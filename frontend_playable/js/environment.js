/**
 * Procedural Tamil Nadu Highway Environment & Dynamic Weather System
 * Features 4-lane NH45 highway chunks, coconut palms, toll plazas, tea stalls,
 * overhead Tamil/English signboards, Western Ghats mountains, day/night cycles, and monsoon rain.
 */
class HighwayEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    // Weather & Day/Night states
    this.timeOfDay = 0.35; // 0.0 to 1.0 (0.2 = sunrise, 0.5 = noon, 0.8 = sunset, 0.0 = midnight)
    this.weatherType = "clear"; // 'clear', 'rain', 'fog', 'storm'
    this.daySpeed = 0.005; // Progression speed

    // Environment Chunks
    this.chunkSize = 200; // meters per highway chunk
    this.numChunks = 6;
    this.chunks = [];

    // Lighting refs
    this.sunLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    // Rain system
    this.rainParticles = null;
    this.rainGeo = null;

    // Shared Materials
    this.materials = {};
    this._initMaterials();
    this._initLighting();
    this._initRain();
    this._initChunks();
    this._buildMountains();
  }

  _initMaterials() {
    this.materials.asphalt = new THREE.MeshStandardMaterial({
      color: 0x22252a,
      roughness: 0.85
    });

    this.materials.roadLine = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    this.materials.yellowLine = new THREE.MeshBasicMaterial({
      color: 0xffcc00
    });

    this.materials.terrain = new THREE.MeshStandardMaterial({
      color: 0x3d5a35, // Lush South Indian greenery / red soil mix
      roughness: 0.95
    });

    this.materials.mountain = new THREE.MeshStandardMaterial({
      color: 0x283618,
      roughness: 0.9
    });

    this.materials.barrier = new THREE.MeshStandardMaterial({
      color: 0x8d99ae,
      metalness: 0.6,
      roughness: 0.4
    });

    this.materials.wood = new THREE.MeshStandardMaterial({
      color: 0x582f0e,
      roughness: 0.85
    });

    this.materials.leaves = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.7
    });

    this.materials.signGreen = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.4
    });
  }

  _initLighting() {
    // Hemisphere ambient light
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x203020, 0.6);
    this.scene.add(this.hemiLight);

    // Directional Sun / Moon
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    this.sunLight.position.set(100, 150, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.scene.add(this.sunLight);

    // Dynamic Fog
    this.scene.fog = new THREE.FogExp2(0xaaccff, 0.0035);
  }

  _initRain() {
    const rainCount = GAME_CONFIG.graphics.monsoonRainParticles;
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 120;
      rainPositions[i * 3 + 1] = Math.random() * 50;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    this.rainGeo = new THREE.BufferGeometry();
    this.rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0xbbddff,
      size: 0.25,
      transparent: true,
      opacity: 0.7
    });

    this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  _initChunks() {
    for (let i = -1; i < this.numChunks - 1; i++) {
      const chunk = this._createHighwayChunk(i * this.chunkSize);
      this.chunks.push(chunk);
      this.root.add(chunk);
    }
  }

  _createHighwayChunk(zOffset) {
    const chunk = new THREE.Group();
    chunk.position.z = zOffset;

    const roadWidth = 22; // 4-lane highway with shoulders
    const roadLen = this.chunkSize;

    // 1. Asphalt Highway Surface
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLen);
    const road = new THREE.Mesh(roadGeo, this.materials.asphalt);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    chunk.add(road);

    // 2. Road Markings
    // Central Median Divider Yellow Double Lines
    [-0.3, 0.3].forEach(x => {
      const yLineGeo = new THREE.PlaneGeometry(0.2, roadLen);
      const yLine = new THREE.Mesh(yLineGeo, this.materials.yellowLine);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(x, 0.02, 0);
      chunk.add(yLine);
    });

    // White dashed lane markers
    [-5.5, 5.5].forEach(laneX => {
      for (let z = -roadLen / 2; z < roadLen / 2; z += 12) {
        const dashGeo = new THREE.PlaneGeometry(0.2, 5.0);
        const dash = new THREE.Mesh(dashGeo, this.materials.roadLine);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(laneX, 0.02, z + 2.5);
        chunk.add(dash);
      }
    });

    // Outer solid white shoulder lines
    [-10.5, 10.5].forEach(shoulderX => {
      const lineGeo = new THREE.PlaneGeometry(0.3, roadLen);
      const line = new THREE.Mesh(lineGeo, this.materials.roadLine);
      line.rotation.x = -Math.PI / 2;
      line.position.set(shoulderX, 0.02, 0);
      chunk.add(line);
    });

    // 3. Concrete Median Barrier (Center divider)
    const barrierGeo = new THREE.BoxGeometry(0.4, 0.8, roadLen);
    const barrier = new THREE.Mesh(barrierGeo, this.materials.barrier);
    barrier.position.set(0, 0.4, 0);
    barrier.castShadow = true;
    chunk.add(barrier);

    // 4. Side Terrain (South Indian lush green soil & shrubs)
    const terrainWidth = 140;
    [-terrainWidth / 2 - roadWidth / 2, terrainWidth / 2 + roadWidth / 2].forEach(sideX => {
      const terGeo = new THREE.PlaneGeometry(terrainWidth, roadLen, 4, 4);
      const ter = new THREE.Mesh(terGeo, this.materials.terrain);
      ter.rotation.x = -Math.PI / 2;
      ter.position.set(sideX, -0.05, 0);
      ter.receiveShadow = true;
      chunk.add(ter);
    });

    // 5. Coconut Palm Trees along roadside
    for (let z = -roadLen / 2 + 10; z < roadLen / 2; z += 24) {
      [-13.5, 13.5].forEach(sideX => {
        if (Math.random() > 0.2) {
          const palm = this._createPalmTree();
          palm.position.set(sideX + (Math.random() * 3 - 1.5), 0, z + (Math.random() * 4 - 2));
          chunk.add(palm);
        }
      });
    }

    // 6. Occasional Highway Props (Streetlights, Signs, Tea Stalls, Bus Stops)
    // Highway Streetlamps every 40m
    for (let z = -roadLen / 2 + 20; z < roadLen / 2; z += 45) {
      const lamp = this._createHighwayStreetlight();
      lamp.position.set(0, 0, z);
      chunk.add(lamp);
    }

    // Overhead Tamil Nadu Gantry Signboard or Tea stall on every 2nd chunk
    if (Math.abs(zOffset) % 400 === 0) {
      const gantry = this._createOverheadGantry();
      gantry.position.set(0, 0, 0);
      chunk.add(gantry);
    } else {
      // Roadside Dhaba / Tea stall ("நாயர் டீ கடை")
      const teaStall = this._createTeaStall();
      teaStall.position.set(-18.5, 0, 30);
      chunk.add(teaStall);
    }

    return chunk;
  }

  _createPalmTree() {
    const palm = new THREE.Group();
    // Curved trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 8.5, 7);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.wood);
    trunk.position.y = 4.25;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm fronds (leaf crown)
    for (let i = 0; i < 7; i++) {
      const frondGeo = new THREE.BoxGeometry(0.4, 0.1, 4.2);
      const frond = new THREE.Mesh(frondGeo, this.materials.leaves);
      frond.position.set(0, 8.2, 0);
      frond.rotation.y = (i * Math.PI * 2) / 7;
      frond.rotation.x = 0.55;
      palm.add(frond);
    }
    return palm;
  }

  _createHighwayStreetlight() {
    const lamp = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 10, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.barrier);
    pole.position.y = 5.0;
    lamp.add(pole);

    // Dual arm over left and right carriageways
    const armGeo = new THREE.BoxGeometry(6.0, 0.1, 0.1);
    const arm = new THREE.Mesh(armGeo, this.materials.barrier);
    arm.position.y = 9.8;
    lamp.add(arm);

    // Light heads
    [-2.8, 2.8].forEach(x => {
      const headGeo = new THREE.BoxGeometry(0.6, 0.2, 0.4);
      const head = new THREE.Mesh(headGeo, this.materials.barrier);
      head.position.set(x, 9.7, 0);
      lamp.add(head);
    });

    return lamp;
  }

  _createOverheadGantry() {
    const gantry = new THREE.Group();
    // Pillars
    [-11.5, 11.5].forEach(x => {
      const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
      const post = new THREE.Mesh(postGeo, this.materials.barrier);
      post.position.set(x, 4.0, 0);
      gantry.add(post);
    });

    // Overhead beam
    const beamGeo = new THREE.BoxGeometry(23.5, 0.4, 0.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.barrier);
    beam.position.set(0, 7.8, 0);
    gantry.add(beam);

    // Signboard Canvas with authentic Tamil / English Highway text
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1b4332"; // Standard Indian Highway Green
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px sans-serif";
    ctx.fillText("சென்னை CHENNAI 45 KM  ▲", 50, 95);
    ctx.fillText("மதுரை MADURAI 320 KM  ▲", 50, 190);

    const texture = new THREE.CanvasTexture(canvas);
    const signMat = new THREE.MeshBasicMaterial({ map: texture });
    const signGeo = new THREE.PlaneGeometry(16, 3.8);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 6.2, 0.1);
    gantry.add(signMesh);

    return gantry;
  }

  _createTeaStall() {
    const stall = new THREE.Group();
    // Shack structure
    const shackGeo = new THREE.BoxGeometry(6.5, 3.2, 4.5);
    const shackMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c });
    const shack = new THREE.Mesh(shackGeo, shackMat);
    shack.position.y = 1.6;
    stall.add(shack);

    // Tin Roof
    const roofGeo = new THREE.ConeGeometry(5.2, 1.2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69, roughness: 0.5 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.6;
    roof.rotation.y = Math.PI / 4;
    stall.add(roof);

    // Tamil Board: "நாயர் டீ கடை (HOT TEA & SNACKS)"
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e63946";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffbe0b";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("நாயர் டீ கடை TEA STALL", canvas.width / 2, 75);

    const textTexture = new THREE.CanvasTexture(canvas);
    const boardMat = new THREE.MeshBasicMaterial({ map: textTexture });
    const boardGeo = new THREE.PlaneGeometry(4.2, 1.1);
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 2.7, 2.3);
    stall.add(board);

    return stall;
  }

  _buildMountains() {
    // Distant Western Ghats Mountain Ridges along the horizon
    const mtnGeo = new THREE.ConeGeometry(80, 70, 5);
    for (let i = 0; i < 18; i++) {
      const mtn = new THREE.Mesh(mtnGeo, this.materials.mountain);
      const side = (i % 2 === 0) ? -1 : 1;
      const x = side * (180 + Math.random() * 80);
      const z = (i - 9) * 120;
      mtn.position.set(x, 25, z);
      mtn.scale.set(1 + Math.random() * 0.8, 1 + Math.random() * 0.6, 1);
      this.root.add(mtn);
    }
  }

  update(playerPos, dt) {
    // 1. Endless Highway Chunk Streaming
    const halfTotal = (this.numChunks * this.chunkSize) / 2;
    this.chunks.forEach(chunk => {
      // If chunk is too far behind player, move it ahead
      if (playerPos.z - chunk.position.z > this.chunkSize * 1.5) {
        chunk.position.z += this.numChunks * this.chunkSize;
      } else if (chunk.position.z - playerPos.z > halfTotal) {
        chunk.position.z -= this.numChunks * this.chunkSize;
      }
    });

    // 2. Day & Night Progression & Dynamic Sun Shadows
    this.timeOfDay = (this.timeOfDay + this.daySpeed * dt * 0.1) % 1.0;
    const sunAngle = this.timeOfDay * Math.PI * 2;
    const sunY = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle);

    this.sunLight.position.set(playerPos.x + sunX * 120, Math.max(15, sunY * 150), playerPos.z + 40);
    this.sunLight.target.position.set(playerPos.x, 0, playerPos.z);
    this.sunLight.target.updateMatrixWorld();

    // Adjust light warmth based on time of day
    if (sunY > 0.1) {
      // Daylight / Sunset
      const isDusk = sunY < 0.4;
      this.sunLight.intensity = isDusk ? 0.9 : 1.4;
      this.sunLight.color.setHex(isDusk ? 0xff9f1c : 0xfff3d6);
      this.hemiLight.intensity = 0.55;
      this.scene.fog.color.setHex(isDusk ? 0xcc8866 : 0xaaccff);
    } else {
      // Night
      this.sunLight.intensity = 0.15;
      this.sunLight.color.setHex(0x5577bb);
      this.hemiLight.intensity = 0.18;
      this.scene.fog.color.setHex(0x0a1128);
    }

    // 3. Monsoon Rain Particles
    if (this.weatherType === "rain" || this.weatherType === "storm") {
      this.rainParticles.visible = true;
      this.rainParticles.position.set(playerPos.x, 0, playerPos.z);
      const posAttr = this.rainGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - 45 * dt;
        if (y < 0) y = 45;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    } else {
      this.rainParticles.visible = false;
    }
  }

  setWeather(type) {
    this.weatherType = type;
    if (type === "fog") {
      this.scene.fog.density = 0.012;
    } else {
      this.scene.fog.density = 0.0035;
    }
  }

  setTimeOfDay(timeVal) {
    // 0.2 = sunrise, 0.5 = noon, 0.8 = sunset, 0.0 = night
    this.timeOfDay = timeVal;
  }
}

window.HighwayEnvironment = HighwayEnvironment;
