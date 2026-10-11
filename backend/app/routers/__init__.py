from .auth import router as auth_router
from .profile import router as profile_router
from .garage import router as garage_router
from .routes import router as routes_router
from .leaderboard import router as leaderboard_router
from .telemetry import router as telemetry_router

__all__ = [
    "auth_router",
    "profile_router",
    "garage_router",
    "routes_router",
    "leaderboard_router",
    "telemetry_router"
]
