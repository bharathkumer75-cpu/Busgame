# 🚌 Tamil Nadu 3D Bus Driving Simulator

A realistic, premium 3D Indian Bus Driving Simulator featuring authentic Tamil Nadu roads, cities, bus stations, passengers, traffic, and long-distance highway routes, paired with a complete **Python FastAPI backend**.

---

## ✨ Features & Highlights

### 1. 3D Graphics & Realistic Indian Vehicles
* **Authentic Tamil Nadu Buses**: 12-meter commercial chassis with liveries for **TNSTC Green Deluxe**, **SETC Aanmajothi AC Sleeper**, **KPN Multi-Axle Highway Cruiser**, and **Nilgiris Ghat Special**.
* **Detailed Cockpit & Interior**: First-person driver view with **animated steering wheel** that turns in real-time, working dashboard needles, driver seat, 2x2 passenger seating rows, and illuminated LED destination boards in Tamil and English (*"சென்னை - மதுரை CHENNAI - MADURAI"*).
* **Multi-Perspective Cameras**: First-person driver cockpit view, third-person smooth chase camera, and dynamic bumper action cam.
* **Day/Night Cycle & Weather**: Dynamic 24-hour sun rotation, highway streetlights, clear skies, dense Nilgiris mountain mist, and monsoon downpours with rain streak particles.

### 2. Vehicle Physics & Audio Synthesis
* **Realistic Heavy Commercial Dynamics**: Authentic bus mass (14.5 tonnes), momentum, speed-sensitive steering damping, suspension body roll on sharp curves, and braking nose dive.
* **Procedural Web Audio Engine**: Synthesizes heavy 6-cylinder diesel engine rumble linked to gear shifts and RPM, iconic **multi-tone Tamil Nadu musical air horns**, pneumatic air brake pressure release hiss, and turn signal clicks.

### 3. Highway Environment & Intelligent AI Traffic
* **Tamil Nadu Highway Landmarks**: 4-lane NH45 GST road with coconut palm trees, overhead green highway gantry signboards (*"சென்னை CHENNAI 45 KM"*, *"மதுரை MADURAI"*), tea stalls (*"நாயர் டீ கடை"*), and distant Western Ghats mountain silhouettes.
* **Indian Traffic AI**: Auto-rickshaws (yellow/green tuk-tuks), Tata heavy goods trucks with *"Horn OK Please"*, commuter cars, and lane-following AI with collision detection.
* **Passenger Pickup & Dropoff**: Highway bus bays where passengers wait under shelters. Stop the bus, open pneumatic doors with `[E]`, collect fares, and build driver satisfaction ratings.

### 4. Python FastAPI Backend Services
* **REST API**: User registration, login with JWT tokens and bcrypt password hashing.
* **Player Profile & Cloud Saves**: Driver level progression, ratings, total distance, passengers served, and wallet balance.
* **Garage & Customization**: Showroom bus catalog, progressive engine/brake/handling upgrades, and custom livery switching.
* **Route Missions & Economy**: Mission lifecycle management with fare calculations and violation penalties.
* **Global Leaderboards**: Top driver rankings across Tamil Nadu routes.

---

## 📁 Repository Structure

```
busgame/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── config.py              # App settings & JWT secret
│   │   ├── database.py            # SQLAlchemy database engine
│   │   ├── models/                # User, BusCatalog, PlayerBus, Route, Leaderboard
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/              # Auth, Economy, and Mission services
│   │   ├── routers/               # Auth, Profile, Garage, Routes, Telemetry, Leaderboard
│   │   └── main.py                # FastAPI main application with static game mount
│   ├── seed_data.py               # Seeds Tamil Nadu buses, routes & demo driver
│   ├── run_backend.py             # Server launcher script
│   └── requirements.txt
│
├── frontend_playable/             # Playable 3D WebGL Simulator (Instant browser play)
│   ├── index.html                 # 3D canvas, glassmorphism HUD, gauges & modals
│   ├── css/style.css              # Cyber-Tamil transport design system
│   └── js/
│       ├── config.js              # Tuning constants & liveries
│       ├── audio.js               # WebAudio procedural diesel & horn engine
│       ├── physics.js             # 12m commercial vehicle dynamics
│       ├── bus_model.js           # Procedural 3D Indian bus with interior cockpit
│       ├── environment.js         # Procedural NH45 highway, palm trees & day/night
│       ├── traffic.js             # Indian AI traffic (Rickshaws, trucks, cars)
│       ├── passenger_system.js    # Bus bays, boarding animations & fare scoring
│       ├── camera_system.js       # Cockpit, chase, and bumper cameras
│       ├── api.js                 # FastAPI client with offline fallback
│       ├── ui_controller.js       # Gauges, speedometer & dialog controllers
│       └── main.js                # Core game orchestrator
│
├── unity_project/                 # Complete Unity 3D C# Scripts & Architecture
│   ├── Assets/Scripts/
│   │   ├── Vehicles/              # BusController.cs, BusInterior.cs, BusSoundController.cs
│   │   ├── Environment/           # DayNightCycle.cs, WeatherManager.cs
│   │   ├── AI/                    # TrafficCarAI.cs, PassengerController.cs
│   │   ├── Backend/               # BackendApiClient.cs (UnityWebRequest REST client)
│   │   └── UI/                    # DrivingHUD.cs
│   └── README_UNITY.md
│
├── docs/
│   ├── ARCHITECTURE.md            # System design & Mermaid data flow
│   ├── API_REFERENCE.md           # REST API specification & curl examples
│   └── SETUP_GUIDE.md             # Detailed installation and launch steps
└── README.md
```

---

## ⚡ Quick Start

### 1. Play Instantly in Your Browser
Open [`frontend_playable/index.html`](file:///c:/Users/acer/Documents/busgame/frontend_playable/index.html) in your browser (Google Chrome, Edge, Brave, or Firefox).

### 2. Launch the Connected Backend Server
```bash
cd backend
pip install -r requirements.txt
python run_backend.py
```
* **Playable 3D Simulator**: [http://localhost:8000/](http://localhost:8000/)
* **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Default Demo Driver Account**: `captain_kumar` / `admin123`

---

## 🎮 Driving Controls

| Key | Function |
| :--- | :--- |
| `W` / `↑` | Accelerate (Diesel Engine Throttle) |
| `S` / `↓` | Brake / Reverse (Air Brakes) |
| `A` / `←` | Steer Left |
| `D` / `→` | Steer Right |
| `Space` | Handbrake (Emergency Lock) |
| `H` | Indian Musical Air Horn |
| `E` | Passenger Doors Open / Close |
| `L` | Headlights / High Beams |
| `C` | Cycle Camera (Chase ➡️ Cockpit ➡️ Bumper) |
| `Q` / `Z` | Left / Right Amber Turn Indicators |
