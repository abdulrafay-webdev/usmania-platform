from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers import auth, users, roles, students, teachers, staff, finance, donors, upload

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed initial roles & Super Admin on launch
    try:
        init_db()
    except Exception as e:
        print("[Lifespan] Error initializing and seeding database:", e)
    yield

app = FastAPI(
    title="Jamia Usmania Trust — Madrasa Management API",
    description="Backend API for managing Student & Teacher records, Staff Management, Finance Module, RBAC Users & Roles, Donors Directory, Hijri date conversion, PDF exports, and Excel exports.",
    version="1.4.0",
    lifespan=lifespan
)

# Custom CORS and Exception Handler Middleware
@app.middleware("http")
async def add_cors_headers_middleware(request: Request, call_next):
    # Fast path for OPTIONS preflight
    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        try:
            response = await call_next(request)
        except Exception as exc:
            print("Unhandled server exception:", exc)
            response = JSONResponse(status_code=500, content={"detail": str(exc)})

    origin = request.headers.get("origin")
    if not origin:
        origin = "*"

    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, X-Requested-With, Cookie"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition, Content-Length, Set-Cookie"
    return response

# Standard CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://usmania-platform.vercel.app",
        "https://usmania-platform-frontend.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(staff.router)
app.include_router(finance.router)
app.include_router(donors.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Jamia Usmania Trust Management API",
        "version": "1.3.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
