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
    color: str

class EventBase(BaseModel):
    title: str
    start_datetime: datetime
    end_datetime: datetime
    all_day: bool
    user_id: int
    user_color: str

class EventUpdate(BaseModel):
    title: str | None = None
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    all_day: bool | None = None
    user_id: int | None = None

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
    # Ensure the stored user_color matches the selected user_id.
    user = db.query(models.User).filter(models.User.id == event.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id")

    payload = event.model_dump()
    payload["user_color"] = user.color

    db_event = models.Event(**payload)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/")
async def get_events(db: db_dependency):
    events = db.query(models.Event).all()
    
    result = []
    for event in events:
        user = db.query(models.User).filter(models.User.id == event.user_id).first()
        result.append({
            "id": event.id,
            "title": event.title,
            "start_datetime": event.start_datetime,
            "end_datetime": event.end_datetime,
            "all_day": event.all_day,
            "user_id": event.user_id,
            "color": user.color if user else None
        })
    
    return result

@app.get("/users/")
async def get_users(db: db_dependency):
    return db.query(models.User).all()

@app.patch("/events/{event_id}")
async def update_event(event_id: int, event: EventUpdate, db: db_dependency):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    updates = event.model_dump(exclude_unset=True)

    if "title" in updates:
        db_event.title = updates["title"]
    if "start_datetime" in updates:
        db_event.start_datetime = updates["start_datetime"]
    if "end_datetime" in updates:
        db_event.end_datetime = updates["end_datetime"]
    if "all_day" in updates:
        db_event.all_day = updates["all_day"]

    if "user_id" in updates:
        user = db.query(models.User).filter(models.User.id == updates["user_id"]).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_id")
        db_event.user_id = user.id
        db_event.user_color = user.color
    else:
        # Keep user_color consistent with the event's selected user.
        user = db.query(models.User).filter(models.User.id == db_event.user_id).first()
        db_event.user_color = user.color if user else db_event.user_color

    db.commit()
    db.refresh(db_event)

    user = db.query(models.User).filter(models.User.id == db_event.user_id).first()
    return {
        "id": db_event.id,
        "title": db_event.title,
        "start_datetime": db_event.start_datetime,
        "end_datetime": db_event.end_datetime,
        "all_day": db_event.all_day,
        "user_id": db_event.user_id,
        "color": user.color if user else None,
    }

@app.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, db: db_dependency):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    db.delete(db_event)
    db.commit()
    return None

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: db_dependency):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return None