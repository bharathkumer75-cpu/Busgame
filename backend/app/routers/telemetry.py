from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/telemetry", tags=["Live Telemetry & Stations"])

class TelemetryPing(BaseModel):
    speed_kmh: float
    current_gear: int
    engine_rpm: float
    fuel_level_percent: float
    bus_health_percent: float
    passenger_comfort: float
    pos_x: float
    pos_z: float
    weather: str
    lights_on: bool
    wipers_on: bool

class FuelRefillRequest(BaseModel):
    liters: float

@router.post("/ping")
def sync_telemetry(data: TelemetryPing, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Receives live driving status from client for monitoring and persistence"""
    profile = current_user.profile
    if profile:
        profile.current_fuel_liters = max(0.0, data.fuel_level_percent)
        profile.bus_health_percent = max(0.0, data.bus_health_percent)
        db.commit()
    return {"status": "synced", "health": profile.bus_health_percent if profile else 100.0}

@router.post("/refill-fuel")
def refill_fuel_station(data: FuelRefillRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Refuel bus at highway fuel pumps (Indian Oil / Bharat Petroleum / HP)"""
    profile = current_user.profile
    # Diesel cost: ₹95 per liter in Tamil Nadu
    cost = int(data.liters * 95)
    if profile.coins < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient coins for fuel refill (₹{cost} needed)")

    profile.coins -= cost
    profile.current_fuel_liters = min(100.0, profile.current_fuel_liters + data.liters)
    db.commit()
    return {
        "message": f"Successfully refilled {data.liters}L of diesel",
        "cost": cost,
        "remaining_coins": profile.coins,
        "current_fuel": profile.current_fuel_liters
    }
