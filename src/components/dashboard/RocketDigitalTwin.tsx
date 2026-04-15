

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
