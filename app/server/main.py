# Third-party Libraries
import logging

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Annotated
from dotenv import load_dotenv
import os

# Application Modules
from database import get_db 
from auth import get_password_hash, verify_password, create_access_token, decode_token
from models import User, Notepad, Task
from schemas import (
    NotepadUpdate, TaskResponse, UserCreate, UserResponse, AccessToken, DeleteUserRequest, DeleteUserResponse,
    NotepadCreate, NotepadResponse, NotepadDeleteResponse,
)

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("NEXT_PUBLIC_BASE_URL", "http://localhost:3001")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This tells FastAPI where to look for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

"""
get_current_user: decodes the JWT & fetches the user from MySQL database.
- Logout is handled by the web client deleting the token
"""
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
):
    payload = decode_token(token)
    
    # sub_extraction: check payload and extract 'sub' into a local variable
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = payload.get("sub")
    
    # type_narrowing: ensure user_id_raw is not None before int()
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token missing subject")

    # user_fetching: fetch the existing user associated with the id
    # - Gemini Note: Use select(...).where() for async scalars
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    # result: the user model object
    return user

"""
process_register: POST /auth/register asynchronous function where a successful registration
leads to hashing the password and saving the new user to MySQL
- Successful status code used in 201 (data created)
- Response model used is UserResponse, defined in schemas.py
"""
@app.post('/auth/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def process_register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
):
    hashed = get_password_hash(user_in.password)
    
    # Payload Schema -> User Model; Use hashed password over plaintext password
    # Note: fucking convenient lmao this is fast as shit
    user_data = user_in.model_dump(exclude={'password'})
    new_user = User(**user_data, hashed_password=hashed)
    
    db.add(new_user)
    
    try:
        await db.commit()
        await db.refresh(new_user)      
    # Duplicate email or username exception
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username or email already registered"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An unexpected error occurred"
        )
    
    # response: the data of the new user (without the password as UserResponse)
    return new_user

"""
process_login: verifies if credentials match with current database info and returns a 
JWT access token to the web client if true. 
- Response model is based on AccessToken in schemas.py
- No status_code since by default if successsful, it already returns 200
"""
@app.post("/auth/login", response_model=AccessToken)
async def process_login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == form_data.username))
    
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect credentials"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

"""
process_delete_user: deletes a user by username.
- Response model is MessageResponse in schemas.py
"""
@app.delete("/auth/delete", response_model=DeleteUserResponse)
async def process_delete_user(
    payload: DeleteUserRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    deleted_user_id = user.id
    await db.delete(user)
    await db.commit()

    return {"message": f"User '{payload.username}' deleted", "deleted_user_id": deleted_user_id}

"""
handle_notepad_index: Returns a paginated list of all notepads belonging to 
the authenticated user.
  - skip (int, default 0): offset for pagination
  - limit (int, default 21): max records to return per page
"""
@app.get("/notepads", response_model=list[NotepadResponse])
async def handle_notepad_index(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=21, ge=1, le=100),
    title: str = Query(default="")
):
    
    logger.info(f"Title: {title}")

    query = select(Notepad).where((Notepad.user_id == current_user.id)).options(selectinload(Notepad.tasks)).offset(skip).limit(limit)

    if title != "": 
        query = query.where(Notepad.title.ilike(f"%{title}%"))

    result = await db.execute(query)   

    return result.scalars().all()

"""
handle_notepad_create: creates a new notepad (with optional initial tasks) for 
the authenticated user. Title and tasks come from the request body (NotepadCreate schema).
- id, user_id, and timestamps are assigned server-side
"""
@app.post("/notepads", response_model=NotepadResponse, status_code=status.HTTP_201_CREATED)
async def handle_notepad_create(
    payload: NotepadCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    new_notepad = Notepad(user_id=current_user.id, title=payload.title)
    db.add(new_notepad)
    await db.flush()

    for task_data in payload.tasks:
        db.add(Task(notepad_id=new_notepad.id, **task_data.model_dump()))

    try:
        await db.commit()
        await db.refresh(new_notepad)
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notepad"
        )

    result = await db.execute(
        select(Notepad)
        .where(Notepad.id == new_notepad.id)
        .options(selectinload(Notepad.tasks))
    )
    return result.scalars().first()

"""
handle_notepad_select: returns a single notepad (with its tasks) belonging to the 
authenticated user. Returns 404 if the notepad does not exist, and 403 if the notepad 
belongs to a different user
"""
@app.get("/notepads/{notepad_id}", response_model=NotepadResponse)
async def handle_notepad_select(
    notepad_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notepad)
        .where(Notepad.id == notepad_id)
        .options(selectinload(Notepad.tasks))
    )
    notepad = result.scalars().first()

    if not notepad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notepad not found")

    if notepad.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return notepad

""" 
handle_notepad_update: updates the currently existing notepad by receiving the new version
of the notepad and overwriting the data sent in the payload. returns the new version of the 
notepad.
"""
@app.put("/notepads/{notepad_id}")
async def handle_notepad_update(
    notepad: NotepadUpdate, 
    current_user: Annotated[User, Depends(get_current_user)], 
    db: AsyncSession = Depends(get_db)
):
    # validation check if user is editing their own notepad
    if current_user.id != notepad.user_id:
        raise HTTPException(status_code=403, detail="This isn't your notepad, bro")
    
    # name current payload data as 'future' as opposed to 'current' (later)
    future = notepad 

    # retrieve the current iteration of the notepad
    result = await db.execute(
        select(Notepad)
        .where(Notepad.id == notepad.id)
        .options(selectinload(Notepad.tasks))
    )
    current: Notepad | None = result.scalars().first()

    # error case: return 404 if notepad is missing
    if current == None: 
        raise HTTPException(status_code=404, detail="Notepad not found!")

    # parse comparisons using iterations, title first then tasks second 
    current.title = future.title
    
    # for tasks, clear the current pool and append all manually 
    current.tasks.clear()
    for task_info in future.tasks: 
        
        task_instance = Task(
            label=task_info.label,
            checked=task_info.flagged,
            mode=task_info.mode,
        )
        
        current.tasks.append(task_instance)

    # now we commit but wrap it in an error handling try block for error cases
    try:
        await db.commit()
        await db.refresh(current)
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notepad"
        )

    # retrieve the result from the database
    result = await db.execute(
        select(Notepad)
        .where(Notepad.id == current.id)
        .options(selectinload(Notepad.tasks))
    )

    # newly update notepad object
    final = result.scalars().first()

    return final

"""
handle_notepad_delete: deletes a notepad (and its tasks via cascade) for the authenticated user.
Returns 404 if the notepad does not exist, 403 if the notepad belongs to a different user
"""
@app.delete("/notepads/{notepad_id}", response_model=NotepadDeleteResponse)
async def handle_delete(
    notepad_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Notepad).where(Notepad.id == notepad_id))
    notepad = result.scalars().first()

    if not notepad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notepad not found")

    if notepad.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await db.delete(notepad)
    await db.commit()

    return {"message": f"Notepad {notepad_id} deleted", "deleted_notepad_id": notepad_id}

@app.get('/')
def root():
    return {"message": "Welcome to FastAPI!"}

