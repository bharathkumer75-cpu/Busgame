/**
 * Heavy Vehicle Raycast & Dynamics Physics Engine
 * Simulates weight, inertia, 6-speed gearbox, suspension tilt, steering geometry, and friction
 */
class BusPhysics {
  constructor(config = GAME_CONFIG.physics) {
    this.cfg = config;

    // Kinematics
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.forwardSpeed = 0.0; // m/s
    this.heading = 0.0; // Radians yaw
    this.steerAngle = 0.0;
    this.targetSteer = 0.0;

    // Body dynamics & suspension roll
    this.roll = 0.0; // Roll around Z/forward axis
    this.pitch = 0.0; // Pitch around X axis (dive on braking)

    // Transmission & Engine
    this.throttle = 0.0;
    this.brake = 0.0;
    this.handbrake = false;
    this.gear = 1; // 1 to 6, 0 = N, -1 = R
    this.isReverse = false;
    this.engineRpm = 650;
    this.maxRpm = 2400;
    this.gearRatios = [3.8, 2.4, 1.6, 1.2, 0.9, 0.72]; // 6-speed commercial bus gearbox
    this.reverseRatio = 4.2;

    // Mileage & Consumption
    this.totalDistanceMeters = 0.0;
    this.fuelRemaining = 100.0; // Percentage
    this.fuelBurnRate = 0.0018; // Per meter
    this.healthPercent = 100.0;

    // Wheel visual rotations
    this.wheelRotation = 0.0;
  }

  setInputs({ throttle = 0, brake = 0, steer = 0, handbrake = false, reverse = false }) {
    this.throttle = Math.max(0, Math.min(1, throttle));
    this.brake = Math.max(0, Math.min(1, brake));
    this.targetSteer = steer * this.cfg.maxSteerAngle;
    this.handbrake = handbrake;
    this.isReverse = reverse;
  }

  update(dt) {
    if (dt <= 0 || dt > 0.2) dt = 0.016; // Safeguard against tab background lags

    // 1. Steering Interpolation with speed-sensitive damping
    const speedKmh = Math.abs(this.getSpeedKmh());
    // At high speeds, max steering angle reduces slightly for stability
    const steerLimitFactor = Math.max(0.35, 1.0 - (speedKmh / 140.0));
    const effectiveTargetSteer = this.targetSteer * steerLimitFactor;

    if (Math.abs(effectiveTargetSteer) > 0.01) {
      this.steerAngle += (effectiveTargetSteer - this.steerAngle) * this.cfg.steeringSpeed * dt;
    } else {
      this.steerAngle += (0 - this.steerAngle) * this.cfg.steeringReturnSpeed * dt;
    }

    // 2. Engine & Gearbox Logic
    this._updateGearbox(speedKmh);

    // 3. Drive Forces
    let driveForce = 0;
    if (this.fuelRemaining > 0) {
      if (this.isReverse) {
        driveForce = -this.throttle * this.cfg.reverseForce;
      } else {
        const gearRatio = this.gearRatios[this.gear - 1] || 1.0;
        driveForce = this.throttle * (this.cfg.accelerationForce * gearRatio * 0.45);
      }
    }

    // 4. Braking Forces
    let brakeForce = (this.brake * this.cfg.brakeForce);
    if (this.handbrake) brakeForce += this.cfg.brakeForce * 1.5;

    // Aerodynamic drag + rolling resistance
    const dragForce = 0.5 * 1.225 * 3.2 * 0.7 * (this.forwardSpeed * this.forwardSpeed) * Math.sign(this.forwardSpeed);
    const rollingResistance = 0.015 * this.cfg.mass * 9.81 * Math.sign(this.forwardSpeed);

    // Net acceleration in forward direction
    const mass = this.cfg.mass / 1000.0; // Scaled for smooth web physics
    let netForce = driveForce - (dragForce + rollingResistance);

    if (Math.abs(this.forwardSpeed) > 0.1) {
      netForce -= Math.sign(this.forwardSpeed) * brakeForce;
    } else if (this.brake > 0 || this.handbrake) {
      this.forwardSpeed = 0;
    }

    const forwardAcc = netForce / mass;
    this.forwardSpeed += forwardAcc * dt;

    // Clamp top speed
    const maxSpeedMs = (this.cfg.maxSpeedKmh * 1000) / 3600;
    this.forwardSpeed = Math.max(-10, Math.min(maxSpeedMs, this.forwardSpeed));

    // Damping near stop
    if (this.throttle === 0 && Math.abs(this.forwardSpeed) < 0.2) {
      this.forwardSpeed = 0;
    }

    // 5. Yaw & Turning Kinematics (Bicycle Model for long bus)
    const wheelbase = 6.2; // meters between front and rear axle
    if (Math.abs(this.forwardSpeed) > 0.01) {
      const turnRadius = wheelbase / Math.tan(this.steerAngle || 0.0001);
      const angularVelocity = this.forwardSpeed / turnRadius;
      this.heading += angularVelocity * dt;
    }

    // 6. Integrate Position
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);

