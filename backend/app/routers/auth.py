from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models.user import User, PlayerProfile
from ..models.bus import BusCatalog, PlayerBus
from ..schemas.auth import UserRegister, UserLogin, Token
from ..schemas.profile import ProfileResponse
from ..services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if username or email exists
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username is already registered")
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Create user
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.flush()

    # Create default player profile with initial coins
    profile = PlayerProfile(
        user_id=user.id,
        display_name=f"{user.username} Captain",
        coins=settings.STARTING_COINS,
        experience=settings.STARTING_EXPERIENCE,
        driver_level=1,
        driving_rating=4.9
    )
    db.add(profile)
    db.flush()

    # Grant initial starter bus: TNSTC Standard Deluxe
    starter_model = db.query(BusCatalog).filter(BusCatalog.model_name == "TNSTC Ultra Deluxe Express").first()
    if starter_model:
        starter_bus = PlayerBus(
            user_id=user.id,
            catalog_id=starter_model.id,
            custom_name="Kaveri Express",
            current_livery=starter_model.base_livery,
            engine_level=1,
            brakes_level=1,
            handling_level=1,
            comfort_level=1,
            is_favorite=True
        )
        db.add(starter_bus)
        db.flush()
        profile.active_bus_id = starter_bus.id

    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        data={"sub": user.username, "id": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_in.username).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={"sub": user.username, "id": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    profile = current_user.profile
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "coins": profile.coins if profile else 0,
        "driver_level": profile.driver_level if profile else 1,
        "driving_rating": profile.driving_rating if profile else 5.0,
        "active_bus_id": profile.active_bus_id if profile else None
    }
