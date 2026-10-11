/**
 * Indian AI Traffic System
 * Features Auto-rickshaws (Tuk-tuks), Tata heavy goods trucks with "Horn OK Please",
 * commuter hatchbacks, lane-keeping, overtaking, and collision detection.
 */
class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.poolSize = GAME_CONFIG.graphics.trafficDensity;

    // Highway lanes (Z is forward direction for player)
    // Left side: oncoming lanes (-8.0, -4.0); Right side: player lanes (+4.0, +8.0)
    this.lanes = [
      { x: -7.5, dir: -1 }, // Oncoming fast lane
      { x: -3.5, dir: -1 }, // Oncoming slow lane
      { x: 3.5, dir: 1 },   // Player slow lane
      { x: 7.5, dir: 1 }    // Player fast overtaking lane
    ];

    this._initTraffic();
  }

  _initTraffic() {
    for (let i = 0; i < this.poolSize; i++) {
      const v = this._spawnVehicle();
      // Scatter initially along highway
      v.mesh.position.z = (Math.random() * 350) - 50;
      this.vehicles.push(v);
    }
  }

  _spawnVehicle() {
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
    const typeRoll = Math.random();
    let type = "car";
    let mesh = null;
    let speed = 20; // m/s
    let length = 4.5;
    let width = 2.0;

    if (typeRoll < 0.35) {
      // Auto-Rickshaw (3-wheeler Tuk-tuk)
      type = "rickshaw";
      mesh = this._createAutoRickshawMesh();
      speed = (35 + Math.random() * 15) / 3.6; // 35 - 50 km/h
      length = 2.8;
      width = 1.4;
    } else if (typeRoll < 0.65) {
      // Tata Heavy Goods Truck ("Horn OK Please")
      type = "truck";
      mesh = this._createIndianTruckMesh();
      speed = (45 + Math.random() * 20) / 3.6; // 45 - 65 km/h
      length = 9.0;
      width = 2.5;
    } else {
      // Hatchback Car
      type = "car";
      mesh = this._createCarMesh();
      speed = (70 + Math.random() * 30) / 3.6; // 70 - 100 km/h
      length = 4.2;
      width = 1.8;
    }

    mesh.position.set(lane.x, 0, 0);
    mesh.rotation.y = (lane.dir === 1) ? 0 : Math.PI;
    this.scene.add(mesh);

    return {
      mesh,
      type,
      lane,
      speed,
      length,
      width,
      dir: lane.dir,
      targetSpeed: speed
    };
  }

  _createAutoRickshawMesh() {
    const group = new THREE.Group();
    // Yellow hood, green lower body (standard South Indian auto livery)
    const lowerGeo = new THREE.BoxGeometry(1.4, 0.7, 2.6);
    const lowerMat = new THREE.MeshStandardMaterial({ color: 0x058c42 });
    const lower = new THREE.Mesh(lowerGeo, lowerMat);
    lower.position.y = 0.55;
    lower.castShadow = true;
    group.add(lower);

    // Yellow Canopy Top
    const topGeo = new THREE.BoxGeometry(1.3, 0.8, 2.2);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffbe0b, roughness: 0.5 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 1.25, -0.1);
    group.add(top);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    // Front single wheel
    const fw = new THREE.Mesh(wGeo, wMat);
    fw.rotation.z = Math.PI / 2;
    fw.position.set(0, 0.28, 1.0);
    group.add(fw);

    // Rear twin wheels
    [-0.65, 0.65].forEach(x => {
      const rw = new THREE.Mesh(wGeo, wMat);
      rw.rotation.z = Math.PI / 2;
      rw.position.set(x, 0.28, -0.8);
      group.add(rw);
    });

    return group;
  }

  _createIndianTruckMesh() {
    const group = new THREE.Group();
    // Heavy wooden cargo bed
    const bedGeo = new THREE.BoxGeometry(2.4, 1.6, 6.0);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 1.6, -1.2);
    bed.castShadow = true;
    group.add(bed);

    // Driver Cabin (Vibrant Indian colors - Blue & Orange)
    const cabGeo = new THREE.BoxGeometry(2.4, 1.8, 2.4);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1d3557 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.7, 2.8);
    cab.castShadow = true;
    group.add(cab);

    // Rear Flap with "HORN OK PLEASE"
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffb703";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d90429";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HORN  OK  PLEASE", canvas.width / 2, 80);

    const hornTex = new THREE.CanvasTexture(canvas);
    const flapGeo = new THREE.PlaneGeometry(2.3, 0.6);
    const flapMat = new THREE.MeshBasicMaterial({ map: hornTex });
    const flap = new THREE.Mesh(flapGeo, flapMat);
    flap.position.set(0, 1.3, -4.22);
    flap.rotation.y = Math.PI;
    group.add(flap);

    // 6 Heavy Wheels
    const wGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 14);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x151515 });
    [-1.15, 1.15].forEach(x => {
      [2.6, -1.8, -3.2].forEach(z => {
        const w = new THREE.Mesh(wGeo, wMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.48, z);
        group.add(w);
      });
    });

    return group;
  }

  _createCarMesh() {
    const group = new THREE.Group();
    const colors = [0xf8f9fa, 0xadb5bd, 0xc1121f, 0x0077b6];
    const col = colors[Math.floor(Math.random() * colors.length)];

    const bodyGeo = new THREE.BoxGeometry(1.8, 0.7, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: col, metalness: 0.5, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const roofGeo = new THREE.BoxGeometry(1.5, 0.6, 2.2);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.15, -0.2);
    group.add(roof);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    [-0.9, 0.9].forEach(x => {
      [1.2, -1.2].forEach(z => {
        const w = new THREE.Mesh(wGeo, wMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x, 0.32, z);
        group.add(w);
      });
    });

    return group;
  }

  update(playerPos, dt, onCollisionCallback) {
    this.vehicles.forEach(v => {
      // 1. Move vehicle along its direction
      v.mesh.position.z += v.dir * v.speed * dt;

      // 2. Wrap around / Recycle when too far from player
      const distFromPlayer = v.mesh.position.z - playerPos.z;

      if (v.dir === 1 && distFromPlayer > 300) {
        // Player lane vehicle went way too far ahead
        v.mesh.position.z = playerPos.z - (80 + Math.random() * 100);
      } else if (v.dir === 1 && distFromPlayer < -120) {
        // Fell far behind player
        v.mesh.position.z = playerPos.z + (180 + Math.random() * 120);
      } else if (v.dir === -1 && distFromPlayer < -300) {
        // Oncoming traffic went past
        v.mesh.position.z = playerPos.z + (280 + Math.random() * 100);
      } else if (v.dir === -1 && distFromPlayer > 350) {
        v.mesh.position.z = playerPos.z + (200 + Math.random() * 80);
      }

      // 3. Collision check with Player Bus
      const dx = Math.abs(v.mesh.position.x - playerPos.x);
      const dz = Math.abs(v.mesh.position.z - playerPos.z);
      const busHalfLen = GAME_CONFIG.physics.busDimensions.length / 2;
      const busHalfWid = GAME_CONFIG.physics.busDimensions.width / 2;

      if (dx < (busHalfWid + v.width / 2) && dz < (busHalfLen + v.length / 2)) {
        if (onCollisionCallback) {
          onCollisionCallback(v);
        }
      }
    });
  }
}

window.TrafficManager = TrafficManager;
