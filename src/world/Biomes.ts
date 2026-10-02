export type BiomeId = 'classic' | 'forest' | 'desert' | 'mountains' | 'asphalt' | 'mix';

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  emoji: string;
  
  groundTexture: string | null;
  roadTexture: string;
  bankTexture: string | null;
  skyTexture: string;
  
  groundColor: number;
  treeTrunkColor: number;
  treeLeafColor: number;
  fogColor: number;
  backgroundColor: number;
  
  treeCount: number;
  roadWidth: number;
}

export const BIOMES: Record<BiomeId, BiomeConfig> = {
  classic: {
    id: 'classic',
    name: 'Классика',
    emoji: '🎯',
    groundTexture: null,
    roadTexture:   './assets/cmr/track/classic_road.png',
    bankTexture:   null,
    skyTexture:    './assets/cmr/sky/classic_sky.png',
    groundColor:      0x5a6b3a,
    treeTrunkColor:   0x4a3520,
    treeLeafColor:    0x2d5016,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 250,
    roadWidth: 13.5,
  },
  
  forest: {
    id: 'forest',
    name: 'Лес',
    emoji: '🌲',
    groundTexture: './assets/cmr/track/forest_ground.png',
    roadTexture:   './assets/cmr/track/forest_road.png',
    bankTexture:   './assets/cmr/track/forest_bank.png',
    skyTexture:    './assets/cmr/sky/sky_forest.png',
    groundColor:      0xffffff,
    treeTrunkColor:   0x4a3520,
    treeLeafColor:    0x2d5016,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 400,
    roadWidth: 13.5,
  },
  
  desert: {
    id: 'desert',
    name: 'Пустыня',
    emoji: '🏜',
    groundTexture: './assets/cmr/track/desert_ground.png',
    roadTexture:   './assets/cmr/track/desert_road.png',
    bankTexture:   './assets/cmr/track/desert_bank.png',
    skyTexture:    './assets/cmr/sky/sky_desert.png',
    groundColor:      0xd4a878,
    treeTrunkColor:   0x6b4a2a,
    treeLeafColor:    0x6b7a3a,
    fogColor:         0xd4a878,
    backgroundColor:  0xd4a878,
    treeCount: 200,
    roadWidth: 13.5,
  },
  
  mountains: {
    id: 'mountains',
    name: 'Горы',
    emoji: '⛰',
    groundTexture: './assets/cmr/track/mountains_ground.png',
    roadTexture:   './assets/cmr/track/mountains_road.png',
    bankTexture:   './assets/cmr/track/mountains_bank.png',
    skyTexture:    './assets/cmr/sky/sky_forest.png',
    groundColor:      0x8a8a7a,
    treeTrunkColor:   0x3a2a1a,
    treeLeafColor:    0x2a3a1a,
    fogColor:         0xa8b0bd,
    backgroundColor:  0xa8b0bd,
    treeCount: 300,
    roadWidth: 13.5,
  },
  
  asphalt: {
    id: 'asphalt',
    name: 'Асфальт',
    emoji: '🛣',
    groundTexture: './assets/cmr/track/asphalt_ground.png',
    roadTexture:   './assets/cmr/track/asphalt_road.png',
    bankTexture:   './assets/cmr/track/asphalt_bank.png',
    skyTexture:    './assets/cmr/sky/sky_forest.png',
    groundColor:      0x6a7a4a,
    treeTrunkColor:   0x4a3520,
    treeLeafColor:    0x2d5016,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 250,
    roadWidth: 15,
  },
  
  mix: {
    id: 'mix',
    name: 'Микс',
    emoji: '🎨',
    groundTexture: './assets/cmr/track/desert_bank.png',
    roadTexture:   './assets/cmr/track/forest_road.png',
    bankTexture:   './assets/cmr/track/forest_bank.png',
    skyTexture:    './assets/cmr/sky/sky_desert.png',
    groundColor:      0xb89878,
    treeTrunkColor:   0x5a3a22,
    treeLeafColor:    0x4a6a2a,
    fogColor:         0xd8b888,
    backgroundColor:  0xd8b888,
    treeCount: 350,
    roadWidth: 14.5,
  },
};

// РАВНЫЕ ШАНСЫ — все биомы по одному разу
export const BIOME_IDS: BiomeId[] = [
  'classic',
  'forest',
  'desert',
  'mountains',
  'asphalt',
  'mix',
];
