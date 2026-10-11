/**
 * Backend API Client & Seamless Cloud Sync Engine
 * Connects WebGL simulator to Python FastAPI server with automatic offline fallback.
 */
class GameApiClient {
  constructor(baseUrl = GAME_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("tn_bus_jwt_token") || null;
    this.isConnected = false;
    this.currentUser = null;

    // Offline state storage key
    this.storageKey = "tn_bus_sim_offline_state_v1";
  }

  async checkHealth() {
    try {
      const resp = await fetch("http://localhost:8000/health", { method: "GET", headers: { "Content-Type": "application/json" } });
      if (resp.ok) {
        this.isConnected = true;
        console.log("Connected to Tamil Nadu Bus Simulator Backend API!");
        return true;
      }
    } catch (err) {
      this.isConnected = false;
      console.log("FastAPI backend not detected, running in Standalone Offline mode.");
    }
    return false;
  }

  async login(username = "captain_kumar", password = "admin123") {
    if (!this.isConnected) {
      return this._getOfflineProfile();
    }

    try {
      const resp = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (resp.ok) {
        const data = await resp.json();
        this.token = data.access_token;
        localStorage.setItem("tn_bus_jwt_token", this.token);
        return await this.getProfile();
      }
    } catch (e) {
      console.warn("Login failed, falling back to offline user", e);
    }
    return this._getOfflineProfile();
  }

  async getProfile() {
    if (!this.isConnected || !this.token) {
      return this._getOfflineProfile();
    }

    try {
      const resp = await fetch(`${this.baseUrl}/profile`, {
        headers: { "Authorization": `Bearer ${this.token}` }
      });
      if (resp.ok) {
        const profile = await resp.json();
        this.currentUser = profile;
        return profile;
      }
    } catch (e) {
      console.warn("Could not fetch remote profile", e);
    }
    return this._getOfflineProfile();
  }

  async getCatalog() {
    if (!this.isConnected) {
      return [
        { id: 1, model_name: "TNSTC Ultra Deluxe Express", brand: "Ashok Leyland", price: 25000, base_livery: "tnstc_green", max_speed_kmh: 115 },
        { id: 2, model_name: "SETC Aanmajothi AC Sleeper", brand: "BharatBenz", price: 65000, base_livery: "setc_red", max_speed_kmh: 125 },
        { id: 3, model_name: "KPN Multi-Axle Highway Jet", brand: "Volvo B11R", price: 120000, base_livery: "omni_blue", max_speed_kmh: 140 },
        { id: 4, model_name: "Nilgiris Hill Ghat Special", brand: "Ashok Leyland", price: 45000, base_livery: "vintage_yellow", max_speed_kmh: 85 }
      ];
    }

    try {
      const resp = await fetch(`${this.baseUrl}/garage/catalog`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("Error getting catalog", e);
    }
    return [];
  }

  async saveProgress(data) {
    if (this.isConnected && this.token) {
      try {
        await fetch(`${this.baseUrl}/profile/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.warn("Cloud save failed, saving locally", e);
      }
    }

    // Always update offline cache
    const offline = this._getOfflineProfile();
    if (data.coins !== undefined) offline.coins = data.coins;
    if (data.experience !== undefined) offline.experience = data.experience;
    if (data.distance_added_km) offline.total_distance_km += data.distance_added_km;
    if (data.passengers_added) offline.passengers_transported += data.passengers_added;
    localStorage.setItem(this.storageKey, JSON.stringify(offline));
  }

  async submitMission(missionData) {
    if (this.isConnected && this.token) {
      try {
        const resp = await fetch(`${this.baseUrl}/routes/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          },
          body: JSON.stringify(missionData)
        });
        if (resp.ok) return await resp.json();
      } catch (e) {
        console.warn("Remote mission submit failed", e);
      }
    }

    // Offline calculation fallback
    const offline = this._getOfflineProfile();
    const earnings = (missionData.passengers_served * 150) + 3500;
    offline.coins += earnings;
    offline.trips_completed += 1;
    localStorage.setItem(this.storageKey, JSON.stringify(offline));
    return {
      earned_coins: earnings,
      earned_xp: 450,
      message: `Trip finished! Earned ₹${earnings}`
    };
  }

  _getOfflineProfile() {
    const cached = localStorage.getItem(this.storageKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    const defaultProfile = {
      user_id: 1,
      username: "captain_kumar",
      display_name: "Captain M. Kumar (Madurai Zone)",
      coins: 45000,
      experience: 2400,
      driver_level: 3,
      driving_rating: 4.9,
      total_distance_km: 1280.0,
      passengers_transported: 840,
      trips_completed: 8,
      bus_health_percent: 100.0,
      current_fuel_liters: 85.0
    };
    localStorage.setItem(this.storageKey, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
}

window.GameApiClient = GameApiClient;
