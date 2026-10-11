from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.bus import BusCatalog, PlayerBus
from ..schemas.garage import (
    BusCatalogResponse,
    PlayerBusResponse,
    BuyBusRequest,
    UpgradeBusRequest,
    CustomizeBusRequest,
    RepairBusRequest
)
from ..services.auth_service import get_current_user
from ..services.economy_service import buy_bus, upgrade_bus, repair_bus

router = APIRouter(prefix="/garage", tags=["Garage & Showroom"])

@router.get("/catalog", response_model=List[BusCatalogResponse])
def get_bus_catalog(db: Session = Depends(get_db)):
    """List all available buses in the Tamil Nadu vehicle showroom"""
    return db.query(BusCatalog).all()

@router.get("/my-buses", response_model=List[PlayerBusResponse])
def get_player_buses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all buses owned by current player"""
    return db.query(PlayerBus).filter(PlayerBus.user_id == current_user.id).all()

@router.post("/buy", response_model=PlayerBusResponse)
def purchase_bus(data: BuyBusRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Purchase a bus from showroom"""
    new_bus = buy_bus(db, current_user, data.catalog_id, data.custom_name)
    return new_bus

@router.post("/upgrade", response_model=PlayerBusResponse)
def upgrade_bus_part(data: UpgradeBusRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Upgrade engine, brakes, handling or turbo"""
    updated_bus = upgrade_bus(db, current_user, data.bus_id, data.upgrade_type)
    return updated_bus

@router.post("/customize", response_model=PlayerBusResponse)
def customize_bus(data: CustomizeBusRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Customize livery paint, air horn, and custom nameplate"""
    bus = db.query(PlayerBus).filter(PlayerBus.id == data.bus_id, PlayerBus.user_id == current_user.id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Player bus not found")

    if data.custom_name:
        bus.custom_name = data.custom_name
    if data.livery:
        bus.current_livery = data.livery
    if data.air_horn_type:
        bus.air_horn_type = data.air_horn_type

    db.commit()
    db.refresh(bus)
    return bus

@router.post("/repair")
def repair_vehicle(data: RepairBusRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Repair bus back to 100% health"""
    return repair_bus(db, current_user, data.bus_id)

@router.post("/select-active/{bus_id}")
def select_active_bus(bus_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Set specified owned bus as currently active driving vehicle"""
    bus = db.query(PlayerBus).filter(PlayerBus.id == bus_id, PlayerBus.user_id == current_user.id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Player bus not found")

    current_user.profile.active_bus_id = bus.id
    db.commit()
    return {"message": f"Active bus changed to {bus.custom_name}", "active_bus_id": bus.id}
