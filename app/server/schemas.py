from pydantic import BaseModel, EmailStr, ConfigDict

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