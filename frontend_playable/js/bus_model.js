/**
 * Procedural 3D Bus Generator for Realistic Indian Buses (TNSTC, SETC, Omni)
 * Builds detailed exterior body, glass, wheels, illuminated destination boards,
 * animated steering wheel, driver cabin interior, seats, and spotlights.
 */
class BusModel3D {
  constructor(liveryKey = "tnstc_green") {
    this.livery = GAME_CONFIG.liveries[liveryKey] || GAME_CONFIG.liveries.tnstc_green;
    this.root = new THREE.Group();

    // References to dynamic animated subcomponents
    this.steeringWheel = null;
    this.frontLeftWheel = null;
    this.frontRightWheel = null;
    this.rearLeftWheels = [];
    this.rearRightWheels = [];
    this.headlights = [];
    this.brakeLights = [];
    this.turnLightsLeft = [];
    this.turnLightsRight = [];
    this.spotlights = [];
    this.passengerDoor = null;
    this.doorOpen = false;
    this.doorProgress = 0.0;

    // Materials
    this.materials = {};
    this._initMaterials();
    this._buildBus();
  }

  _initMaterials() {
    this.materials.body = new THREE.MeshStandardMaterial({
      color: this.livery.bodyColor,
      metalness: 0.35,
      roughness: 0.35
    });

    this.materials.stripe = new THREE.MeshStandardMaterial({
      color: this.livery.stripeColor,
      metalness: 0.2,
      roughness: 0.4
    });

    this.materials.roof = new THREE.MeshStandardMaterial({
      color: this.livery.roofColor,
      roughness: 0.6
    });

    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x1a2b3c,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5
    });

    this.materials.rubber = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.85
    });

    this.materials.rim = new THREE.MeshStandardMaterial({
      color: 0xdcdcdc,
      metalness: 0.8,
      roughness: 0.25
    });

    this.materials.interior = new THREE.MeshStandardMaterial({
      color: 0x2b2d42,
      roughness: 0.8
    });

    this.materials.seat = new THREE.MeshStandardMaterial({
      color: 0x3a0ca3,
      roughness: 0.7
    });

    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.1
    });

    this.materials.headlightOff = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    this.materials.headlightOn = new THREE.MeshBasicMaterial({ color: 0xffffee });

    this.materials.brakeOff = new THREE.MeshStandardMaterial({ color: 0x550000 });
    this.materials.brakeOn = new THREE.MeshBasicMaterial({ color: 0xff0022 });

    this.materials.amberOff = new THREE.MeshStandardMaterial({ color: 0x664400 });
    this.materials.amberOn = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  }

  _buildBus() {
    const W = GAME_CONFIG.physics.busDimensions.width;   // 2.6m
    const H = GAME_CONFIG.physics.busDimensions.height;  // 3.4m
    const L = GAME_CONFIG.physics.busDimensions.length;  // 12.0m
    const halfL = L / 2;

    // Main Chassis Group
    this.chassis = new THREE.Group();
    this.root.add(this.chassis);

    // 1. Lower Body Shell
    const lowerBodyGeo = new THREE.BoxGeometry(W, 1.3, L);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, this.materials.body);
    lowerBody.position.y = 1.25;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.chassis.add(lowerBody);

    // Side Accent Graphic Stripe
    const stripeGeo = new THREE.BoxGeometry(W + 0.04, 0.25, L - 0.2);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.stripe);
    stripe.position.y = 1.15;
    this.chassis.add(stripe);

    // 2. Upper Cabin Pillars & Roof
    const roofGeo = new THREE.BoxGeometry(W, 0.35, L);
    const roof = new THREE.Mesh(roofGeo, this.materials.roof);
    roof.position.y = 2.95;
    roof.castShadow = true;
    this.chassis.add(roof);

    // AC Unit / Luggage Pod on Roof
    const acPodGeo = new THREE.BoxGeometry(W * 0.75, 0.4, 3.8);
    const acPod = new THREE.Mesh(acPodGeo, this.materials.roof);
    acPod.position.set(0, 3.25, -0.5);
    acPod.castShadow = true;
    this.chassis.add(acPod);

    // 3. Windshield & Windows
    // Front Windshield (curved split glass)
    const windshieldGeo = new THREE.PlaneGeometry(W * 0.92, 1.2);
    const windshield = new THREE.Mesh(windshieldGeo, this.materials.glass);
    windshield.position.set(0, 2.3, halfL - 0.02);
    windshield.rotation.x = -0.15;
    this.chassis.add(windshield);

    // Rear Window
    const rearGlassGeo = new THREE.PlaneGeometry(W * 0.85, 0.95);
    const rearGlass = new THREE.Mesh(rearGlassGeo, this.materials.glass);
    rearGlass.position.set(0, 2.35, -halfL + 0.02);
    rearGlass.rotation.y = Math.PI;
    this.chassis.add(rearGlass);

    // Side Window Bands
    const sideWinGeo = new THREE.BoxGeometry(0.04, 1.05, L * 0.78);
    const leftWindows = new THREE.Mesh(sideWinGeo, this.materials.glass);
    leftWindows.position.set(-W / 2 - 0.01, 2.3, -0.4);
    this.chassis.add(leftWindows);

    const rightWindows = new THREE.Mesh(sideWinGeo, this.materials.glass);
    rightWindows.position.set(W / 2 + 0.01, 2.3, -0.4);
    this.chassis.add(rightWindows);

    // 4. Front LED Destination Sign Board ("சென்னை - மதுரை CHENNAI - MADURAI")
    const signBoard = this._createDestinationBoard(this.livery.signText, this.livery.signTextColor);
    signBoard.position.set(0, 3.0, halfL - 0.05);
    signBoard.rotation.x = -0.1;
    this.chassis.add(signBoard);

    // Front Chrome Grille with Ashok Leyland / BharatBenz badge style
    const grilleGeo = new THREE.BoxGeometry(W * 0.65, 0.45, 0.15);
    const grille = new THREE.Mesh(grilleGeo, this.materials.chrome);
    grille.position.set(0, 1.0, halfL + 0.02);
    this.chassis.add(grille);

    // Front Bumper
    const bumperGeo = new THREE.BoxGeometry(W + 0.08, 0.35, 0.3);
    const bumper = new THREE.Mesh(bumperGeo, this.materials.rubber);
    bumper.position.set(0, 0.68, halfL + 0.1);
    bumper.castShadow = true;
    this.chassis.add(bumper);

    // 5. Headlights & Spotlights
    this._buildLighting(W, halfL);

    // 6. Side Convex Mirrors
    this._buildMirrors(W, halfL);

    // 7. Interior: Driver Cockpit, Steering Wheel & Passenger Seats
    this._buildInterior(W, L, halfL);

    // 8. Wheels & Axles
    this._buildWheels(W, halfL);

    // 9. Passenger Entrance Door (animated folding door)
    this._buildPassengerDoor(W, halfL);
  }

  _createDestinationBoard(text, textColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.fillStyle = textColor;
    ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: texture });
    const signGeo = new THREE.PlaneGeometry(1.6, 0.32);
    return new THREE.Mesh(signGeo, signMat);
  }

  _buildLighting(W, halfL) {
    const lightGeo = new THREE.BoxGeometry(0.24, 0.16, 0.05);

    // Left and Right Headlights
    [-W * 0.35, W * 0.35].forEach((xPos) => {
      const hl = new THREE.Mesh(lightGeo, this.materials.headlightOff);
      hl.position.set(xPos, 0.95, halfL + 0.08);
      this.chassis.add(hl);
      this.headlights.push(hl);

      // Spotlights for night driving
      const spot = new THREE.SpotLight(0xfffaed, 0, 80, Math.PI / 6, 0.3, 1.2);
      spot.position.set(xPos, 1.0, halfL + 0.2);
      spot.target.position.set(xPos, 0.2, halfL + 25);
      this.chassis.add(spot);
      this.chassis.add(spot.target);
      this.spotlights.push(spot);
    });

    // Rear Brake / Tail Lights
    [-W * 0.38, W * 0.38].forEach((xPos) => {
      const bl = new THREE.Mesh(lightGeo, this.materials.brakeOff);
      bl.position.set(xPos, 1.1, -halfL - 0.02);
      this.chassis.add(bl);
      this.brakeLights.push(bl);
    });

    // Turn Indicators
    const indGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);
    const leftInd = new THREE.Mesh(indGeo, this.materials.amberOff);
    leftInd.position.set(-W * 0.46, 0.95, halfL + 0.08);
    this.chassis.add(leftInd);
    this.turnLightsLeft.push(leftInd);

    const rightInd = new THREE.Mesh(indGeo, this.materials.amberOff);
    rightInd.position.set(W * 0.46, 0.95, halfL + 0.08);
    this.chassis.add(rightInd);
    this.turnLightsRight.push(rightInd);
  }

  _buildMirrors(W, halfL) {
    const mirrorStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5);
    const mirrorGlassGeo = new THREE.BoxGeometry(0.18, 0.42, 0.04);

    [-1, 1].forEach((side) => {
      const mirrorGroup = new THREE.Group();
      const stem = new THREE.Mesh(mirrorStemGeo, this.materials.chrome);
      stem.rotation.z = side * Math.PI / 4;
      stem.position.set(0, 0, 0);
      mirrorGroup.add(stem);

      const mirror = new THREE.Mesh(mirrorGlassGeo, this.materials.chrome);
      mirror.position.set(side * 0.3, 0.15, 0.05);
      mirrorGroup.add(mirror);

      mirrorGroup.position.set(side * (W / 2 + 0.05), 2.2, halfL - 0.35);
      this.chassis.add(mirrorGroup);
    });
  }

  _buildInterior(W, L, halfL) {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(W - 0.1, L - 0.4);
    const floor = new THREE.Mesh(floorGeo, this.materials.interior);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.95;
    this.chassis.add(floor);

    // Dashboard Console
    const dashGeo = new THREE.BoxGeometry(W * 0.88, 0.5, 0.9);
    const dash = new THREE.Mesh(dashGeo, this.materials.interior);
    dash.position.set(0, 1.45, halfL - 0.85);
    this.chassis.add(dash);

    // Driver Steering Wheel (Right-hand drive for India!)
    const wheelGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.24, 0.026, 8, 24);
    const ring = new THREE.Mesh(ringGeo, this.materials.rubber);
    wheelGroup.add(ring);

    const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05);
    const hub = new THREE.Mesh(hubGeo, this.materials.chrome);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    // Spokes
    const spokeGeo = new THREE.BoxGeometry(0.44, 0.03, 0.02);
    const spoke = new THREE.Mesh(spokeGeo, this.materials.rubber);
    wheelGroup.add(spoke);

    // Place on Right Side (India RHD)
    wheelGroup.position.set(0.65, 1.62, halfL - 1.25);
    wheelGroup.rotation.x = -Math.PI / 3.8;
    this.chassis.add(wheelGroup);
    this.steeringWheel = wheelGroup;

    // Driver Captain Seat
    const seatGeo = new THREE.BoxGeometry(0.55, 0.8, 0.55);
    const driverSeat = new THREE.Mesh(seatGeo, this.materials.seat);
    driverSeat.position.set(0.65, 1.45, halfL - 1.8);
    this.chassis.add(driverSeat);

    // Passenger Rows (2x2 seating layout)
    const seatRowGeo = new THREE.BoxGeometry(0.85, 0.75, 0.45);
    for (let z = halfL - 3.0; z > -halfL + 1.5; z -= 1.1) {
      // Left 2-seater
      const leftSeat = new THREE.Mesh(seatRowGeo, this.materials.seat);
      leftSeat.position.set(-0.75, 1.4, z);
      this.chassis.add(leftSeat);

      // Right 2-seater
      const rightSeat = new THREE.Mesh(seatRowGeo, this.materials.seat);
      rightSeat.position.set(0.75, 1.4, z);
      this.chassis.add(rightSeat);
    }
  }

  _buildWheels(W, halfL) {
    const wheelR = GAME_CONFIG.physics.wheelRadius;
    const wheelW = 0.32;

    const createWheelMesh = () => {
      const group = new THREE.Group();
      const tireGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 20);
      const tire = new THREE.Mesh(tireGeo, this.materials.rubber);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      group.add(tire);

      const rimGeo = new THREE.CylinderGeometry(wheelR * 0.62, wheelR * 0.62, wheelW + 0.02, 16);
      const rim = new THREE.Mesh(rimGeo, this.materials.rim);
      rim.rotation.z = Math.PI / 2;
      group.add(rim);
      return group;
    };

    // Front Steerable Wheels (Axle at halfL - 2.4m)
    const frontZ = halfL - 2.4;
    this.frontLeftPivot = new THREE.Group();
    this.frontLeftPivot.position.set(-W / 2 + 0.1, wheelR, frontZ);
    this.frontLeftWheel = createWheelMesh();
    this.frontLeftPivot.add(this.frontLeftWheel);
    this.chassis.add(this.frontLeftPivot);

    this.frontRightPivot = new THREE.Group();
    this.frontRightPivot.position.set(W / 2 - 0.1, wheelR, frontZ);
    this.frontRightWheel = createWheelMesh();
    this.frontRightPivot.add(this.frontRightWheel);
    this.chassis.add(this.frontRightPivot);

    // Rear Dual Wheels (Axle at -halfL + 2.8m)
    const rearZ = -halfL + 2.8;
    const rl1 = createWheelMesh();
    rl1.position.set(-W / 2 + 0.05, wheelR, rearZ);
    this.chassis.add(rl1);
    this.rearLeftWheels.push(rl1);

    const rr1 = createWheelMesh();
    rr1.position.set(W / 2 - 0.05, wheelR, rearZ);
    this.chassis.add(rr1);
    this.rearRightWheels.push(rr1);
  }

  _buildPassengerDoor(W, halfL) {
    // Passenger entrance door on Left side (Indian bus left door)
    const doorGroup = new THREE.Group();
    const doorGeo = new THREE.BoxGeometry(0.06, 1.9, 0.95);
    const doorMesh = new THREE.Mesh(doorGeo, this.materials.body);
    doorMesh.position.set(0, 0.95, 0.475);
    doorGroup.add(doorMesh);

    // Door glass window
    const doorGlassGeo = new THREE.PlaneGeometry(0.7, 0.8);
    const doorGlass = new THREE.Mesh(doorGlassGeo, this.materials.glass);
    doorGlass.position.set(-0.04, 1.3, 0.475);
    doorGlass.rotation.y = -Math.PI / 2;
    doorGroup.add(doorGlass);

    doorGroup.position.set(-W / 2 - 0.02, 0.7, halfL - 2.6);
    this.chassis.add(doorGroup);
    this.passengerDoor = doorGroup;
  }

  togglePassengerDoor() {
    this.doorOpen = !this.doorOpen;
    return this.doorOpen;
  }

  setHeadlights(active) {
    this.headlights.forEach(hl => hl.material = active ? this.materials.headlightOn : this.materials.headlightOff);
    this.spotlights.forEach(spot => spot.intensity = active ? 3.5 : 0);
  }

  setBrakeLights(active) {
    this.brakeLights.forEach(bl => bl.material = active ? this.materials.brakeOn : this.materials.brakeOff);
  }

  setTurnSignal(direction, state) {
    // direction: 'left', 'right', 'off'
    this.turnLightsLeft.forEach(l => l.material = (direction === 'left' && state) ? this.materials.amberOn : this.materials.amberOff);
    this.turnLightsRight.forEach(r => r.material = (direction === 'right' && state) ? this.materials.amberOn : this.materials.amberOff);
  }

  update(physics, dt) {
    // 1. Position & Heading from physics
    this.root.position.copy(physics.position);
    this.root.rotation.y = physics.heading;

    // 2. Suspension Body Roll & Pitch
    this.chassis.rotation.z = physics.roll;
    this.chassis.rotation.x = physics.pitch;

    // 3. Front Steering Pivot & Animated Wheel Spin
    if (this.frontLeftPivot && this.frontRightPivot) {
      this.frontLeftPivot.rotation.y = physics.steerAngle;
      this.frontRightPivot.rotation.y = physics.steerAngle;
    }

    // Spin wheels
    if (this.frontLeftWheel) this.frontLeftWheel.children[0].rotation.x = physics.wheelRotation;
    if (this.frontRightWheel) this.frontRightWheel.children[0].rotation.x = physics.wheelRotation;
    this.rearLeftWheels.forEach(w => w.children[0].rotation.x = physics.wheelRotation);
    this.rearRightWheels.forEach(w => w.children[0].rotation.x = physics.wheelRotation);

    // 4. Animated Interior Steering Wheel
    if (this.steeringWheel) {
      // Steering wheel turns up to 2.5 full rotations (ratio 5.0)
      this.steeringWheel.rotation.z = -physics.steerAngle * 4.5;
    }

    // 5. Smooth Animated Passenger Door Slide
    const targetDoorProgress = this.doorOpen ? 1.0 : 0.0;
    this.doorProgress += (targetDoorProgress - this.doorProgress) * 5.0 * dt;
    if (this.passengerDoor) {
      this.passengerDoor.position.z = (GAME_CONFIG.physics.busDimensions.length / 2 - 2.6) - (this.doorProgress * 0.9);
      this.passengerDoor.rotation.y = -this.doorProgress * 0.35;
    }

    // 6. Dynamic Brake Lights
    this.setBrakeLights(physics.brake > 0.1 || physics.handbrake);
  }

  changeLivery(liveryKey) {
    const liv = GAME_CONFIG.liveries[liveryKey];
    if (!liv) return;
    this.livery = liv;
    this.materials.body.color.setHex(liv.bodyColor);
    this.materials.stripe.color.setHex(liv.stripeColor);
    this.materials.roof.color.setHex(liv.roofColor);
  }
}

window.BusModel3D = BusModel3D;
