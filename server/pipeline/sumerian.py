
import ast
import hashlib
import json
import math
import os
import time
from time import perf_counter
from pprint import pprint

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tree_sitter import Node, Parser, Language as tsLanguage
import tree_sitter_typescript as tsts

load_dotenv()

class Sumerian():

    # Constructor
    def __init__(
            self,
            repository_path: str = "./app",
            root_path: str | None = None
        ):
        # Pre-run metrics
        # print(f"Working directory: {os.getcwd()}")

        # Parameter validation
        if not os.path.isdir(repository_path):
            raise ValueError(f"The repository at {repository_path} does not exist.")
        if len(os.listdir(repository_path)) <= 0:
            raise FileNotFoundError(f"The repository at {repository_path} must have at LEAST 1 file.")
        
        # Determine the set root directory whether user-set or
        # going for default 
        if root_path is None:
            root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        else:
            root_path = os.path.abspath(root_path)
        
        # --- Main Configurations ---
        self.repository_path: str = repository_path
        self.root_path: str = root_path

        self.new_documents: list[Document] = []

        self.EMBEDDING_MODEL = "nomic-embed-text"
        self.GENERATIVE_MODEL = "qwen2.5:3b"
        self.GENERATIVE_MODEL_2 = "gemini-2.5-flash"

        # Lazy-load clients to avoid startup hangs
        self._embeddings = None
        self._client = None
        self._client_2 = None
        self._store = None

        # make directories for the caches + db
        db_path = os.path.join(root_path, "server", "db")
        cache_dir = os.path.join(root_path, "server", "cache")

        os.makedirs(db_path, exist_ok=True)
        os.makedirs(cache_dir, exist_ok=True)
        
        self.db_path = db_path
        self.cache_dir = cache_dir

        # --- Cache Configurations ---
        self.DOCUMENT_CACHE_PATH: str = os.path.join(cache_dir, "documents.json")
        self.CHUNK_CACHE_PATH: str = os.path.join(cache_dir, "chunks.json")

        self.document_cache: dict[str, str] = self._load_cache_document()
        self.chunk_cache: dict[str, dict] = self._load_cache_chunk()

        # --- File Scanning Configurations ---
        self.BLACKLIST_DIRECTORIES: set[str] = {
            'node_modules','.git','__pycache__','.venv','venv','env','.pytest_cache',
            '.mypy_cache','.ruff_cache','htmlcov','dist','build','.next','.npm',
            '.turbo','.yarn','.coverage','.out','.vercel'
        }
        self.WHITELIST_FILE_EXTENSIONS: set[str]  = {
            '.ts','.tsx','.mjs','.css','.md','.toml','.ini','.json','.yaml','.yml',
            '.mako','.sql','.d.ts', '.py'
        }
        self.CONFIG_PREFIX = [
            ".ini", ".toml", ".yaml", ".yml", ".lock", ".mjs", ".js"
        ]
        self.CONFIG_RELPATH = [
            "config/", "alembic.ini", "pyproject.toml", "package.json",
            "tsconfig.json", "next.config.ts"
        ]
        self.CONFIG_FILE_PATTERNS = [
            "config.", "eslint.", "postcss.", "vite.", "webpack.",
            "jest.", "vitest.", "prettier.", "stylelint.", ".env"
        ]

        # --- Metadata Configuration ---
        self.scopes: dict[str, str] = {
            "server": "api_server",
            "web": "web_client",
        }
        self.domains: dict[str, str] = {
            "auth": "auth",
            "dashboard": "dashboard",
            "notes": "notes",
            "credits": "credits",
            "shared": "shared", 
        }
        self.layers: dict[str, str] = {
            "ui": "ui",
            "api": "api",
            "service": "service",
            "data": "data",
            "schema": "schema",
            "config": "config",
            "tests": "tests",
            "scripts": "scripts"
        }

        # --- Chunking Configuration ---
        self.MAX_CHUNKING_ALLOWED: int = 1738
        self.BATCH_SIZE: int = 50
    
    # Lazy-loading properties: claude haiku introduced me to this concept so that
    # i can remove the slow startup issue I have with my FastAPI and instead the 
    # startup issue (caused by models + vector db) occurs in /rag/query
    # because they're primarily used in that route
    @property
    def embeddings(self):
        if self._embeddings is None:
            self._embeddings = OllamaEmbeddings(model=self.EMBEDDING_MODEL)
        return self._embeddings
    
    @property
    def client(self):
        if self._client is None:
            self._client = ChatOllama(
                model=self.GENERATIVE_MODEL,
                num_predict=128,
                num_ctx=2500,
                temperature=0.2
            )
        return self._client
    
    @property
    def client_2(self):
        if self._client_2 is None:
            self._client_2 = ChatGoogleGenerativeAI(
                model=self.GENERATIVE_MODEL_2,
                api_key=os.getenv('GOOGLE_API_KEY'),
            )
        return self._client_2
    
    @property
    def store(self):
        if self._store is None:
            self._store = Chroma(
                persist_directory=self.db_path,
                embedding_function=self.embeddings
            )
        return self._store
    
    @store.setter
    def store(self, value):
        self._store = value
    
    # Classification
    def _classify_relative_path(self, file: str, relative_path: str) -> tuple[str, str, str]: 
        scope: str = ""
        domain: str = ""
        layer: str = ""  

        # scope classification
        for scope_key, scope_value in self.scopes.items():
            if scope_key in relative_path: 
                scope = scope_value

                # domain classification
                if "auth" in relative_path and "/auth/" in relative_path:
                    domain = self.domains["auth"]
                elif "notes" in relative_path and "/notes/" in relative_path:
                    domain = self.domains["notes"]
                elif "dash" in relative_path and "/dash/" in relative_path:
                    domain = self.domains["dashboard"]
                elif "credits" in relative_path and "/credits/" in relative_path:
                    domain = self.domains["credits"]
                elif "/middleware/" in relative_path or "/utils/" in relative_path or "proxy" in file or file == "database.py" or file == "config.py":
                    domain = self.domains["shared"]
                else:
                    domain = self.domains["shared"]

                # layer classification
                if "/tests/" in relative_path or relative_path.startswith("tests/"):
                    layer = self.layers["tests"]
                elif "/scripts/" in relative_path or relative_path.startswith("scripts/"):
                    layer = self.layers["scripts"]
                elif (any(x in file for x in self.CONFIG_PREFIX) or 
                      any(x in relative_path for x in self.CONFIG_RELPATH) or
                      any(x in file for x in self.CONFIG_FILE_PATTERNS)):
                    layer = self.layers["config"]
                
                elif scope_value == self.scopes["server"]:
                    if "/schemas/" in relative_path or file in ('schemas.py'):
                        layer = self.layers["schema"] 
                    elif "/alembic/" in relative_path or file in ('models.py'):
                        layer = self.layers["data"]
                    elif "/router/" in relative_path or file in ("main.py", "auth.py"):
                        layer = self.layers["api"]
                    elif "/services/" in relative_path or "/utils/" in relative_path or "service" in file:
                        layer = self.layers["service"]
                    else: 
                        layer = self.layers["service"]
                    
                elif scope_value == self.scopes["web"]:
                    if "page.tsx" in file or "layout.tsx" in file:
                        layer = self.layers["ui"]
                    elif "/_components/" in relative_path or (file.endswith((".tsx", ".ts")) and file[0].isupper()):
                        layer = self.layers["ui"]
                    elif "actions.ts" in file:
                        layer = self.layers["service"]
                    elif "/api/" in relative_path:
                        layer = self.layers["api"]
                    elif any(x in file for x in ["types.ts", "constants.ts", "schema.ts"]) or "/schemas/" in relative_path:
                        layer = self.layers["schema"]
                    elif "/utils/" in relative_path or "/hooks/" in relative_path or "/lib/" in relative_path:
                        layer = self.layers["service"]
                    else:
                        layer = self.layers["service"]

                if layer == "":
                    layer = "unclassified"

        if scope == "": 
            scope = "unclassified"

        # print(f"Current relative path: {relative_path} \nScope: {scope}, Domain: {domain}, Layer: {layer}\n ")
        return scope, domain, layer

    # Encryption
    def _encrypt_file_content(self, file_content: str) -> str: 
        return hashlib.sha256(file_content.encode('utf-8')).hexdigest()

    # Cache
    def _load_cache_document(self) -> dict[str, str]: 
        cache_dir = os.path.dirname(self.DOCUMENT_CACHE_PATH)
        if cache_dir and not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)

        if not os.path.exists(self.DOCUMENT_CACHE_PATH):
            with open(self.DOCUMENT_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump({}, f, indent=2)
            return {}
        
        with open(self.DOCUMENT_CACHE_PATH, 'r', encoding='utf-8') as f: 
            return json.load(f)

    def _load_cache_chunk(self) -> dict[str, dict]: 
        if not os.path.exists(self.CHUNK_CACHE_PATH):
            with open(self.CHUNK_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump({}, f, indent=2)
            return {}
        
        with open(self.CHUNK_CACHE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _save_cache_document(self) -> None:
        try: 
            with open(self.DOCUMENT_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(self.document_cache, f, indent=2)
        except Exception as e: 
            print(e)
    
    def _save_cache_chunk(self) -> None: 
        try:
            with open(self.CHUNK_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(self.chunk_cache, f, indent=2)
        except Exception as e:
            print(f"Error saving chunk cache: {e}")

    def _delete_cache_document(self): 
        # Reset in-memory (object) cache
        self.document_cache = {}

        # Try deleting (rewriting the cache with {}) unless exception occurs
        try: 
            with open(self.DOCUMENT_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump({}, f, indent=2)
            return self.document_cache
        except Exception as e:
            print(f"Error on resetting document cache: {e}")
            return self.document_cache

    def _delete_cache_chunk(self):
        # Reset in-memory (object) cache
        self.chunk_cache = {}
    
        # Try deleting (rewriting the cache with {}) unless exception occurs
        try: 
            with open(self.CHUNK_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump({}, f, indent=2)
            return self.chunk_cache
        except Exception as e:
            print(f"Error on resetting chunk cache: {e}")
            return self.chunk_cache

    # Chunking
    def _chunk_typescript(self, code: str) -> list[dict]:
        TSX = tsLanguage(tsts.language_tsx())
        parser = Parser(language=TSX)
        
        tree = parser.parse(code.encode())
        code_bytes = code.encode('utf-8')
        chunks = []
        lines = code.split('\n')
        
        # function-level helpers
        def is_top_level(node: Node) -> bool:
            parent = node.parent
            if not parent:
                return False
            if parent.type in ("program", "export_statement"):
                return True
            if parent.type in ("lexical_declaration", "variable_declaration"):
                return bool(parent.parent and parent.parent.type in ("program", "export_statement"))
            return False
        
        def is_function_like(node: Node) -> bool:
            if node.type in ("function_declaration", "class_declaration"):
                return True
            if node.type == "variable_declarator":
                init = node.child_by_field_name("value")
                return bool(init and init.type in ("arrow_function", "function", "function_expression"))
            return False
        
        def get_target_node(node: Node) -> Node:
            parent = node.parent
            if parent and parent.type in ("lexical_declaration", "variable_declaration"):
                return parent
            return node
        
        def traverse(node: Node):
            if is_function_like(node) and is_top_level(node):

                target = get_target_node(node)
                start_line = target.start_point[0]
                end_line = target.end_point[0]

                chunk_content = "\n".join(lines[start_line:end_line + 1])

                entity_name = None
                if hasattr(node, "child_by_field_name"):
                    name_node = node.child_by_field_name("name")
                    if name_node:
                        entity_name = code_bytes[name_node.start_byte:name_node.end_byte].decode(
                            "utf-8", errors="ignore"
                        )

                chunks.append(
                    {
                        "content": chunk_content,
                        "entity_name": entity_name,
                        "start_line": start_line,
                        "end_line": end_line,
                    }
                )
            
            for child in node.children: 
                traverse(child)
        
        try: 
            traverse(tree.root_node)

            safe_chunks = []

            for chunk in chunks:

                if len(chunk["content"]) > self.MAX_CHUNKING_ALLOWED:
                    content = chunk["content"]
                    step = self.MAX_CHUNKING_ALLOWED
                    for i in range(0, len(content), step):
                        safe_chunks.append({
                            "content": content[i:i + step],
                            "entity_name": chunk["entity_name"],
                            "start_line": chunk["start_line"],
                            "end_line": chunk["end_line"],
                        })

                else:
                    safe_chunks.append(chunk)
            return safe_chunks if safe_chunks else self._chunk_text(code)
        except Exception as e: 
            print(f"Error encountered when attempting to chunk TypeScript: {e}")
            return self._chunk_text(code)

    def _chunk_python(self, code: str) -> list[dict]:
        # function-relevant helpers
        def _split_python_chunk(chunk: dict, max_lines: int = 50) -> list[dict]:
            content = chunk["content"]
            lines = content.split('\n')
            
            if len(lines) <= max_lines:
                return [chunk]
            
            chunks = []
            overlap = 3 
            
            for i in range(0, len(lines), max_lines - overlap):
                chunk_lines = lines[i:i + max_lines]
                content = '\n'.join(chunk_lines)
                chunks.append({
                    "content": content,
                    "entity_name": chunk["entity_name"],
                    "start_line": chunk["start_line"] + i,
                    "end_line": chunk["start_line"] + i + len(chunk_lines)
                })
            
            return chunks
        
        try: 
            tree = ast.parse(code)
            lines = code.split('\n')
            chunks = []

            ast_defs = (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)

            for node in ast.walk(tree): 
                if isinstance(node, ast_defs): 
                    start = node.lineno - 1
                    end = node.end_lineno
                    chunk = '\n'.join(lines[start:end])

                    chunks.append({
                        "content": chunk, 
                        "entity_name": node.name,
                        "start_line": start,
                        "end_line": end
                    })
            
            
            
            safe_chunks = []
            
            for chunk in chunks:
                
                if len(chunk["content"]) > self.MAX_CHUNKING_ALLOWED:
                    sub = _split_python_chunk(chunk=chunk)
                    safe_chunks.extend(sub)
                else:
                    safe_chunks.append(chunk)
            
            return safe_chunks if safe_chunks else self._chunk_text(code)
        except Exception as e:
            print(f"Error encountered when attempting to chunk Python, reverting to text chunking...")
            print(str(e))
            return self._chunk_text(code)

    def _chunk_text(self, code: str) -> list[dict]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.MAX_CHUNKING_ALLOWED,
            chunk_overlap=(self.MAX_CHUNKING_ALLOWED * 0.1)
        )

        chunks = splitter.split_text(code)

        return [{   
            "content": chunk,
            "entity_name": "text_chunk",
            "start_line": 0,
            "end_line": 0,
        } for chunk in chunks] 

    # File Scanning
    def _document_scanning(self) -> dict:
        overall_start = time.time()

        self._load_cache_document()

        chunks: list[Document] = []

        metrics: dict = {
            "scanned": 0,
            "ignored": 0,
            "skipped": 0,
            "updated": 0,
            "new": 0,
            "failed": 0,
            "cached_chunks": 0,
            "total_documents": 0,
            "time_per_stage": {}
        }
        failed_logs: list[str] = []

        # File Processing
        stage_start = time.time()

        for root, directories, files in os.walk(self.repository_path):

            # Blacklisting
            directories[:] = [d for d in directories if d not in self.BLACKLIST_DIRECTORIES]

            for file in files: 
                metrics["scanned"] += 1

                # File data
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, self.repository_path).replace("\\", "/")
                ext = os.path.splitext(file)[1].lower()
                raw_code: str = ""

                try: 
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f: 
                        raw_code = f.read()
                except Exception as e:
                    metrics['failed'] += 1
                    failed_logs.append(f"Error at {relative_path}: {str(e)}") 
                    continue

                # Cache comparison
                current = self._encrypt_file_content(raw_code)
                previous = self.document_cache.get(relative_path)

                if previous == current:
                    metrics['skipped'] += 1
                    continue
            
                entry = self.chunk_cache.get(relative_path)

                if entry and entry["hash"] == current:
                    split_chunks = entry["chunks"]
                    metrics["cached_chunks"] += 1
                else:
                    split = self._chunk_text
                    if ext == ".py":
                        split = self._chunk_python
                    elif ext in {".ts", ".tsx", ".mjs", ".js"}:
                        split = self._chunk_typescript
                    
                    split_chunks = split(raw_code)
                    
                    self.chunk_cache[relative_path] = {
                        "hash": current,
                        "chunks": split_chunks
                    }

                if relative_path in self.document_cache:
                    metrics["updated"] += 1
                else:
                    metrics["new"] += 1

                
                
                # Classification
                s, d, l = self._classify_relative_path(
                    file=file, 
                    relative_path=relative_path
                )

                for chunk_dict in split_chunks: 
                    doc = Document(
                        page_content=chunk_dict["content"],
                        metadata={
                            "scope": s,
                            "domain": d,
                            "layer": l,
                            "name": chunk_dict["entity_name"],
                            "line_start": chunk_dict["start_line"],
                            "line_end": chunk_dict["end_line"],
                            "relative_path": relative_path
                        }
                    )
                    chunks.append(doc)

                self.document_cache[relative_path] = current

        metrics["time_per_stage"]["file_processing"] = f"{time.time() - stage_start:.2f}"

        stage_start = time.time()
        self.new_documents = chunks
        self._save_cache_document()
        self._save_cache_chunk()
        metrics["time_per_stage"]["cache_save"] = f"{time.time() - stage_start:.2f}"

        metrics["total_documents"] = len(chunks)
        metrics["total_time"] = f"{time.time() - overall_start:.2f}"
        
        saved = self._save_to_chroma()
        metrics["files_saved_to_db"] = saved 

        return metrics

    # Vector DB
    def _save_to_chroma(self) -> int: 
        # TODO: reset new_documents once added 

        files_saved = 0
        for i in range(0, len(self.new_documents), self.BATCH_SIZE):
            b = self.new_documents[i:i+self.BATCH_SIZE]
            self.store.add_documents(b)
            files_saved += len(b)

        return files_saved
    
    def _reset_chroma(self) -> dict:
        metrics = {
            "status":                   "in_progress",
            "chroma_reset":             False,
            "document_cache_reset":     False,
            "chunk_cache_reset":        False,
            "new_documents_cleared":    False,
            "errors":                   []
        } 

        # chroma db deletion
        try: 
            self.store.delete_collection()
            self.store = Chroma(
                persist_directory=os.path.join(self.root_path, "server", "db"),
                embedding_function=self.embeddings
            )
            metrics["chroma_reset"] = True
        except Exception as e:
            metrics["errors"].append(f"Chroma reset failed: {str(e)}")

        # document cache deletion
        try:
            self._delete_cache_document()
            metrics["document_cache_reset"] = True
        except Exception as e:
            metrics["errors"].append(f"Document cache reset failed: {str(e)}")
        
        # chunk cache deletion
        try:
            self._delete_cache_chunk()
            metrics["chunk_cache_reset"] = True
        except Exception as e:
            metrics["errors"].append(f"Chunk cache reset failed: {str(e)}")
        
        # new document
        try:
            self.new_documents = []
            metrics["new_documents_cleared"] = True
        except Exception as e:
            metrics["errors"].append(f"New documents clear failed: {str(e)}")
        
        metrics["status"] = "complete" if not metrics["errors"] else "partial"
        return metrics

    # Response Generation
    def _generate_response(self, prompt: str) -> tuple[str, float]:
        
        generation_start = perf_counter()

        
        if self.store._collection.count() <= 0:
            raise ValueError("Chroma DB loaded but empty. Possible missing ingestion.")

        retrieved = self.store.max_marginal_relevance_search(prompt, k=12, fetch_k=50)
        context = "\n".join([doc.page_content for doc in retrieved])

        template = f"""You are a code assistant for Yellowpad — a notetaking web app built with Next.js (frontend), FastAPI (backend), and MySQL (database).

        You have been given relevant source code and file excerpts from the Yellowpad codebase below. Use ONLY the provided context to answer the question. Do not use outside knowledge.

        Answer concisely in 1-3 paragraphs. Be direct and specific to the question. If code is needed, include only the relevant snippet.

        If the context doesn't contain enough information to answer, say: "I don't have enough context from the codebase to answer that."

        --- CONTEXT START ---
        {context}
        --- CONTEXT END ---

        Question: {prompt}
        """

        response = self.client_2.invoke(template)

        generation_end = perf_counter() - generation_start
        return response.text, generation_end

    # TODO: model switching -> groq > gemini
    
if __name__ == "__main__":
    script_start = perf_counter()
    sumerian = Sumerian()
    metrics = sumerian._document_scanning()
    question = "Explain the main use case of the project like I am 5"

    # print("--- Scan Metrics ---")
    # pprint(metrics)

    reply, generation_time = sumerian._generate_response(question)
    print(reply)
    print(f"\nTime elapsed: {generation_time}s")
    print(f"Script Elapsed Time: {perf_counter() - script_start}s")
    
