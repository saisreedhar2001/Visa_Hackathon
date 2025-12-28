"""
Utility Helper Functions
"""
from typing import Any, Dict, List
import re


def clean_text(text: str) -> str:
    """Clean and normalize text"""
    if not text:
        return ""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format a number as currency"""
    symbols = {"USD": "$", "EUR": "€", "GBP": "£", "AED": "AED "}
    symbol = symbols.get(currency, f"{currency} ")
    return f"{symbol}{amount:,.0f}"


def format_percentage(value: float) -> str:
    """Format a decimal as percentage"""
    return f"{value * 100:.0f}%"


def extract_numbers(text: str) -> List[float]:
    """Extract all numbers from text"""
    pattern = r'[\d,]+\.?\d*'
    matches = re.findall(pattern, text)
    return [float(m.replace(',', '')) for m in matches if m]


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to max length with suffix"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)].rsplit(' ', 1)[0] + suffix


def merge_dicts(base: Dict, override: Dict) -> Dict:
    """Deep merge two dictionaries"""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result


def safe_get(data: Dict, path: str, default: Any = None) -> Any:
    """Safely get nested dictionary value using dot notation"""
    keys = path.split('.')
    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
        else:
            return default
        if result is None:
            return default
    return result
