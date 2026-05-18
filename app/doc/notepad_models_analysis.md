# Notepad Models Analysis

## Frontend data shape (source of truth)

```typescript
// types.ts
type TaskItemData = {
  label: string;
  checked: boolean;   // completion state (only meaningful in checkbox mode)
  flagged: boolean;   // priority marker
  mode: "checkbox" | "list";
};

type NotepadCardData = {
  id: string;
  title: string;
  tasks: TaskItemData[];  // ordered list
};
```

The page holds a list of `NotepadCardData[]` owned by the logged-in user.
Tasks are ordered (the UI preserves insertion order, split into flagged / unflagged sections).

---

## Relationship diagram

```
User ──< Notepad ──< NotepadTask
(1)      (many)      (many)
```

---

## Two models needed

### 1. `Notepad`

Maps to `NotepadCardData`. Belongs to a `User`.

| Column | Type | Notes |
|---|---|---|
| `id` | `int PK autoincrement` | replaces the frontend `notepad-{Date.now()}` string |
| `user_id` | `int FK → users.id` | ownership |
| `title` | `String(255)` | required, non-nullable |
| `created_at` | `DateTime` | useful for ordering the card grid |
| `updated_at` | `DateTime` | track last edit |

### 2. `NotepadTask`

Maps to `TaskItemData`. Belongs to a `Notepad`. Tasks are ordered, so a `position` column is the cleanest approach (avoids re-querying and sorting client-side).

| Column | Type | Notes |
|---|---|---|
| `id` | `int PK autoincrement` | stable row identity |
| `notepad_id` | `int FK → notepads.id` | parent notepad |
| `label` | `String(500)` | task text |
| `checked` | `bool` | completion state; only relevant when `mode = "checkbox"` |
| `flagged` | `bool` | priority marker |
| `mode` | `Enum("checkbox","list")` | mirrors the TS union |
| `position` | `int` | 0-indexed insertion order for stable sorting |

> [!NOTE]
> `mode` is a good candidate for a SQLAlchemy `Enum` type — it enforces the
> constraint at the DB level, matching the TypeScript union.

---

## Design decisions

**Why not store tasks as JSON on Notepad?**
The modal already supports per-task operations (check, flag, mode switch, delete, edit label). Storing tasks as rows gives you proper indexing, row-level updates, and makes it easier to add future per-task features (due dates, attachments, etc.) without schema migrations.

**`position` for ordering**
The UI shows tasks in insertion order. A simple integer position column is straightforward and efficient for the current scale. You'll re-number on delete/reorder.

**`checked` resets on mode → list**
This is already enforced in the frontend (`handleModeToggle` sets `checked: false`). The DB model doesn't need to enforce this — the API layer (or a `@validates` hook) can handle it if you want belt-and-suspenders.

**`flagged` is required**
Matches the `types.ts` change from `flagged?: boolean` to `flagged: boolean`. Default `False` in the DB.

---

## Suggested addition to `models.py`

```python
import enum
from datetime import datetime
from sqlalchemy import String, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class TaskMode(str, enum.Enum):
    checkbox = "checkbox"
    list = "list"


"""
Notepad DB Resource: Associated with 'notepads' table.
- ID         Primary key
- user_id    FK → users.id (owner)
- title      Display name of the notepad
- created_at Timestamp of creation
- updated_at Timestamp of last edit
"""
class Notepad(Base):
    __tablename__ = "notepads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="notepads")
    tasks: Mapped[list["NotepadTask"]] = relationship(
        back_populates="notepad",
        cascade="all, delete-orphan",
        order_by="NotepadTask.position",
    )


"""
NotepadTask DB Resource: Associated with 'notepad_tasks' table.
- ID         Primary key
- notepad_id FK → notepads.id (parent)
- label      Task description text
- checked    Whether the task is marked complete (checkbox mode only)
- flagged    Whether the task is marked as priority
- mode       "checkbox" | "list" — display/interaction mode
- position   0-indexed insertion order for stable list ordering
"""
class NotepadTask(Base):
    __tablename__ = "notepad_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    notepad_id: Mapped[int] = mapped_column(ForeignKey("notepads.id"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    checked: Mapped[bool] = mapped_column(default=False)
    flagged: Mapped[bool] = mapped_column(default=False)
    mode: Mapped[TaskMode] = mapped_column(Enum(TaskMode), default=TaskMode.checkbox)
    position: Mapped[int] = mapped_column(default=0)

    # Relationship
    notepad: Mapped["Notepad"] = relationship(back_populates="tasks")
```

You'll also need to add the back-reference on `User`:

```python
# Inside class User:
notepads: Mapped[list["Notepad"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
```

---

## What you do **not** need

- A separate table for flagged tasks — `flagged` is just a boolean column on `NotepadTask`.
- Any "draft" table — drafts live only in React state until submitted.
