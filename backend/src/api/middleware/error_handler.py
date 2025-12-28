"""
Error Handler Middleware
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback

from src.core.logging import logger


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handler middleware"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
            
        except HTTPException as e:
            # Re-raise HTTP exceptions as-is
            raise e
            
        except Exception as e:
            # Log the error
            logger.error(f"Unhandled error: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Return generic error response
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Internal server error",
                    "message": str(e) if str(e) else "An unexpected error occurred"
                }
            )


def register_exception_handlers(app):
    """Register exception handlers with the app"""
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.detail,
                "status_code": exc.status_code
            }
        )
    
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Validation error",
                "message": str(exc)
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "An unexpected error occurred"
            }
        )
