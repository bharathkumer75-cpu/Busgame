/**
 * UI Controller for Tamil Nadu 3D Bus Simulator
 * Updates real-time gauges, speedometer, gear status, modals (Garage, Routes, Settings),
 * and onscreen banner alerts.
 */
class UIController {
  constructor(game) {
    this.game = game;

    // HUD Elements
    this.speedEl = document.getElementById("hud-speed");
    this.gearEl = document.getElementById("hud-gear");
    this.fuelFillEl = document.getElementById("hud-fuel-fill");
    this.damageFillEl = document.getElementById("hud-damage-fill");
    this.coinsEl = document.getElementById("user-coins");
    this.levelEl = document.getElementById("user-level");
    this.passengersEl = document.getElementById("hud-passengers");
    this.fareEl = document.getElementById("hud-fare");
    this.ratingEl = document.getElementById("hud-rating");
    this.bannerEl = document.getElementById("notification-banner");
    this.connectionTag = document.getElementById("backend-connection-status");

    // Indicator elements
    this.turnLeftEl = document.getElementById("turn-left-indicator");
    this.turnRightEl = document.getElementById("turn-right-indicator");

    this.bannerTimeout = null;
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Menu navigation buttons
    document.getElementById("btn-menu")?.addEventListener("click", () => this.showModal("modal-menu"));
    document.getElementById("btn-garage")?.addEventListener("click", () => {
      this.populateGarage();
      this.showModal("modal-garage");
    });
    document.getElementById("btn-routes")?.addEventListener("click", () => {
      this.populateRoutes();
      this.showModal("modal-routes");
    });
    document.getElementById("btn-settings")?.addEventListener("click", () => this.showModal("modal-settings"));

    // Close buttons
    document.querySelectorAll(".btn-close").forEach(btn => {
      btn.addEventListener("click", () => this.closeModals());
    });

    // Action buttons (Horn, Door, Lights, Camera)
    document.getElementById("btn-act-horn")?.addEventListener("click", () => this.game.triggerHorn());
    document.getElementById("btn-act-door")?.addEventListener("click", () => this.game.toggleDoor());
    document.getElementById("btn-act-lights")?.addEventListener("click", () => this.game.toggleLights());
    document.getElementById("btn-act-cam")?.addEventListener("click", () => this.game.toggleCamera());

    // Weather dropdown in settings
    document.getElementById("setting-weather")?.addEventListener("change", (e) => {
      this.game.setWeather(e.target.value);
    });

    // Time of day slider in settings
    document.getElementById("setting-time")?.addEventListener("input", (e) => {
      this.game.setTimeOfDay(parseFloat(e.target.value));
    });

    // Audio Mute button
    document.getElementById("btn-audio-toggle")?.addEventListener("click", () => {
      const isMuted = this.game.sound.toggleMute();
      document.getElementById("btn-audio-toggle").innerText = isMuted ? "🔇 Unmute" : "🔊 Audio";
    });
  }

  showModal(modalId) {
    this.closeModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      this.game.isPaused = true;
    }
  }

  closeModals() {
    document.querySelectorAll(".screen-modal").forEach(m => m.classList.remove("active"));
    this.game.isPaused = false;
  }

  showBanner(message, duration = 3500) {
    if (!this.bannerEl) return;
    this.bannerEl.innerText = message;
    this.bannerEl.style.display = "block";

    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.bannerEl.style.display = "none";
    }, duration);
  }

  updateHUD(physics, passengerSystem) {
    // 1. Digital Speedometer
    const speed = Math.round(Math.abs(physics.getSpeedKmh()));
    if (this.speedEl) this.speedEl.innerText = speed;

    // 2. Gear indicator
    if (this.gearEl) {
      if (physics.isReverse) this.gearEl.innerText = "R";
      else if (speed === 0 && physics.throttle === 0) this.gearEl.innerText = "N";
      else this.gearEl.innerText = physics.gear;
    }

    // 3. Fuel & Health bars
    if (this.fuelFillEl) {
      this.fuelFillEl.style.width = `${Math.max(0, physics.fuelRemaining)}%`;
    }
    if (this.damageFillEl) {
      this.damageFillEl.style.width = `${Math.max(0, physics.healthPercent)}%`;
    }

    // 4. Passenger stats
    if (this.passengersEl && passengerSystem) {
      this.passengersEl.innerText = `${passengerSystem.currentPassengersOnBoard} / 45`;
    }
    if (this.fareEl && passengerSystem) {
      this.fareEl.innerText = `₹${passengerSystem.totalFareCollected}`;
    }
    if (this.ratingEl && passengerSystem) {
      this.ratingEl.innerText = `${passengerSystem.satisfactionRating.toFixed(1)}%`;
    }
  }

  setConnectionStatus(isConnected) {
    if (this.connectionTag) {
      if (isConnected) {
        this.connectionTag.innerHTML = "🟢 Cloud API Connected";
        this.connectionTag.style.color = "#06d6a0";
      } else {
        this.connectionTag.innerHTML = "🟠 Standalone Offline";
        this.connectionTag.style.color = "#ffbe0b";
      }
    }
  }

  updateProfileData(profile) {
    if (this.coinsEl) this.coinsEl.innerText = `₹${profile.coins.toLocaleString()}`;
    if (this.levelEl) this.levelEl.innerText = `Lvl ${profile.driver_level}`;
  }

  populateGarage() {
    const container = document.getElementById("garage-catalog-list");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(GAME_CONFIG.liveries).forEach(livKey => {
      const liv = GAME_CONFIG.liveries[livKey];
      const card = document.createElement("div");
      card.className = "card-item";
      if (this.game.bus.livery.name === liv.name) card.classList.add("selected");

      card.innerHTML = `
        <div class="card-title">${liv.name}</div>
        <div class="card-subtitle">Destination: ${liv.signText}</div>
        <div class="card-specs">
          <div class="spec-row"><span>Type:</span><span class="spec-val">Express Coach</span></div>
          <div class="spec-row"><span>Engine:</span><span class="spec-val">Ashok Leyland 210HP</span></div>
          <div class="spec-row"><span>Air Horn:</span><span class="spec-val">Multi-Tone Pneumatic</span></div>
        </div>
        <button class="btn-primary" style="margin-top:8px;">Apply Livery</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        this.game.bus.changeLivery(livKey);
        this.showBanner(`Applied ${liv.name} Livery!`);
        this.populateGarage();
      });

      container.appendChild(card);
    });
  }

  populateRoutes() {
    const container = document.getElementById("routes-catalog-list");
    if (!container) return;
    container.innerHTML = "";

    GAME_CONFIG.routes.forEach(route => {
      const card = document.createElement("div");
      card.className = "card-item";
      card.innerHTML = `
        <div class="card-title">${route.name}</div>
        <div class="card-subtitle">Route Code: ${route.code} (${route.type})</div>
        <div class="card-specs">
          <div class="spec-row"><span>Distance:</span><span class="spec-val">${route.lengthKm} KM</span></div>
          <div class="spec-row"><span>Ticket Fare:</span><span class="spec-val">₹${route.baseFare}</span></div>
          <div class="spec-row"><span>Weather:</span><span class="spec-val">${route.weather}</span></div>
          <div class="spec-row"><span>Stops:</span><span class="spec-val">${route.stops.join(" -> ")}</span></div>
        </div>
        <button class="btn-primary" style="margin-top:8px;">Start Route Mission</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        this.closeModals();
        this.game.startRoute(route);
        this.showBanner(`🚀 Mission Started: ${route.name}!`);
      });

      container.appendChild(card);
    });
  }
}

window.UIController = UIController;
