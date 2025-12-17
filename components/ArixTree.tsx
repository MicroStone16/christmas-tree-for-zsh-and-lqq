import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateTreeParticles } from '../utils/geometry';
import { TreeState } from '../types';

interface ArixTreeProps {
  state: TreeState;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScatterQuat = new THREE.Quaternion();
const tempTreeQuat = new THREE.Quaternion();

export const ArixTree: React.FC<ArixTreeProps> = ({ state }) => {
  // References
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const ornamentsRef = useRef<THREE.InstancedMesh>(null);
  const lightsRef = useRef<THREE.InstancedMesh>(null); 
  const starRef = useRef<THREE.Group>(null);

  // Configuration
  const leavesConfig = { count: 4000, radius: 7, height: 16, colorPrimary: '#0A2F10', colorSecondary: '#FFFFFF' };
  const ornamentsConfig = { count: 300, radius: 7.2, height: 16, colorPrimary: '#FFD700', colorSecondary: '#D70040' };
  const lightsConfig = { count: 200, radius: 7.1, height: 16, colorPrimary: '#FFD27F', colorSecondary: '#FFD27F' };

  // Generate Data
  const leavesData = useMemo(() => generateTreeParticles(leavesConfig, 'LEAF'), []);
  const ornamentsData = useMemo(() => generateTreeParticles(ornamentsConfig, 'ORNAMENT'), []);
  const lightsData = useMemo(() => generateTreeParticles(lightsConfig, 'LIGHT'), []);
  
  // Animation Progress Ref
  const progressRef = useRef(0);

  // Initial Color Setup
  useLayoutEffect(() => {
    const setColors = (ref: React.RefObject<THREE.InstancedMesh>, data: any[]) => {
        if (ref.current) {
            data.forEach((d, i) => ref.current!.setColorAt(i, d.color));
            ref.current.instanceColor!.needsUpdate = true;
        }
    };
    setColors(leavesRef, leavesData);
    setColors(ornamentsRef, ornamentsData);
    setColors(lightsRef, lightsData);
  }, [leavesData, ornamentsData, lightsData]);

  // Frame Loop
  useFrame((stateThree, delta) => {
    const target = state === TreeState.TREE_SHAPE ? 1 : 0;
    const speed = 1.0; 
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * speed);
    
    const t = progressRef.current;
    const easedT = t * t * (3 - 2 * t); 

    const updateMesh = (ref: React.RefObject<THREE.InstancedMesh>, data: any[], isLight = false) => {
        if (!ref.current) return;
        data.forEach((d, i) => {
            tempPos.lerpVectors(d.scatterPosition, d.treePosition, easedT);
            tempScatterQuat.setFromEuler(d.scatterRotation);
            tempTreeQuat.setFromEuler(d.treeRotation);
            
            if (!isLight) {
                 tempTreeQuat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), stateThree.clock.getElapsedTime() * 0.1));
            }
            tempQuat.slerpQuaternions(tempScatterQuat, tempTreeQuat, easedT);
            tempObject.position.copy(tempPos);
            tempObject.quaternion.copy(tempQuat);
            
            let s = d.scale;
            if (isLight) {
                s = d.scale * (0.8 + 0.4 * Math.sin(stateThree.clock.getElapsedTime() * 2 + d.id));
            }
            tempObject.scale.setScalar(s);
            tempObject.updateMatrix();
            ref.current!.setMatrixAt(i, tempObject.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(leavesRef, leavesData);
    updateMesh(ornamentsRef, ornamentsData);
    updateMesh(lightsRef, lightsData, true);

    if (starRef.current) {
        const treeTop = new THREE.Vector3(0, leavesConfig.height / 2 + 1, 0);
        const scatterTop = new THREE.Vector3(0, 35, 0);
        starRef.current.position.lerpVectors(scatterTop, treeTop, easedT);
        starRef.current.rotation.y += delta * 0.2;
        const scale = THREE.MathUtils.lerp(0, 1.2, easedT);
        starRef.current.scale.setScalar(scale);
    }

    const groupRotation = delta * 0.05 * easedT;
    if(leavesRef.current) leavesRef.current.rotation.y += groupRotation;
    if(ornamentsRef.current) ornamentsRef.current.rotation.y += groupRotation;
    if(lightsRef.current) lightsRef.current.rotation.y += groupRotation;
    if(starRef.current) starRef.current.rotation.y += groupRotation;
  });

  return (
    <group position={[0, -5, 0]}>
      <instancedMesh ref={leavesRef} args={[undefined, undefined, leavesConfig.count]}>
        <coneGeometry args={[0.15, 0.8, 3]} /> 
        <meshStandardMaterial roughness={0.8} metalness={0.1} flatShading={true} />
      </instancedMesh>

      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, ornamentsConfig.count]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} envMapIntensity={1.5} />
      </instancedMesh>

      <instancedMesh ref={lightsRef} args={[undefined, undefined, lightsConfig.count]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#FFD27F" emissive="#FFAA33" emissiveIntensity={4} toneMapped={false} />
      </instancedMesh>

      <group ref={starRef}>
        <mesh>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0} metalness={1} emissive="#FFF" emissiveIntensity={0.5} />
        </mesh>
        <mesh>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={1} wireframe={true} emissive="#FFD700" emissiveIntensity={0.2} />
        </mesh>
        <pointLight intensity={3} distance={15} color="#FFEDD5" decay={2} />
      </group>
      
      <pointLight position={[0, 0, 2]} intensity={1} color="#FF9900" distance={10} />
    </group>
  );
};