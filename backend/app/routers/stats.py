from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.stats import StatsResponse
from app.services.stats_service import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
def stats(db: Session = Depends(get_db)):
    """Return aggregated statistics across the entire library."""
    return get_stats(db)
