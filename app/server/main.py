from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Annotated

from database import get_db 
# from security import hash_password, verify_password, create_access_token, decode_token
from models import User
# from schemas import UserCreate, UserResponse, Token

app = FastAPI()

# This tells FastAPI where to look for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    # db: AsyncSession = Depends(get_db)
):
    """
    Decodes the JWT and fetches the user from MySQL.
    In a JWT setup, 'logout' is handled by the React client deleting this token.
    """
    # payload = decode_token(token)
    # user = await db.get(User, payload.get("sub"))
    # if not user: raise HTTPException(status_code=401)
    # return user
    pass

@app.post('/auth/register', response_model=None, status_code=status.HTTP_201_CREATED)
async def process_register(
    # user_in: UserCreate, 
    # db: AsyncSession = Depends(get_db)
):
    """
    Hashes the password and saves the new user to MySQL.
    """
    # hashed = hash_password(user_in.password)
    # new_user = User(**user_in.dict(exclude={'password'}), hashed_password=hashed)
    # db.add(new_user)
    # await db.commit()
    return {"message": "User registered successfully"}

@app.post("/auth/login")
async def process_login(
    # form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    # db: AsyncSession = Depends(get_db)
):
    """
    Verifies credentials and returns a JWT access token to the React frontend.
    """
    # user = await db.execute(select(User).where(User.username == form_data.username))
    # if not user or not verify_password(form_data.password, user.hashed_password):
    #     raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    # access_token = create_access_token(data={"sub": str(user.id)})
    # return {"access_token": access_token, "token_type": "bearer"}
    pass

@app.get('/')
def root():
    return {"message": "Welcome to FastAPI!"}