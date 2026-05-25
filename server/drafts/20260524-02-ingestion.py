import ast
import hashlib
import json
import re
import traceback

from dotenv import load_dotenv
import os

from langchain_text_splitters import Language, RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from tree_sitter import Parser, Language as tsLanguage
from tree_sitter_languages import get_parser
import tree_sitter_typescript as tsts

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

class RepoIngestor:

    """
    CONSTRUCTOR: initialize everything pre-method running
    - repo_path         refers to the repository I want to ingest 
                        (which is yellowpad in this case)
    - registry_path     refers to the existing registry (if not named
                        as hash_registry.json) to store the hash map
    """
    def __init__(
            self,
            repo_path: str, 
            registry_path: str = "./hash_registry.json"
    ):
        # attach parameters to class instance via properties
        self.repo_path = repo_path 
        self.registry_path = registry_path
        self.MAX_CHUNK_LIMIT = 1000

        # add blacklist for directories, whitelist for files (extensions)
        self.DIR_IGNORE = {'node_modules','.git','__pycache__','.venv','venv','env','.pytest_cache','.mypy_cache','.ruff_cache','htmlcov','dist','build','.next','.npm','.turbo','.yarn','.coverage','.out','.vercel'}
        self.EXT_ALLOWED = {'.ts','.tsx','.mjs','.css','.md','.toml','.ini','.json','.yaml','.yml','.mako','.sql','.d.ts', '.py'}

        # load the change detection tracking db for registry
        self.hash_registry = self._load_registry()

    """
    REGISTRY SECTION: private functions usually pertaining to the registry
    database or cache. 
    - _load_registry
    - _save_registry
    """

    """
    _load_registry: internal private method used in order to find the registry and load it 
    into the object as a json file. Uses context manager along with open() to read (r) the
    file (f) using default encoding (utf-8) and loads the file to a new json. returns an 
    empty json file if not working.
    """
    def _load_registry(self) -> dict: 
        if os.path.exists(self.registry_path):
            with open(self.registry_path, 'r', encoding='utf-8') as f: 
                return json.load(f)
        return {}
    
    """
    _save_registry: internal private method used in order to save the current file 
    fingerprints inside of the registry_path file using write (w) operation with default
    encoding (utf-8)
    """
    def _save_registry(self):
        with open(self.registry_path, 'w', encoding='utf-8') as f:
            json.dump(self.hash_registry, f, indent=2)
    

    """
    AST CHUNKING SECTION: private functions usually pertaining to the Abstract Syntax 
    Tree (AST) chunking section. AST chunking > text chunking means slower but more accurate
    and code-friendly approach to breaking down files for document loading in langchain.
    """

    """
    _chunk_python: takes a code (string) and outputs a list of dictionaries, with each dictionary
    being a valid chunk parsed through AST (or python's abstract syntax tree library) to traverse
    the file as a AST instead of just text on a file. 
    """
    def _chunk_python(self, code: str) -> list[dict]:
        try: 
            # note: chunk_python was made after chunk_typescript
            # essentials: the abstract syntax tree from the code string (tree), the
            # lines of the code itself split per newline (lines), and the chunks formed
            # in order to group lines of same semantic division (i.e. functions/components)
            # (chunks)
            tree = ast.parse(code)
            lines = code.split('\n')
            chunks = []

            definitions = (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)

            # iterate through each node in the tree
            # no need for custom function for navigation
            # thank you AST library
            for node in ast.walk(tree):
                # if the node instance is in definitions, proceed with 
                # the chunking process
                if isinstance(node, definitions):
                    # start the node's first line + last line, and 
                    # define a chunk that is a slice of the lines array 
                    # and join them together as a chunk
                    start = node.lineno - 1
                    end = node.end_lineno
                    chunk = '\n'.join(lines[start:end])

                    chunks.append({
                        "content": chunk,
                        "entity_name": node.name,
                        "start_line": start, 
                        "end_line": end
                    })

            # loop to check for safe chunks, aka those below the max
            # chunk limit. 
            safe_chunks = []
            for chunk in chunks:
                if len(chunk["content"]) > self.MAX_CHUNK_LIMIT:
                    # too big, fall back to text splitting on just this chunk
                    sub = self._chunk_text(chunk["content"])
                    safe_chunks.extend(sub)
                else:
                    safe_chunks.append(chunk)
                
            # fallback chunker if chunks less than 0/unsuccessful chunking
            return safe_chunks if safe_chunks else self._chunk_text(code)

        except:
            print(f"Error encountered when attempting to chunk Python, reverting to text chunking...")
            return self._chunk_text(code)
    """
    _chunk_typescript: takes a code (string) and outputs a list of dictionaries, with each dictionary
    being representative of a chunk parsed throughly via tree-sitter with the typescript language
    (since tree-sitter is language-agnostic).
    """
    def _chunk_typescript(self, code: str) -> list[dict]:
        try: 
            # prepare both the parser (tree-sitter-languages) as well as the
            # tree by parsing the code (str) into the parser instance
            # making a tree makes it possible to recursively traverse
            TSX = tsLanguage(tsts.language_tsx())
            parser = Parser(language=TSX)
            tree = parser.parse(code.encode())
            
            # prepare the chunk list ++ the lines itself by splitting raw code str
            code_bytes = code.encode('utf-8')
            chunks = []
            lines = code.split('\n')

            # is_top_level: helper function to check whether an existing node is the 
            # assigned top level node. returns bool. pretty easy to understand.
            def is_top_level(node) -> bool:
                parent = node.parent
                if not parent:
                    return False
                if parent.type in ("program", "export_statement"):
                    return True
                if parent.type in ("lexical_declaration", "variable_declaration"):
                    return parent.parent and parent.parent.type in ("program", "export_statement")
                return False
            
            # is_function_like: too buzzed at 11pm to make an explanation, please rewrite 
            def is_function_like(node) -> bool:
                if node.type in ("function_declaration", "class_declaration"):
                    return True
                if node.type == "variable_declarator":
                    init = node.child_by_field_name("value")
                    return init and init.type in ("arrow_function", "function", "function_expression")
                return False
            
            # get_target_node: too buzzed at 11pm to make an explanation, please rewrite
            def get_target_node(node):
                parent = node.parent
                if parent and parent.type in ("lexical_declaration", "variable_declaration"):
                    return parent
                return node
            
            # recursive function to traverse node and find func/component declarations
            def traverse(node):
                
                # if conditional to check if node is top level and is a function/component
                if is_function_like(node) and is_top_level(node):

                    # retrieve the selected node, and its start and end
                    target = get_target_node(node)
                    start_line = target.start_point[0]
                    end_line = target.end_point[0]

                    # merge/join once more relevant semantic text/code
                    chunk_content = "\n".join(lines[start_line:end_line + 1])

                    # attempt to label the entity by finding an attribute (hasattr)
                    # and using that attribute if present to be the entity_name
                    entity_name = None
                    if hasattr(node, "child_by_field_name"):
                        name_node = node.child_by_field_name("name")
                        if name_node:
                            entity_name = code_bytes[name_node.start_byte:name_node.end_byte].decode(
                                "utf-8", errors="ignore"
                            )

                    # append the newly joined chunk to the list
                    chunks.append(
                        {
                            "content": chunk_content,
                            "entity_name": entity_name,
                            "start_line": start_line,
                            "end_line": end_line,
                        }
                    )
                    
                # keep traversing if child nodes are present for coverage
                for child in node.children:
                    traverse(child)
            
            traverse(tree.root_node)

            # loop in order to check for safe chunks 
            safe_chunks = []
            for chunk in chunks:
                if len(chunk["content"]) > self.MAX_CHUNK_LIMIT:
                    # too big, fall back to text splitting on just this chunk
                    sub = self._chunk_text(chunk["content"])
                    safe_chunks.extend(sub)
                else:
                    safe_chunks.append(chunk)
                    
            return safe_chunks if safe_chunks else self._chunk_text(code)

        except Exception as e: 
            print(f"Error encountered when attempting to chunk TypeScript: {e}")
            traceback.print_exc()
            return self._chunk_text(code)
        
    """
    _chunk_text: takes a code (str) as a parameter and outputs a list full of dictionaries
    that are just raw text. used as a fallback as well for non-ts and non-py files (see
    chunking private method above)
    """
    def _chunk_text(self, code: str) -> list[dict]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=100
        ) 

        text_chunks = splitter.split_text(code)

        # return a dictionary with defaults named as a text chunk
        return [{   
            "content": chunk,
            "entity_name": "text_chunk",
            "start_line": 0,
            "end_line": 0,
        } for chunk in text_chunks]

    """
    UNGROUPED SECTION: private functions where I don't even know where to put them or my ass
    is too lazy to be giving them their own sections.
    """

    """
    _calculate_sha256: calculate the unique deterministics sha256 fingerprint of an existing
    code file taking in file_content as parameter. takes a string, returns a string. pretty 
    simple.
    """
    def _calculate_sha256(self, file_content: str) -> str: 
        return hashlib.sha256(file_content.encode('utf-8')).hexdigest()
    
    """
    _write_chunks_cache: write the chunks to the cache file (chunks_cache.txt) for logging and 
    monitoring. 
    """
    def _write_chunks_cache(self, relative_path: str, chunks: list[dict], scope: str, domain: str, layer: str):
        cache_file = "./chunks_cache.txt"

        with open(cache_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"File: {relative_path}\n")
            f.write(f"Scope: {scope} | Domain: {domain} | Layer: {layer}\n")
            f.write(f"Chunks Generated: {len(chunks)}\n")
            f.write(f"{'='*80}\n\n")
            
            for i, chunk in enumerate(chunks):
                f.write(f"--- Chunk {i+1} ---\n")
                f.write(f"Entity: {chunk.get('entity_name', 'None')}\n")
                f.write(f"Lines: {chunk.get('start_line')}-{chunk.get('end_line')}\n")
                f.write(f"Content:\n{chunk['content']}\n\n")

    """
    _reset_chunks_cache: resets the current cache in favor of writing new data. Usually going to
    be used at the start of the run for better run monitoring.
    """
    def _reset_chunks_cache(self):
        cache_file = "chunks_cache.txt"
        if os.path.exists(cache_file):
            os.remove(cache_file)
        print(f"Chunks cache reset.")
    

    """
    run: the main method of the class. contains the full length of the ingestion pipeline. 
    """
    def run(self) -> list[Document]:
        # load the existing registry if available
        self._load_registry()

        global_chunks = []

        metrics = {
            "scanned": 0,
            "ignored": 0,
            "skipped": 0,
            "updated_or_new": 0,
            "failed": 0,
        }
        failed_logs = []

        # use os to walk through the repo and retrieve root, directories, and files
        for root, dirs, files in os.walk(self.repo_path):
            # prune ignored folders pre-exec
            dirs[:] = [d for d in dirs if d not in self.DIR_IGNORE]

            # iterate through files
            for file in files: 
                metrics["scanned"] += 1

                full_path = os.path.join(root, file)
                # relative path: replace backslashes to forward slashes
                relative_path = os.path.relpath(full_path, self.repo_path).replace("\\", "/") 

                # retrieve file extension, apply whitelisting logic here
                ext = os.path.splitext(file)[1].lower()
                if ext not in self.EXT_ALLOWED:
                    metrics["ignored"] += 1
                    continue
            
                # attempt to read raw code text by opening file and reading (r) with 
                # default encoding (utf-8) while ignoring errors. tracks error in reading
                # files using metrics.failed and logs it in failed_logs
                try: 
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f: 
                        raw_code_contents = f.read()
                except Exception as e:
                    metrics['failed'] += 1
                    failed_logs.append(f"Error reading {relative_path}: {str(e)}") 
                    continue

                # change_detection: hash the file to see changes
                current_hash = self._calculate_sha256(raw_code_contents)
                old_hash = self.hash_registry.get(relative_path)

                # add metrics.skipped if the two hashes are the same. that means no changes
                # have been occured so we can move on to the next file
                if old_hash == current_hash:
                    metrics['skipped'] += 1
                    continue 

                # if we bypass the if conditional above, that means there is either a) a new
                # or a b) modified file block. automatically track that in metrics.updated_or_new
                # ++ updated the current instance hash_registry so that it saves via the
                # save_registry method
                self.hash_registry[relative_path] = current_hash
                metrics['updated_or_new'] += 1

                # parser/loader: uses a unique structure adapted to the current app right now
                # so unfortunately it is a bit rigid in that regard. first determines the scope
                # whether from nextjs (web) or fastapi (server), then determines domain (auth, notepad, etc)
                # then determines the layer (api_router, view_page, etc)

                # metadata properties
                scope = ""
                domain = ""
                layer = ""
                file_path = ""
                
                # AST metadata

                splitter = self._chunk_text 

                """ POSSIBLE VALUES FOR METADATA
                {
                    "scope": "backend_service | frontend_ui | global_repo_config",
                    "domain": "auth | notepad | dashboard | global_shared | infrastructure",
                    "layer": "api_router | data_migration | view_page | server_action | ui_component | middleware | utility",
                    "file_path": "relative/path/to/file.ext",
                    "entity_name": "NameOfFunctionOrClassOrNone"  # Derived via AST parsing
                }
                """

                # Determine scope
                if "web" in relative_path:
                    scope = "frontend_ui"
                    splitter = self._chunk_typescript
                    
                    # Determine domain
                    if "auth" in relative_path:
                        domain = "auth"
                    elif "notes" in relative_path:
                        domain = "notepad"
                    elif "dash" in relative_path:
                        domain = "dashboard"
                    elif "middleware" in relative_path or "utils" in relative_path:
                        domain = "global_shared"
                    else:
                        domain = "infrastructure"  # config files
                    
                    # Determine layer
                    if "page.tsx" in file:
                        layer = "view_page"
                    elif "layout.tsx" in file:
                        layer = "view_page"
                    elif "actions.ts" in file:
                        layer = "server_action"
                    elif "_components" in relative_path or file.endswith((".tsx", ".ts")) and relative_path.endswith((".tsx", ".ts")) and file[0].isupper():
                        layer = "ui_component"
                    elif "middleware" in relative_path:
                        layer = "middleware"
                    elif "utils" in relative_path:
                        layer = "utility"
                    elif any(x in file for x in ["constants.ts", "types.ts", "proxy.ts"]):
                        layer = "utility"
                    else:
                        layer = "utility"  # fallback

                elif "server" in relative_path:
                    scope = "backend_service"
                    splitter = self._chunk_python
                    
                    # Determine domain for server
                    if "auth" in relative_path:
                        domain = "auth"
                    else:
                        domain = "infrastructure"
                    
                    # Determine layer for server
                    if "models.py" in file:
                        layer = "data_migration"
                    elif "schemas.py" in file or "auth.py" in file:
                        layer = "api_router"
                    elif "middleware" in relative_path:
                        layer = "middleware"
                    else:
                        layer = "utility"

                # print(f"  → Scope: {scope}, Domain: {domain}, Layer: {layer}")

                text_chunks = splitter(raw_code_contents)
                # Optional: write the chunks on the cache for logging and monitoring using the
                # custom helper functions
                # self._write_chunks_cache(relative_path, text_chunks, scope, domain, layer)
                # print(f"  → Text chunks generated: {len(text_chunks)}")

                for index, chunk_text in enumerate(text_chunks): 

                    content = (
                        f"// File Location: {relative_path}\n"
                        f"// Code Block Group: {scope}:{domain}:{layer} \n"
                        f"// Chunk Identifier: {index + 1}\n\n"
                        f"{chunk_text['content']}"
                    )

                    doc = Document( 
                        page_content=content,
                        metadata={
                            "source_path": relative_path, 
                            "file_name": file,
                            "file_extension": ext.replace(".", ""),
                            "code_group": f"{scope}:{domain}:{layer}"
                        }
                    )

                    global_chunks.append(doc)
        
        self._save_registry()
        return global_chunks



if __name__ == "__main__":

    inst = RepoIngestor('../app')
    docs = inst.run()
    print(f"Total docs: {len(docs)}")