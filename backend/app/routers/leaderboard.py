from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.leaderboard import Leaderboard
from ..schemas.leaderboard import LeaderboardResponse, LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=LeaderboardResponse)
def get_global_leaderboard(db: Session = Depends(get_db)):
    """Fetch Top Tamil Nadu Drivers by total earnings and safety score"""
    entries = db.query(Leaderboard).order_by(Leaderboard.total_earnings.desc()).limit(50).all()
    return {"top_drivers": entries}
