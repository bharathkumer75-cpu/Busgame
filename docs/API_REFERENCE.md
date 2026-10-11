# Tamil Nadu 3D Bus Simulator - REST API Reference

The backend API is served at `http://localhost:8000/api/v1`. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 🔐 1. Authentication (`/auth`)

### 1.1 Register New Player
* **Endpoint**: `POST /api/v1/auth/register`
* **Request**:
```json
{
  "username": "madurai_captain",
  "email": "captain@tnstc.com",
  "password": "securepassword123"
}
```
* **Response** `(201 Created)`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user_id": 2,
  "username": "madurai_captain"
}
```

### 1.2 Login Player
* **Endpoint**: `POST /api/v1/auth/login`
* **Request**:
```json
{
  "username": "captain_kumar",
  "password": "admin123"
}
```
* **Response** `(200 OK)`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user_id": 1,
  "username": "captain_kumar"
}
```

---

## 👤 2. Player Profile & Cloud Saves (`/profile`)

### 2.1 Get Player Profile
* **Endpoint**: `GET /api/v1/profile`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response** `(200 OK)`:
```json
{
  "id": 1,
  "user_id": 1,
  "username": "captain_kumar",
  "display_name": "Captain M. Kumar (Madurai Zone)",
  "coins": 45000,
  "experience": 2400,
  "driver_level": 3,
  "driving_rating": 4.95,
  "total_distance_km": 1280.0,
  "passengers_transported": 840,
  "trips_completed": 8,
  "current_fuel_liters": 85.0,
  "bus_health_percent": 100.0,
  "active_bus_id": 1
}
```

### 2.2 Cloud Save Game Progress
* **Endpoint**: `POST /api/v1/profile/save`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request**:
```json
{
  "coins": 47250,
  "experience": 2850,
  "distance_added_km": 18.5,
  "passengers_added": 15,
  "trips_added": 1
}
```

---

## 🏪 3. Garage & Showroom (`/garage`)

### 3.1 Get Bus Showroom Catalog
* **Endpoint**: `GET /api/v1/garage/catalog`
* **Response** `(200 OK)`: Returns array of available buses (TNSTC Ultra Deluxe, SETC AC Sleeper, KPN Multi-Axle, etc.)

### 3.2 Buy Bus from Showroom
* **Endpoint**: `POST /api/v1/garage/buy`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request**:
```json
{
  "catalog_id": 2,
  "custom_name": "Nellai Superfast AC"
}
```

### 3.3 Upgrade Bus Parts
* **Endpoint**: `POST /api/v1/garage/upgrade`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request**:
```json
{
  "bus_id": 1,
  "upgrade_type": "engine"
}
```

### 3.4 Repair Damaged Bus
* **Endpoint**: `POST /api/v1/garage/repair`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request**:
```json
{
  "bus_id": 1
}
```

---

## 🛣️ 4. Routes & Missions (`/routes`)

### 4.1 List Tamil Nadu Routes
* **Endpoint**: `GET /api/v1/routes`
* **Response**: Returns NH45 Chennai-Madurai, Ooty Ghat, Trichy-Thanjavur, Salem-Chennai routes.

### 4.2 Complete Trip Mission
* **Endpoint**: `POST /api/v1/routes/complete`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request**:
```json
{
  "mission_id": 1,
  "distance_covered_km": 42.0,
  "passengers_served": 28,
  "passenger_satisfaction": 96.5,
  "traffic_violations": 0,
  "accidents_count": 0,
  "fuel_used_liters": 9.5
}
```
* **Response**:
```json
{
  "mission_id": 1,
  "earned_coins": 7700,
  "earned_xp": 520,
  "passenger_satisfaction": 96.5,
  "new_balance": 52700,
  "new_experience": 2920,
  "driver_level": 3,
  "message": "Trip safely completed! Earned ₹7700 and 520 XP."
}
```

---

## 🏆 5. Global Leaderboards (`/leaderboard`)

* **Endpoint**: `GET /api/v1/leaderboard`
* **Response**: Top Tamil Nadu highway captains ranked by total earnings, trips completed, and passenger satisfaction safety score.
