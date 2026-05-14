# Alembic Migration Guide 
> Made by ChatGPT 5.4 - mistakes can still apply so take everything with a grain of salt.

## 1. What Alembic does (core idea)

Alembic is a **schema versioning tool** for SQLAlchemy.

Think of it as:

> “Git, but for your database structure”

It tracks:

* schema changes (tables, columns, indexes)
* migration history
* upgrade/downgrade paths

It does **not manage data**, only schema evolution.

## 2. Your folder structure (mapped to meaning)

```
alembic/
│
├── env.py
├── README.md
├── script.py.mako
│
└── versions/
```

### `env.py` (the engine + runtime bridge)

This is the **core execution file**.

It:

* connects Alembic → your SQLAlchemy engine (`database.py`)
* binds metadata (`models.py → Base.metadata`)
* controls migration context (online/offline mode)

In your setup, this is where:

* your `DATABASE_URL`
* your `engine`
* your `Base.metadata`

are wired together.

### `versions/` (migration history log)

This is your **source of truth for schema evolution**.

Each file inside:

* represents 1 migration step
* has:

  * `upgrade()` → apply change
  * `downgrade()` → rollback change

Example flow:

```
0001_create_users.py
0002_add_email_column.py
0003_add_indexes.py
```

Alembic executes them **in order (like a commit chain).**

---

### `script.py.mako` (migration template)

This is a **Jinja-style template** used when generating new migrations.

It defines:

* file structure of every migration
* revision IDs
* upgrade/downgrade scaffolding

You rarely touch this unless customizing generation format.

---

### `README.md`

Usually optional, but useful for:

* documenting migration conventions
* team rules (naming, branching migrations, etc.)

---

## 3. How Alembic fits your stack

Given your structure:

```
app/server/
├── database.py   → engine/session setup
├── models.py     → SQLAlchemy ORM models
├── alembic/      → migration system
```

Flow is:

```
models.py (source of truth)
        ↓
alembic revision --autogenerate
        ↓
versions/XXX.py
        ↓
alembic upgrade head
        ↓
database schema updated
```

---

## 4. Key workflow commands (mental model)

### Initialize new migration

```
alembic revision --autogenerate -m "message"
```

### Apply migrations

```
alembic upgrade head
```

### Rollback one step

```
alembic downgrade -1
```

### Check current DB version

```
alembic current
```

---

## 5. Important internal concept (most people miss this)

Alembic relies on:

### `target_metadata`

Inside `env.py`:

* This is usually:

  ```
  Base.metadata
  ```

If this is missing or wrong:

* autogenerate will produce empty or incorrect migrations

So your real dependency chain is:

```
models.py → Base.metadata → env.py → migrations
```

---

## 6. Common pitfalls (based on real SQLAlchemy usage)

* ❌ forgetting to import models in `env.py`
* ❌ autogenerate missing changes (metadata not bound)
* ❌ manual DB edits causing drift from migration history
* ❌ editing old migration files instead of creating new ones

---

## References

* Alembic Documentation (Official): [https://alembic.sqlalchemy.org/en/latest/](https://alembic.sqlalchemy.org/en/latest/)
* SQLAlchemy ORM + Metadata system: [https://docs.sqlalchemy.org/en/20/orm/](https://docs.sqlalchemy.org/en/20/orm/)
* Alembic autogenerate behavior: [https://alembic.sqlalchemy.org/en/latest/autogenerate.html](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)
