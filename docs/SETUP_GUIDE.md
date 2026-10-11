# Installation & Step-by-Step Setup Guide

Follow these steps to run and play the **Tamil Nadu 3D Bus Driving Simulator** on your computer.

---

## ⚡ Option 1: Instant Play in Browser (Zero Install)

The game includes a complete, high-fidelity 3D WebGL simulator built with Three.js. You can launch it immediately:

1. Navigate to the project directory:
   ```bash
   cd c:\Users\acer\Documents\busgame
   ```
2. Double click or open [`frontend_playable/index.html`](file:///c:/Users/acer/Documents/busgame/frontend_playable/index.html) directly in any modern web browser (**Google Chrome**, **Microsoft Edge**, **Brave**, or **Mozilla Firefox**).
3. The game starts immediately with full 3D graphics, procedural audio synthesis, physics, traffic, and passenger stops!

---

## 🚀 Option 2: Running Backend & Game Together (Full Cloud Experience)

Running the FastAPI backend provides live user authentication, cloud game saves, garage database persistence, and leaderboards.

### Step 1: Install Python Requirements
Open a terminal (PowerShell or Command Prompt) and install dependencies:
```bash
cd c:\Users\acer\Documents\busgame\backend
pip install -r requirements.txt
```

### Step 2: Launch Backend Server
Run the automated runner script:
```bash
python run_backend.py
```

This will automatically:
* Initialize the SQLite database `bussimulator.db`
* Seed realistic Tamil Nadu bus models (TNSTC Ultra Deluxe, SETC AC Sleeper, KPN Multi-Axle, Ghat Special)
* Seed authentic Tamil Nadu highway routes (NH-45 Chennai-Madurai, Ooty Ghat 36 Hairpin Bends, etc.)
* Create the default driver account (`captain_kumar` / password `admin123`)
* Start the server at `http://localhost:8000`

### Step 3: Access the Application
* **Playable 3D Bus Simulator**: Open [http://localhost:8000/](http://localhost:8000/) or [http://localhost:8000/game](http://localhost:8000/game)
* **Interactive API Documentation (Swagger UI)**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check**: Open [http://localhost:8000/health](http://localhost:8000/health)

---

## 🎮 Game Controls Guide

| Action | Keyboard Key | Description |
| :--- | :--- | :--- |
| **Accelerate** | `W` or `Up Arrow` | Forward throttle with diesel RPM sound |
| **Brake / Reverse** | `S` or `Down Arrow` | Pneumatic brakes, reverse gear when stopped |
| **Steer Left** | `A` or `Left Arrow` | Rotates wheels and animated steering wheel |
| **Steer Right** | `D` or `Right Arrow` | Rotates wheels and animated steering wheel |
| **Handbrake** | `Spacebar` | Emergency pneumatic lock with air hiss |
| **Musical Air Horn** | `H` | Authentic Tamil Nadu highway musical air horn |
| **Passenger Doors** | `E` | Opens/closes left passenger folding doors |
| **Headlights** | `L` | Toggles high-beam spotlights for night driving |
| **Camera View** | `C` | Cycles Chase View ➡️ Driver Cockpit ➡️ Bumper Cam |
| **Turn Signals** | `Q` (Left) / `Z` (Right) | Amber indicators with relay clicks |

---

## 🛠️ Option 3: Unity 3D Engine Development

To open the project inside Unity:
1. Open **Unity Hub** and click **Add project from disk**.
2. Select the [`unity_project`](file:///c:/Users/acer/Documents/busgame/unity_project) directory.
3. Use **Unity 2022.3 LTS** or higher with Universal Render Pipeline (URP).
4. Review [`unity_project/README_UNITY.md`](file:///c:/Users/acer/Documents/busgame/unity_project/README_UNITY.md) for full WheelCollider tuning and Cinemachine camera setup.
