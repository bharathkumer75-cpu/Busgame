from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RouteResponse(BaseModel):
    id: int
    route_code: str
    origin_city: str
    destination_city: str
    distance_km: float
    difficulty: str
    recommended_bus_type: str
    base_reward_coins: int
    base_xp: int
    toll_booths_count: int
    weather_preset: str
    stops_summary: str

    class Config:
        from_attributes = True

class StartMissionRequest(BaseModel):
    route_id: int
    bus_id: Optional[int] = None

class CompleteMissionRequest(BaseModel):
    mission_id: int
    distance_covered_km: float
    passengers_served: int
    passenger_satisfaction: float
    traffic_violations: int
    accidents_count: int
    fuel_used_liters: float

class MissionResultResponse(BaseModel):
    mission_id: int
    earned_coins: int
    earned_xp: int
    passenger_satisfaction: float
    new_balance: int
    new_experience: int
    driver_level: int
    message: str
