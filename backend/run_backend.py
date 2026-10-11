import uvicorn
import os
import sys

# Ensure backend root is on Python sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from seed_data import seed_database

if __name__ == "__main__":
    print("=" * 65)
    print(" Tamil Nadu 3D Bus Driving Simulator - Backend API Server")
    print("=" * 65)
    
    # Run automatic seeding if database is brand new
    try:
        seed_database()
        print("Database schema verified and initial catalog prepared.")
    except Exception as err:
        print(f"Database setup notice: {err}")

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"\nStarting Uvicorn Server at http://localhost:{port}")
    print(f" - Interactive API Documentation: http://localhost:{port}/docs")
    print(f" - Playable 3D Bus Simulator:     http://localhost:{port}/game (or http://localhost:{port}/)")
    print("=" * 65 + "\n")

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
