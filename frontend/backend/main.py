from fastapi import FastAPI
from routers import tck_syntax
from routers import tck_reach
from fastapi.middleware.cors import CORSMiddleware
import ctypes
app = FastAPI()

# Include routers from separate files
app.include_router(tck_syntax.router)
app.include_router(tck_reach.router)

origins = [
    "http://localhost:5173",  # React/Svelte dev server
    "http://127.0.0.1:8000",
]

# Add the middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # List of origins that can talk to this backend
    allow_credentials=True,           # Allow cookies/auth headers
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # Allow all headers
)

 










