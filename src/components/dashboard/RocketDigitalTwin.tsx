import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Maximize2, Minimize2 } from "lucide-react";

interface RocketProps {
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  isAnomaly: boolean;
}

function ExhaustParticles({ intensity = 1 }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = -2.5 - Math.random() * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] -= delta * (2 + Math.random()) * intensity;
      if (posArr[i * 3 + 1] < -5) {
        posArr[i * 3] = (Math.random() - 0.5) * 0.4;
        posArr[i * 3 + 1] = -2.2;
        posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#6EF3FF" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function LaunchVehicle({ gyroX, gyroY, gyroZ, isAnomaly }: RocketProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const tx = (gyroX || 0) * 0.02;
    const ty = (gyroY || 0) * 0.02 + state.clock.elapsedTime * 0.1;
    const tz = (gyroZ || 0) * 0.02;

    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, tx, delta * 2);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, ty, delta * 2);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tz, delta * 2);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  const bodyColor = isAnomaly ? "#FF4444" : "#C0C8D8";
  const emissiveColor = isAnomaly ? "#FF0000" : "#6EF3FF";

  return (
    <group ref={group}>
      <mesh position={[0, 2.2, 0]}>
        <coneGeometry args={[0.35, 1, 32]} />
        <meshStandardMaterial color="#E8E8E8" emissive={emissiveColor} emissiveIntensity={0.1} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.2, 32]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.2} emissive={emissiveColor} emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.15, 32]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 1.8, 32]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={isAnomaly ? 0.3 : 0.05} metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.45, -1.3, Math.sin(angle) * 0.45]} rotation={[0, -angle, 0.3]}>
          <boxGeometry args={[0.02, 0.6, 0.35]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} emissive={emissiveColor} emissiveIntensity={0.1} />
        </mesh>
      ))}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.4, 32, 1, true]} />
        <meshStandardMaterial color="#444" metalness={0.95} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -1.9, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#6EF3FF" emissive="#6EF3FF" emissiveIntensity={isAnomaly ? 4 : 2} transparent opacity={0.5} />
      </mesh>
      <ExhaustParticles intensity={isAnomaly ? 2 : 1} />
    </group>
  );
}

function StarsBackground() {
  const ref = useRef<THREE.Points>(null);
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 30;
    return pos;
  }, []);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.005; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#6EF3FF" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/** Disable all R3F pointer events so the canvas never captures touch gestures. */
function DisablePointerEvents() {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "pan-y";
    canvas.style.pointerEvents = "none";
  }, [gl]);
  return null;
}

interface DigitalTwinProps {
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
  isAnomaly?: boolean;
}

const RocketDigitalTwin = ({ gyroX = 0, gyroY = 0, gyroZ = 0, isAnomaly = false }: DigitalTwinProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasContent = (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 40 }}
      dpr={[1, 1.5]}
      style={{ touchAction: "pan-y", pointerEvents: "none" }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <DisablePointerEvents />
        <fog attach="fog" args={["#0B0F2F", 8, 25]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#6EF3FF" />
        <pointLight position={[-3, -2, 3]} intensity={0.5} color="#FF6EC7" />
        <spotLight position={[0, 8, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#ffffff" />
        <LaunchVehicle gyroX={gyroX} gyroY={gyroY} gyroZ={gyroZ} isAnomaly={isAnomaly} />
        <StarsBackground />
      </Suspense>
    </Canvas>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">3D Digital Twin — Launch Vehicle</span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative" style={{ touchAction: "pan-y" }}>
          {canvasContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[280px] relative" style={{ touchAction: "pan-y" }}>
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-card/60 backdrop-blur-sm border border-border/30 hover:bg-card/80 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      {canvasContent}
    </div>
  );
};

export default RocketDigitalTwin;
