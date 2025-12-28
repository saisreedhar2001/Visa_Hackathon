"""
Citation Extractor - Formats citations for UI display
"""
from typing import List, Dict


class CitationExtractor:
    """
    Extracts and formats citations from RAG results for UI display.
    Creates user-friendly citation formats suitable for the frontend.
    """
    
    @staticmethod
    def format_for_ui(citations: List[Dict]) -> List[Dict]:
        """
        Format citations for frontend display.
        
        Returns citations in a UI-friendly format with:
        - Short title
        - Snippet preview
        - Source indicator
        - Country tag
        """
        formatted = []
        
        for citation in citations:
            formatted.append({
                "id": citation.get('id', ''),
                "title": CitationExtractor._create_title(citation),
                "snippet": CitationExtractor._truncate_snippet(citation.get('snippet', '')),
                "source_type": CitationExtractor._determine_source_type(citation),
                "country": citation.get('country', 'General'),
                "confidence": CitationExtractor._score_to_confidence(citation.get('relevance_score', 0.5)),
                "icon": CitationExtractor._get_icon(citation),
                "url": citation.get('url', None)
            })
        
        return formatted
    
    @staticmethod
    def _create_title(citation: Dict) -> str:
        """Create a concise title for the citation"""
        title = citation.get('title', 'Policy Document')
        country = citation.get('country', '')
        
        if country and country.lower() not in title.lower():
            return f"{country.title()}: {title}"
        return title
    
    @staticmethod
    def _truncate_snippet(snippet: str, max_length: int = 150) -> str:
        """Truncate snippet for preview"""
        if len(snippet) <= max_length:
            return snippet
        return snippet[:max_length].rsplit(' ', 1)[0] + "..."
    
    @staticmethod
    def _determine_source_type(citation: Dict) -> str:
        """Determine the type of source"""
        source = citation.get('source', '').lower()
        
        if 'official' in source or 'government' in source:
            return 'official'
        elif 'policy' in source:
            return 'policy'
        elif 'financial' in source or 'threshold' in source:
            return 'financial'
        else:
            return 'general'
    
    @staticmethod
    def _score_to_confidence(score: float) -> str:
        """Convert relevance score to confidence label"""
        if score >= 0.85:
            return 'high'
        elif score >= 0.7:
            return 'medium'
        else:
            return 'low'
    
    @staticmethod
    def _get_icon(citation: Dict) -> str:
        """Get appropriate icon for the citation type"""
        source_type = CitationExtractor._determine_source_type(citation)
        
        icons = {
            'official': '🏛️',
            'policy': '📋',
            'financial': '💰',
            'general': '📄'
        }
        
        return icons.get(source_type, '📄')
    
    @staticmethod
    def group_by_country(citations: List[Dict]) -> Dict[str, List[Dict]]:
        """Group citations by country for organized display"""
        grouped = {}
        
        for citation in citations:
            country = citation.get('country', 'General')
            if country not in grouped:
                grouped[country] = []
            grouped[country].append(citation)
        
        return grouped
    
    @staticmethod
    def create_citation_summary(citations: List[Dict]) -> str:
        """Create a text summary of citations for agent context"""
        if not citations:
            return "No specific policy sources referenced."
        
        summary_parts = ["Sources referenced:"]
        
        for i, citation in enumerate(citations[:5], 1):  # Top 5
            summary_parts.append(
                f"{i}. {citation.get('title', 'Document')} - {citation.get('snippet', '')[:100]}"
            )
        
        return "\n".join(summary_parts)
