import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .database import engine, Base
from .routers import (
    auth_router,
    profile_router,
    garage_router,
    routes_router,
    leaderboard_router,
    telemetry_router
)

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for Tamil Nadu 3D Realistic Bus Driving Simulator Game"
)

# Enable CORS for Unity clients, WebGL builds, and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(garage_router, prefix=settings.API_V1_STR)
app.include_router(routes_router, prefix=settings.API_V1_STR)
app.include_router(leaderboard_router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router, prefix=settings.API_V1_STR)

# Serve playable 3D frontend statically
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend_playable"))
if os.path.exists(frontend_dir):
    app.mount("/game", StaticFiles(directory=frontend_dir, html=True), name="frontend_playable")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": settings.DATABASE_URL.split("///")[0] if "///" in settings.DATABASE_URL else "configured"
    }

@app.get("/")
def root_index():
    index_file = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Open /docs for Swagger interactive endpoints or /game for 3D simulation."
    }
