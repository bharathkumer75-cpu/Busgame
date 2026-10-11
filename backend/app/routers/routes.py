from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.route import Route, MissionHistory
from ..schemas.mission import RouteResponse, StartMissionRequest, CompleteMissionRequest, MissionResultResponse
from ..services.auth_service import get_current_user
from ..services.mission_service import start_mission, complete_mission

router = APIRouter(prefix="/routes", tags=["Routes & Missions"])

@router.get("", response_model=List[RouteResponse])
def get_all_routes(db: Session = Depends(get_db)):
    """List all available Tamil Nadu routes (NH44, NH45, Ghat roads)"""
    return db.query(Route).all()

@router.post("/start")
def begin_route_mission(data: StartMissionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start an active passenger trip on selected route"""
    mission = start_mission(db, current_user, data.route_id, data.bus_id)
    return {
        "mission_id": mission.id,
        "route_id": mission.route_id,
        "bus_id": mission.bus_id,
        "status": mission.status,
        "started_at": mission.started_at
    }

@router.post("/complete", response_model=MissionResultResponse)
def finish_route_mission(data: CompleteMissionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit completed trip statistics and receive earnings/XP"""
    result = complete_mission(db, current_user, data)
    return result

@router.get("/history")
def get_mission_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get player's completed passenger driving missions"""
    missions = db.query(MissionHistory).filter(MissionHistory.user_id == current_user.id).order_by(MissionHistory.id.desc()).limit(20).all()
    return missions
