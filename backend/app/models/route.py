from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Route(Base):
    """Tamil Nadu bus routes (e.g., Chennai to Madurai, Coimbatore to Ooty Ghat)"""
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(20), unique=True, index=True) # e.g. TN-101
    origin_city = Column(String(50), nullable=False)          # Chennai (CMBT/Kilambakkam)
    destination_city = Column(String(50), nullable=False)     # Madurai (Mattuthavani)
    distance_km = Column(Float, nullable=False)               # 460.0 km
    difficulty = Column(String(20), default="Medium")         # Easy, Medium, Hard (Ghats)
    recommended_bus_type = Column(String(50), default="SETC Ultra Deluxe")
    base_reward_coins = Column(Integer, default=5000)
    base_xp = Column(Integer, default=350)
    toll_booths_count = Column(Integer, default=4)
    weather_preset = Column(String(30), default="Dynamic")    # Clear, Monsoon Rain, Mist, Night
    stops_summary = Column(Text, default="Chengalpattu, Villupuram, Trichy, Dindigul")

class MissionHistory(Base):
    """Records each completed trip/mission by players with stats, rating and earnings"""
    __tablename__ = "mission_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    bus_id = Column(Integer, ForeignKey("player_buses.id"), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Mission performance
    distance_covered_km = Column(Float, default=0.0)
    passengers_served = Column(Integer, default=0)
    passenger_satisfaction = Column(Float, default=100.0) # Percentage based on smooth driving & traffic compliance
    traffic_violations = Column(Integer, default=0)
    accidents_count = Column(Integer, default=0)
    earned_coins = Column(Integer, default=0)
    earned_xp = Column(Integer, default=0)
    status = Column(String(20), default="COMPLETED") # IN_PROGRESS, COMPLETED, FAILED

    user = relationship("User", back_populates="missions")
    route = relationship("Route")
    bus = relationship("PlayerBus")
