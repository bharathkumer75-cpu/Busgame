/**
 * Dynamic Multi-Perspective Camera Controller
 * Supports Cockpit View (driver eye-level with animated steering wheel & windshield),
 * Third-Person Chase Cam, and Low Bumper Action Cam with inertia smoothing.
 */
class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.mode = "third_person"; // 'third_person', 'cockpit', 'cinematic'
    this.modesList = ["third_person", "cockpit", "cinematic"];
    this.currentModeIndex = 0;

    // Smoothing vectors
    this.currentPos = new THREE.Vector3();
    this.currentTarget = new THREE.Vector3();

    // Camera settings
    this.chaseDistance = 18.0;
    this.chaseHeight = 6.2;
    this.chaseLookAhead = 10.0;
  }

  toggleMode() {
    this.currentModeIndex = (this.currentModeIndex + 1) % this.modesList.length;
    this.mode = this.modesList[this.currentModeIndex];
    return this.mode;
  }

  setMode(modeName) {
    if (this.modesList.includes(modeName)) {
      this.mode = modeName;
      this.currentModeIndex = this.modesList.indexOf(modeName);
    }
  }

  update(busMesh, physics, dt) {
    const halfL = GAME_CONFIG.physics.busDimensions.length / 2;
    const busPos = physics.position;
    const heading = physics.heading;

    const fwdX = Math.sin(heading);
    const fwdZ = Math.cos(heading);
    const rightX = Math.cos(heading);
    const rightZ = -Math.sin(heading);

    if (this.mode === "cockpit") {
      // Driver Eye Position (Right-Hand Drive: x = +0.65m, y = 2.05m, z = halfL - 1.4m)
      const eyeOffsetX = rightX * 0.65;
      const eyeOffsetZ = rightZ * 0.65;
      const eyeFwdX = fwdX * (halfL - 1.4);
      const eyeFwdZ = fwdZ * (halfL - 1.4);

      // Subtle driver head inertia on bumps and steering
      const headSway = -physics.roll * 0.5;

      const targetPos = new THREE.Vector3(
        busPos.x + eyeOffsetX + eyeFwdX,
        busPos.y + 2.05 + physics.pitch * 0.4,
        busPos.z + eyeOffsetZ + eyeFwdZ
      );

      // Look straight out through windshield towards the road
      const lookTarget = new THREE.Vector3(
        targetPos.x + fwdX * 30 + rightX * headSway,
        targetPos.y - 0.2 + physics.pitch,
        targetPos.z + fwdZ * 30 + rightZ * headSway
      );

      this.camera.position.copy(targetPos);
      this.camera.lookAt(lookTarget);

    } else if (this.mode === "third_person") {
      // Chase Cam elevated behind bus
      const targetCamX = busPos.x - fwdX * this.chaseDistance;
      const targetCamY = busPos.y + this.chaseHeight;
      const targetCamZ = busPos.z - fwdZ * this.chaseDistance;

      // Smooth camera follower with elastic lerp
      this.camera.position.x += (targetCamX - this.camera.position.x) * 6.5 * dt;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 6.5 * dt;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 6.5 * dt;

      // Look slightly ahead of the front of the bus
      const lookTarget = new THREE.Vector3(
        busPos.x + fwdX * this.chaseLookAhead,
        busPos.y + 2.4,
        busPos.z + fwdZ * this.chaseLookAhead
      );
      this.camera.lookAt(lookTarget);

    } else if (this.mode === "cinematic") {
      // Low Front Grille Bumper Cam
      const bumperFwdX = fwdX * (halfL + 0.6);
      const bumperFwdZ = fwdZ * (halfL + 0.6);

      const targetPos = new THREE.Vector3(
        busPos.x + bumperFwdX,
        busPos.y + 0.9,
        busPos.z + bumperFwdZ
      );

      const lookTarget = new THREE.Vector3(
        targetPos.x + fwdX * 25,
        targetPos.y + 0.5,
        targetPos.z + fwdZ * 25
      );

      this.camera.position.copy(targetPos);
      this.camera.lookAt(lookTarget);
    }
  }
}

window.CameraController = CameraController;
