import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Car } from './components/Car';
import { Track } from './components/Track';
import { GameUI } from './components/GameUI';

function App() {
  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Environment preset="sunset" background blur={0.5} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Physics debug={false}>
          <Track />
          <Car />
        </Physics>
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
      <GameUI />
    </div>
  );
}

export default App;