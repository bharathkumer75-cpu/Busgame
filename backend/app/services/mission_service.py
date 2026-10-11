from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.user import User
from ..models.route import Route, MissionHistory
from ..models.bus import PlayerBus
from ..models.leaderboard import Leaderboard
from ..schemas.mission import CompleteMissionRequest

def start_mission(db: Session, user: User, route_id: int, bus_id: int = None) -> MissionHistory:
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    selected_bus_id = bus_id or user.profile.active_bus_id
    if selected_bus_id:
        bus = db.query(PlayerBus).filter(PlayerBus.id == selected_bus_id, PlayerBus.user_id == user.id).first()
        if not bus:
            raise HTTPException(status_code=400, detail="Specified bus not owned by player")
    else:
        # Default to first owned bus
        bus = db.query(PlayerBus).filter(PlayerBus.user_id == user.id).first()
        selected_bus_id = bus.id if bus else None

    mission = MissionHistory(
        user_id=user.id,
        route_id=route.id,
        bus_id=selected_bus_id,
        status="IN_PROGRESS"
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission

def complete_mission(db: Session, user: User, data: CompleteMissionRequest) -> dict:
    mission = db.query(MissionHistory).filter(
        MissionHistory.id == data.mission_id,
        MissionHistory.user_id == user.id
    ).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Active mission not found")

    route = db.query(Route).filter(Route.id == mission.route_id).first()
    profile = user.profile

    # Calculate earnings
    # Base reward + Passenger fare (₹150 per passenger)
    ticket_revenue = data.passengers_served * 150
    base_pay = route.base_reward_coins if route else 3000

    # Satisfaction multiplier (0.5 to 1.3)
    satisfaction_ratio = max(0.2, min(1.3, data.passenger_satisfaction / 100.0))
    
    # Violations & Accident deductions
    violations_penalty = data.traffic_violations * 250
    accident_penalty = data.accidents_count * 800

    gross_earnings = int((base_pay + ticket_revenue) * satisfaction_ratio)
    net_earnings = max(500, gross_earnings - violations_penalty - accident_penalty)

    # XP formula
    earned_xp = int(route.base_xp * satisfaction_ratio) + (data.passengers_served * 15)

    # Update Mission
    mission.completed_at = datetime.utcnow()
    mission.distance_covered_km = data.distance_covered_km
    mission.passengers_served = data.passengers_served
    mission.passenger_satisfaction = data.passenger_satisfaction
    mission.traffic_violations = data.traffic_violations
    mission.accidents_count = data.accidents_count
    mission.earned_coins = net_earnings
    mission.earned_xp = earned_xp
    mission.status = "COMPLETED"

    # Update Player Profile
    profile.coins += net_earnings
    profile.experience += earned_xp
    profile.total_distance_km += data.distance_covered_km
    profile.passengers_transported += data.passengers_served
    profile.trips_completed += 1

    # Level calculation: every 1000 XP is 1 level
    new_level = 1 + (profile.experience // 1000)
    profile.driver_level = new_level

    # Update driving rating (weighted average)
    profile.driving_rating = round((profile.driving_rating * 0.8) + ((data.passenger_satisfaction / 20.0) * 0.2), 2)
    profile.driving_rating = min(5.0, max(1.0, profile.driving_rating))

    # Wear and tear on bus
    if mission.bus_id:
        bus = db.query(PlayerBus).filter(PlayerBus.id == mission.bus_id).first()
        if bus:
            bus.mileage_km += data.distance_covered_km
            damage_inflicted = (data.accidents_count * 15.0) + (data.distance_covered_km * 0.1)
            bus.condition_percent = max(10.0, bus.condition_percent - damage_inflicted)
            profile.bus_health_percent = bus.condition_percent

    # Update or insert into Leaderboard
    leaderboard = db.query(Leaderboard).filter(Leaderboard.user_id == user.id).first()
    if not leaderboard:
        leaderboard = Leaderboard(
            user_id=user.id,
            username=user.username,
            total_earnings=net_earnings,
            safety_score=data.passenger_satisfaction,
            total_passengers=data.passengers_served,
            trips_completed=1,
            rank_title=get_rank_title(new_level)
        )
        db.add(leaderboard)
    else:
        leaderboard.total_earnings += net_earnings
        leaderboard.total_passengers += data.passengers_served
        leaderboard.trips_completed += 1
        leaderboard.safety_score = round((leaderboard.safety_score * 0.7) + (data.passenger_satisfaction * 0.3), 1)
        leaderboard.rank_title = get_rank_title(new_level)

    db.commit()

    return {
        "mission_id": mission.id,
        "earned_coins": net_earnings,
        "earned_xp": earned_xp,
        "passenger_satisfaction": data.passenger_satisfaction,
        "new_balance": profile.coins,
        "new_experience": profile.experience,
        "driver_level": profile.driver_level,
        "message": f"Trip safely completed! Earned ₹{net_earnings} and {earned_xp} XP."
    }

def get_rank_title(level: int) -> str:
    if level >= 20:
        return "Supreme Highway Monarch"
    elif level >= 15:
        return "Tamil Nadu Super Express Master"
    elif level >= 10:
        return "Veteran NH-44 Captain"
    elif level >= 5:
        return "Skilled Route Specialist"
    else:
        return "Certified State Driver"
