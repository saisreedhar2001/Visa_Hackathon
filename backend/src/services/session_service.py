"""
Session Service - Manages analysis sessions
"""
from typing import Dict, Optional
from datetime import datetime
import uuid

from src.core.logging import logger


class SessionService:
    """
    Manages user analysis sessions.
    In production, this would use Redis or a database.
    """
    
    def __init__(self):
        self._sessions: Dict[str, Dict] = {}
    
    def create_session(self, user_profile: Dict) -> str:
        """Create a new analysis session"""
        session_id = str(uuid.uuid4())
        
        self._sessions[session_id] = {
            "id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "pending",
            "user_profile": user_profile,
            "result": None,
            "error": None
        }
        
        logger.info(f"Created session: {session_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        return self._sessions.get(session_id)
    
    def update_session_status(
        self, 
        session_id: str, 
        status: str, 
        result: Dict = None,
        error: str = None
    ):
        """Update session status"""
        if session_id in self._sessions:
            self._sessions[session_id]["status"] = status
            self._sessions[session_id]["updated_at"] = datetime.utcnow().isoformat()
            
            if result:
                self._sessions[session_id]["result"] = result
            if error:
                self._sessions[session_id]["error"] = error
            
            logger.info(f"Updated session {session_id} status to: {status}")
    
    def get_session_result(self, session_id: str) -> Optional[Dict]:
        """Get the result of a completed session"""
        session = self.get_session(session_id)
        if session and session["status"] == "completed":
            return session["result"]
        return None
    
    def delete_session(self, session_id: str):
        """Delete a session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info(f"Deleted session: {session_id}")


# Singleton instance
_session_service = None

def get_session_service() -> SessionService:
    """Get or create the session service singleton"""
    global _session_service
    if _session_service is None:
        _session_service = SessionService()
    return _session_service
