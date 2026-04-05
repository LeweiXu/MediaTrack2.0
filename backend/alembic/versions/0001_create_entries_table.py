"""create entries table

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "entries",
        sa.Column("id",           sa.Integer(),                      nullable=False),
        sa.Column("title",        sa.String(length=500),             nullable=False),
        sa.Column("medium",       sa.String(length=100),             nullable=True),
        sa.Column("origin",       sa.String(length=100),             nullable=True),
        sa.Column("year",         sa.Integer(),                      nullable=True),
        sa.Column("cover_url",    sa.String(length=1000),            nullable=True),
        sa.Column("notes",        sa.Text(),                         nullable=True),
        sa.Column("external_id",  sa.String(length=200),             nullable=True),
        sa.Column("source",       sa.String(length=100),             nullable=True),
        sa.Column("status",       sa.String(length=50),              nullable=False,
                  server_default="planned"),
        sa.Column("rating",       sa.Float(),                        nullable=True),
        sa.Column("progress",     sa.Integer(),                      nullable=True),
        sa.Column("total",        sa.Integer(),                      nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True),        nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at",   sa.DateTime(timezone=True),        nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True),        nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_entries_id",     "entries", ["id"],     unique=False)
    op.create_index("ix_entries_title",  "entries", ["title"],  unique=False)
    op.create_index("ix_entries_medium", "entries", ["medium"], unique=False)
    op.create_index("ix_entries_origin", "entries", ["origin"], unique=False)
    op.create_index("ix_entries_status", "entries", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_entries_status", table_name="entries")
    op.drop_index("ix_entries_origin", table_name="entries")
    op.drop_index("ix_entries_medium", table_name="entries")
    op.drop_index("ix_entries_title",  table_name="entries")
    op.drop_index("ix_entries_id",     table_name="entries")
    op.drop_table("entries")
