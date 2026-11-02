import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { AirportData } from '../types';
import { GLOBAL_AIRPORTS } from '../data/focusData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Video, 
  VideoOff, 
  Plane,
  Radio,
  Wind,
  Navigation2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Focus3DGlobeProps {
  originAirport: AirportData;
  destAirport: AirportData;
  progressPercent: number; // 0 to 100
  isFlying?: boolean;
  onSelectAirport?: (airport: AirportData, type: 'origin' | 'dest') => void;
  selectionTarget?: 'origin' | 'dest';
  cameraFollow?: boolean;
  onToggleCameraFollow?: () => void;
}

const GLOBE_RADIUS = 5;

// Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert 3D Vector3 back to Lat/Lng
function vector3ToLatLng(vec: THREE.Vector3): { lat: number; lng: number } {
  const norm = vec.clone().normalize();
  const lat = 90 - (Math.acos(norm.y) * 180) / Math.PI;
  let lng = ((Math.atan2(norm.z, -norm.x) * 180) / Math.PI) - 180;
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;
  return { lat, lng };
}

// Spherical Linear Interpolation (Great Circle / Orthodrome Geodesic path)
function slerpGreatCircle(v1: THREE.Vector3, v2: THREE.Vector3, t: number): THREE.Vector3 {
  const n1 = v1.clone().normalize();
  const n2 = v2.clone().normalize();
  const dot = Math.max(-1, Math.min(1, n1.dot(n2)));
  const omega = Math.acos(dot);
  if (Math.abs(omega) < 0.0001) return n1.clone();
  
  const sinOmega = Math.sin(omega);
  const scale1 = Math.sin((1 - t) * omega) / sinOmega;
  const scale2 = Math.sin(t * omega) / sinOmega;
  
  return new THREE.Vector3()
    .addScaledVector(n1, scale1)
    .addScaledVector(n2, scale2)
    .normalize();
}

// Real Aviation Flight Altitude Profile (Climb, Cruise FL380, Descent)
function calculateFlightAltitude(t: number, maxLift: number): number {
  if (t <= 0 || t >= 1) return 0;
  // Climb Phase (0 to 12%): smooth parabolic ascent
  if (t < 0.12) {
    const p = t / 0.12;
    return maxLift * Math.sin((p * Math.PI) / 2);
  }
  // Descent Phase (88% to 100%): smooth glide slope to touchdown
  if (t > 0.88) {
    const p = (1 - t) / 0.12;
    return maxLift * Math.sin((p * Math.PI) / 2);
  }
  // Cruise Phase (12% to 88%): stable high altitude cruise
  return maxLift;
}

