from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    display_name: str
    driving_rating: float
    total_distance_km: float
    passengers_transported: int
    trips_completed: int
    driver_level: int
    coins: int
    experience: int
    current_fuel_liters: float
    bus_health_percent: float
    active_bus_id: Optional[int] = None

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    active_bus_id: Optional[int] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    username: str
    email: str
    last_saved_at: datetime

    class Config:
        from_attributes = True

class SaveGameState(BaseModel):
    coins: Optional[int] = None
    experience: Optional[int] = None
    driving_rating: Optional[float] = None
    distance_added_km: Optional[float] = 0.0
    passengers_added: Optional[int] = 0
    trips_added: Optional[int] = 0
    current_fuel: Optional[float] = None
    bus_health: Optional[float] = None
