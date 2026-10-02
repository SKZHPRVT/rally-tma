export type BiomeId = 'forest' | 'desert' | 'mountains' | 'asphalt';

export interface BiomeConfig {
  id: BiomeId;
  name: string;
  emoji: string;
  
  groundTexture: string;
  roadTexture: string;
  bankTexture: string;
  skyTexture: string;
  
  groundColor: number;   // тон поверх текстуры (0xffffff = без изменений)
  treeTrunkColor: number;
  treeLeafColor: number;
  fogColor: number;
  backgroundColor: number;
  
  treeCount: number;
  roadWidth: number;
}

export const BIOMES: Record<BiomeId, BiomeConfig> = {
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
    groundColor:      0xd4a878,  // тёплый песок
    treeTrunkColor:   0x6b4a2a,
    treeLeafColor:    0x6b7a3a,  // сухая зелень
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
    groundColor:      0x8a8a7a,  // серо-каменный
    treeTrunkColor:   0x3a2a1a,
    treeLeafColor:    0x2a3a1a,  // тёмная зелень
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
    groundColor:      0x6a7a4a,  // зелёная трава
    treeTrunkColor:   0x4a3520,
    treeLeafColor:    0x2d5016,
    fogColor:         0x87ceeb,
    backgroundColor:  0x87ceeb,
    treeCount: 250,
    roadWidth: 15,   // асфальт шире
  },
};

export const BIOME_IDS: BiomeId[] = ['forest', 'desert', 'mountains', 'asphalt'];
