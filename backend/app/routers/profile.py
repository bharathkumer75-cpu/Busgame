from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, PlayerProfile
from ..schemas.profile import ProfileResponse, ProfileUpdate, SaveGameState
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/profile", tags=["Player Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        profile = PlayerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return ProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        display_name=profile.display_name,
        coins=profile.coins,
        experience=profile.experience,
        driver_level=profile.driver_level,
        driving_rating=profile.driving_rating,
        total_distance_km=profile.total_distance_km,
        passengers_transported=profile.passengers_transported,
        trips_completed=profile.trips_completed,
        active_bus_id=profile.active_bus_id,
        current_fuel_liters=profile.current_fuel_liters,
        bus_health_percent=profile.bus_health_percent,
        last_saved_at=profile.last_saved_at
    )

@router.put("/update")
def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if data.display_name:
        profile.display_name = data.display_name
    if data.active_bus_id is not None:
        profile.active_bus_id = data.active_bus_id
    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully", "active_bus_id": profile.active_bus_id}

@router.post("/save")
def save_game_state(state: SaveGameState, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if state.coins is not None:
        profile.coins = state.coins
    if state.experience is not None:
        profile.experience = state.experience
        profile.driver_level = 1 + (profile.experience // 1000)
    if state.driving_rating is not None:
        profile.driving_rating = state.driving_rating
    if state.distance_added_km:
        profile.total_distance_km += state.distance_added_km
    if state.passengers_added:
        profile.passengers_transported += state.passengers_added
    if state.trips_added:
        profile.trips_completed += state.trips_added
    if state.current_fuel is not None:
        profile.current_fuel_liters = state.current_fuel
    if state.bus_health is not None:
        profile.bus_health_percent = state.bus_health

    db.commit()
    return {"message": "Game progress successfully synced to cloud", "coins": profile.coins, "level": profile.driver_level}
