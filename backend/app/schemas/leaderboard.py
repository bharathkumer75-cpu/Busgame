from pydantic import BaseModel
from typing import List
from datetime import datetime

class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    total_earnings: int
    safety_score: float
    total_passengers: int
    trips_completed: int
    rank_title: str

    class Config:
        from_attributes = True

class LeaderboardResponse(BaseModel):
    top_drivers: List[LeaderboardEntry]
