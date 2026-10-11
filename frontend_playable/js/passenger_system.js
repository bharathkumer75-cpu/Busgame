/**
 * Passenger Pickup & Dropoff System
 * Generates highway bus bays, waiting passengers, door opening triggers, boarding animations,
 * fare calculation and satisfaction scoring.
 */
class PassengerSystem {
  constructor(scene, soundEngine) {
    this.scene = scene;
    this.sound = soundEngine;

    this.stops = [];
    this.currentStopIndex = 0;
    this.currentPassengersOnBoard = 12;
    this.maxPassengerCapacity = 45;
    this.totalFareCollected = 0;
    this.satisfactionRating = 98.0; // Percentage

    this.activeStopInRange = null;
    this.isBoardingInProgress = false;

    this._createBusStops();
  }

  _createBusStops() {
    // Generate stops along the route (Z = 250m, 700m, 1300m, 1900m)
    const stopLocations = [
      { name: "Chengalpattu Toll Bus Bay", z: 260 },
      { name: "Tindivanam Highway Stand", z: 750 },
      { name: "Villupuram Junction Stop", z: 1350 },
      { name: "Samayapuram Toll Plaza", z: 2000 }
    ];

    stopLocations.forEach((loc, idx) => {
      const stopMesh = this._buildBusStopMesh(loc.name);
      stopMesh.position.set(-13.5, 0, loc.z);
      this.scene.add(stopMesh);

      // Create 3-5 passengers waiting under shelter
      const passengers = [];
      const numWaiting = 3 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numWaiting; p++) {
        const pMesh = this._createPassengerCharacter();
        pMesh.position.set(-13.0 + (p * 0.7 - 1.2), 0, loc.z + (Math.random() * 1.5 - 0.75));
        this.scene.add(pMesh);
        passengers.push(pMesh);
      }

      this.stops.push({
        id: idx + 1,
        name: loc.name,
        z: loc.z,
        mesh: stopMesh,
        passengers: passengers,
        completed: false
      });
    });
  }

  _buildBusStopMesh(name) {
    const group = new THREE.Group();
    // Concrete Bus Platform
    const platGeo = new THREE.BoxGeometry(4.5, 0.35, 18.0);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.y = 0.17;
    platform.receiveShadow = true;
    group.add(platform);

    // Yellow Bus Bay Road Marking
    const bayLineGeo = new THREE.PlaneGeometry(3.5, 18.0);
    const bayMat = new THREE.MeshBasicMaterial({ color: 0xffbe0b, transparent: true, opacity: 0.35 });
    const bayMesh = new THREE.Mesh(bayLineGeo, bayMat);
    bayMesh.rotation.x = -Math.PI / 2;
    bayMesh.position.set(3.5, 0.03, 0);
    group.add(bayMesh);

    // Glass & Steel Passenger Shelter
    const shelterGeo = new THREE.BoxGeometry(2.8, 2.8, 8.0);
    const shelterMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.3 });
    const shelter = new THREE.Mesh(shelterGeo, shelterMat);
    shelter.position.set(-0.5, 1.55, 0);
    group.add(shelter);

    // Tamil Nadu State Transport Board Sign
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#058c42"; // TNSTC Green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("பேருந்து நிறுத்தம் BUS STOP", canvas.width / 2, 50);
    ctx.font = "24px sans-serif";
    ctx.fillText(name, canvas.width / 2, 95);

    const tex = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: tex });
    const signGeo = new THREE.PlaneGeometry(3.6, 0.9);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0.92, 2.7, 0);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);

    return group;
  }

  _createPassengerCharacter() {
    const char = new THREE.Group();
    const shirtColors = [0xef476f, 0x06d6a0, 0x118ab2, 0xffd166, 0xf77f00];
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];

    // Body / Torso
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.05;
    char.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 }); // Indian skin tone
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.55;
    char.add(head);

    // Legs / Pants
    const legGeo = new THREE.BoxGeometry(0.3, 0.7, 0.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1d3557 });
    const legs = new THREE.Mesh(legGeo, legMat);
    legs.position.y = 0.35;
    char.add(legs);

    return char;
  }

  checkStops(playerBusPos, busSpeedKmh, isDoorOpen, onBannerCallback) {
    // Find if player is close to any stop (within 15m in Z, and parked in the left lane/shoulder X ~ -10m)
    let foundStop = null;

    for (const stop of this.stops) {
      if (stop.completed) continue;
      const dz = Math.abs(playerBusPos.z - stop.z);
      if (dz < 16.0 && playerBusPos.x < -4.0) {
        foundStop = stop;
        break;
      }
    }

    this.activeStopInRange = foundStop;

    if (!foundStop) return null;

    // Check conditions for boarding:
    // Stopped (< 3 km/h) and Door is Open!
    if (Math.abs(busSpeedKmh) < 3.0) {
      if (isDoorOpen && !this.isBoardingInProgress) {
        this._boardPassengers(foundStop, onBannerCallback);
      } else if (!isDoorOpen) {
        return {
          status: "WAITING_DOOR",
          message: `Approaching ${foundStop.name}. Stop and press [E] to Open Doors!`
        };
      }
    } else {
      return {
        status: "SLOW_DOWN",
        message: `Bus Stop Ahead: ${foundStop.name}. Slow down to board passengers.`
      };
    }

    return null;
  }

  _boardPassengers(stop, onBannerCallback) {
    this.isBoardingInProgress = true;
    const boardedCount = stop.passengers.length;
    const fare = boardedCount * 150; // ₹150 per passenger

    if (this.sound) {
      this.sound.playPassengerChime();
    }

    // Smoothly animate passengers into the bus door
    let step = 0;
    const interval = setInterval(() => {
      if (step < stop.passengers.length) {
        const p = stop.passengers[step];
        p.visible = false;
        step++;
      } else {
        clearInterval(interval);
        this.currentPassengersOnBoard += boardedCount;
        this.totalFareCollected += fare;
        this.satisfactionRating = Math.min(100.0, this.satisfactionRating + 2.5);
        stop.completed = true;
        this.isBoardingInProgress = false;

        if (onBannerCallback) {
          onBannerCallback(`✅ ${boardedCount} Passengers Boarded! +₹${fare} Collected. Close doors [E] & depart.`);
        }
      }
    }, 280);
  }

  penalizeViolation(amount = 4.0) {
    this.satisfactionRating = Math.max(10.0, this.satisfactionRating - amount);
  }
}

window.PassengerSystem = PassengerSystem;
