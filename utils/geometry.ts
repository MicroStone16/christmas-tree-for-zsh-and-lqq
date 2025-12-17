import * as THREE from 'three';
import { ParticleData, TreeConfig } from '../types';

/**
 * Generates data for particles that can morph between a random sphere (scatter)
 * and a cone spiral (tree).
 */
export const generateTreeParticles = (config: TreeConfig, type: 'LEAF' | 'ORNAMENT' | 'LIGHT'): ParticleData[] => {
  const particles: ParticleData[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < config.count; i++) {
    const t = i / config.count; // Normalized height (0 to 1)

    // --- 1. TREE POSITION ---
    let treePos = new THREE.Vector3();
    let treeRot = new THREE.Euler();
    let scale = 1;

    if (type === 'LIGHT') {
        // String Lights: Perfect Spiral winding around the tree
        const windings = 15; // How many times it wraps around
        const angle = t * Math.PI * 2 * windings;
        const currentHeight = t * config.height - (config.height / 2);
        
        // Base cone radius
        let r = config.radius * (1 - t);
        // Push lights slightly out so they sit ON the leaves
        r += 0.2; 

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        treePos.set(x, currentHeight, z);
        scale = Math.random() * 0.5 + 0.5; // Random flicker size
        treeRot.set(0, 0, 0);

    } else {
        // Leaves and Ornaments: Layered "Bough" Structure
        // Create distinct layers/tiers for that "Perfect Pine" look
        const layers = 8; 
        // Modulate linear height with steps to cluster particles
        const layerHeight = config.height * t - (config.height / 2);
        
        // Radius creates the main cone shape
        let r = config.radius * (1 - t);

        // Apply "Bough" logic: modify radius based on sine wave of height to create layers
        // Only for leaves to create shape, ornaments follow closely
        const branchOut = Math.sin(t * Math.PI * layers * 2); 
        if (type === 'LEAF') {
            r += (branchOut * 0.8) * (1-t); // Bulge out at layers, less at top
        } else {
            r += (branchOut * 0.8) * (1-t) + 0.2; // Ornaments hang on tips
        }

        // Phylotaxis spiral for distribution
        const theta = i * goldenAngle;
        
        // Randomness (Leaves are messier, Ornaments are cleaner)
        const randomness = type === 'LEAF' ? 0.6 : 0.1;
        
        const x = Math.cos(theta) * r + (Math.random() - 0.5) * randomness;
        const z = Math.sin(theta) * r + (Math.random() - 0.5) * randomness;
        const y = layerHeight + (Math.random() - 0.5) * randomness * 0.5;

        treePos.set(x, y, z);
        
        treeRot.set(
            (Math.random() - 0.5) * Math.PI * 0.5, // Tilt
            Math.random() * Math.PI * 2,           // Spin
            (Math.random() - 0.5) * Math.PI * 0.5  // Tilt
        );
        
        scale = type === 'LEAF' ? Math.random() * 0.5 + 0.5 : Math.random() * 0.8 + 0.6;
    }

    // --- 2. SCATTER POSITION (Random Sphere) ---
    const scatterRadius = 35;
    const u = Math.random();
    const v = Math.random();
    const thetaScatter = 2 * Math.PI * u;
    const phiScatter = Math.acos(2 * v - 1);
    
    const sx = scatterRadius * Math.sin(phiScatter) * Math.cos(thetaScatter);
    const sy = scatterRadius * Math.sin(phiScatter) * Math.sin(thetaScatter);
    const sz = scatterRadius * Math.cos(phiScatter);
    
    const scatterPos = new THREE.Vector3(sx, sy, sz);
    const scatterRot = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    // --- 3. COLORS ---
    let color = new THREE.Color();

    if (type === 'LEAF') {
        // Base: Dark Emerald
        color.set(config.colorPrimary);
        
        // Frost logic: If particle is on the outer edge (radius), make it white/silver
        const dist = Math.sqrt(treePos.x * treePos.x + treePos.z * treePos.z);
        const maxDistAtHeight = config.radius * (1 - t) + (Math.sin(t * Math.PI * 8 * 2) * 0.8 * (1-t));
        
        // If near the tip of the branch -> Snow
        if (dist > maxDistAtHeight - 1.0) {
            // Mix white into green
            color.lerp(new THREE.Color('#E0F7FA'), Math.random() * 0.8); 
        } else {
             // Darker interior
             color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
        }
    } else if (type === 'ORNAMENT') {
        // Palette: Gold, Ruby Red, Crystal
        const rand = Math.random();
        if (rand < 0.4) {
            color.set('#FFD700'); // Gold
        } else if (rand < 0.7) {
            color.set('#D70040'); // Ruby Red
            color.offsetHSL(0, 0, -0.1); // Slightly deeper red
        } else {
            color.set('#F0FFFF'); // Crystal/Diamond
        }
    } else if (type === 'LIGHT') {
        // Warm Light
        color.set('#FFD27F'); 
    }

    particles.push({
      id: i,
      treePosition: treePos,
      treeRotation: treeRot,
      scatterPosition: scatterPos,
      scatterRotation: scatterRot,
      scale: scale,
      color: color
    });
  }

  return particles;
};