# Third-party Libraries
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select
from typing import Annotated

# Application Modules
from database import get_db 
from auth import get_password_hash, verify_password, create_access_token, decode_token
from models import User
from schemas import UserCreate, UserResponse, AccessToken, DeleteUserRequest, DeleteUserResponse

app = FastAPI()

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

@app.get('/')
def root():
    return {"message": "Welcome to FastAPI!"}