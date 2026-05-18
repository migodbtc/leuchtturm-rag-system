from pydantic import BaseModel, EmailStr, ConfigDict
from models import TaskMode
from datetime import datetime

"""
SCHEMAS.PY: A module required in order to parse the schema not of the
database but for the requests that have incoming payloads or outbound
responses.
"""

"""
UserCreate: Schema for login from web client
"""
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

"""
UserResponse: Schema for the response sent back by FastAPI (excluding the
password for security purposes, this is basically the user data w/o it)
"""
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    
    # Allow pydantic to read data from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)

"""
AccessToken: Schema for what the login endpoint returns for auth session 
operations.
"""
class AccessToken(BaseModel):
    access_token: str
    token_type: str

"""
DeleteUserRequest: Schema for deleting a user by username.
"""
class DeleteUserRequest(BaseModel):
    username: str

"""
DeleteUserResponse: Response for delete user operation.
"""
class DeleteUserResponse(BaseModel):
    message: str
    deleted_user_id: int


"""
TaskCreate: Payload schema for a single task submitted during notepad creation.
Only user-supplied fields — id and notepad_id are assigned server-side.
"""
class TaskCreate(BaseModel):
    label: str
    checked: bool = False
    flagged: bool = False
    mode: TaskMode = TaskMode.checkbox

"""
TaskResponse: Read schema for a Task ORM object.
"""
class TaskResponse(BaseModel):
    id: int
    notepad_id: int
    label: str
    checked: bool
    flagged: bool
    mode: TaskMode

    model_config = ConfigDict(from_attributes=True)

"""
NotepadCreate: Payload for POST /notepads — title + initial task list.
user_id, timestamps, and id are all assigned server-side.
"""
class NotepadCreate(BaseModel):
    title: str
    tasks: list[TaskCreate] = []

"""
NotepadResponse: Read schema for a Notepad ORM object including its tasks.
"""
class NotepadResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    tasks: list[TaskResponse] = []

    model_config = ConfigDict(from_attributes=True)

"""
NotepadDeleteResponse: Response shape for DELETE /notepads/{notepad_id}.
"""
class NotepadDeleteResponse(BaseModel):
    message: str
    deleted_notepad_id: int
