from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime 

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

#Allows specific ip addresses to access the api
origins = [
    "http://localhost:3000", 
    "http://localhost:5173",
]

#Gives the frontend permission to do specific actions
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)

#Objects for each table in the database
class UserBase(BaseModel):
    username: str

class EventBase(BaseModel):
    title: str
    start_datetime: datetime
    end_datetime: datetime
    all_day: bool
    user_id: int

class EventRecurrenceBase(BaseModel):
    event_id: int
    frequency: str
    event_interval: int = 1
    days_of_week: list[int] | None = None
    end_date: str | None = None
    count: int | None = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

#These are the actions the frontend can do 
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