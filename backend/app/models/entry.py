from datetime import datetime, timezone
from sqlalchemy import (
    Integer, String, Float, DateTime, Text, func
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Entry(Base):
    """A single piece of tracked media (film, book, game, etc.)."""

    __tablename__ = "entries"

    # ── Identity ──────────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Core metadata ─────────────────────────────────────────────────────────
    title:     Mapped[str]           = mapped_column(String(500), nullable=False, index=True)
    medium:    Mapped[str | None]    = mapped_column(String(100), nullable=True, index=True)
    origin:    Mapped[str | None]    = mapped_column(String(100), nullable=True, index=True)
    year:      Mapped[int | None]    = mapped_column(Integer,     nullable=True)
    cover_url: Mapped[str | None]    = mapped_column(String(1000),nullable=True)
    notes:     Mapped[str | None]    = mapped_column(Text,        nullable=True)

    # ── External source tracking (from auto-search) ───────────────────────────
    external_id: Mapped[str | None]  = mapped_column(String(200), nullable=True)
    source:      Mapped[str | None]  = mapped_column(String(100), nullable=True)

    # ── Status & rating ───────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="planned", index=True
    )
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ── Progress ──────────────────────────────────────────────────────────────
    progress: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total:    Mapped[int | None] = mapped_column(Integer, nullable=True)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at:   Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at:   Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=_utcnow,
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    def __repr__(self) -> str:
        return f"<Entry id={self.id} title={self.title!r} status={self.status!r}>"
