/**
 * Procedural Terrain Generator for KidCode Studio
 * Generate infinite worlds with biomes, caves, and structures
 */

export type BiomeType = 'forest' | 'desert' | 'snow' | 'ocean' | 'mountain' | 'plains' | 'volcano' | 'jungle';

export interface TerrainConfig {
  seed: number;
  width: number;
  height: number;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seaLevel: number;
}

export interface TerrainTile {
  x: number;
  y: number;
  height: number;
  biome: BiomeType;
  type: 'grass' | 'sand' | 'snow' | 'rock' | 'water' | 'lava' | 'dirt' | 'stone';
  decoration?: 'tree' | 'rock' | 'flower' | 'cactus' | 'mushroom';
  structure?: 'cave' | 'dungeon' | 'chest' | 'house';
}

export interface GeneratedTerrain {
  tiles: TerrainTile[][];
  width: number;
  height: number;
  seed: number;
}

/**
 * Simplex Noise implementation (simplified)
 */
class SimplexNoise {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }

  noise2D(x: number, y: number): number {
    // Simplified noise function
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  octaveNoise(x: number, y: number, octaves: number, persistence: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

/**
 * Generate terrain with noise-based heightmap
 */
export const generateTerrain = (config: TerrainConfig): GeneratedTerrain => {
  const noise = new SimplexNoise(config.seed);
  const tiles: TerrainTile[][] = [];

  for (let y = 0; y < config.height; y++) {
    tiles[y] = [];
    for (let x = 0; x < config.width; x++) {
      // Generate height using octave noise
      const nx = x / config.scale;
      const ny = y / config.scale;
      
      const height = noise.octaveNoise(nx, ny, config.octaves, config.persistence);
      const normalizedHeight = height * 2 - 1; // Normalize to -1 to 1

      // Determine biome based on height and position
      const biome = determineBiome(normalizedHeight, x, y, config);
      
      // Determine tile type based on biome and height
      const type = determineTileType(biome, normalizedHeight, config.seaLevel);
      
      // Add decorations
      const decoration = shouldAddDecoration(biome, noise.noise2D(x * 0.1, y * 0.1));
      
      // Add structures
      const structure = shouldAddStructure(noise.noise2D(x * 0.05, y * 0.05));

      tiles[y][x] = {
        x,
        y,
        height: normalizedHeight,
        biome,
        type,
        decoration,
        structure
      };
    }
  }

  return {
    tiles,
    width: config.width,
    height: config.height,
    seed: config.seed
  };
};

/**
 * Determine biome based on height and position
 */
const determineBiome = (height: number, x: number, y: number, config: TerrainConfig): BiomeType => {
  // Temperature noise (varies with x position)
  const tempNoise = Math.sin(x * 0.01 + config.seed);
  
  // Moisture noise (varies with y position)
  const moistureNoise = Math.cos(y * 0.01 + config.seed);

  if (height < config.seaLevel - 0.2) return 'ocean';
  if (height < config.seaLevel) return 'plains';
  
  if (height > 0.7) {
    return tempNoise > 0 ? 'volcano' : 'snow';
  }
  
  if (tempNoise > 0.5 && moistureNoise < -0.5) return 'desert';
  if (tempNoise > 0.3 && moistureNoise > 0.5) return 'jungle';
  if (tempNoise < -0.5) return 'snow';
  if (height > 0.4) return 'mountain';
  
  return 'forest';
};

/**
 * Determine tile type based on biome
 */
const determineTileType = (biome: BiomeType, height: number, seaLevel: number): string => {
  switch (biome) {
    case 'ocean': return 'water';
    case 'desert': return 'sand';
    case 'snow': return 'snow';
    case 'volcano': return height > 0.8 ? 'lava' : 'rock';
    case 'mountain': return height > 0.6 ? 'snow' : 'rock';
    case 'forest':
    case 'jungle': return height > seaLevel ? 'grass' : 'dirt';
    case 'plains': return 'grass';
    default: return 'grass';
  }
};

/**
 * Determine if decoration should be added
 */
const shouldAddDecoration = (biome: BiomeType, noise: number): TerrainTile['decoration'] => {
  if (noise > 0.7) {
    switch (biome) {
      case 'forest': return 'tree';
      case 'desert': return 'cactus';
      case 'plains': return Math.random() > 0.5 ? 'flower' : 'rock';
      case 'jungle': return 'mushroom';
      default: return undefined;
    }
  }
  return undefined;
};

/**
 * Determine if structure should be added
 */
const shouldAddStructure = (noise: number): TerrainTile['structure'] => {
  if (noise > 0.9) return 'cave';
  if (noise > 0.85) return 'chest';
  if (noise > 0.95) return 'dungeon';
  return undefined;
};

/**
 * Generate cave system using cellular automata
 */
export const generateCaves = (terrain: GeneratedTerrain, density: number = 0.45): GeneratedTerrain => {
  const { tiles, width, height } = terrain;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const noise = Math.random();
      if (noise < density && tiles[y][x].height < 0.5) {
        tiles[y][x].structure = 'cave';
        tiles[y][x].type = 'stone';
        
        // Expand cave slightly
        const neighbors = [
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];
        
        neighbors.forEach(({ dx, dy }) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (Math.random() < 0.5) {
              tiles[ny][nx].structure = 'cave';
            }
          }
        });
      }
    }
  }

  return terrain;
};

