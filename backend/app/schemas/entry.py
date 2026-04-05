from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


VALID_STATUSES = {"current", "planned", "completed", "on_hold", "dropped"}


class EntryBase(BaseModel):
    title:       str             = Field(..., min_length=1, max_length=500)
    medium:      Optional[str]   = Field(None, max_length=100)
    origin:      Optional[str]   = Field(None, max_length=100)
    year:        Optional[int]   = Field(None, ge=1800, le=2100)
    cover_url:   Optional[str]   = Field(None, max_length=1000)
    notes:       Optional[str]   = None
    status:      str             = Field("planned", max_length=50)
    rating:      Optional[float] = Field(None, ge=0, le=10)
    progress:    Optional[int]   = Field(None, ge=0)
    total:       Optional[int]   = Field(None, ge=0)
    external_id: Optional[str]   = Field(None, max_length=200)
    source:      Optional[str]   = Field(None, max_length=100)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {sorted(VALID_STATUSES)}")
        return v


class EntryCreate(EntryBase):
    """Schema for POST /entries"""
    pass


class EntryUpdate(BaseModel):
    """Schema for PUT /entries/{id} — all fields optional."""
    title:       Optional[str]   = Field(None, min_length=1, max_length=500)
    medium:      Optional[str]   = Field(None, max_length=100)
    origin:      Optional[str]   = Field(None, max_length=100)
    year:        Optional[int]   = Field(None, ge=1800, le=2100)
    cover_url:   Optional[str]   = Field(None, max_length=1000)
    notes:       Optional[str]   = None
    status:      Optional[str]   = Field(None, max_length=50)
    rating:      Optional[float] = Field(None, ge=0, le=10)
    progress:    Optional[int]   = Field(None, ge=0)
    total:       Optional[int]   = Field(None, ge=0)
    external_id: Optional[str]   = Field(None, max_length=200)
    source:      Optional[str]   = Field(None, max_length=100)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {sorted(VALID_STATUSES)}")
        return v


class EntryRead(EntryBase):
    """Schema for responses — includes DB-generated fields."""
    id:           int
    created_at:   datetime
    updated_at:   datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EntryListResponse(BaseModel):
    """Paginated list response."""
    items: list[EntryRead]
    total: int
    limit: int
    offset: int
