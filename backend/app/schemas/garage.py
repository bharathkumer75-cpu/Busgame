from pydantic import BaseModel
from typing import Optional, List

class BusCatalogResponse(BaseModel):
    id: int
    model_name: str
    brand: str
    bus_type: str
    price: int
    seat_capacity: int
    max_speed_kmh: float
    engine_power_hp: int
    fuel_capacity_liters: float
    fuel_efficiency_kmpl: float
    base_livery: str
    description: str
    image_url: str

    class Config:
        from_attributes = True

class PlayerBusResponse(BaseModel):
    id: int
    user_id: int
    catalog_id: int
    custom_name: str
    current_livery: str
    engine_level: int
    brakes_level: int
    handling_level: int
    comfort_level: int
    turbo_installed: bool
    air_horn_type: str
    mileage_km: float
    condition_percent: float
    is_favorite: bool
    catalog_item: BusCatalogResponse

    class Config:
        from_attributes = True

class BuyBusRequest(BaseModel):
    catalog_id: int
    custom_name: Optional[str] = None

class UpgradeBusRequest(BaseModel):
    bus_id: int
    upgrade_type: str  # "engine", "brakes", "handling", "comfort", "turbo"

class CustomizeBusRequest(BaseModel):
    bus_id: int
    custom_name: Optional[str] = None
    livery: Optional[str] = None
    air_horn_type: Optional[str] = None

class RepairBusRequest(BaseModel):
    bus_id: int
