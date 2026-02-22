
import { Vector3 } from 'three';

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

// Mock AI Generator (In production, this would call Gemini with a structured prompt)
export const generateVoxelsFromPrompt = async (prompt: string): Promise<Voxel[]> => {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const voxels: Voxel[] = [];
  const color = prompt.includes('lava') ? '#ef4444' : prompt.includes('ice') ? '#bae6fd' : '#22c55e';
  
  // Basic procedural generation based on keywords
  // "Castle" -> Towers
  if (prompt.includes('castle')) {
      for(let x = -5; x <= 5; x++) {
          for(let z = -5; z <= 5; z++) {
              // Floor
              voxels.push({ x, y: 0, z, color: '#94a3b8' });
              // Walls
              if (Math.abs(x) === 5 || Math.abs(z) === 5) {
                  for(let y = 1; y < 4; y++) voxels.push({ x, y, z, color: '#64748b' });
                  // Crenellations
                  if (x % 2 === 0 && z % 2 === 0) voxels.push({ x, y: 4, z, color: '#475569' });
              }
          }
      }
  } 
  // "Tree" -> Organic shapes
  else if (prompt.includes('tree')) {
      // Trunk
      for(let y = 0; y < 5; y++) voxels.push({ x: 0, y, z: 0, color: '#78350f' });
      // Leaves
      for(let x = -2; x <= 2; x++) {
          for(let y = 3; y <= 6; y++) {
              for(let z = -2; z <= 2; z++) {
                  if (Math.random() > 0.3) voxels.push({ x, y, z, color: '#22c55e' });
              }
          }
      }
  }
  // Default: Random Terrain
  else {
      for(let x = -10; x <= 10; x++) {
          for(let z = -10; z <= 10; z++) {
              const height = Math.floor(Math.sin(x * 0.2) * Math.cos(z * 0.2) * 3 + 3);
              for(let y = 0; y < height; y++) {
                  voxels.push({ x, y, z, color });
              }
          }
      }
  }

  return voxels;
};
