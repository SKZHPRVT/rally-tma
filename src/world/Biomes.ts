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
  rockColor: number;
  buildingColor: number;
  mountainColor: number;
  fogColor: number;
  backgroundColor: number;
  
  treeCount: number;
  rockCount: number;
  buildingCount: number;
  mountainCount: number;
  
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
    rockColor:        0x808080,
    buildingColor:    0xa08060,
    mountainColor:    0x6a7a5a,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 500,
    rockCount: 60,
    buildingCount: 0,
    mountainCount: 12,
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
    rockColor:        0x808080,
    buildingColor:    0xb09070,
    mountainColor:    0x6a7a5a,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 700,
    rockCount: 80,
    buildingCount: 30,
    mountainCount: 15,
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
    treeLeafColor:    0x8a7a4a,
    rockColor:        0xb8a080,
    buildingColor:    0xc0a080,
    mountainColor:    0xc8a878,
    fogColor:         0xd4a878,
    backgroundColor:  0xd4a878,
    treeCount: 200,
    rockCount: 150,
    buildingCount: 15,
    mountainCount: 20,
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
    rockColor:        0x909090,
    buildingColor:    0x9a8a7a,
    mountainColor:    0x7a8a7a,
    fogColor:         0xa8b0bd,
    backgroundColor:  0xa8b0bd,
    treeCount: 400,
    rockCount: 200,
    buildingCount: 10,
    mountainCount: 25,
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
    rockColor:        0x808080,
    buildingColor:    0xc0c0c0,
    mountainColor:    0x7a8a7a,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 500,
    rockCount: 40,
    buildingCount: 60,
    mountainCount: 10,
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
    rockColor:        0xa89878,
    buildingColor:    0xc0a888,
    mountainColor:    0xb89888,
    fogColor:         0xd8b888,
    backgroundColor:  0xd8b888,
    treeCount: 600,
    rockCount: 120,
    buildingCount: 25,
    mountainCount: 18,
    roadWidth: 14.5,
  },
};

export const BIOME_IDS: BiomeId[] = [
  'classic',
  'forest',
  'desert',
  'mountains',
  'asphalt',
  'mix',
];
