import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 300 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6EF3FF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function OrbitingRing({ radius = 2.5, speed = 0.3, color = "#6EF3FF" }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.3 + 0.5;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

function AbstractRocket() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });
  return (
    <group ref={group}>
      {/* Body */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.4, 1.5, 16, 32]} />
          <MeshDistortMaterial color="#1A1A40" emissive="#6EF3FF" emissiveIntensity={0.15} distort={0.05} speed={2} metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>
      {/* Nose cone */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.4, 0.6, 32]} />
        <meshStandardMaterial color="#2D1E6B" emissive="#FF6EC7" emissiveIntensity={0.2} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Engine glow */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#6EF3FF" emissive="#6EF3FF" emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      {/* Orbiting cubes */}
      <OrbitingCube offset={0} />
      <OrbitingCube offset={Math.PI * 0.66} />
      <OrbitingCube offset={Math.PI * 1.33} />
    </group>
  );
}

function OrbitingCube({ offset }: { offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 0.5 + offset;
      ref.current.position.x = Math.cos(t) * 2;
      ref.current.position.z = Math.sin(t) * 2;
      ref.current.position.y = Math.sin(t * 2) * 0.3;
      ref.current.rotation.x = t;
      ref.current.rotation.y = t * 0.7;
    }
  });
  return (
    <mesh ref={ref} scale={0.15}>
      <boxGeometry />
      <meshStandardMaterial color="#FF6EC7" emissive="#FF6EC7" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

function MouseTracker() {
  const { camera } = useThree();
  useFrame(({ pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.3 + 1, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const HeroScene = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 1, 6], fov: 45 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#0B0F2F", 5, 20]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#6EF3FF" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#FF6EC7" />
        <Particles />
        <AbstractRocket />
        <OrbitingRing radius={3} speed={0.2} color="#6EF3FF" />
        <OrbitingRing radius={3.5} speed={0.15} color="#FF6EC7" />
        <MouseTracker />
      </Canvas>
    </div>
  );
};

export default HeroScene;
