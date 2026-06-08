import os
from pathlib import Path
import sys
import uuid

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, Request
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.sumerian import Sumerian

load_dotenv()

# Bind a RAG pipeline object into the lifespan of the server
@asynccontextmanager
async def lifespan(app):
    # Reference parent directory (root of this project)
    parent_dir = str(Path(__file__).parent.parent)

    # Absolute path conversion (for RAG pipeline)
    parent_dir = os.path.abspath(parent_dir)

    # Insert parent directory at the very top of the search list
    # by assigning it at index 0 
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)

    # Debug print logs
    print(f"Working directory: {os.getcwd()}")
    print(f"Added to sys.path: {parent_dir}")

    # Define the correct path to root /app since relative paths
    # fucked up the location
    app_path = os.path.join(parent_dir, "app")
    print(f"App path: {app_path}") 

    print(">>> Starting Sumerian initialization...")  # ADD THIS
    
    try:
        app.state.service = Sumerian(repository_path=app_path, root_path=parent_dir)
        print(">>> Sumerian initialized successfully")  # ADD THIS
    except Exception as e:
        print(f">>> ERROR during Sumerian init: {e}")  # ADD THIS
        raise
    
    yield

def get_sumerian(request: Request):
    return request.app.state.service

app = FastAPI(lifespan=lifespan)
active_ingestions: set[str] = set()
tasks = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_APPLICATION_URL", "http://localhost:8000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default endpoint
@app.get('/')
async def default_endpoint(service = Depends(get_sumerian)):
    return {
        "status": "ok",
        "message": "RAG service initialized"
    }

# POST /rag/query: fire-and-forget the user query for processing using Sumerian
class PostQueryRequest(BaseModel):
    query: str 

@app.post('/rag/query')
async def process_query(
    payload: PostQueryRequest, 
    service: Sumerian | None = Depends(get_sumerian)
):
    # null/none check
    if service is None:
        return {"status": "error", "message": "Service not initialized"}
    
    try:
        query_text = payload.query

        response_text, generation_time = service._generate_response(query_text)
        return {
            "status": "ok",
            "response": response_text,
            "generation_time_seconds": generation_time,
            "message": "Query processed successfully"
        }
    # database error case
    except ValueError as e:
        return {
            "status": "error",
            "error_type": "database_error",
            "message": str(e)
        }
    # general error case
    except Exception as e:
        return {
            "status": "error",
            "error_type": "generation_error",
            "message": str(e)
        }



@app.post('/rag/database')
# POST /rag/database: check for the status + content + analytics of the vector Chroma database
async def check_database_status(service = Depends(get_sumerian)):
    return {
        "status": "ok",
        "message": "placeholder message"
    }


# POST /rag/database/ingest: executes Sumerian's document scanning method in order to scan, filter, 
# and ingest into the Chroma DB. Causes the whole Laravel dashboard views to have a temporary loading 
# screen while the ingesting is still occurring - most likely architected via async dispatches + polling
async def run_ingestion(
    task_id: str,
    service: Sumerian
):
    try: 
        metrics = service._document_scanning()
        tasks[task_id] = {
            "status": "complete",
            "metrics": metrics
        }
    except Exception as e:
        tasks[task_id] = {
            "status": "error",
            "message": str(e)
        }
    finally: 
        active_ingestions.discard(task_id)

@app.get('/debug/tasks')
async def debug_tasks():
    return {
        "active_ingestions": list(active_ingestions),
        "tasks": tasks,
        "task_count": len(tasks)
    }

@app.post('/rag/database/ingest')
async def process_ingestion(
    background_tasks: BackgroundTasks,
    service: Sumerian | None = Depends(get_sumerian)
):
    # Service null/none check
    if service is None:
        return {
            "status": "error", 
            "message": "Service not initialized"
        }
    
    # Check for existing jobs for already existing ingestions
    if active_ingestions:
        return {
            "status": "error",
            "message": "An ingestion is already in progress!"
        }
    
    # Ingestion ID for task
    task_id = str(uuid.uuid4())
    active_ingestions.add(task_id)
    tasks[task_id] = {
        "status": "in_progress",
        "progress": 0
    }

    background_tasks.add_task(run_ingestion, task_id, service)

    return {"task_id": task_id, "status": "started"}

# GET /rag/database/ingest/status/{task_id}: poll the status of an ongoing ingestion task
@app.get('/rag/database/ingest/status/{task_id}')
async def get_ingestion_status(task_id: str):
    if task_id not in tasks:
        return {
            "status": "not_found",
            "message": f"Task {task_id} not found"
        }
    
    task = tasks[task_id]
    return {
        "task_id": task_id,
        "status": task.get("status"),
        "data": task
    }

# POST /rag/database/reset: reset the existing Chroma vector database
@app.post('/rag/database/reset')
async def reset_database(
    service: Sumerian | None = Depends(get_sumerian)
):
    # null/none check
    if service is None:
        return {"status": "error", "message": "Service not initialized"}
    
    try: 
        metrics = service._reset_chroma()

        if metrics["status"] == "complete":
            return {"status": "ok", "message": "Database reset successfully", "metrics": metrics}

        elif metrics["status"] == "partial":
            return {"status": "warning", "message": "Database reset partially completed", "metrics": metrics}

        else:
            return {"status": "error", "message": "Unknown reset status", "metrics": metrics}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get('/cache/documents')
# GET /cache/documents: check the information regarding the document cache if it exists or not
async def check_document_cache(service = Depends(get_sumerian)):
    return {
        "status": "ok",
        "message": "placeholder message"
    }

@app.get('/cache/chunks')
# GET /cache/chunk: check the information regarding the chunk cache if it exists or not
async def check_chunk_cache(service = Depends(get_sumerian)):
    return {
        "status": "ok",
        "message": "placeholder message"
    }