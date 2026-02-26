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
  theme?: string;
}

export interface TerrainTile {
  x: number;
  y: number;
  height: number;
  biome: BiomeType;
  type: 'grass' | 'sand' | 'snow' | 'rock' | 'water' | 'lava' | 'dirt' | 'stone';
  decoration?: 'tree' | 'rock' | 'flower' | 'cactus' | 'mushroom' | 'pine_tree' | 'palm_tree' | 'birch_tree' | 'bush' | 'tall_grass' | 'rock_large' | 'dead_bush' | 'crystal';
  structure?: 'cave' | 'dungeon' | 'chest' | 'house';
}

export interface GeneratedTerrain {
  tiles: TerrainTile[][];
  width: number;
  height: number;
  seed: number;
}

/**
 * Coherent Simplex Noise implementation
 */
class SimplexNoise {
  private p: Uint8Array;
  private perm: Uint8Array;
  private gradP: Int8Array;

  constructor(seed: number) {
    const random = this.splitmix32(seed);
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = i;

    for (let i = 255; i > 0; i--) {
      const r = Math.floor(random() * (i + 1));
      [this.p[i], this.p[r]] = [this.p[r], this.p[i]];
    }

    this.perm = new Uint8Array(512);
    this.gradP = new Int8Array(512);
    const grads = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];

    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      const g = grads[this.perm[i] % 12];
      this.gradP[i] = g[0]; // Interleaved grad components would be better but this is fine
    }
  }

  private splitmix32(a: number) {
    return () => {
      a |= 0; a = a + 0x9e3779b9 | 0;
      let t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
      t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
  }

  private F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  noise2D(xin: number, yin: number): number {
    let n0, n1, n2;
    const s = (xin + yin) * this.F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * this.G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1.0 + 2.0 * this.G2;
    const y2 = y0 - 1.0 + 2.0 * this.G2;

    const ii = i & 255;
    const jj = j & 255;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      const gi0 = (this.perm[ii + this.perm[jj]] % 12) * 2;
      n0 = t0 * t0 * (this.getGradX(gi0) * x0 + this.getGradY(gi0) * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      const gi1 = (this.perm[ii + i1 + this.perm[jj + j1]] % 12) * 2;
      n1 = t1 * t1 * (this.getGradX(gi1) * x1 + this.getGradY(gi1) * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      const gi2 = (this.perm[ii + 1 + this.perm[jj + 1]] % 12) * 2;
      n2 = t2 * t2 * (this.getGradX(gi2) * x2 + this.getGradY(gi2) * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  private getGradX(gi: number): number {
    const grads = [1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 1, 0, -1, 0, 0, 1, 0, -1, 0, 1, 0, -1];
    return grads[gi];
  }

  private getGradY(gi: number): number {
    const grads = [1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 1, 0, -1, 0, 0, 1, 0, -1, 0, 1, 0, -1];
    return grads[gi + 1];
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

    return (total / maxValue + 1) / 2; // Normalize to 0-1
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

  // Theme-based overrides
  if (config.theme) {
    const theme = config.theme.toLowerCase();
    if (theme.includes('snow') || theme.includes('ice') || theme.includes('frozen') || theme.includes('arctic')) return 'snow';
    if (theme.includes('desert') || theme.includes('sand') || theme.includes('dune')) return 'desert';
    if (theme.includes('jungle') || theme.includes('tropical') || theme.includes('rainforest')) return 'jungle';
    if (theme.includes('mountain') || theme.includes('peak') || theme.includes('highland')) return 'mountain';
    if (theme.includes('volcano') || theme.includes('lava') || theme.includes('fire') || theme.includes('magma')) return 'volcano';
    if (theme.includes('forest') || theme.includes('wood') || theme.includes('tree')) return 'forest';
    if (theme.includes('ocean') || theme.includes('water') || theme.includes('sea') || theme.includes('island')) {
      if (height < config.seaLevel) return 'ocean';
      return 'plains';
    }
  }

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
const determineTileType = (biome: BiomeType, height: number, seaLevel: number): TerrainTile['type'] => {
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
  // Use noise for clustering (0.7-1.0 range usually means "cluttered")
  if (noise > 0.6) {
    switch (biome) {
      case 'forest':
        if (noise > 0.85) return 'tree';
        if (noise > 0.75) return 'birch_tree';
        return 'bush';
      case 'desert':
        if (noise > 0.9) return 'cactus';
        return 'dead_bush';
      case 'snow':
        if (noise > 0.8) return 'pine_tree';
        return 'rock';
      case 'mountain':
        if (noise > 0.9) return 'rock_large';
        return 'rock';
      case 'plains':
        if (noise > 0.9) return 'tree';
        if (noise > 0.8) return 'flower';
        return 'tall_grass';
      case 'jungle':
        if (noise > 0.8) return 'tree';
        if (noise > 0.7) return 'mushroom';
        return 'bush';
      case 'volcano':
        if (noise > 0.9) return 'rock_large';
        return 'rock';
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
    case 'tree': return '🌳';
    case 'pine_tree': return '🌲';
    case 'palm_tree': return '🌴';
    case 'birch_tree': return '🌳';
    case 'bush': return '🌿';
    case 'tall_grass': return '🌱';
    case 'rock': return '🪨';
    case 'rock_large': return '⛰️';
    case 'flower': return '🌸';
    case 'cactus': return '🌵';
    case 'mushroom': return '🍄';
    case 'dead_bush': return '🎋';
    case 'crystal': return '💎';
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