// Realistic Jet Airliner 3D Model (Boeing 787 / Airbus A350 Style)
function createDetailedJetAirplane(): THREE.Group {
  const plane = new THREE.Group();

  // 1. Aerodynamic Fuselage
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0.0, 0.45)); // Nose tip
  points.push(new THREE.Vector2(0.07, 0.38));
  points.push(new THREE.Vector2(0.12, 0.28));
  points.push(new THREE.Vector2(0.13, 0.1));
  points.push(new THREE.Vector2(0.13, -0.2));
  points.push(new THREE.Vector2(0.09, -0.4));
  points.push(new THREE.Vector2(0.02, -0.52));
  points.push(new THREE.Vector2(0.0, -0.55)); // Tail cone

  const fuselageGeo = new THREE.LatheGeometry(points, 24);
  fuselageGeo.rotateX(-Math.PI / 2);
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.65,
    roughness: 0.22
  });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  plane.add(fuselage);

  // Cockpit Tinted Windshield
  const windshieldGeo = new THREE.BoxGeometry(0.12, 0.05, 0.12);
  const windshieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true
  });
  const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
  windshield.position.set(0, 0.07, 0.25);
  plane.add(windshield);

  // 2. Main Swept Wings with Winglets
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.15);
  wingShape.lineTo(1.15, -0.22);
  wingShape.lineTo(1.12, -0.32);
  wingShape.lineTo(0.12, -0.15);
  wingShape.lineTo(0.0, -0.18);
  wingShape.lineTo(-0.12, -0.15);
  wingShape.lineTo(-1.12, -0.32);
  wingShape.lineTo(-1.15, -0.22);
  wingShape.closePath();

  const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01
  });
  wingExtrude.rotateX(-Math.PI / 2);

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Sky Blue Airline Wing
    metalness: 0.5,
    roughness: 0.25
  });
  const wings = new THREE.Mesh(wingExtrude, wingMat);
  wings.position.set(0, -0.01, 0.05);
  plane.add(wings);

  // Upturned Winglets at tips
  [-1.14, 1.14].forEach((xSide) => {
    const wingletGeo = new THREE.BoxGeometry(0.02, 0.12, 0.08);
    const wingletMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 });
    const winglet = new THREE.Mesh(wingletGeo, wingletMat);
    winglet.position.set(xSide, 0.05, -0.22);
    plane.add(winglet);
  });

  // 3. Vertical Tail Fin (Rudder)
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, -0.25);
  tailShape.lineTo(0, -0.52);
  tailShape.lineTo(0.35, -0.48);
  tailShape.lineTo(0.32, -0.38);
  tailShape.closePath();

  const tailGeo = new THREE.ShapeGeometry(tailShape);
  tailGeo.rotateY(Math.PI / 2);
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // Rose red livery
    side: THREE.DoubleSide,
    metalness: 0.4
  });
  const rudder = new THREE.Mesh(tailGeo, tailMat);
  rudder.position.set(0, 0.06, 0);
  plane.add(rudder);

  // 4. Horizontal Stabilizers
  const horizTailShape = new THREE.Shape();
  horizTailShape.moveTo(0, 0);
  horizTailShape.lineTo(0.38, -0.15);
  horizTailShape.lineTo(0.35, -0.2);
  horizTailShape.lineTo(0, -0.08);
  horizTailShape.lineTo(-0.35, -0.2);
  horizTailShape.lineTo(-0.38, -0.15);
  horizTailShape.closePath();

  const horizTailGeo = new THREE.ShapeGeometry(horizTailShape);
  horizTailGeo.rotateX(-Math.PI / 2);
  const horizTail = new THREE.Mesh(horizTailGeo, wingMat);
  horizTail.position.set(0, 0.02, -0.42);
  plane.add(horizTail);

  // 5. Twin Turbofan Jet Engines
  const engineGeo = new THREE.CylinderGeometry(0.06, 0.065, 0.28, 16);
  engineGeo.rotateX(Math.PI / 2);
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.8,
    roughness: 0.2
  });

  const exhaustGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const exhaustMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  [-0.42, 0.42].forEach((xPos) => {
    const pod = new THREE.Mesh(engineGeo, engineMat);
    pod.position.set(xPos, -0.09, -0.04);
    plane.add(pod);

    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(xPos, -0.09, -0.18);
    plane.add(exhaust);
  });

  // 6. Navigation Strobe Lights
  // Red port wingtip
  const portLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  portLight.position.set(-1.14, 0.0, -0.22);
  plane.add(portLight);

  // Green starboard wingtip
  const stbdLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff66 })
  );
  stbdLight.position.set(1.14, 0.0, -0.22);
  plane.add(stbdLight);

  // Flashing Beacon on top of fuselage
  const beaconLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2200 })
  );
  beaconLight.position.set(0, 0.14, 0.0);
  plane.add(beaconLight);

  plane.scale.set(0.65, 0.65, 0.65);
  return plane;
}

