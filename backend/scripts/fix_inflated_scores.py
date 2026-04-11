#!/usr/bin/env python3
"""
Reduce inflated ratings for a user's entries.

Rules applied (in order, mutually exclusive):
  - If rating is a non-zero multiple of 1.0 (e.g. 8.0, 9.0) → subtract 1.0
  - If rating is a non-zero multiple of 0.5 but NOT a multiple of 1.0 (e.g. 7.5, 9.5) → subtract 0.5

Usage:
    python fix_inflated_scores.py [username] [--dry-run]

    username  defaults to "lingwei"
    --dry-run  preview changes without committing
"""

import sys
import os
_BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
os.chdir(_BACKEND_DIR)
sys.path.insert(0, _BACKEND_DIR)

from db import SessionLocal
from models import Entry


def fix_inflated_scores(username: str, dry_run: bool = False) -> None:
    db = SessionLocal()
    try:
        entries = (
            db.query(Entry)
            .filter(Entry.username == username, Entry.rating.isnot(None))
            .all()
        )

        if not entries:
            print(f"No rated entries found for user '{username}'.")
            return

        changes = []
        for entry in entries:
            r = entry.rating
            if r % 1.0 == 0.0:
                changes.append((entry, r, r - 1.0))
            elif r % 1.0 == 0.5:
                changes.append((entry, r, r - 0.5))

        if not changes:
            print(f"No entries require adjustment for user '{username}'.")
            return

        print(f"Found {len(changes)} entries to adjust for user '{username}'.")
        if dry_run:
            print("[DRY RUN] No changes will be committed.\n")

        for entry, old, new in changes:
            print(f"  [{entry.id}] {entry.title!r:50s}  {old} -> {new}")
            if not dry_run:
                entry.rating = new

        if not dry_run:
            db.commit()
            print(f"\nCommitted {len(changes)} updates.")
        else:
            print(f"\n[DRY RUN] Would have updated {len(changes)} entries.")

    finally:
        db.close()


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    positional = [a for a in sys.argv[1:] if not a.startswith("--")]
    username = positional[0] if positional else "lingwei"

    fix_inflated_scores(username, dry_run=dry_run)
