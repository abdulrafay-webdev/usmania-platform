from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers import students, teachers, upload, auth, finance, donors

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on application launch
    init_db()
    yield

app = FastAPI(
    title="Jamia Usmania Trust — Madrasa Management API",
    description="Backend API for managing Student & Teacher records, Finance Module, Donors Directory & Comments, Hijri date conversion, PDF profile exports, and Excel bulk exports.",
    version="1.2.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(finance.router)
app.include_router(donors.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Jamia Usmania Trust Management API",
        "version": "1.2.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
