from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class SearchResult(BaseModel):
    """A single result from the auto-search endpoint."""
    title:       str
    medium:      Optional[str] = None
    origin:      Optional[str] = None
    year:        Optional[int] = None
    cover_url:   Optional[str] = None
    total:       Optional[int] = None   # total episodes / pages
    external_id: Optional[str] = None
    source:      str = ""               # e.g. "tmdb", "anilist", "igdb", "google_books"
    description: Optional[str] = None
