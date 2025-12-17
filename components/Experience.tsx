import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ArixTree } from './ArixTree';
import { TreeState } from '../types';

interface ExperienceProps {
  treeState: TreeState;
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas 
      gl={{ antialias: false, alpha: false, toneMappingExposure: 1.0 }} 
      dpr={[1, 2]} 
    >
      {/* Background: Deep Warm Indoor Dark */}
      <color attach="background" args={['#050805']} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 28]} fov={45} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 2.8} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={12}
        maxDistance={50}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* --- CINEMATIC LIGHTING --- */}
      {/* Soft Ambient to lift shadows */}
      <ambientLight intensity={0.4} color="#554433" />
      
      {/* Key Light: Warm Spotlight (Fireplace/Lamp feel) */}
      <spotLight 
        position={[15, 12, 15]} 
        angle={0.4} 
        penumbra={1} 
        intensity={2.5} 
        color="#ffccaa" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* Rim Light: Cool blue/white (Moonlight from window) */}
      <spotLight 
        position={[-15, 15, -10]} 
        angle={0.6} 
        penumbra={1} 
        intensity={3} 
        color="#cceeff" 
      />

      {/* Back Light to separate tree from background */}
      <pointLight position={[0, 5, -8]} intensity={2} color="#ffaa55" distance={25} />

      {/* --- ENVIRONMENT --- */}
      {/* "Lobby" provides a warm, rich indoor reflection map for the gold/crystals */}
      <Environment preset="city" environmentIntensity={1.0} blur={0.8} background={false} />
      
      {/* Floating Dust/Snow Motes (Interior dust in light beams) */}
      <Sparkles 
        count={500} 
        scale={30} 
        size={3} 
        speed={0.4} 
        opacity={0.6} 
        color="#FFD700"
      />
      
      <Sparkles 
        count={200} 
        scale={25} 
        size={5} 
        speed={0.2} 
        opacity={0.3} 
        color="#FFFFFF"
      />

      <Suspense fallback={null}>
        <ArixTree state={treeState} />
      </Suspense>

      {/* --- POST PROCESSING --- */}
      <EffectComposer enableNormalPass={false}>
        {/* Warm, Dreamy Bloom for lights and star */}
        <Bloom 
            luminanceThreshold={1} // Only hit the bright lights
            mipmapBlur 
            intensity={0.8} 
            radius={0.6}
        />
        {/* Vignette for movie poster look */}
        <Vignette eskil={false} offset={0.3} darkness={0.7} />
        {/* Subtle Noise for film grain texture */}
        <Noise opacity={0.03} />
      </EffectComposer>
    </Canvas>
  );
};