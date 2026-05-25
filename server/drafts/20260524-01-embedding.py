
import os
from pathlib import Path
from time import perf_counter

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama, OllamaEmbeddings
from pydantic import SecretStr

from ingestion import RepoIngestor

import logging 
logging.basicConfig(level=logging.INFO)
logging = logging.getLogger(__name__)

# counter for the script runing logging. see how fast the process usually is.
print(f"Running the embedding script")
start = perf_counter()

# ingest the current repository in /app (see main.py)
docs = RepoIngestor("../app").run()
# log the ingestion finish and the retrieved documents.
print(f"Ingestion finished. Retrieved {len(docs)} documents.")

# call on API key and add if conditional for a missong api key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY == None:
    print("API_KEY loading unsuccessful, cannot run with a broken API key.")
    raise Exception("Missing API key")

# embedding object from langchain's GoogleGenerativeAIEmbeddings using the 
# embedding model and the API key wrapped as a SecretStr
print(f"Generating embeddings with nomic-embed-text Ollama embedding model.")
# embeddings = GoogleGenerativeAIEmbeddings(
#     model="gemini-embedding-001",
#     output_dimensionality=768,                  # less dimensions = less performance = faster processing                   
#     api_key=SecretStr(GOOGLE_API_KEY)
# )

# I used to opt for the gemini api key embedding but fucking hell am i rate limited
# using 90mb local embedding model instead lol, idc if its 384 at least it works
embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

# vector_store for uploading the documents to chroma, 
# raw code below, need to optimize to prevent rate limiting
# vector_store = Chroma.from_documents(
#     documents=docs, 
#     embedding=embeddings, 
#     persist_directory='./chroma_db'
# )

batch_size = 50
# dedicated for loop to carefully batch request send to the embedding model
# this happens because the free tier is strict on the rate limiting
# fine lol
vector_store: Chroma | None = None
for i in range(0, len(docs), batch_size):
    batch = docs[i:i+batch_size]
    if i == 0:
        print(f"Generating new Chroma vector db with embeddings")

        vector_store = Chroma.from_documents(
            documents=batch,
            embedding=embeddings,
            persist_directory='./chromadb'
        )
    else:
        if vector_store is not None: 
            print(f"Adding a new batch (docs[{i}:{i+batch_size}]) to the vector store...")
            vector_store.add_documents(batch)


print(f"Ingested {len(docs)} documents into the local chroma_db")

# locate chroma_db if existing or else throw error that file nto found
db_path = Path("./chromadb")

if not db_path.exists():
    raise FileNotFoundError("Chroma DB directory not found. Run ingestion first.")

# load an existing chroma db by referencing the newly made chroma db folder
# embedding function is required in order for new queries to work properly
# new queries are made from similarity searches (below)
store = Chroma(
    persist_directory='./chromadb',
    embedding_function=embeddings
)

if store._collection.count() == 0:
    raise ValueError("Chroma DB loaded but empty. Possible missing ingestion.")

print(f"Store collection count: " + str(store._collection.count()))

# user prompt ++ similarity search using prompt string -> vectors -> compare vectors
# from the chroma db 
prompt = "What can you tell me about the infrastructure layer of the project?"
# similarity search is much stricter since it looks at similar vectors
# from what i know, max margival relevance search searches for query AND diversity
# meaning from what i can see, with a local database like this, i can reach different
# parts of the application more
retrieved = store.max_marginal_relevance_search(prompt, k=20, fetch_k=50)

context = "\n".join([doc.page_content for doc in retrieved])
print(f"Retrieved {len(retrieved)} docs")

client = ChatOllama(
    model="qwen2.5:0.5b"

)

client_2 = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.0, 
    top_p=0.9,
    top_k=40,

)

prompt_final = f"""You are a code assistant for Yellowpad — a notetaking web app built with Next.js (frontend), FastAPI (backend), and MySQL (database).

You have been given relevant source code and file excerpts from the Yellowpad codebase below. Use ONLY the provided context to answer the question. Do not use outside knowledge.

Answer concisely in 1-3 paragraphs. Be direct and specific to the question. If code is needed, include only the relevant snippet.

If the context doesn't contain enough information to answer, say: "I don't have enough context from the codebase to answer that."

--- CONTEXT START ---
{context}
--- CONTEXT END ---

Question: {prompt}
"""

client=client

response = client.invoke(prompt_final)

elapsed = perf_counter() - start
print(f"Time elapsed pre-response: {elapsed}")
start = perf_counter()
print(f"--- # LLM Response # ---")

# terminal stream for real time updating i guess
for chunk in client.stream(prompt):
    print(chunk.content, end="", flush=True)

elapsed = perf_counter() - start
print(f"Time elapsed post-response: {elapsed}")