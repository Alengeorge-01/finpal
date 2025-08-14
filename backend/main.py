import os
import django
from functools import wraps

# --- Django ORM Setup ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finpal_core.settings')
django.setup()
# --- End of Django ORM Setup ---

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import Annotated

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from asgiref.sync import sync_to_async

# --- Configuration ---
SECRET_KEY = "your-super-secret-key-that-no-one-knows"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Pydantic Models (Data Validation) ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- FastAPI App Instance ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Helper Functions ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Asynchronous Database Functions ---
# These wrappers allow our synchronous Django ORM calls to work in an async environment
@sync_to_async
def get_user(username: str):
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None

@sync_to_async
def create_user(user_data: UserCreate):
    if User.objects.filter(username=user_data.username).exists():
        return None
    new_user = User.objects.create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    return new_user

@sync_to_async
def authenticate_user(username, password):
    return authenticate(username=username, password=password)


# --- API Endpoints ---
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    new_user = await create_user(user)
    if not new_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return {"username": new_user.username, "email": new_user.email}


@app.post("/token", response_model=Token)
async def login_for_access_token(user_data: UserLogin):
    user = await authenticate_user(username=user_data.username, password=user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}