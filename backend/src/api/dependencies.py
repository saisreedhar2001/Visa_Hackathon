"""
API Dependencies - Dependency injection for FastAPI
"""
from functools import lru_cache
from typing import Generator

from src.orchestrator.crew import MobilityAnalysisCrew
from src.rag.retriever import RAGRetriever
from src.services.country_service import CountryService
from src.services.scoring_service import ScoringService
from src.services.session_service import SessionService


@lru_cache()
def get_crew() -> MobilityAnalysisCrew:
    """Get the mobility analysis crew (cached)"""
    return MobilityAnalysisCrew()


@lru_cache()
def get_rag_retriever() -> RAGRetriever:
    """Get the RAG retriever (cached)"""
    return RAGRetriever()


@lru_cache()
def get_country_svc() -> CountryService:
    """Get the country service (cached)"""
    return CountryService()


@lru_cache()
def get_scoring_svc() -> ScoringService:
    """Get the scoring service (cached)"""
    return ScoringService()


def get_session_svc() -> SessionService:
    """Get session service (not cached - maintains state)"""
    return SessionService()
