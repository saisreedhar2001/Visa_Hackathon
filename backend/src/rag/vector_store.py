"""
Vector Store - ChromaDB integration for document storage and retrieval
Free, local vector database - no API keys needed!
"""
from typing import List, Dict, Optional
import os

import chromadb
from chromadb.config import Settings as ChromaSettings

from src.core.config import settings
from src.core.logging import logger
from src.rag.embeddings import get_embedding_generator


class VectorStore:
    """
    Manages the ChromaDB vector database for storing and retrieving
    visa policy documents and related information.
    ChromaDB is free and runs locally - no external API needed!
    """
    
    def __init__(self):
        # Create persistent storage directory
        persist_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "chromadb")
        os.makedirs(persist_dir, exist_ok=True)
        
        # Initialize ChromaDB with persistent storage
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        self.embedding_generator = get_embedding_generator()
        
        # Create or get collections (like namespaces in Pinecone)
        self.collections = {}
        self._ensure_collections_exist()
        
        logger.info(f"VectorStore (ChromaDB) initialized at: {persist_dir}")
    
    def _ensure_collections_exist(self):
        """Create collections if they don't exist"""
        collection_names = ["policies", "countries", "financial", "default"]
        
        for name in collection_names:
            self.collections[name] = self.client.get_or_create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"}  # Use cosine similarity
            )
            logger.info(f"Collection '{name}' ready")
    
    def upsert_documents(
        self, 
        documents: List[Dict],
        namespace: str = "default"
    ) -> int:
        """
        Insert or update documents in the vector store.
        
        Args:
            documents: List of dicts with 'id', 'text', and 'metadata'
            namespace: Collection name (e.g., 'countries', 'policies')
            
        Returns:
            Number of documents upserted
        """
        if namespace not in self.collections:
            self.collections[namespace] = self.client.get_or_create_collection(
                name=namespace,
                metadata={"hnsw:space": "cosine"}
            )
        
        collection = self.collections[namespace]
        
        ids = []
        embeddings = []
        documents_text = []
        metadatas = []
        
        for doc in documents:
            ids.append(doc['id'])
            embeddings.append(self.embedding_generator.embed_text(doc['text']))
            documents_text.append(doc['text'][:10000])  # ChromaDB has larger limits
            metadatas.append(doc.get('metadata', {}))
        
        # Upsert to collection
        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents_text,
            metadatas=metadatas
        )
        
        logger.info(f"Upserted {len(documents)} documents to collection '{namespace}'")
        return len(documents)
    
    def query(
        self,
        query_text: str,
        top_k: int = 5,
        namespace: str = "default",
        filter_dict: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Query the vector store for similar documents.
        
        Args:
            query_text: The query text
            top_k: Number of results to return
            namespace: Collection to search in
            filter_dict: Optional metadata filters
            
        Returns:
            List of matching documents with scores
        """
        if namespace not in self.collections:
            logger.warning(f"Collection '{namespace}' not found, returning empty results")
            return []
        
        collection = self.collections[namespace]
        
        # Generate query embedding
        query_embedding = self.embedding_generator.embed_query(query_text)
        
        # Build where filter if provided
        where = filter_dict if filter_dict else None
        
        try:
            count = collection.count()
            if count == 0:
                return []
                
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, count),
                where=where,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            if results and results['ids'] and len(results['ids'][0]) > 0:
                for i in range(len(results['ids'][0])):
                    # Convert distance to similarity score (ChromaDB returns distances)
                    distance = results['distances'][0][i] if results['distances'] else 0
                    score = 1 - distance  # Convert distance to similarity
                    
                    formatted_results.append({
                        'id': results['ids'][0][i],
                        'text': results['documents'][0][i] if results['documents'] else "",
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'score': score
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []
    
    def delete_namespace(self, namespace: str):
        """Delete a collection"""
        try:
            self.client.delete_collection(namespace)
            if namespace in self.collections:
                del self.collections[namespace]
            logger.info(f"Deleted collection '{namespace}'")
        except Exception as e:
            logger.error(f"Failed to delete collection: {e}")
    
    def get_stats(self) -> Dict:
        """Get collection statistics"""
        stats = {}
        for name, collection in self.collections.items():
            stats[name] = {"count": collection.count()}
        return stats


# Singleton instance
_vector_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    """Get or create the vector store singleton"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