/**
 * Generate structures (houses, dungeons, etc.)
 */
export const generateStructures = (terrain: GeneratedTerrain): GeneratedTerrain => {
  const { tiles, width, height } = terrain;

  // Place houses in plains/forest
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles[y][x];
      if ((tile.biome === 'plains' || tile.biome === 'forest') && 
          tile.height > 0 && 
          Math.random() < 0.01) {
        tile.structure = 'house';
      }
    }
  }

  // Place dungeons in mountains
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tiles[y][x];
      if (tile.biome === 'mountain' && Math.random() < 0.005) {
        tile.structure = 'dungeon';
      }
    }
  }

  return terrain;
};

/**
 * Convert terrain to game blocks
 */
export const terrainToGameBlocks = (terrain: GeneratedTerrain): any[] => {
  const blocks: any[] = [];

  terrain.tiles.forEach(row => {
    row.forEach(tile => {
      // Add platform/block based on tile type
      if (tile.type !== 'water' && tile.type !== 'lava') {
        blocks.push({
          type: 'ADD_PLATFORM',
          params: {
            x: tile.x * 40,
            y: tile.y * 40,
            width: 40,
            height: 40,
            tileType: tile.type
          }
        });
      }

      // Add decoration
      if (tile.decoration) {
        blocks.push({
          type: 'SPAWN_ITEM',
          params: {
            x: tile.x * 40 + 20,
            y: tile.y * 40 - 20,
            text: getDecorationEmoji(tile.decoration)
          }
        });
      }

      // Add structure
      if (tile.structure === 'chest') {
        blocks.push({
          type: 'SPAWN_ITEM',
          params: {
            x: tile.x * 40 + 20,
            y: tile.y * 40 - 20,
            text: '📦'
          }
        });
      }
    });
  });

  return blocks;
};

/**
 * Get emoji for decoration type
 */
const getDecorationEmoji = (decoration: string): string => {
  switch (decoration) {
    case 'tree': return '🌲';
    case 'rock': return '🪨';
    case 'flower': return '🌸';
    case 'cactus': return '🌵';
    case 'mushroom': return '🍄';
    default: return '🌿';
  }
};

/**
 * Preset terrain configurations
 */
export const TERRAIN_PRESETS = {
  small: {
    seed: Math.random() * 10000,
    width: 50,
    height: 30,
    scale: 10,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    seaLevel: 0
  },
  medium: {
    seed: Math.random() * 10000,
    width: 100,
    height: 50,
    scale: 15,
    octaves: 5,
    persistence: 0.5,
    lacunarity: 2,
    seaLevel: 0
  },
  large: {
    seed: Math.random() * 10000,
    width: 200,
    height: 100,
    scale: 20,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2,
    seaLevel: 0
  },
  islands: {
    seed: Math.random() * 10000,
    width: 100,
    height: 100,
    scale: 20,
    octaves: 4,
    persistence: 0.6,
    lacunarity: 2,
    seaLevel: 0.3
  },
  mountains: {
    seed: Math.random() * 10000,
    width: 100,
    height: 50,
    scale: 8,
    octaves: 6,
    persistence: 0.6,
    lacunarity: 2,
    seaLevel: -0.2
  }
};

/**
 * Generate infinite terrain chunk
 */
export const generateTerrainChunk = (
  chunkX: number,
  chunkY: number,
  config: TerrainConfig
): GeneratedTerrain => {
  const chunkSize = 16;
  const chunkConfig = {
    ...config,
    width: chunkSize,
    height: chunkSize
  };

  const terrain = generateTerrain(chunkConfig);

  // Offset tiles to chunk position
  terrain.tiles.forEach(row => {
    row.forEach(tile => {
      tile.x += chunkX * chunkSize;
      tile.y += chunkY * chunkSize;
    });
  });

  return terrain;
};

/**
 * Get height at specific position
 */
export const getHeightAt = (x: number, y: number, config: TerrainConfig): number => {
  const noise = new SimplexNoise(config.seed);
  const nx = x / config.scale;
  const ny = y / config.scale;
  
  const height = noise.octaveNoise(nx, ny, config.octaves, config.persistence);
  return height * 2 - 1;
};

/**
 * Get biome at specific position
 */
export const getBiomeAt = (x: number, y: number, config: TerrainConfig): BiomeType => {
  const height = getHeightAt(x, y, config);
  return determineBiome(height, x, y, config);
};
