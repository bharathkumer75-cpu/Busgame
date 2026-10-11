# Unity 3D Project Guide - Tamil Nadu Bus Simulator

This folder contains the complete C# game architecture for developing or building the game in **Unity 3D** (Unity 2022.3 LTS, Unity 2023, or Unity 6).

---

## 📁 Folder Structure

```
Assets/
├── Scripts/
│   ├── Vehicles/
│   │   ├── BusController.cs       # WheelCollider physics, motor torque curves, pneumatic braking
│   │   ├── BusInterior.cs         # Animated steering wheel, speedo & tachometer needles
│   │   └── BusSoundController.cs  # Engine RPM audio blending, air brake hiss, musical horn
│   ├── Environment/
│   │   ├── DayNightCycle.cs       # 24h rotating sunlight, skybox gradients, night streetlights
│   │   └── WeatherManager.cs      # Clear, monsoon rain downpour, Nilgiris mountain mist
│   ├── AI/
│   │   ├── TrafficCarAI.cs        # Indian traffic (Auto-rickshaws, Tata trucks), collision raycasts
│   │   └── PassengerController.cs # Bus stop shelter queueing, NavMesh walking & boarding
│   ├── Backend/
│   │   └── BackendApiClient.cs    # UnityWebRequest REST integration with Python FastAPI backend
│   └── UI/
│       └── DrivingHUD.cs          # Gauges, gear indicator, fuel, health and notifications
```

---

## 🛠️ Unity Engine Setup Instructions

### 1. Requirements
* **Unity Version**: 2022.3 LTS or higher (recommended: Unity 2022.3 LTS or Unity 6)
* **Render Pipeline**: **Universal Render Pipeline (URP)** for realistic real-time lighting, wet road reflections, and bloom.

### 2. Package Manager Dependencies
Install the following packages via Unity Package Manager (`Window -> Package Manager`):
* `Universal RP` (URP)
* `Cinemachine` (for smooth third-person chase cam and cockpit driver seat camera)
* `TextMeshPro` (for high-resolution destination LED signboards)
* `AI Navigation` (for passenger NavMesh walking)

### 3. WheelCollider Physics Configuration
For the 12-meter commercial bus:
* **Bus Rigidbody Mass**: `14,500 kg`
* **Center of Mass**: `(0, -0.65, 0.2)`
* **Wheel Suspension Spring**: `35,000`
* **Wheel Suspension Damper**: `4,500`
* **Target Position**: `0.5`
* **Wheel Radius**: `0.55m`

### 4. Connecting to FastAPI Backend
1. Start the backend by running:
   ```bash
   python backend/run_backend.py
   ```
2. In Unity, attach `BackendApiClient.cs` to an empty GameObject named `[GameManager]`.
3. Set `Api Base Url` to `http://localhost:8000/api/v1`.
4. When testing in the Unity Editor, the client will automatically authenticate with the backend, load player coins, active buses, and synchronize trip earnings!
