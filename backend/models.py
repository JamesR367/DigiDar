from sqlalchemy import Boolean, Column, Integer, String, DateTime, Date, Enum, JSON, ForeignKey
from database import Base

# Creates database tables if they aren't already created
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True)
    color = Column(String(50), unique=True)

class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(50), nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    all_day = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user_color = Column(String(50), ForeignKey('users.color', ondelete='CASCADE'), nullable=False)