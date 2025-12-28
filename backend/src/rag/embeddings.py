"""
Embeddings - Generate embeddings for documents and queries
"""
from typing import List
from sentence_transformers import SentenceTransformer

from src.core.config import settings
from src.core.logging import logger


class EmbeddingGenerator:
    """
    Generates embeddings using sentence-transformers (free, local).
    Used for both document indexing and query embedding.
    """
    
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.model = SentenceTransformer(self.model_name)
        logger.info(f"EmbeddingGenerator initialized with model: {self.model_name}")
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        embedding = self.model.encode(text)
        return embedding.tolist()
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (batch processing).
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        embeddings = self.model.encode(texts)
        return [emb.tolist() for emb in embeddings]
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a search query.
        Same as embed_text but semantically clearer.
        """
        return self.embed_text(query)


# Singleton instance
_embedding_generator = None

def get_embedding_generator() -> EmbeddingGenerator:
    """Get or create the embedding generator singleton"""
    global _embedding_generator
    if _embedding_generator is None:
        _embedding_generator = EmbeddingGenerator()
    return _embedding_generator
