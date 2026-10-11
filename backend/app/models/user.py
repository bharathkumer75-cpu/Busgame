from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("PlayerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buses = relationship("PlayerBus", back_populates="user", cascade="all, delete-orphan")
    missions = relationship("MissionHistory", back_populates="user", cascade="all, delete-orphan")

class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String(60), default="TN Highway Captain")
    coins = Column(Integer, default=25000)
    experience = Column(Integer, default=0)
    driver_level = Column(Integer, default=1)
    driving_rating = Column(Float, default=4.8)  # Out of 5.0
    total_distance_km = Column(Float, default=0.0)
    passengers_transported = Column(Integer, default=0)
    trips_completed = Column(Integer, default=0)
    active_bus_id = Column(Integer, nullable=True)  # ID of currently selected bus
    current_fuel_liters = Column(Float, default=80.0)
    bus_health_percent = Column(Float, default=100.0)
    last_saved_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
