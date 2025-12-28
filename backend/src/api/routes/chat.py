"""
Chat Routes - API endpoints for the RAG-powered chat assistant
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid

from src.services.chat_service import get_chat_service
from src.core.logging import logger

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message request model"""
    message: str
    session_id: Optional[str] = None
    context_countries: Optional[List[str]] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    session_id: str
    citations: List[dict] = []
    detected_countries: List[str] = []
    has_context: bool = False
    suggested_questions: Optional[List[str]] = None


class ClearChatRequest(BaseModel):
    """Clear chat request model"""
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage):
    """
    Send a message to the visa chat assistant.
    
    The assistant uses RAG to retrieve relevant visa policy information
    and provides accurate, context-aware responses.
    
    Args:
        request: ChatMessage with the user's message and optional session_id
        
    Returns:
        ChatResponse with the assistant's response and metadata
    """
    try:
        chat_service = get_chat_service()
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process the chat message
        result = chat_service.chat(
            session_id=session_id,
            message=request.message,
            context_countries=request.context_countries
        )
        
        return ChatResponse(
            response=result["response"],
            session_id=result["session_id"],
            citations=result.get("citations", []),
            detected_countries=result.get("detected_countries", []),
            has_context=result.get("has_context", False)
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/chat/suggestions")
async def get_suggestions():
    """
    Get suggested starter questions for the chat.
    
    Returns:
        List of suggested questions to help users get started
    """
    try:
        chat_service = get_chat_service()
        suggestions = chat_service.get_suggested_questions()
        
        return {
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/clear")
async def clear_chat(request: ClearChatRequest):
    """
    Clear conversation history for a session.
    
    Args:
        request: ClearChatRequest with the session_id to clear
        
    Returns:
        Success status
    """
    try:
        chat_service = get_chat_service()
        success = chat_service.clear_conversation(request.session_id)
        
        return {
            "success": success,
            "message": "Conversation cleared" if success else "Session not found"
        }
        
    except Exception as e:
        logger.error(f"Error clearing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/health")
async def chat_health():
    """
    Check the health of the chat service.
    
    Returns:
        Health status of the chat service
    """
    try:
        chat_service = get_chat_service()
        
        return {
            "status": "healthy",
            "model": chat_service.model,
            "rag_available": chat_service.retriever is not None
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
