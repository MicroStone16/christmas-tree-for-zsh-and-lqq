import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  // The target position when forming the tree
  treePosition: THREE.Vector3;
  // The target rotation when forming the tree
  treeRotation: THREE.Euler;
  // The random position in space
  scatterPosition: THREE.Vector3;
  // The random rotation in space
  scatterRotation: THREE.Euler;
  // Scale of the particle
  scale: number;
  // Base color (for slight variation)
  color: THREE.Color;
}

export interface TreeConfig {
  count: number;
  radius: number;
  height: number;
  colorPrimary: string;
  colorSecondary: string;
}