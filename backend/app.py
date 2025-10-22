from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import tck_syntax, tck_reach, tck_liveness, tck_compare, tck_simulate

app = FastAPI(
    title="Timed Automata Analysis Backend",
    description="A backend service for analyzing timed automata using TChecker.",
    version="1.0.0"
)

# include routers
app.include_router(tck_syntax.router)
app.include_router(tck_reach.router)
app.include_router(tck_liveness.router)
app.include_router(tck_compare.router)
app.include_router(tck_simulate.router)

# add middleware to app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],              # allow any origin
    allow_credentials=True,           # allow cookies/auth headers
    allow_methods=["*"],              # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # allow all headers
)
