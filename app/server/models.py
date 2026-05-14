from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

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