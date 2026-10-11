from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user import User, PlayerProfile
from ..models.bus import BusCatalog, PlayerBus

UPGRADE_COSTS = {
    "engine": {2: 12000, 3: 25000, 4: 45000, 5: 80000},
    "brakes": {2: 8000, 3: 16000, 4: 30000, 5: 55000},
    "handling": {2: 9000, 3: 18000, 4: 35000, 5: 60000},
    "comfort": {2: 6000, 3: 12000, 4: 22000, 5: 40000},
    "turbo": 35000
}

def buy_bus(db: Session, user: User, catalog_id: int, custom_name: str = None) -> PlayerBus:
    catalog_item = db.query(BusCatalog).filter(BusCatalog.id == catalog_id).first()
    if not catalog_item:
        raise HTTPException(status_code=404, detail="Bus model not found in showroom catalog")

    profile = user.profile
    if profile.coins < catalog_item.price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient coins. Required: ₹{catalog_item.price}, Available: ₹{profile.coins}"
        )

    # Deduct coins
    profile.coins -= catalog_item.price

    new_bus = PlayerBus(
        user_id=user.id,
        catalog_id=catalog_item.id,
        custom_name=custom_name or f"{catalog_item.model_name} Express",
        current_livery=catalog_item.base_livery,
        engine_level=1,
        brakes_level=1,
        handling_level=1,
        comfort_level=1,
        turbo_installed=False,
        condition_percent=100.0,
        mileage_km=0.0
    )
    db.add(new_bus)
    db.commit()
    db.refresh(new_bus)

    # Set as active bus if none active
    if not profile.active_bus_id:
        profile.active_bus_id = new_bus.id
        db.commit()

    return new_bus

def upgrade_bus(db: Session, user: User, bus_id: int, upgrade_type: str) -> PlayerBus:
    bus = db.query(PlayerBus).filter(PlayerBus.id == bus_id, PlayerBus.user_id == user.id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Player bus not found")

    profile = user.profile
    cost = 0

    if upgrade_type == "turbo":
        if bus.turbo_installed:
            raise HTTPException(status_code=400, detail="Turbo is already installed on this bus")
        cost = UPGRADE_COSTS["turbo"]
        if profile.coins < cost:
            raise HTTPException(status_code=400, detail=f"Insufficient coins for Turbo (₹{cost})")
        profile.coins -= cost
        bus.turbo_installed = True

    elif upgrade_type in ["engine", "brakes", "handling", "comfort"]:
        current_lvl = getattr(bus, f"{upgrade_type}_level")
        if current_lvl >= 5:
            raise HTTPException(status_code=400, detail=f"{upgrade_type.title()} is already at maximum level 5")
        
        target_lvl = current_lvl + 1
        cost = UPGRADE_COSTS[upgrade_type].get(target_lvl, 15000)
        if profile.coins < cost:
            raise HTTPException(status_code=400, detail=f"Insufficient coins for level {target_lvl} upgrade (₹{cost})")
        
        profile.coins -= cost
        setattr(bus, f"{upgrade_type}_level", target_lvl)
    else:
        raise HTTPException(status_code=400, detail="Invalid upgrade type")

    db.commit()
    db.refresh(bus)
    return bus

def repair_bus(db: Session, user: User, bus_id: int) -> dict:
    bus = db.query(PlayerBus).filter(PlayerBus.id == bus_id, PlayerBus.user_id == user.id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Player bus not found")

    damage = 100.0 - bus.condition_percent
    if damage <= 0:
        return {"message": "Bus is already in pristine condition", "cost": 0, "condition": 100.0}

    # ₹150 per 1% damage
    cost = int(damage * 150)
    profile = user.profile
    if profile.coins < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient coins for repairs (₹{cost} required)")

    profile.coins -= cost
    bus.condition_percent = 100.0
    profile.bus_health_percent = 100.0
    db.commit()
    return {"message": "Bus completely overhauled and repaired!", "cost": cost, "condition": 100.0}
