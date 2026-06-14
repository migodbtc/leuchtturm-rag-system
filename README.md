<div align="center">
  <h1>Leuchtturm RAG System</h1>

  <p>
    A full-stack RAG chatbot on Laravel + FastAPI, with a complete document scanning-to-vector-storage pipeline and Yellowpad — a dedicated child system for testing the scanner and ingestion flow.
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/ChromaDB-E85E3C?style=for-the-badge&logoColor=white" />
</div>

<img width="1536" height="730" alt="image" src="https://github.com/user-attachments/assets/f3590f25-173d-4444-b7c5-3e48b58e8921" />

## Architecture Overview

Leuchtturm is a RAG-powered AI chatbot built on Laravel + FastAPI, with a complete document scanning-to-vector-storage pipeline — and **Yellowpad**, a dedicated child system for testing the scanner and ingestion flow.

The system has three layers:

| Layer | Service | Port | Role |
|---|---|---|---|
| Web UI | Laravel + Inertia/React | `:8000` | Frontend, auth, chat interface, queue dispatch |
| RAG API | FastAPI + Uvicorn | `:8001` | Hosts Sumerian — handles ingestion and query |
| Yellowpad | Next.js + FastAPI | `:3001` / `:8002` | Child app scanned by Sumerian; its own API for testing |

**Request Flowchart**
<img width="3462" height="747" alt="mermaid-diagram (1)" src="https://github.com/user-attachments/assets/694a7f77-ad26-4529-871e-bf72b91252f9" />
Laravel polls `/rag/database/ingest/status/{task_id}` during an active ingestion to surface progress to the UI.

---

## Prerequisites & Tech Stack

**Runtime requirements:**

| Requirement | Version | Used by |
|---|---|---|
| PHP | `^8.2` | Laravel |
| Composer | latest | Laravel deps |
| Node.js | `^20` | Vite / Next.js |
| pnpm | latest | Both frontends |
| Python | `^3.11` | FastAPI / Sumerian |
| Poetry | `^2.0` | Python dep management |
| Ollama | latest | Local embeddings (`nomic-embed-text`) + optional LLM (`qwen2.5:3b`) |
| Task | latest | Dev task runner (`Taskfile.yml`) |

**Repository Preview**

```
Leuchtturm
├── web/         Laravel 12 · Inertia.js · React 19 · TypeScript · TailwindCSS v4 · Vite
└── server/      FastAPI · Uvicorn · LangChain · ChromaDB · Gemini 2.5 Flash · Ollama · Tree-sitter · Poetry

Yellowpad (app/)
├── web/         Next.js 16 · React 19 · TypeScript · TailwindCSS v4
└── server/      FastAPI · SQLAlchemy (async) · Alembic · MySQL · Poetry
```

---

## Yellowpad
<img width="2759" height="2056" alt="mermaid-diagram (2)" src="https://github.com/user-attachments/assets/27afb4df-fe3c-4629-85b0-37f56e197e61" />
<i>The diagram displays the different high level components of the Yellowpad application (the right side boxes) and how it connects to the bigger RAG system (on the left)</i>

<p>
Yellowpad is a fully functional notetaking web application that lives inside `/app`. It exists for one specific reason: to be the **subject** of the RAG system — the codebase that Sumerian scans, chunks, embeds, and stores so Leuchtturm's chatbot can answer questions about it.

At its core, Yellowpad lets authenticated users create, edit, and delete **notepads** — each a titled container holding a list of **tasks** with states like checked, flagged, and mode. It's small enough to be scannable in full but real enough to have actual architectural decisions worth asking a RAG system about.

The backend is a FastAPI server backed by a **MySQL database** (via SQLAlchemy async + Alembic for migrations). Authentication is handled with **JWT tokens** — login issues a bearer token, and every protected route validates it via a shared `get_current_user` dependency that decodes the token and fetches the user from the database. Passwords are stored as bcrypt hashes. The server exposes four domain groups: `auth` (register, login, delete account), `notepads` (full CRUD with pagination and title search), `dashboard` (aggregate analytics — total notepads, tasks, and completion rates for the current user), and the root health check.

The frontend is a **Next.js 16** app in the App Router style, using React 19, TailwindCSS v4, Framer Motion for animations, Recharts for the dashboard analytics view, and Lucide for icons. It communicates with the FastAPI backend through a `proxy.ts` utility and a set of middleware/util layers.

From Sumerian's perspective, Yellowpad's source is organized into domains (`auth`, `notes`, `dashboard`, `shared`) and layers (`ui`, `api`, `service`, `data`, `schema`, `config`) that Sumerian's classifier reads from the file's relative path and filename. This metadata is stored alongside each embedded chunk in ChromaDB, letting Leuchtturm retrieve context with structural awareness — not just semantic similarity.

Yellowpad also ships with a **pytest suite** (`task yellowpad:server:test`) for basic API quality assurance.
</p>

---

## Sumerian
<img width="3742" height="270" alt="mermaid-diagram (3)" src="https://github.com/user-attachments/assets/fc3926c7-29ac-47b1-8aa3-17a421ac6801" />

Sumerian is the ingestion pipeline at the core of Leuchtturm's RAG capability. It is a Python class (`pipeline/sumerian.py`) instantiated once at FastAPI startup and bound to the app's lifespan state.

### Responsibilities

| Stage | What it does |
|---|---|
| **Scan** | Walks the `/app` directory recursively, applying directory blacklists (`node_modules`, `.git`, `.venv`, etc.) and a file extension whitelist (`.ts`, `.tsx`, `.py`, `.md`, `.json`, `.sql`, etc.) |
| **Hash & diff** | SHA-256 hashes each file's content and compares against a JSON document cache — unchanged files are skipped entirely |
| **Chunk** | Dispatches to a language-aware chunker: AST-based for Python (`ast` module), parse-tree-based for TypeScript/TSX (`tree-sitter`), and character-split fallback for everything else |
| **Classify** | Tags each chunk with `scope` (api_server / web_client), `domain` (auth / notes / dashboard / shared), and `layer` (ui / api / service / data / schema / config) metadata |
| **Embed & store** | Batches chunks (50/batch) into ChromaDB using `nomic-embed-text` via Ollama embeddings |
| **Query** | On `/rag/query`, runs MMR retrieval (k=12, fetch_k=50) against ChromaDB and passes retrieved context to Gemini 2.5 Flash for generation |

## License

This project is licensed under the MIT License.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, provided that you include the original copyright notice and this permission notice in all copies or substantial portions of the software.

The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from the use of the software.

Full license text: https://opensource.org/licenses/MIT