export const Focus3DGlobe: React.FC<Focus3DGlobeProps> = ({
  originAirport,
  destAirport,
  progressPercent,
  onSelectAirport,
  selectionTarget = 'dest',
  cameraFollow = true,
  onToggleCameraFollow
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFollowActive, setIsFollowActive] = useState<boolean>(cameraFollow);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setIsFollowActive(cameraFollow);
  }, [cameraFollow]);

  const isFollowRef = useRef(isFollowActive);
  useEffect(() => {
    isFollowRef.current = isFollowActive;
  }, [isFollowActive]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const airplaneRef = useRef<THREE.Group | null>(null);
  const arcMeshRef = useRef<THREE.Line | null>(null);
  const waypointsGroupRef = useRef<THREE.Group | null>(null);
  const contrailLineRef = useRef<THREE.Line | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 3.5 });
  const currentRotationRef = useRef({ x: 0.2, y: 3.5 });
  const zoomDistRef = useRef(11.5);

  // Compute flight statistics
  const flightStats = useMemo(() => {
    const pStart = latLngToVector3(originAirport.lat, originAirport.lng, GLOBE_RADIUS);
    const pEnd = latLngToVector3(destAirport.lat, destAirport.lng, GLOBE_RADIUS);
    const dot = Math.max(-1, Math.min(1, pStart.clone().normalize().dot(pEnd.clone().normalize())));
    const angleRad = Math.acos(dot);
    
    // Earth radius = 6,371 km
    const distanceKm = Math.round(angleRad * 6371);
    const distanceNm = Math.round(distanceKm * 0.539957);

    // Callsign heuristics
    let callsign = 'TG 682';
    let flightCode = 'THA682';
    if (destAirport.country === 'ญี่ปุ่น') {
      callsign = 'TG 682 / JL 34';
      flightCode = 'TG682';
    } else if (destAirport.country === 'สหราชอาณาจักร') {
      callsign = 'TG 910 / BA 118';
      flightCode = 'TG910';
    } else if (destAirport.country === 'ฝรั่งเศส') {
      callsign = 'TG 930 / AF 165';
      flightCode = 'TG930';
    } else if (destAirport.country === 'สิงคโปร์') {
      callsign = 'SQ 705 / TG 403';
      flightCode = 'SQ705';
    } else if (destAirport.country === 'ฮ่องกง') {
      callsign = 'CX 750 / TG 600';
      flightCode = 'CX750';
    } else if (destAirport.country === 'สหรัฐอเมริกา') {
      callsign = 'TG 790 (Polar Express)';
      flightCode = 'TG790';
    } else if (destAirport.country === 'ไทย') {
      callsign = 'TG 102 (Royal Silk Domestic)';
      flightCode = 'TG102';
    }

    // Altitude profile in feet based on progress
    const t = Math.max(0, Math.min(1, progressPercent / 100));
    let altFt = 38000;
    let phase = 'CRUISE ✈';
    if (t < 0.12) {
      altFt = Math.round(38000 * Math.sin(((t / 0.12) * Math.PI) / 2));
      phase = 'CLIMB ↗';
    } else if (t > 0.88) {
      altFt = Math.round(38000 * Math.sin((((1 - t) / 0.12) * Math.PI) / 2));
      phase = 'DESCENT ↘';
    }

    const kmRemaining = Math.max(0, Math.round(distanceKm * (1 - t)));
    const nmRemaining = Math.max(0, Math.round(distanceNm * (1 - t)));

    return {
      distanceKm,
      distanceNm,
      callsign,
      flightCode,
      altFt,
      phase,
      kmRemaining,
      nmRemaining
    };
  }, [originAirport, destAirport, progressPercent]);

  // Update Flight Path along authentic Great Circle Slerp
  const updateFlightPath = useCallback(() => {
    if (!globeGroupRef.current) return;

    if (arcMeshRef.current) {
      globeGroupRef.current.remove(arcMeshRef.current);
      arcMeshRef.current.geometry.dispose();
      arcMeshRef.current = null;
    }

    if (waypointsGroupRef.current) {
      globeGroupRef.current.remove(waypointsGroupRef.current);
      waypointsGroupRef.current = null;
    }

    const pStart = latLngToVector3(originAirport.lat, originAirport.lng, GLOBE_RADIUS);
    const pEnd = latLngToVector3(destAirport.lat, destAirport.lng, GLOBE_RADIUS);

    const dist = pStart.distanceTo(pEnd);
    const maxLift = Math.min(2.8, Math.max(0.65, dist * 0.28));

    // Generate 120 points along authentic Great Circle Slerp with altitude curve
    const pathPoints: THREE.Vector3[] = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const slerpDir = slerpGreatCircle(pStart, pEnd, t);
      const alt = calculateFlightAltitude(t, maxLift);
      const pt = slerpDir.clone().multiplyScalar(GLOBE_RADIUS + alt);
      pathPoints.push(pt);
    }

    const arcGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Sky-400 Flight Corridor
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });

    const arcMesh = new THREE.Line(arcGeometry, arcMaterial);
    arcMeshRef.current = arcMesh;
    globeGroupRef.current.add(arcMesh);

    // Create Navigation Waypoint Beacons along the corridor
    const waypointsGroup = new THREE.Group();
    const wpSteps = [0.2, 0.4, 0.6, 0.8];
    wpSteps.forEach((wpT, idx) => {
      const wpDir = slerpGreatCircle(pStart, pEnd, wpT);
      const wpAlt = calculateFlightAltitude(wpT, maxLift);
      const wpPos = wpDir.multiplyScalar(GLOBE_RADIUS + wpAlt);

      // Glowing waypoint ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.12, 16);
      ringGeo.lookAt(wpPos.clone().normalize());
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(wpPos);
      waypointsGroup.add(ring);
    });

    waypointsGroupRef.current = waypointsGroup;
    globeGroupRef.current.add(waypointsGroup);
  }, [originAirport, destAirport]);

  // Initialize 3D Globe with REAL NASA Earth Satellite Texture
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = zoomDistRef.current;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Realistic Lighting: Sunlight & Atmospheric Ambient
    const ambientLight = new THREE.AmbientLight(0x445566, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(20, 15, 25);
    scene.add(sunLight);

    const secondaryFill = new THREE.DirectionalLight(0x38bdf8, 0.4);
    secondaryFill.position.set(-20, -10, -15);
    scene.add(secondaryFill);

    // Deep Space Starfield
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 85 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.75, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // REAL NASA Earth Satellite Texture Loading
    const textureLoader = new THREE.TextureLoader();
    
    // 1. Photorealistic Earth Sphere
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    
    // Load local NASA satellite texture with specular reflection on oceans
    const earthTexture = textureLoader.load('/textures/earth-blue-marble.jpg');
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    const specularTexture = textureLoader.load('/textures/earth-specular.jpg');

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: specularTexture,
      specular: new THREE.Color(0x334466),
      shininess: 25,
      bumpScale: 0.05
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 2. Realistic Cloud Layer (Floating above Earth)
    const cloudsTexture = textureLoader.load('/textures/earth-clouds.png');
    const cloudsMaterial = new THREE.MeshLambertMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.015, 64, 64),
      cloudsMaterial
    );
    cloudsRef.current = cloudsMesh;
    globeGroup.add(cloudsMesh);

    // 3. Atmosphere Fresnel Sky-Blue Halo
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.22, 0.65, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 4. Departure & Arrival Airport Markers
    const originPos = latLngToVector3(originAirport.lat, originAirport.lng, GLOBE_RADIUS);
    const destPos = latLngToVector3(destAirport.lat, destAirport.lng, GLOBE_RADIUS);

    // Departure Pin (Emerald)
    const originMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 })
    );
    originMarker.position.copy(originPos);
    globeGroup.add(originMarker);

    // Destination Pin (Rose Red)
    const destMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.8 })
    );
    destMarker.position.copy(destPos);
    globeGroup.add(destMarker);

    // 5. Jet Airplane 3D Model
    const airplane = createDetailedJetAirplane();
    airplaneRef.current = airplane;
    globeGroup.add(airplane);

    // 6. Contrail Line
    const contrailGeo = new THREE.BufferGeometry();
    const contrailMat = new THREE.LineBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.65,
      linewidth: 2
    });
    const contrailLine = new THREE.Line(contrailGeo, contrailMat);
    contrailLineRef.current = contrailLine;
    globeGroup.add(contrailLine);

    // Center view on midpoint of route initially
    const midDir = slerpGreatCircle(originPos, destPos, 0.5);
    const targetY = -Math.atan2(midDir.z, -midDir.x);
    const targetX = Math.asin(midDir.y);
    targetRotationRef.current = { x: targetX, y: targetY };
    currentRotationRef.current = { x: targetX, y: targetY };

    updateFlightPath();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Real Flight Positioning & Camera Tracking Follow
    let animId: number;
    let clock = new THREE.Clock();
    const contrailHistory: THREE.Vector3[] = [];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Cloud slow atmospheric rotation
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0003;
      }

      // Compute aircraft position along authentic Great Circle Slerp
      const t = Math.max(0, Math.min(1, progressPercent / 100));
      const pStart = latLngToVector3(originAirport.lat, originAirport.lng, GLOBE_RADIUS);
      const pEnd = latLngToVector3(destAirport.lat, destAirport.lng, GLOBE_RADIUS);
      const dist = pStart.distanceTo(pEnd);
      const maxLift = Math.min(2.8, Math.max(0.65, dist * 0.28));

      const slerpDir = slerpGreatCircle(pStart, pEnd, t);
      const currentAlt = calculateFlightAltitude(t, maxLift);
      const currentPlanePos = slerpDir.clone().multiplyScalar(GLOBE_RADIUS + currentAlt);

      // Tangent vector for aircraft heading orientation
      const nextT = Math.min(1, t + 0.005);
      const nextDir = slerpGreatCircle(pStart, pEnd, nextT);
      const nextAlt = calculateFlightAltitude(nextT, maxLift);
      const nextPlanePos = nextDir.clone().multiplyScalar(GLOBE_RADIUS + nextAlt);
      const forwardVec = nextPlanePos.clone().sub(currentPlanePos).normalize();

      if (airplaneRef.current) {
        airplaneRef.current.position.copy(currentPlanePos);

        // Orient aircraft forward along velocity vector and normal up from globe
        const upVec = slerpDir.clone().normalize();
        const orientationMatrix = new THREE.Matrix4();
        const rightVec = new THREE.Vector3().crossVectors(forwardVec, upVec).normalize();
        const trueUpVec = new THREE.Vector3().crossVectors(rightVec, forwardVec).normalize();

        orientationMatrix.makeBasis(rightVec, trueUpVec, forwardVec);
        airplaneRef.current.quaternion.setFromRotationMatrix(orientationMatrix);

        // Add to contrail history
        if (contrailHistory.length > 50) contrailHistory.shift();
        contrailHistory.push(currentPlanePos.clone());
        if (contrailLineRef.current && contrailHistory.length >= 2) {
          contrailLineRef.current.geometry.setFromPoints(contrailHistory);
        }
      }

      // Camera Tracking Follow: Auto-orient globe to follow moving airplane
      if (isFollowRef.current) {
        const targetFollowY = -Math.atan2(slerpDir.z, -slerpDir.x);
        const targetFollowX = Math.asin(slerpDir.y);

        // Smooth spherical interpolation towards plane position
        targetRotationRef.current.x = targetFollowX;
        targetRotationRef.current.y = targetFollowY;
      }

      // Smooth rotation damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x = currentRotationRef.current.x;
        globeGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [originAirport, destAirport, updateFlightPath, progressPercent]);

  // Handle Drag / Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosRef.current.x;
    const deltaY = e.clientY - previousMousePosRef.current.y;

    targetRotationRef.current.y += deltaX * 0.005;
    targetRotationRef.current.x += deltaY * 0.005;

    // Clamp vertical tilt
    targetRotationRef.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, targetRotationRef.current.x));

    previousMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom Controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -1.5 : 1.5;
    zoomDistRef.current = Math.max(7, Math.min(18, zoomDistRef.current + delta));
    cameraRef.current.position.z = zoomDistRef.current;
  };

  const handleCenterOnFlight = () => {
    const pStart = latLngToVector3(originAirport.lat, originAirport.lng, GLOBE_RADIUS);
    const pEnd = latLngToVector3(destAirport.lat, destAirport.lng, GLOBE_RADIUS);
    const midDir = slerpGreatCircle(pStart, pEnd, 0.5);
    const targetY = -Math.atan2(midDir.z, -midDir.x);
    const targetX = Math.asin(midDir.y);
    targetRotationRef.current = { x: targetX, y: targetY };
  };

  return (
    <div
      className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Real Flight Radar HUD (Compact & Collapsible to prevent blocking 3D Earth) */}
      <div className="absolute top-3 left-3 z-20 pointer-events-auto max-w-[calc(100%-64px)] sm:max-w-md transition-all">
        {isCollapsed ? (
          /* Collapsed Mini Capsule */
          <div
            onClick={() => setIsCollapsed(false)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl cursor-pointer transition-all active:scale-95 group"
            title="คลิกเพื่อขยายดูข้อมูลเส้นทางบิน Great Circle"
          >
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold font-mono text-emerald-400">{originAirport.code}</span>
            <span className="text-slate-400 text-xs">➔</span>
            <span className="text-xs font-bold font-mono text-rose-400">{destAirport.code}</span>
            <span className="text-[10px] text-amber-300 font-mono shrink-0">{flightStats.callsign}</span>
            <span className="text-[10px] text-slate-300 font-mono shrink-0 hidden sm:inline">เหลือ {flightStats.kmRemaining} กม.</span>
            <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold shrink-0">
              {progressPercent.toFixed(1)}%
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 transition-transform group-hover:translate-y-0.5" />
          </div>
        ) : (
          /* Expanded Compact Card */
          <div className="flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl max-w-[290px] sm:max-w-md transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Plane className="w-3.5 h-3.5 -rotate-45" />
                </div>
                <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold truncate">
                  <span className="text-emerald-400 font-mono">{originAirport.code}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-rose-400 font-mono">{destAirport.code}</span>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {flightStats.callsign}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-black">
                  {progressPercent.toFixed(1)}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="w-6 h-6 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="ย่อแถบข้อมูลเพื่อดูมุมมองลูกโลกเต็มตา"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/90 text-[10px] text-slate-400 gap-2">
              <span className="truncate">
                Great Circle: <span className="font-bold text-slate-200">{flightStats.distanceKm} กม.</span> (เหลือ <span className="text-sky-400 font-bold">{flightStats.kmRemaining} กม.</span>)
              </span>
              <span className="text-emerald-400 font-mono font-bold shrink-0 uppercase text-[9px]">
                {flightStats.phase}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls: Camera Follow Toggle, Zoom & Recenter (Cleanly placed at top-right) */}
      <div className="absolute top-3 right-3 flex flex-col space-y-1.5 z-20 pointer-events-auto">
        <button
          onClick={() => {
            const next = !isFollowActive;
            setIsFollowActive(next);
            onToggleCameraFollow?.();
          }}
          className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-lg transition-all active:scale-90 cursor-pointer ${
            isFollowActive
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title={isFollowActive ? 'กล้องกำลังติดตามเครื่องบิน (คลิกเพื่อปิด)' : 'เปิดกล้องติดตามเครื่องบิน'}
        >
          {isFollowActive ? <Video className="w-4 h-4 animate-pulse" /> : <VideoOff className="w-4 h-4" />}
        </button>

        <button
          onClick={handleCenterOnFlight}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="จัดกึ่งกลางเส้นทางบิน Great Circle"
        >
          <RotateCcw className="w-4 h-4 text-sky-400" />
        </button>

        <button
          onClick={() => handleZoom('in')}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="ซูมเข้า"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="ซูมออก"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Aeronautical Live Flight Telemetry HUD */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white shadow-xl pointer-events-none max-w-[calc(100%-24px)]">
        <div className="flex items-center space-x-2">
          <Navigation2 className="w-4 h-4 text-sky-400 animate-pulse" />
          <div>
            <p className="text-[9px] text-slate-400 font-mono uppercase">ระดับความสูง (Altitude)</p>
            <p className="text-xs sm:text-sm font-black font-mono text-sky-300">
              {flightStats.altFt.toLocaleString()} FT (FL{Math.round(flightStats.altFt / 100)})
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-[9px] text-slate-400 font-mono uppercase">ความเร็วการบิน (Ground Speed)</p>
            <p className="text-xs sm:text-sm font-black font-mono text-emerald-300">
              895 km/h (Mach 0.82)
            </p>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-slate-800" />

        <div className="hidden sm:flex items-center space-x-2">
          <Radio className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-[9px] text-slate-400 font-mono uppercase">ลูกโลกดาวเทียมจริง (NASA)</p>
            <p className="text-xs font-bold text-slate-300">
              Blue Marble • Geodesic Arc
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
