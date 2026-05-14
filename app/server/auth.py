from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings

# Password hashing config using bcrypt, cited by Gemini AI to be 'safe, secure, and efficient'
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

"""
VERIFY_PASSWORD: Compares a login attempt PW with a stored MySQL hash.
Returns either true or false. Truncated to adhere to bcrypt limits regarding UTF-8 level.
"""
def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(truncated, hashed_password)

"""
GET_PASSWORD_HASH: Generates a password salt and hashes password for registration.
Truncated to adhere to bcrypt limits regarding UTF-8 level.
"""
def get_password_hash(password: str) -> str:
    truncated = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated)

"""
CREATE_ACCESS_TOKEN: Genearte a JSON Web Token for the web client to store
"""
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Use timezone-aware UTC
    now = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

"""
DECODE_TOKEN: Decodes the JWT and returns the payload if valid.
"""
def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
