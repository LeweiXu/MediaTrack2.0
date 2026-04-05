from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.entry import EntryCreate, EntryListResponse, EntryRead, EntryUpdate
from app.services import entry_service

router = APIRouter(prefix="/entries", tags=["entries"])


@router.get("", response_model=EntryListResponse)
def list_entries(
    # Filters
    status: Optional[str] = Query(None, description="Filter by status"),
    medium: Optional[str] = Query(None, description="Filter by medium"),
    origin: Optional[str] = Query(None, description="Filter by origin"),
    title:  Optional[str] = Query(None, description="Search by title (case-insensitive)"),
    # Sorting
    sort:   str = Query("updated_at", description="Column to sort by"),
    order:  str = Query("desc",       description="asc or desc"),
    # Pagination
    limit:  int = Query(40,  ge=1, le=2000, description="Max results to return"),
    offset: int = Query(0,   ge=0,          description="Number of results to skip"),
    db: Session = Depends(get_db),
):
    return entry_service.get_entries(
        db,
        status=status,
        medium=medium,
        origin=origin,
        title=title,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset,
    )


@router.get("/{entry_id}", response_model=EntryRead)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = entry_service.get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry


@router.post("", response_model=EntryRead, status_code=status.HTTP_201_CREATED)
def create_entry(payload: EntryCreate, db: Session = Depends(get_db)):
    return entry_service.create_entry(db, payload)


@router.put("/{entry_id}", response_model=EntryRead)
def update_entry(entry_id: int, payload: EntryUpdate, db: Session = Depends(get_db)):
    entry = entry_service.get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry_service.update_entry(db, entry, payload)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = entry_service.get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    entry_service.delete_entry(db, entry)
