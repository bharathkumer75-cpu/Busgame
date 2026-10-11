import sys
import os

# Add parent directory to path so app modules are resolvable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User, PlayerProfile
from app.models.bus import BusCatalog, PlayerBus
from app.models.route import Route
from app.models.leaderboard import Leaderboard
from app.services.auth_service import get_password_hash

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Bus Catalog
        if db.query(BusCatalog).count() == 0:
            print("Seeding Tamil Nadu Bus Catalog...")
            buses = [
                BusCatalog(
                    model_name="TNSTC Ultra Deluxe Express",
                    brand="Ashok Leyland",
                    bus_type="Government Express",
                    price=25000,
                    seat_capacity=49,
                    max_speed_kmh=115.0,
                    engine_power_hp=220,
                    fuel_capacity_liters=250.0,
                    fuel_efficiency_kmpl=4.5,
                    base_livery="tnstc_green",
                    description="The pride of Tamil Nadu State Transport Corporation. Equipped with pneumatic air horns and legendary highway overtaking dynamics."
                ),
                BusCatalog(
                    model_name="SETC Aanmajothi AC Sleeper",
                    brand="BharatBenz",
                    bus_type="Long Distance AC Sleeper",
                    price=65000,
                    seat_capacity=36,
                    max_speed_kmh=125.0,
                    engine_power_hp=240,
                    fuel_capacity_liters=300.0,
                    fuel_efficiency_kmpl=4.0,
                    base_livery="setc_red",
                    description="State Express Transport Corporation premium luxury coach connecting Chennai to South Tamil Nadu with ultra-soft air suspension."
                ),
                BusCatalog(
                    model_name="KPN Multi-Axle Highway Jet",
                    brand="Volvo B11R",
                    bus_type="Private Omni Coach",
                    price=120000,
                    seat_capacity=44,
                    max_speed_kmh=140.0,
                    engine_power_hp=430,
                    fuel_capacity_liters=450.0,
                    fuel_efficiency_kmpl=3.2,
                    base_livery="omni_blue",
                    description="Top-tier 3-axle aerodynamic luxury cruiser dominating NH44 night traffic with laser LED lighting and musical air horns."
                ),
                BusCatalog(
                    model_name="Chennai MTC Metro Commuter",
                    brand="Tata Motors",
                    bus_type="City Transit Bus",
                    price=20000,
                    seat_capacity=52,
                    max_speed_kmh=95.0,
                    engine_power_hp=180,
                    fuel_capacity_liters=200.0,
                    fuel_efficiency_kmpl=4.8,
                    base_livery="mtc_red",
                    description="Heavy-duty urban workhorse designed to handle heavy crowd boarding at Broadway and Tambaram."
                ),
                BusCatalog(
                    model_name="Nilgiris Hill Ghat Special",
                    brand="Ashok Leyland Oyster",
                    bus_type="Hill Mountain Climber",
                    price=45000,
                    seat_capacity=32,
                    max_speed_kmh=85.0,
                    engine_power_hp=160,
                    fuel_capacity_liters=180.0,
                    fuel_efficiency_kmpl=5.2,
                    base_livery="ghat_yellow",
                    description="Short-wheelbase high-torque mountain specialist engineered for the 36 hairpin bends of Ooty and Kodaikanal."
                )
            ]
            db.add_all(buses)
            db.commit()
            print("Added 5 realistic Tamil Nadu bus models.")

        # 2. Seed Tamil Nadu Routes
        if db.query(Route).count() == 0:
            print("Seeding Tamil Nadu Highway Routes...")
            routes = [
                Route(
                    route_code="TN-NH45",
                    origin_city="Chennai (Kilambakkam KCBT)",
                    destination_city="Madurai (Mattuthavani)",
                    distance_km=460.0,
                    difficulty="Medium",
                    recommended_bus_type="TNSTC Ultra Deluxe Express",
                    base_reward_coins=7500,
                    base_xp=500,
                    toll_booths_count=5,
                    weather_preset="Dynamic",
                    stops_summary="Chengalpattu Toll -> Tindivanam -> Villupuram Junction -> Trichy Samayapuram -> Madurai"
                ),
                Route(
                    route_code="TN-GHAT-18",
                    origin_city="Coimbatore (Gandhipuram)",
                    destination_city="Ooty (Nilgiris Lake)",
                    distance_km=88.0,
                    difficulty="Hard (Ghat Roads)",
                    recommended_bus_type="Nilgiris Hill Ghat Special",
                    base_reward_coins=6800,
                    base_xp=620,
                    toll_booths_count=1,
                    weather_preset="Mist & Fog",
                    stops_summary="Mettupalayam Foothills -> Kallar -> Burliyar Tea Garden -> Coonoor -> Ooty Central"
                ),
                Route(
                    route_code="TN-NH44",
                    origin_city="Madurai (Arapalayam)",
                    destination_city="Kanyakumari (Triveni Sangam)",
                    distance_km=245.0,
                    difficulty="Easy",
                    recommended_bus_type="SETC Aanmajothi AC Sleeper",
                    base_reward_coins=4800,
                    base_xp=380,
                    toll_booths_count=3,
                    weather_preset="Clear Sunset",
                    stops_summary="Virudhunagar -> Sattur -> Kovilpatti -> Tirunelveli Bypass -> Nagercoil -> Kanyakumari"
                ),
                Route(
                    route_code="TN-DELTA-22",
                    origin_city="Trichy (Central Stand)",
                    destination_city="Thanjavur (Old Bus Stand)",
                    distance_km=55.0,
                    difficulty="Easy",
                    recommended_bus_type="Chennai MTC Metro Commuter",
                    base_reward_coins=2400,
                    base_xp=200,
                    toll_booths_count=1,
                    weather_preset="Sunny",
                    stops_summary="Thiruverumbur (BHEL) -> Thuvakudi -> Vallam -> Thanjavur Big Temple"
                ),
                Route(
                    route_code="TN-EXPR-99",
                    origin_city="Salem (New Bus Stand)",
                    destination_city="Chennai (Koyambedu)",
                    distance_km=340.0,
                    difficulty="Medium",
                    recommended_bus_type="KPN Multi-Axle Highway Jet",
                    base_reward_coins=5900,
                    base_xp=460,
                    toll_booths_count=4,
                    weather_preset="Monsoon Rain",
                    stops_summary="Attur -> Kallakurichi -> Ulundurpet Bypass -> Tindivanam -> Chennai"
                )
            ]
            db.add_all(routes)
            db.commit()
            print("Added 5 Tamil Nadu realistic highway and ghat routes.")

        # 3. Seed Demo User
        demo_user = db.query(User).filter(User.username == "captain_kumar").first()
        if not demo_user:
            print("Creating default demo driver account: captain_kumar / admin123")
            user = User(
                username="captain_kumar",
                email="kumar.driver@tnstc.gov.in",
                hashed_password=get_password_hash("admin123")
            )
            db.add(user)
            db.flush()

            profile = PlayerProfile(
                user_id=user.id,
                display_name="Captain M. Kumar (Madurai Zone)",
                coins=45000,
                experience=2400,
                driver_level=3,
                driving_rating=4.95,
                total_distance_km=1280.0,
                passengers_transported=840,
                trips_completed=8
            )
            db.add(profile)
            db.flush()

            first_bus = db.query(BusCatalog).first()
            if first_bus:
                player_bus = PlayerBus(
                    user_id=user.id,
                    catalog_id=first_bus.id,
                    custom_name="Nellai Superfast",
                    current_livery="tnstc_green",
                    engine_level=2,
                    brakes_level=2,
                    handling_level=2,
                    comfort_level=1,
                    is_favorite=True
                )
                db.add(player_bus)
                db.flush()
                profile.active_bus_id = player_bus.id

            leaderboard_entry = Leaderboard(
                user_id=user.id,
                username="captain_kumar",
                total_earnings=68000,
                safety_score=98.5,
                total_passengers=840,
                trips_completed=8,
                rank_title="Veteran NH-44 Captain"
            )
            db.add(leaderboard_entry)
            db.commit()
            print("Successfully initialized default demo driver profile.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
