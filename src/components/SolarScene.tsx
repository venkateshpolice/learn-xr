"use client";

import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { WebXRButton } from "@/components/trigonometry/WebXRButton";

const TEXTURES = {
  mercury: "/textures/2k_mercury.jpg",
  venus: "/textures/2k_venus_surface.jpg",
  earth: "/textures/2k_earth_daymap.jpg",
  mars: "/textures/2k_mars.jpg",
  jupiter: "/textures/2k_jupiter.jpg",
  saturn: "/textures/2k_saturn.jpg",
  uranus: "/textures/2k_uranus.jpg",
  neptune: "/textures/2k_neptune.jpg",
};

interface PlanetInfo {
  name: string;
  type: string;
  diameter: string;
  distance: string;
  dayLength: string;
  yearLength: string;
  moons: string;
  temperature: string;
  description: string;
}

const PLANET_DATA: Record<string, PlanetInfo> = {
  mercury: {
    name: "Mercury",
    type: "Terrestrial Planet",
    diameter: "4,879 km",
    distance: "57.9 million km",
    dayLength: "59 Earth days",
    yearLength: "88 Earth days",
    moons: "0",
    temperature: "-180°C to 430°C",
    description: "The smallest planet and closest to the Sun. Mercury has no atmosphere and is covered in craters.",
  },
  venus: {
    name: "Venus",
    type: "Terrestrial Planet",
    diameter: "12,104 km",
    distance: "108.2 million km",
    dayLength: "243 Earth days",
    yearLength: "225 Earth days",
    moons: "0",
    temperature: "465°C (average)",
    description: "The hottest planet with a thick toxic atmosphere. Venus rotates backwards compared to other planets.",
  },
  earth: {
    name: "Earth",
    type: "Terrestrial Planet",
    diameter: "12,756 km",
    distance: "149.6 million km",
    dayLength: "24 hours",
    yearLength: "365.25 days",
    moons: "1",
    temperature: "15°C (average)",
    description: "Our home planet and the only known world to harbor life. 71% of its surface is covered in water.",
  },
  mars: {
    name: "Mars",
    type: "Terrestrial Planet",
    diameter: "6,792 km",
    distance: "227.9 million km",
    dayLength: "24.6 hours",
    yearLength: "687 Earth days",
    moons: "2",
    temperature: "-60°C (average)",
    description: "The Red Planet, home to the tallest volcano (Olympus Mons) and largest canyon in the solar system.",
  },
  jupiter: {
    name: "Jupiter",
    type: "Gas Giant",
    diameter: "142,984 km",
    distance: "778.5 million km",
    dayLength: "10 hours",
    yearLength: "12 Earth years",
    moons: "95",
    temperature: "-110°C (cloud top)",
    description: "The largest planet with a Great Red Spot storm that has raged for hundreds of years.",
  },
  saturn: {
    name: "Saturn",
    type: "Gas Giant",
    diameter: "120,536 km",
    distance: "1.43 billion km",
    dayLength: "10.7 hours",
    yearLength: "29 Earth years",
    moons: "146",
    temperature: "-140°C (average)",
    description: "Famous for its stunning ring system made of ice and rock particles spanning 282,000 km.",
  },
  uranus: {
    name: "Uranus",
    type: "Ice Giant",
    diameter: "51,118 km",
    distance: "2.87 billion km",
    dayLength: "17 hours",
    yearLength: "84 Earth years",
    moons: "28",
    temperature: "-195°C (average)",
    description: "Tilted on its side at 98°, Uranus rolls around the Sun like a ball. It has faint rings.",
  },
  neptune: {
    name: "Neptune",
    type: "Ice Giant",
    diameter: "49,528 km",
    distance: "4.5 billion km",
    dayLength: "16 hours",
    yearLength: "165 Earth years",
    moons: "16",
    temperature: "-200°C (average)",
    description: "The windiest planet with speeds up to 2,100 km/h. It has a vivid blue color from methane.",
  },
  sun: {
    name: "Sun",
    type: "Yellow Dwarf Star",
    diameter: "1,392,700 km",
    distance: "0 (Center)",
    dayLength: "25 Earth days",
    yearLength: "N/A",
    moons: "8 planets",
    temperature: "5,500°C (surface)",
    description: "Our star, containing 99.86% of the solar system's mass. It fuses 600 million tons of hydrogen per second.",
  },
};

