"""
Health Check Routes
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "Global Mobility Intelligence API",
        "version": "1.0.0"
    }


@router.get("/health/detailed")
async def detailed_health():
    """Detailed health check with component status"""
    return {
        "status": "healthy",
        "components": {
            "api": "healthy",
            "agents": "ready",
            "rag": "connected",
            "database": "not_required"
        }
    }
