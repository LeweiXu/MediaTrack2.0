from __future__ import annotations

import logging

import httpx

from schemas import SearchResult
from .utils import safe_year, country_to_origin

logger = logging.getLogger(__name__)

# VNDB language code → origin mapping (lowercase keys)
_LANG_TO_ORIGIN: dict[str, str] = {
    "ja": "Japanese",
    "zh": "Chinese",
    "zh-hans": "Chinese",
    "zh-hant": "Chinese",
    "ko": "Korean",
    "en": "Western",
    "de": "Western",
    "fr": "Western",
    "es": "Western",
    "it": "Western",
    "pt": "Western",
    "pt-br": "Western",
    "ru": "Western",
}


async def search_vndb(
    client: httpx.AsyncClient, title: str
) -> list[SearchResult]:
    """
    VNDB public API — no API key required.
    https://api.vndb.org/kana
    """
    try:
        r = await client.post(
            "https://api.vndb.org/kana/vn",
            json={
                "filters": ["search", "=", title],
                "fields": "id,title,released,rating,image.url,olang,tags.name",
                "results": 8,
            },
        )
        r.raise_for_status()
        items = r.json().get("results", [])
    except Exception as exc:
        logger.warning("VNDB search error: %s", exc)
        return []

    results: list[SearchResult] = []
    for item in items:
        vndb_id = item.get("id", "")
        item_title = item.get("title") or ""
        if not item_title:
            continue

        year = safe_year(item.get("released"))

        olang = (item.get("olang") or "").lower()
        origin = _LANG_TO_ORIGIN.get(olang, "Other") if olang else None

        raw_rating = item.get("rating")
        try:
            ext_rating = round(float(raw_rating) / 10, 1) if raw_rating else None
        except (ValueError, TypeError):
            ext_rating = None

        image = item.get("image") or {}
        cover = image.get("url") or None

        tags = item.get("tags") or []
        genres = ", ".join(t["name"] for t in tags if t.get("name"))[:500] or None

        results.append(
            SearchResult(
                title=item_title,
                medium="Visual Novel",
                origin=origin,
                year=year,
                cover_url=cover,
                external_id=vndb_id,
                source="vndb",
                external_url=f"https://vndb.org/{vndb_id}",
                external_rating=ext_rating,
                genres=genres,
            )
        )

    return results
