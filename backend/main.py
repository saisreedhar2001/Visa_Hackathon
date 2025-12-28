"""
Global Mobility Intelligence Platform - Backend Entry Point
"""
import os
from dotenv import load_dotenv

# Load environment variables FIRST before any other imports
load_dotenv()

# Set CrewAI environment variables early
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
os.environ["OTEL_SDK_DISABLED"] = "true"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import analysis, countries, health, chat, travel
from src.api.routes import explore  # Dynamic path exploration
from src.core.config import settings

# Verify Groq API key is loaded
if settings.GROQ_API_KEY:
    print(f"✅ Groq API Key loaded successfully")
    os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
else:
    print("❌ WARNING: Groq API Key not found in .env file!")

app = FastAPI(
    title="Global Mobility Intelligence API",
    description="AI-powered global mobility and visa pathway analysis",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(countries.router, prefix="/api/v1", tags=["Countries"])
app.include_router(explore.router, prefix="/api/v1", tags=["Explore"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(travel.router, prefix="/api/v1", tags=["Travel"])


@app.get("/")
async def root():
    return {
        "message": "Global Mobility Intelligence API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
