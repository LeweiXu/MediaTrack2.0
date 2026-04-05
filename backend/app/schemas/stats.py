from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class MediumCount(BaseModel):
    medium: str
    count:  int


class OriginCount(BaseModel):
    origin: str
    count:  int


class MonthCount(BaseModel):
    key:   str   # "YYYY-MM"
    label: str   # "Jan 25"
    count: int


class StatsResponse(BaseModel):
    # Totals by status
    total:     int
    current:   int
    planned:   int
    completed: int
    on_hold:   int
    dropped:   int

    # Averages
    avg_rating: Optional[float] = None

    # Breakdowns
    by_medium: list[MediumCount]
    by_origin: list[OriginCount]

    # Time series (last 12 months)
    entries_per_month: list[MonthCount]
