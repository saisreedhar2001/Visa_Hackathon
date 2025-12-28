"""
Document Indexer - Index documents into the vector store
"""
import json
import os
from pathlib import Path
from typing import List, Dict
import hashlib

from src.rag.vector_store import get_vector_store
from src.core.logging import logger


class DocumentIndexer:
    """
    Indexes documents from the data folder into Pinecone.
    Handles JSON and Markdown files.
    """
    
    def __init__(self, data_dir: str = None):
        self.vector_store = get_vector_store()
        self.data_dir = data_dir or Path(__file__).parent.parent.parent / "data"
    
    def index_all(self):
        """Index all documents from the data directory"""
        logger.info("Starting full document indexing...")
        
        # Index country data
        self.index_countries()
        
        # Index policy documents
        self.index_policies()
        
        # Index financial thresholds
        self.index_financial_data()
        
        logger.info("Document indexing complete")
    
    def index_countries(self):
        """Index country JSON files"""
        countries_dir = Path(self.data_dir) / "countries"
        
        if not countries_dir.exists():
            logger.warning(f"Countries directory not found: {countries_dir}")
            return
        
        documents = []
        
        for json_file in countries_dir.glob("*.json"):
            with open(json_file, 'r', encoding='utf-8') as f:
                country_data = json.load(f)
            
            # Create document for each visa type
            country_name = json_file.stem
            
            for visa_type in country_data.get('visa_types', []):
                doc_text = self._format_visa_document(country_name, visa_type)
                doc_id = self._generate_id(f"{country_name}_{visa_type['type']}")
                
                documents.append({
                    'id': doc_id,
                    'text': doc_text,
                    'metadata': {
                        'country': country_name,
                        'visa_type': visa_type['type'],
                        'source': 'country_data',
                        'title': f"{country_name.title()} - {visa_type['name']}"
                    }
                })
            
            # Create general country document
            general_doc = self._format_country_overview(country_name, country_data)
            documents.append({
                'id': self._generate_id(f"{country_name}_overview"),
                'text': general_doc,
                'metadata': {
                    'country': country_name,
                    'source': 'country_overview',
                    'title': f"{country_name.title()} Immigration Overview"
                }
            })
        
        if documents:
            self.vector_store.upsert_documents(documents, namespace="policies")
            logger.info(f"Indexed {len(documents)} country documents")
    
    def index_policies(self):
        """Index markdown policy documents"""
        policies_dir = Path(self.data_dir) / "policies"
        
        if not policies_dir.exists():
            logger.warning(f"Policies directory not found: {policies_dir}")
            return
        
        documents = []
        
        for md_file in policies_dir.glob("*.md"):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split into chunks if too long
            chunks = self._chunk_text(content, max_length=1000)
            
            for i, chunk in enumerate(chunks):
                doc_id = self._generate_id(f"{md_file.stem}_{i}")
                
                documents.append({
                    'id': doc_id,
                    'text': chunk,
                    'metadata': {
                        'source': 'policy_document',
                        'title': md_file.stem.replace('_', ' ').title(),
                        'chunk_index': i
                    }
                })
        
        if documents:
            self.vector_store.upsert_documents(documents, namespace="policies")
            logger.info(f"Indexed {len(documents)} policy document chunks")
    
    def index_financial_data(self):
        """Index financial thresholds"""
        financial_file = Path(self.data_dir) / "financial_thresholds.json"
        
        if not financial_file.exists():
            logger.warning(f"Financial data not found: {financial_file}")
            return
        
        with open(financial_file, 'r', encoding='utf-8') as f:
            financial_data = json.load(f)
        
        documents = []
        
        for country, thresholds in financial_data.items():
            doc_text = self._format_financial_document(country, thresholds)
            doc_id = self._generate_id(f"financial_{country}")
            
            documents.append({
                'id': doc_id,
                'text': doc_text,
                'metadata': {
                    'country': country,
                    'source': 'financial_thresholds',
                    'title': f"{country.title()} Financial Requirements"
                }
            })
        
        if documents:
            self.vector_store.upsert_documents(documents, namespace="financial")
            logger.info(f"Indexed {len(documents)} financial documents")
    
    def _format_visa_document(self, country: str, visa_type: Dict) -> str:
        """Format visa type data as searchable document"""
        parts = [
            f"Country: {country.title()}",
            f"Visa Type: {visa_type.get('name', visa_type['type'])}",
            f"Description: {visa_type.get('description', '')}",
            f"Requirements: {', '.join(visa_type.get('requirements', []))}",
            f"Processing Time: {visa_type.get('processing_time', 'Varies')}",
            f"Duration: {visa_type.get('duration', 'Varies')}",
            f"Path to PR: {visa_type.get('path_to_pr', 'Unknown')}"
        ]
        return "\n".join(parts)
    
    def _format_country_overview(self, country: str, data: Dict) -> str:
        """Format country overview as searchable document"""
        parts = [
            f"Country: {country.title()}",
            f"Immigration Friendliness: {data.get('immigration_friendliness', 'Unknown')}/10",
            f"Fintech Readiness: {data.get('fintech_readiness', 'Unknown')}/10",
            f"Official Language: {data.get('language', 'Unknown')}",
            f"Skill Demand Areas: {', '.join(data.get('skill_demand', []))}",
            f"Stepping Stone Potential: {data.get('stepping_stone_potential', 'Unknown')}",
            f"Notes: {data.get('notes', '')}"
        ]
        return "\n".join(parts)
    
    def _format_financial_document(self, country: str, thresholds: Dict) -> str:
        """Format financial thresholds as searchable document"""
        parts = [f"Country: {country.title()}", "Financial Requirements:"]
        
        for visa_type, amounts in thresholds.items():
            parts.append(f"  {visa_type}:")
            if isinstance(amounts, dict):
                for key, value in amounts.items():
                    parts.append(f"    - {key}: {value}")
            else:
                parts.append(f"    - Amount: {amounts}")
        
        return "\n".join(parts)
    
    def _chunk_text(self, text: str, max_length: int = 1000) -> List[str]:
        """Split text into chunks while preserving paragraphs"""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) < max_length:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks or [text]
    
    def _generate_id(self, base: str) -> str:
        """Generate a unique document ID"""
        return hashlib.md5(base.encode()).hexdigest()[:16]