function PlanetLabel({
  name,
  size,
  hasRing,
  ringOuter,
}: {
  name: string;
  size: number;
  hasRing?: boolean;
  ringOuter?: number;
}) {
  const ringBoost = hasRing ? (ringOuter ?? size * 2.5) * 0.28 : 0;
  const y = size * 1.2 + ringBoost + 0.12;
  const fontSize = Math.min(Math.max(size * 0.34, 0.13), 0.52);

  return (
    <Billboard position={[0, y, 0]}>
      <Text
        fontSize={fontSize}
        color="#f1f5f9"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={fontSize * 0.14}
        outlineColor="#020617"
        fillOpacity={0.95}
      >
        {name}
      </Text>
    </Billboard>
  );
}

function Sun({ onSelect, paused, onHoverStart, onHoverEnd }: { onSelect: (id: string, pos: THREE.Vector3) => void; paused: boolean; onHoverStart: () => void; onHoverEnd: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const corona1Ref = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    if (hovered) onHoverStart(); else onHoverEnd();
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered, onHoverStart, onHoverEnd]);

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;varying vec3 vNormal;varying vec3 vViewDir;
        void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);vec4 mvPos=modelViewMatrix*vec4(position,1.0);vViewDir=normalize(-mvPos.xyz);gl_Position=projectionMatrix*mvPos;}
      `,
      fragmentShader: `
        uniform float time;varying vec2 vUv;varying vec3 vNormal;varying vec3 vViewDir;
        vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
        vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
        vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
        float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
        float fbm(vec3 p){float f=0.;f+=.5*snoise(p);f+=.25*snoise(p*2.);f+=.125*snoise(p*4.);f+=.0625*snoise(p*8.);return f;}
        void main(){vec3 pos=vec3(vUv*4.,time*.1);float n1=fbm(pos);float n2=fbm(pos+vec3(5.2,1.3,time*.06));float n3=fbm(pos+vec3(n1*2.,n2*2.,0.));float flare=pow(max(n3,0.),3.);vec3 white=vec3(1.,.98,.9);vec3 yellow=vec3(1.,.8,.15);vec3 orange=vec3(1.,.4,0.);vec3 darkRed=vec3(.65,.12,0.);float t=n1*.5+.5;vec3 color=mix(orange,yellow,t);color=mix(color,white,flare*.85);color=mix(color,darkRed,(1.-t)*.2);float limb=dot(vNormal,vViewDir);float ld=pow(limb,.28);color*=ld;color=mix(darkRed*.25,color,ld);color*=2.0;gl_FragColor=vec4(color,1.);}
      `,
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    sunMaterial.uniforms.time.value = t;
    if (sunRef.current && !paused) sunRef.current.rotation.y = t * 0.015;
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);
    if (corona1Ref.current) corona1Ref.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03);
    if (corona2Ref.current) corona2Ref.current.scale.setScalar(1 + Math.sin(t) * 0.04);
    if (!planetPositions["sun"]) planetPositions["sun"] = new THREE.Vector3();
    planetPositions["sun"].set(0, 0, 0);
  });

  return (
    <group>
      <mesh
        ref={sunRef}
        material={sunMaterial}
        onClick={(e) => { e.stopPropagation(); onSelect("sun", new THREE.Vector3(0, 0, 0)); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2.2, 64, 64]} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#FF7700" transparent opacity={0.25} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={corona1Ref}>
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshBasicMaterial color="#FF4400" transparent opacity={0.1} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial color="#FF2200" transparent opacity={0.04} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <pointLight intensity={12} distance={250} color="#FFF5E0" decay={1.2} />
      <Billboard position={[0, 5.4, 0]}>
        <Text
          fontSize={0.55}
          color="#fde68a"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.07}
          outlineColor="#451a03"
          fillOpacity={0.98}
        >
          Sun
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitLine({ radius }: { radius: number }) {
  const orbitPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const angle = (i / 256) * Math.PI * 2;
      pts.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    }
    return new Float32Array(pts);
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[orbitPoints, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#4466aa" opacity={0.25} transparent />
    </line>
  );
}

function TexturedPlanet({
  id,
  orbitRadius,
  size,
  textureUrl,
  speed,
  offset,
  rotationSpeed,
  tilt,
  hasRing,
  ringInner,
  ringOuter,
  ringColor,
  hasAtmosphere,
  atmosphereColor,
  onSelect,
  paused,
  onHoverStart,
  onHoverEnd,
}: {
  id: string;
  orbitRadius: number;
  size: number;
  textureUrl: string;
  speed: number;
  offset: number;
  rotationSpeed?: number;
  tilt?: number;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  onSelect: (id: string, pos: THREE.Vector3) => void;
  paused: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const frozenTime = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    if (hovered) onHoverStart(); else onHoverEnd();
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered, onHoverStart, onHoverEnd]);

  useFrame(({ clock }) => {
    if (paused) {
      if (frozenTime.current === null) {
        frozenTime.current = clock.getElapsedTime();
      }
    } else {
      frozenTime.current = null;
    }

    const time = frozenTime.current !== null ? frozenTime.current : clock.getElapsedTime();
    const t = time * speed + offset;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
      if (!planetPositions[id]) planetPositions[id] = new THREE.Vector3();
      groupRef.current.getWorldPosition(planetPositions[id]);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += (rotationSpeed || 0.005);
    }

    if (glowRingRef.current) {
      const targetOpacity = hovered ? 0.8 : 0;
      const mat = glowRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (targetOpacity - mat.opacity) * 0.1;
      glowRingRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
  });

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (groupRef.current) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      onSelect(id, worldPos);
    }
  }, [id, onSelect]);

  return (
    <>
      <OrbitLine radius={orbitRadius} />
      <group ref={groupRef}>
        <group rotation={[0, 0, ((tilt || 0) * Math.PI) / 180]}>
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={() => setHovered(false)}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[size, 64, 64]} />
            <meshStandardMaterial map={texture} roughness={0.45} metalness={0.12} emissive="#333333" emissiveIntensity={0.1} />
          </mesh>
          {/* Hover glow ring */}
          <mesh ref={glowRingRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.3, size * 1.5, 64]} />
            <meshBasicMaterial color="#66aaff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {hasAtmosphere && (
            <mesh>
              <sphereGeometry args={[size * 1.04, 48, 48]} />
              <shaderMaterial
                vertexShader={`varying vec3 vNormal;varying vec3 vViewDir;void main(){vNormal=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vViewDir=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`}
                fragmentShader={`uniform vec3 c;varying vec3 vNormal;varying vec3 vViewDir;void main(){float i=pow(.55-dot(vNormal,vViewDir),4.);gl_FragColor=vec4(c,i);}`}
                uniforms={{ c: { value: new THREE.Color(atmosphereColor || "#4488ff") } }}
                transparent blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false}
              />
            </mesh>
          )}
          {hasRing && (
            <mesh rotation={[Math.PI / 2.1, 0, 0]}>
              <ringGeometry args={[ringInner || size * 1.5, ringOuter || size * 2.5, 128]} />
              <meshBasicMaterial color={ringColor || "#C8A86B"} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          )}
          {/* Moons */}
          {PLANET_MOONS[id]?.map((moon) => (
            <MoonOrbit key={moon.name} moon={moon} />
          ))}
          <PlanetLabel
            name={PLANET_DATA[id]?.name ?? id}
            size={size}
            hasRing={hasRing}
            ringOuter={ringOuter}
          />
        </group>
      </group>
    </>
  );
}

interface MoonData {
  name: string;
  size: number;
  orbitRadius: number;
  speed: number;
  color: string;
  offset: number;
}

function MoonOrbit({ moon }: { moon: MoonData }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * moon.speed + moon.offset;

    if (ref.current) {
      ref.current.position.x = Math.cos(t) * moon.orbitRadius;
      ref.current.position.z = Math.sin(t) * moon.orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[moon.size, 24, 24]} />
        <meshStandardMaterial color={moon.color} roughness={0.8} metalness={0.0} />
      </mesh>
    </group>
  );
}

const PLANET_MOONS: Record<string, MoonData[]> = {
  earth: [
    { name: "Moon", size: 0.12, orbitRadius: 0.8, speed: 1.5, color: "#AAAAAA", offset: 0 },
  ],
  mars: [
    { name: "Phobos", size: 0.04, orbitRadius: 0.5, speed: 2.5, color: "#887766", offset: 0 },
    { name: "Deimos", size: 0.03, orbitRadius: 0.7, speed: 1.8, color: "#776655", offset: 2.0 },
  ],
  jupiter: [
    { name: "Io", size: 0.1, orbitRadius: 1.5, speed: 2.0, color: "#CCAA44", offset: 0 },
    { name: "Europa", size: 0.09, orbitRadius: 1.8, speed: 1.6, color: "#BBCCDD", offset: 1.5 },
    { name: "Ganymede", size: 0.13, orbitRadius: 2.2, speed: 1.2, color: "#998877", offset: 3.0 },
    { name: "Callisto", size: 0.11, orbitRadius: 2.6, speed: 0.9, color: "#665544", offset: 4.5 },
  ],
  saturn: [
    { name: "Titan", size: 0.12, orbitRadius: 2.4, speed: 1.0, color: "#CC9944", offset: 0 },
    { name: "Enceladus", size: 0.05, orbitRadius: 1.5, speed: 2.0, color: "#DDEEFF", offset: 2.0 },
  ],
  uranus: [
    { name: "Titania", size: 0.07, orbitRadius: 1.0, speed: 1.5, color: "#99AABB", offset: 0 },
    { name: "Oberon", size: 0.06, orbitRadius: 1.3, speed: 1.2, color: "#887799", offset: 2.5 },
  ],
  neptune: [
    { name: "Triton", size: 0.08, orbitRadius: 1.0, speed: 1.3, color: "#88AACC", offset: 0 },
  ],
};

function AsteroidBelt({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 10.0 + (Math.random() - 0.5) * 1.8;
      const y = (Math.random() - 0.5) * 0.3;
      pts.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
    return new Float32Array(pts);
  }, []);

  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.004;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#998877" size={0.04} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function CameraAnimator({
  targetPos,
  planetSize,
  active,
  controlsRef,
}: {
  targetPos: THREE.Vector3 | null;
  planetSize: number;
  active: boolean;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const animating = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const progress = useRef(0);

  useEffect(() => {
    if (active && targetPos) {
      startPos.current.copy(camera.position);
      startTarget.current.copy(controlsRef.current?.target || new THREE.Vector3());

      const offset = new THREE.Vector3()
        .subVectors(camera.position, targetPos)
        .normalize()
        .multiplyScalar(planetSize * 4 + 1.5);

      endPos.current.copy(targetPos).add(offset);
      endTarget.current.copy(targetPos);
      progress.current = 0;
      animating.current = true;
    }
    if (!active && !targetPos) {
      startPos.current.copy(camera.position);
      startTarget.current.copy(controlsRef.current?.target || new THREE.Vector3());
      endPos.current.set(5, 18, 35);
      endTarget.current.set(0, 0, 0);
      progress.current = 0;
      animating.current = true;
    }
  }, [active, targetPos, camera, planetSize, controlsRef]);

  useFrame((_, delta) => {
    if (!animating.current) return;

    progress.current += delta * 1.2;
    const t = Math.min(progress.current, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos.current, endPos.current, ease);

    if (controlsRef.current) {
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget.current, endTarget.current, ease);
      controlsRef.current.target.copy(currentTarget);
      controlsRef.current.update();
    }

    if (t >= 1) {
      animating.current = false;
    }
  });

  return null;
}

function SunLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={10} distance={300} color="#FFF5E0" decay={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.001} />
      <pointLight position={[0, 8, 0]} intensity={1.5} distance={100} color="#FFFFFF" decay={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.6} color="#E8E0FF" />
    </>
  );
}

function Scene({ onSelect, paused, hovered, onHoverStart, onHoverEnd }: { onSelect: (id: string, pos: THREE.Vector3) => void; paused: boolean; hovered: boolean; onHoverStart: () => void; onHoverEnd: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = (paused || hovered) ? 0 : 0.008;
      groupRef.current.rotation.y += delta * speed;
    }
  });

  const stopped = paused || hovered;

  return (
    <group ref={groupRef} rotation={[-0.5, 0.2, 0]}>
      <SunLight />
      <Sun onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="mercury" orbitRadius={4.5} size={0.18} textureUrl={TEXTURES.mercury} speed={0.3} offset={0} rotationSpeed={0.001} tilt={0.03} onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="venus" orbitRadius={6.0} size={0.38} textureUrl={TEXTURES.venus} speed={0.22} offset={2.4} rotationSpeed={0.0008} tilt={177} hasAtmosphere atmosphereColor="#D4A030" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="earth" orbitRadius={8.0} size={0.42} textureUrl={TEXTURES.earth} speed={0.18} offset={4.1} rotationSpeed={0.004} tilt={23.4} hasAtmosphere atmosphereColor="#5599FF" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="mars" orbitRadius={9.8} size={0.28} textureUrl={TEXTURES.mars} speed={0.14} offset={1.5} rotationSpeed={0.003} tilt={25.2} hasAtmosphere atmosphereColor="#BB5533" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <AsteroidBelt paused={stopped} />
      <TexturedPlanet id="jupiter" orbitRadius={13.0} size={0.95} textureUrl={TEXTURES.jupiter} speed={0.08} offset={3.3} rotationSpeed={0.008} tilt={3.1} hasAtmosphere atmosphereColor="#CC9955" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="saturn" orbitRadius={17.0} size={0.8} textureUrl={TEXTURES.saturn} speed={0.05} offset={5.0} rotationSpeed={0.007} tilt={26.7} hasRing ringInner={1.1} ringOuter={2.0} ringColor="#C8A050" hasAtmosphere atmosphereColor="#D4C080" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="uranus" orbitRadius={21.0} size={0.5} textureUrl={TEXTURES.uranus} speed={0.03} offset={2.2} rotationSpeed={0.005} tilt={97.8} hasRing ringInner={0.7} ringOuter={1.0} ringColor="#80BBBB" hasAtmosphere atmosphereColor="#66CCCC" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <TexturedPlanet id="neptune" orbitRadius={25.0} size={0.48} textureUrl={TEXTURES.neptune} speed={0.02} offset={4.6} rotationSpeed={0.004} tilt={28.3} hasAtmosphere atmosphereColor="#3355FF" onSelect={onSelect} paused={stopped} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FF8800" />
      <pointLight intensity={3} distance={50} color="#FF8800" />
    </mesh>
  );
}

function NebulaDust() {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const sz: number[] = [];

    for (let i = 0; i < 2000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 45;
      const y = (Math.random() - 0.5) * 4 * Math.exp(-r * 0.02);
      pos.push(Math.cos(angle) * r, y, Math.sin(angle) * r);

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        col.push(0.4, 0.5, 0.9);
      } else if (colorChoice < 0.6) {
        col.push(0.6, 0.3, 0.7);
      } else if (colorChoice < 0.85) {
        col.push(0.3, 0.6, 0.8);
      } else {
        col.push(0.9, 0.7, 0.4);
      }

      sz.push(Math.random() * 0.08 + 0.02);
    }

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
      sizes: new Float32Array(sz),
    };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.3}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

const PLANET_SIZES: Record<string, number> = {
  sun: 2.2, mercury: 0.18, venus: 0.38, earth: 0.42, mars: 0.28,
  jupiter: 0.95, saturn: 0.8, uranus: 0.5, neptune: 0.48,
};

const PLANET_LIST = [
  { id: "sun", name: "Sun", color: "#FFA500", orbit: 0 },
  { id: "mercury", name: "Mercury", color: "#8C8C8C", orbit: 4.5 },
  { id: "venus", name: "Venus", color: "#C8A030", orbit: 6.0 },
  { id: "earth", name: "Earth", color: "#4488FF", orbit: 8.0 },
  { id: "mars", name: "Mars", color: "#CC4422", orbit: 9.8 },
  { id: "jupiter", name: "Jupiter", color: "#C8956B", orbit: 13.0 },
  { id: "saturn", name: "Saturn", color: "#C8B060", orbit: 17.0 },
  { id: "uranus", name: "Uranus", color: "#66CCCC", orbit: 21.0 },
  { id: "neptune", name: "Neptune", color: "#3355FF", orbit: 25.0 },
];

const planetPositions: Record<string, THREE.Vector3> = {};

function XROrbitGuard({ controlsRef }: { controlsRef: React.RefObject<{ enabled: boolean } | null> }) {
  const { gl } = useThree();

  useEffect(() => {
    const onStart = () => {
      if (controlsRef.current) controlsRef.current.enabled = false;
    };
    const onEnd = () => {
      if (controlsRef.current) controlsRef.current.enabled = true;
    };
    gl.xr.addEventListener("sessionstart", onStart);
    gl.xr.addEventListener("sessionend", onEnd);
    return () => {
      gl.xr.removeEventListener("sessionstart", onStart);
      gl.xr.removeEventListener("sessionend", onEnd);
    };
  }, [gl, controlsRef]);

  return null;
}

/** Scale & position the solar system for room-scale AR / standing VR. */
function XRWorldAdjustment({ children }: { children: React.ReactNode }) {
  const { gl } = useThree();
  const [xrLayout, setXrLayout] = useState<"desktop" | "ar" | "vr">("desktop");

  useEffect(() => {
    const onStart = () => {
      const mode = gl.xr.getSession()?.mode;
      setXrLayout(mode === "immersive-ar" ? "ar" : "vr");
    };
    const onEnd = () => setXrLayout("desktop");
    gl.xr.addEventListener("sessionstart", onStart);
    gl.xr.addEventListener("sessionend", onEnd);
    return () => {
      gl.xr.removeEventListener("sessionstart", onStart);
      gl.xr.removeEventListener("sessionend", onEnd);
    };
  }, [gl]);

  const scale = xrLayout === "ar" ? 0.028 : xrLayout === "vr" ? 0.12 : 1;
  const position: [number, number, number] =
    xrLayout === "ar" ? [0, 0.9, -1.4] : xrLayout === "vr" ? [0, 1.5, -2.5] : [0, 0, 0];

  return (
    <group scale={scale} position={position}>
      {children}
    </group>
  );
}

export default function SolarScene() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetPos, setPlanetPos] = useState<THREE.Vector3 | null>(null);
  const [paused, setPaused] = useState(false);
  const [anyHovered, setAnyHovered] = useState(false);
  const controlsRef = useRef<{ enabled: boolean; target: THREE.Vector3; update: () => void } | null>(null);
  const xrContainerRef = useRef<HTMLDivElement>(null);
  const [planetsOpen, setPlanetsOpen] = useState(false);

  const handleSelect = useCallback((id: string, pos: THREE.Vector3) => {
    setSelectedPlanet(id);
    setPlanetPos(pos);
    setPaused(true);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPlanet(null);
    setPlanetPos(null);
    setPaused(false);
  }, []);

  const hoverCount = useRef(0);
  const handleHoverStart = useCallback(() => { hoverCount.current++; setAnyHovered(true); }, []);
  const handleHoverEnd = useCallback(() => { hoverCount.current = Math.max(0, hoverCount.current - 1); if (hoverCount.current === 0) setAnyHovered(false); }, []);

  const info = selectedPlanet ? PLANET_DATA[selectedPlanet] : null;

  return (
    <div ref={xrContainerRef} className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [5, 18, 35], fov: 42 }}
        style={{ background: "transparent" }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.8,
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#000002"]} />
        <ambientLight intensity={0.25} color="#ffffff" />
        <Stars radius={500} depth={300} count={12000} factor={8} saturation={0.2} fade speed={0.08} />
        <Stars radius={100} depth={80} count={3000} factor={4} saturation={0.4} fade speed={0.15} />
        <Stars radius={30} depth={20} count={800} factor={2} saturation={0.6} fade speed={0.3} />
        <XRWorldAdjustment>
          <NebulaDust />
          <Suspense fallback={<Loader />}>
            <Scene onSelect={handleSelect} paused={paused} hovered={anyHovered} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd} />
          </Suspense>
        </XRWorldAdjustment>
        <CameraAnimator
          targetPos={planetPos}
          planetSize={selectedPlanet ? PLANET_SIZES[selectedPlanet] || 0.5 : 0.5}
          active={paused}
          controlsRef={controlsRef}
        />
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          minDistance={2}
          maxDistance={55}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
        <WebXRButton containerRef={xrContainerRef} mode="both" />
        <XROrbitGuard controlsRef={controlsRef} />
      </Canvas>

      {/* Planet Info Card — bottom sheet on mobile, left panel on desktop */}
      {info && (
        <div className="absolute inset-x-0 bottom-0 sm:inset-0 pointer-events-none flex items-end sm:items-center justify-center sm:justify-start p-0 sm:p-8 z-30 pb-[max(0px,env(safe-area-inset-bottom))] sm:pb-8">
          <div className="pointer-events-auto w-full sm:max-w-sm lg:w-96 max-h-[min(45dvh,360px)] sm:max-h-none overflow-y-auto overscroll-contain glass-card rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 border-b-0 sm:border-b shadow-lg shadow-black/30">
            <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />
            <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{info.name}</h3>
                <span className="inline-block mt-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {info.type}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white shrink-0"
                aria-label="Close planet info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-5 leading-relaxed">{info.description}</p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Diameter</div>
                <div className="text-sm font-semibold text-white">{info.diameter}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Distance from Sun</div>
                <div className="text-sm font-semibold text-white">{info.distance}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Day Length</div>
                <div className="text-sm font-semibold text-white">{info.dayLength}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Year Length</div>
                <div className="text-sm font-semibold text-white">{info.yearLength}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Moons</div>
                <div className="text-sm font-semibold text-white">{info.moons}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Temperature</div>
                <div className="text-sm font-semibold text-white">{info.temperature}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planet picker — horizontal scroll on mobile, sidebar on desktop */}
      <div className="absolute top-[3.25rem] sm:top-4 right-0 left-0 sm:left-auto sm:right-4 z-20 px-3 sm:px-0 pointer-events-none">
        {/* Mobile: collapsible + horizontal chips */}
        <div className="sm:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setPlanetsOpen((o) => !o)}
            className="ml-auto flex items-center gap-2 glass-card rounded-xl px-3 py-2 border border-white/10 text-xs font-medium text-slate-300"
          >
            Planets
            {planetsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {planetsOpen && (
            <div className="mt-2 glass-card rounded-xl p-2 border border-white/10 overflow-x-auto overscroll-x-contain">
              <div className="flex gap-1.5 min-w-max pb-0.5">
                {PLANET_LIST.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const livePos = planetPositions[p.id];
                      const pos = livePos ? livePos.clone() : new THREE.Vector3(p.orbit, 0, 0);
                      handleSelect(p.id, pos);
                      setPlanetsOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                      selectedPlanet === p.id
                        ? "bg-indigo-500/25 text-white border border-indigo-500/30"
                        : "text-slate-400 border border-transparent hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: vertical list */}
        <div className="hidden sm:block pointer-events-auto glass-card rounded-xl p-3 border border-white/10 w-44 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-2 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-1 -mx-1 rounded">
            Planets
          </div>
          <div className="flex flex-col gap-0.5">
            {PLANET_LIST.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const livePos = planetPositions[p.id];
                  const pos = livePos ? livePos.clone() : new THREE.Vector3(p.orbit, 0, 0);
                  handleSelect(p.id, pos);
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-all ${
                  selectedPlanet === p.id
                    ? "bg-indigo-500/20 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hint */}
      {!selectedPlanet && (
        <div className="absolute bottom-[4.5rem] sm:bottom-20 left-1/2 -translate-x-1/2 z-10 text-center w-full max-w-[min(100%,20rem)] sm:max-w-sm px-4 pointer-events-none">
          <p className="text-[10px] sm:text-xs text-slate-400 glass-card px-3 py-2 sm:px-4 rounded-2xl sm:rounded-full leading-relaxed">
            <span className="sm:hidden">Tap a planet · Pinch to zoom · Drag to rotate</span>
            <span className="hidden sm:inline">Click a planet to learn more · Drag to rotate · Enter AR / VR below</span>
          </p>
        </div>
      )}
    </div>
  );
}
