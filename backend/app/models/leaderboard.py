from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from ..database import Base

class Leaderboard(Base):
    """Global rankings for Top Drivers across Tamil Nadu routes"""
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    username = Column(String(50), nullable=False)
    total_earnings = Column(Integer, default=0)
    safety_score = Column(Float, default=100.0)
    total_passengers = Column(Integer, default=0)
    trips_completed = Column(Integer, default=0)
    rank_title = Column(String(50), default="Rookie Driver") # "Legendary Captain", "Highway King", etc.
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
