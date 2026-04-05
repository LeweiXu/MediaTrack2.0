#!/usr/bin/env python3
"""
Import a CSV of personal media entries into the MediaTrack database.

Usage (run from the backend/ directory):
    python services/import_service.py [path/to/file.csv]

Defaults to ../../personal.csv relative to this script if no path is given.

CSV columns expected:
    Title, Type, Enjoyment, Objective, Date, Chapter/Episode, Notes

Column mapping:
    Title           → title
    Type            → medium  (normalised to app mediums)
    Objective       → rating
    Date            → completed_at  (DD/MM/YY)
    Chapter/Episode → progress / status
    Notes           → notes

For each row the script searches for the first result via search_media() to
auto-fill cover_url, year, origin, external_id, source, and total.
If search returns nothing, only CSV data is used.
"""
from __future__ import annotations

import asyncio
import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ── Path fix so imports work when called from backend/ ────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from db import SessionLocal
from models import Entry
from services.search_service import search_media

# ── Medium normalisation ──────────────────────────────────────────────────────

_MEDIUM_MAP: dict[str, str] = {
    "web novel":    "Web Novel",
    "webnovel":     "Web Novel",
    "light novel":  "Light Novel",
    "anime":        "Anime",
    "donghua":      "Anime",   # Chinese animation → Anime
    "manga":        "Manga",
    "manhwa":       "Manga",   # Korean manga → Manga
    "manhua":       "Manga",   # Chinese manga → Manga
    "film":         "Film",
    "movie":        "Film",
    "tv show":      "TV Show",
    "tv":           "TV Show",
    "book":         "Book",
    "comics":       "Comics",
    "comic":        "Comics",
    "game":         "Game",
}

def _normalise_medium(raw: str) -> str:
    return _MEDIUM_MAP.get(raw.strip().lower(), raw.strip())


# ── Progress / status parsing ─────────────────────────────────────────────────

def _parse_progress(chap_ep: str) -> tuple[Optional[int], str]:
    """
    Returns (progress_or_None, status).

    "Completed"   → (None, "completed")
    "C325"        → (325, "current")
    "V2C29"       → (29, "current")   # chapter takes precedence
    "V12"         → (None, "current") # volume only, can't map to int progress
    "C45?"        → (45, "current")   # trailing ? stripped
    anything else → (None, "current")
    """
    val = chap_ep.strip()
    if val.lower() == "completed":
        return None, "completed"

    # Extract chapter number (C123 pattern)
    m = re.search(r'[Cc](\d+)', val)
    if m:
        return int(m.group(1)), "current"

    # Volume-only (V12) or unknown
    return None, "current"


# ── Date parsing ──────────────────────────────────────────────────────────────

def _parse_date(date_str: str) -> Optional[datetime]:
    for fmt in ("%d/%m/%y", "%d/%m/%Y"):
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


# ── Main import logic ─────────────────────────────────────────────────────────

USERNAME = "lingwei"
SEARCH_DELAY = 0.4  # seconds between API calls to avoid rate limits


async def _import_rows(rows: list[dict]) -> None:
    db = SessionLocal()
    created = 0
    skipped = 0

    try:
        for i, row in enumerate(rows, start=1):
            title      = row.get("Title", "").strip()
            raw_medium = row.get("Type", "").strip()
            objective  = row.get("Objective", "").strip()
            date_str   = row.get("Date", "").strip()
            chap_ep    = row.get("Chapter/Episode", "").strip()
            notes      = row.get("Notes", "").strip() or None

            if not title:
                print(f"  [{i}] SKIP — empty title")
                skipped += 1
                continue

            medium   = _normalise_medium(raw_medium)
            progress, status = _parse_progress(chap_ep)
            completed_at     = _parse_date(date_str) if status == "completed" else None

            rating: Optional[float] = None
            try:
                rating = float(objective)
            except (ValueError, TypeError):
                pass

            # ── Search for metadata ───────────────────────────────────────────
            cover_url   = None
            year        = None
            origin      = None
            external_id = None
            source      = None
            total       = None

            try:
                results = await search_media(title, medium)
                if results:
                    r = results[0]
                    cover_url   = r.cover_url
                    year        = r.year
                    origin      = r.origin
                    external_id = r.external_id
                    source      = r.source
                    total       = r.total
                    print(f"  [{i}/{len(rows)}] FOUND  '{title}' → '{r.title}' ({r.source})")
                else:
                    print(f"  [{i}/{len(rows)}] NO HIT '{title}' (medium={medium})")
            except Exception as exc:
                print(f"  [{i}/{len(rows)}] SEARCH ERROR '{title}': {exc}")

            entry = Entry(
                title=title,
                medium=medium,
                origin=origin,
                year=year,
                cover_url=cover_url,
                notes=notes,
                status=status,
                rating=rating,
                progress=progress,
                total=total,
                external_id=external_id,
                source=source,
                completed_at=completed_at,
                username=USERNAME,
            )
            db.add(entry)
            db.commit()
            created += 1

            if i < len(rows):
                await asyncio.sleep(SEARCH_DELAY)

    finally:
        db.close()

    print(f"\nDone. Created {created} entries, skipped {skipped}.")


def main() -> None:
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else _BACKEND_DIR.parent / "personal.csv"

    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}")
        sys.exit(1)

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Importing {len(rows)} rows from {csv_path} for user '{USERNAME}' …\n")
    asyncio.run(_import_rows(rows))


if __name__ == "__main__":
    main()
