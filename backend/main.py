from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class EventBase(BaseModel):
    title: str
    start_datetime: str
    end_datetime: str
    all_day: bool
    user_id: int

class EventRecurrenceBase(BaseModel):
    event_id: int
    frequency: str
    event_interval: int = 1
    days_of_week: list[int] | None = None
    end_date: str | None = None
    count: int | None = None

class UserBase(BaseModel):
    username: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserBase, db: db_dependency):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  
    return db_user 

@app.post("/events/", status_code=status.HTTP_201_CREATED)
async def create_event(event: EventBase, db: db_dependency):
    db_event = models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/")
async def get_events(db: db_dependency):
    return db.query(models.Event).all()

@app.get("/users/")
async def get_users(db: db_dependency):
    return db.query(models.User).all()