import enum

from sqlalchemy import ForeignKey, String, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime

"""
TaskMode Enum: Either a) checkbox or b) list
"""
class TaskMode(str, enum.Enum):
    checkbox = "checkbox"
    list = "list"

"""
Users DB Resource: Associated with 'users' table, contains 5 columns.
- ID            Necessary in order to have a primary key, also known as User ID
- Username      Username registered in the table for the user (Unique value, indexed)
- Email Address Another unique value/indexed value for recovery + future auth flows
- Hashed PW     Password for the user, hashed in the API itself
- Active Flag   Used in order to see if user is currently logged in or not
"""
class User(Base):
    # Table
    __tablename__ = "users"

    # Columns
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True) 
    hashed_password: Mapped[str] = mapped_column(String(255))              
    is_active: Mapped[bool] = mapped_column(default=True)     
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now()) 

    # Relationships
    notepads: Mapped[list["Notepad"]] = relationship(back_populates="owner", cascade="all, delete-orphan")

"""
Notepad DB Resource: Associated with 'notepads' table.
- ID         Primary key
- user_id    FK → users.id (owner)
- title      Display name of the notepad
- created_at Timestamp of creation
- updated_at Timestamp of last edit
"""
class Notepad(Base):
    # Table
    __tablename__ = "notepads"

    # Columns
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="notepads")
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="notepad",
        cascade="all, delete-orphan"
    )


"""
Task DB Resource: Associated with 'notepad_tasks' table.
- ID         Primary key
- notepad_id FK → notepads.id (parent)
- label      Task description text
- checked    Whether the task is marked complete (checkbox mode only)
- flagged    Whether the task is marked as priority
- mode       "checkbox" | "list" — display/interaction mode
"""
class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    notepad_id: Mapped[int] = mapped_column(ForeignKey("notepads.id"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    checked: Mapped[bool] = mapped_column(default=False)
    flagged: Mapped[bool] = mapped_column(default=False)
    mode: Mapped[TaskMode] = mapped_column(Enum(TaskMode), default=TaskMode.checkbox)

    # Relationship
    notepad: Mapped["Notepad"] = relationship(back_populates="tasks")