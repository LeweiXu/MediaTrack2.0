from fastapi import APIRouter, Query
from app.schemas.search import SearchResult
from app.services.search_service import search_media

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[SearchResult])
async def search(
    title:  str           = Query(..., min_length=1, description="Title to search for"),
    medium: str           = Query("",                description="Optional medium hint"),
):
    """
    Auto-search external providers (TMDB, AniList, IGDB, Google Books)
    and return up to 10 normalised results.
    """
    return await search_media(title=title, medium=medium)
