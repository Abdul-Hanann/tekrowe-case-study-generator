#!/usr/bin/env python3
"""
FastAPI Server Runner for Tekrowe Case Study Generator
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting Tekrowe Case Study Generator API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Interactive API Explorer: http://localhost:8000/redoc")
    print("🏥 Health Check: http://localhost:8000/health")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
