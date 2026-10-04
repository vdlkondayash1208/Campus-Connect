from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"
    bio: Optional[str] = ""
    skills: List[str] = []
    interests: List[str] = []

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None

class SwipeRequest(BaseModel):
    targetUserId: str
    isInterested: bool

class MessageRequest(BaseModel):
    content: str

class MessageCreate(BaseModel):
    content: str

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Technology"
    club: Optional[str] = "Engineering Council"
    tags: Optional[List[str]] = []
    venue_name: Optional[str] = ""
    venue: Optional[str] = ""
    latitude: Optional[float] = 17.3850
    longitude: Optional[float] = 78.4867
    capacity: int = 100
    max_team_size: Optional[int] = 4
    start_at: Optional[str] = None
    deadline_at: Optional[str] = None
    expire_at: Optional[str] = None
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    registration_deadline: Optional[str] = None
    required_skills: Optional[List[str]] = []

