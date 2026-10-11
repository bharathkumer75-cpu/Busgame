/**
 * Tamil Nadu 3D Bus Simulator Configuration & Tuning Parameters
 */
const GAME_CONFIG = {
  version: "1.0.0",
  apiBaseUrl: "http://localhost:8000/api/v1",

  // Physics tuning for heavy 12-meter commercial Indian bus
  physics: {
    maxSpeedKmh: 110.0,
    accelerationForce: 38.0,
    brakeForce: 75.0,
    reverseForce: 20.0,
    steeringSpeed: 2.8,
    steeringReturnSpeed: 3.5,
    maxSteerAngle: 0.55, // radians (~31 degrees)
    linearDamping: 0.985,
    angularDamping: 0.92,
    mass: 14500, // kg (fully loaded TNSTC bus)
    bodyRollFactor: 0.08, // chassis roll on turns
    suspensionStiffness: 12.0,
    wheelRadius: 0.55,
    busDimensions: {
      width: 2.6,
      height: 3.4,
      length: 12.0
    }
  },

  // Audio synthesis parameters
  audio: {
    idleRpm: 600,
    maxRpm: 2400,
    airBrakeDuration: 0.6,
    hornFrequencies: [330, 440, 550, 660] // Iconic Tamil Nadu musical air horn frequencies
  },

  // Graphics presets
  graphics: {
    shadows: true,
    shadowMapSize: 2048,
    antiAliasing: true,
    renderDistance: 500,
    trafficDensity: 12, // number of AI vehicles on highway
    monsoonRainParticles: 1200
  },

  // Authentic Tamil Nadu Bus Liveries
  liveries: {
    tnstc_green: {
      name: "TNSTC Kumbakonam / Salem Deluxe",
      bodyColor: 0x0a6836,
      stripeColor: 0xf4f1de,
      roofColor: 0xe0e1dd,
      signText: "சென்னை - மதுரை CHENNAI - MADURAI",
      signTextColor: "#ffdd00"
    },
    setc_red: {
      name: "SETC Aanmajothi Ultra Deluxe",
      bodyColor: 0xa4161a,
      stripeColor: 0xffb703,
      roofColor: 0x161a1d,
      signText: "சென்னை - கன்னியாகுமரி EXPRESS",
      signTextColor: "#00ffcc"
    },
    omni_blue: {
      name: "KPN Multi-Axle Highway Cruiser",
      bodyColor: 0x003049,
      stripeColor: 0xfdf0d5,
      roofColor: 0x669bbc,
      signText: "BANGALORE - COIMBATORE - MADURAI",
      signTextColor: "#ff0055"
    },
    vintage_yellow: {
      name: "Nilgiris Ghat Ooty Special",
      bodyColor: 0xf77f00,
      stripeColor: 0x003049,
      roofColor: 0xd62828,
      signText: "METTUPALAYAM - COONOOR - OOTY",
      signTextColor: "#ffff00"
    }
  },

  // Highway Routes
  routes: [
    {
      id: 1,
      name: "Chennai (KCBT) to Madurai (Mattuthavani)",
      code: "TN-NH45",
      type: "Expressway",
      lengthKm: 460,
      baseFare: 480,
      stops: ["Kilambakkam", "Chengalpattu", "Villupuram", "Trichy Bypass", "Madurai"],
      weather: "Sunny Day"
    },
    {
      id: 2,
      name: "Coimbatore to Ooty Ghat Roads (36 Hairpin Bends)",
      code: "TN-GHAT-18",
      type: "Hill Highway",
      lengthKm: 88,
      baseFare: 320,
      stops: ["Gandhipuram", "Mettupalayam", "Kallar", "Coonoor", "Ooty Lake"],
      weather: "Misty Fog"
    },
    {
      id: 3,
      name: "Trichy to Thanjavur Delta Corridor",
      code: "TN-DELTA-22",
      type: "State Highway",
      lengthKm: 55,
      baseFare: 90,
      stops: ["Central Stand", "BHEL Thiruverumbur", "Vallam", "Thanjavur Old Stand"],
      weather: "Monsoon Rain"
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
}