    this.position.x += forwardX * this.forwardSpeed * dt;
    this.position.z += forwardZ * this.forwardSpeed * dt;

    // 7. Chassis Suspension Dynamics (Roll on corners, Pitch on braking)
    const lateralG = (this.forwardSpeed * this.forwardSpeed * Math.tan(this.steerAngle)) / (wheelbase * 9.81);
    const targetRoll = -lateralG * this.cfg.bodyRollFactor;
    this.roll += (targetRoll - this.roll) * 6.0 * dt;

    const targetPitch = (forwardAcc / 9.81) * 0.05;
    this.pitch += (targetPitch - this.pitch) * 8.0 * dt;

    // 8. Visual Wheel Spin
    const wheelCircumference = 2 * Math.PI * this.cfg.wheelRadius;
    const distanceTraveled = Math.abs(this.forwardSpeed) * dt;
    this.wheelRotation += (distanceTraveled / wheelCircumference) * Math.PI * 2 * Math.sign(this.forwardSpeed);

    // Mileage & Fuel Tracking
    this.totalDistanceMeters += distanceTraveled;
    if (this.forwardSpeed > 0.5) {
      this.fuelRemaining = Math.max(0, this.fuelRemaining - (distanceTraveled * this.fuelBurnRate));
    }
  }

  _updateGearbox(speedKmh) {
    if (this.isReverse) {
      this.gear = -1;
      this.engineRpm = 700 + (Math.abs(speedKmh) / 25.0) * 1600;
      return;
    }

    // Automatic gear shifting thresholds for bus
    if (speedKmh < 18) this.gear = 1;
    else if (speedKmh < 35) this.gear = 2;
    else if (speedKmh < 55) this.gear = 3;
    else if (speedKmh < 75) this.gear = 4;
    else if (speedKmh < 95) this.gear = 5;
    else this.gear = 6;

    // Calculate RPM based on current gear and speed
    const minGearSpeed = [0, 0, 18, 35, 55, 75, 95][this.gear] || 0;
    const maxGearSpeed = [0, 22, 40, 60, 80, 100, 125][this.gear] || 120;
    const gearSpan = maxGearSpeed - minGearSpeed;
    const gearProgress = Math.max(0, Math.min(1, (speedKmh - minGearSpeed) / gearSpan));

    this.engineRpm = 650 + (gearProgress * 1550) + (this.throttle * 300);
    this.engineRpm = Math.min(this.maxRpm, Math.max(650, this.engineRpm));
  }

  getSpeedKmh() {
    return this.forwardSpeed * 3.6;
  }

  getRpmRatio() {
    return (this.engineRpm - 650) / (this.maxRpm - 650);
  }

  applyCrashDamage(impactMagnitude = 5) {
    this.healthPercent = Math.max(0, this.healthPercent - impactMagnitude);
    // Sudden deceleration bounce
    this.forwardSpeed *= -0.3;
  }
}

window.BusPhysics = BusPhysics;
