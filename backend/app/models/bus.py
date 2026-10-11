from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class BusCatalog(Base):
    """Buses available for purchase in game showroom/garage"""
    __tablename__ = "bus_catalog"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    brand = Column(String(50), nullable=False)       # Ashok Leyland, Tata Motors, BharatBenz, Volvo
    bus_type = Column(String(50), nullable=False)    # TNSTC Ordinary, SETC Ultra Deluxe, Multi-Axle AC Sleeper
    price = Column(Integer, nullable=False)          # Coins
    seat_capacity = Column(Integer, default=45)
    max_speed_kmh = Column(Float, default=110.0)
    engine_power_hp = Column(Integer, default=210)
    fuel_capacity_liters = Column(Float, default=250.0)
    fuel_efficiency_kmpl = Column(Float, default=4.2)
    base_livery = Column(String(50), default="tnstc_green")  # tnstc_green, setc_red, omni_blue, vintage_yellow
    description = Column(String(255), default="Standard Tamil Nadu public transit long-distance bus")
    image_url = Column(String(255), default="")

class PlayerBus(Base):
    """Instances of buses owned by a specific player with upgrades & customization"""
    __tablename__ = "player_buses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    catalog_id = Column(Integer, ForeignKey("bus_catalog.id"), nullable=False)
    custom_name = Column(String(60), default="Raja Rani Express")
    current_livery = Column(String(50), default="tnstc_green")
    
    # Upgrades (1 to 5 level)
    engine_level = Column(Integer, default=1)
    brakes_level = Column(Integer, default=1)
    handling_level = Column(Integer, default=1)
    comfort_level = Column(Integer, default=1)
    turbo_installed = Column(Boolean, default=False)
    air_horn_type = Column(String(50), default="chennai_triple_air") # musical horn style
    
    # State & Wear
    mileage_km = Column(Float, default=0.0)
    condition_percent = Column(Float, default=100.0)
    is_favorite = Column(Boolean, default=False)

    user = relationship("User", back_populates="buses")
    catalog_item = relationship("BusCatalog")
