


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
