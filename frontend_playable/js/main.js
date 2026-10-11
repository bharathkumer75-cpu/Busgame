/**
 * Master Game Loop & Core Controller for Tamil Nadu 3D Bus Simulator
 */
class BusGame {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.canvas = document.getElementById("canvas3d");

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Subsystems
    this.physics = null;
    this.bus = null;
    this.environment = null;
    this.traffic = null;
    this.sound = null;
    this.passengers = null;
    this.cameraCtrl = null;
    this.api = null;
    this.ui = null;

    // State
    this.isPaused = false;
    this.headlightsOn = false;
    this.turnSignal = "off"; // 'left', 'right', 'off'
    this.turnSignalTimer = 0;
    this.lastTime = performance.now();
    this.activeRoute = null;

    // Input Map
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false
    };

    this.init();
  }

  async init() {
    // 1. Setup Three.js 3D Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaccff);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 800);
    this.camera.position.set(0, 5, -15);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: GAME_CONFIG.graphics.antiAliasing,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = GAME_CONFIG.graphics.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Initialize Subsystems
    this.sound = new BusSoundEngine();
    this.physics = new BusPhysics();
    this.bus = new BusModel3D("tnstc_green");
    this.scene.add(this.bus.root);

    this.environment = new HighwayEnvironment(this.scene);
    this.traffic = new TrafficManager(this.scene);
    this.passengers = new PassengerSystem(this.scene, this.sound);
    this.cameraCtrl = new CameraController(this.camera);
    this.api = new GameApiClient();
    this.ui = new UIController(this);

    // 3. Connect to Backend & Load Driver Profile
    this._initBackendConnection();

    // 4. Setup Input Listeners
    this._setupInputListeners();
    window.addEventListener("resize", () => this._onWindowResize());

    // 5. Start Game Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._gameLoop(t));

    // Show Welcome Banner
    setTimeout(() => {
      this.ui.showBanner("🚦 Welcome to Tamil Nadu 3D Bus Simulator! Use WASD to Drive.");
    }, 600);
  }

  async _initBackendConnection() {
    const isOnline = await this.api.checkHealth();
    this.ui.setConnectionStatus(isOnline);
    const profile = await this.api.login("captain_kumar", "admin123");
    if (profile) {
      this.ui.updateProfileData(profile);
      if (profile.coins) this.physics.fuelRemaining = profile.current_fuel_liters || 85.0;
    }
  }

  _setupInputListeners() {
    // Unlock Audio Context on first interaction
    const unlockAudio = () => {
      this.sound.init();
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("click", unlockAudio);

    window.addEventListener("keydown", (e) => this._onKeyDown(e));
    window.addEventListener("keyup", (e) => this._onKeyUp(e));

    // Touch controls for mobile
    const bindTouch = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("touchstart", (e) => { e.preventDefault(); this.keys[keyName] = true; });
      el.addEventListener("touchend", (e) => { e.preventDefault(); this.keys[keyName] = false; });
    };

    bindTouch("touch-up", "forward");
    bindTouch("touch-down", "backward");
    bindTouch("touch-left", "left");
    bindTouch("touch-right", "right");
  }

  _onKeyDown(e) {
    if (this.isPaused) return;

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.backward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = true;
        break;
      case "Space":
        this.keys.handbrake = true;
        this.sound.playAirBrakeHiss();
        break;
      case "KeyH":
        this.triggerHorn();
        break;
      case "KeyE":
        this.toggleDoor();
        break;
      case "KeyL":
        this.toggleLights();
        break;
      case "KeyC":
        this.toggleCamera();
        break;
      case "KeyQ":
        this.toggleTurnSignal("left");
        break;
      case "KeyZ":
        this.toggleTurnSignal("right");
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.keys.forward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.keys.backward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.keys.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.keys.right = false;
        break;
      case "Space":
        this.keys.handbrake = false;
        break;
    }
  }

  triggerHorn() {
    this.sound.playIndianAirHorn();
    this.ui.showBanner("🎺 Musical Air Horn Sounding!", 1500);
  }

  toggleDoor() {
    const isOpen = this.bus.togglePassengerDoor();
    this.sound.playAirBrakeHiss();
    this.ui.showBanner(isOpen ? "🚪 Passenger Doors Opened" : "🚪 Passenger Doors Closed", 1800);
    document.getElementById("btn-act-door")?.classList.toggle("active", isOpen);
  }

  toggleLights() {
    this.headlightsOn = !this.headlightsOn;
    this.bus.setHeadlights(this.headlightsOn);
    this.ui.showBanner(this.headlightsOn ? "💡 High Beams ON" : "💡 Headlights OFF", 1500);
    document.getElementById("btn-act-lights")?.classList.toggle("active", this.headlightsOn);
  }

  toggleCamera() {
    const newMode = this.cameraCtrl.toggleMode();
    const modeLabels = {
      third_person: "Chase View",
      cockpit: "Cockpit View (Driver Seat)",
      cinematic: "Bumper Action Cam"
    };
    this.ui.showBanner(`🎥 Camera: ${modeLabels[newMode] || newMode}`, 1600);
  }

  toggleTurnSignal(dir) {
    if (this.turnSignal === dir) {
      this.turnSignal = "off";
    } else {
      this.turnSignal = dir;
      this.sound.playClick();
    }
  }

  setWeather(wType) {
    this.environment.setWeather(wType);
    this.ui.showBanner(`Weather updated to: ${wType.toUpperCase()}`);
  }

  setTimeOfDay(timeVal) {
    this.environment.setTimeOfDay(timeVal);
  }

  startRoute(route) {
    this.activeRoute = route;
    document.getElementById("hud-route-name").innerText = route.name;
    document.getElementById("hud-next-stop").innerText = `Next Stop: ${route.stops[1] || route.stops[0]}`;
    if (route.weather.includes("Rain")) this.environment.setWeather("rain");
    else if (route.weather.includes("Fog")) this.environment.setWeather("fog");
    else this.environment.setWeather("clear");
  }

  _gameLoop(now) {
    requestAnimationFrame((t) => this._gameLoop(t));

    const dt = Math.min(0.1, (now - this.lastTime) / 1000.0);
    this.lastTime = now;

    if (this.isPaused) return;

    // 1. Process Physics Inputs
    let throttle = 0;
    let brake = 0;
    let steer = 0;
    let reverse = false;

    if (this.keys.forward) throttle = 1.0;
    if (this.keys.backward) {
      if (this.physics.forwardSpeed > 0.8) {
        brake = 1.0;
      } else {
        reverse = true;
        throttle = 0.8;
      }
    }
    if (this.keys.left) steer = -1.0;
    if (this.keys.right) steer = 1.0;

    this.physics.setInputs({
      throttle,
      brake,
      steer,
      handbrake: this.keys.handbrake,
      reverse
    });

    // 2. Physics Update
    this.physics.update(dt);

    // 3. 3D Model Update
    this.bus.update(this.physics, dt);

    // 4. Highway Environment Streaming & Day/Night Progression
    this.environment.update(this.physics.position, dt);

    // 5. AI Traffic Update & Collision Detection
    this.traffic.update(this.physics.position, dt, (hitCar) => {
      // Collision Callback
      this.physics.applyCrashDamage(8);
      this.sound.playAirBrakeHiss();
      this.passengers.penalizeViolation(6.0);
      this.ui.showBanner("⚠️ ACCIDENT ALERT! Drive carefully on highway.", 2500);
    });

    // 6. Passenger Stops Checking
    const stopPrompt = this.passengers.checkStops(
      this.physics.position,
      this.physics.getSpeedKmh(),
      this.bus.doorOpen,
      (msg) => {
        this.ui.showBanner(msg, 4000);
        this.api.saveProgress({
          coins: (this.api._getOfflineProfile().coins || 45000) + 750,
          passengers_added: 5
        });
        this.ui.updateProfileData(this.api._getOfflineProfile());
      }
    );
    if (stopPrompt && stopPrompt.message) {
      this.ui.showBanner(stopPrompt.message, 1200);
    }

    // 7. Turn Signals Blinking Cycle
    if (this.turnSignal !== "off") {
      this.turnSignalTimer += dt;
      const blinkState = Math.sin(this.turnSignalTimer * 8) > 0;
      this.bus.setTurnSignal(this.turnSignal, blinkState);
    } else {
      this.bus.setTurnSignal("off", false);
    }

    // 8. Sound Engine Update (Diesel RPM growl)
    this.sound.updateEngine(this.physics.getRpmRatio(), throttle);

    // 9. Camera Update
    this.cameraCtrl.update(this.bus.root, this.physics, dt);

    // 10. UI HUD Refresh
    this.ui.updateHUD(this.physics, this.passengers);

    // 11. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  _onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Boot game when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  window.currentGame = new BusGame();
});
