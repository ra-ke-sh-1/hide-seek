export interface WorldTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'school' | 'outdoor' | 'futuristic' | 'fantasy' | 'urban';
  blocks: Array<{
    type: string;
    position: { x: number; y: number };
    rotation: number;
    properties: any;
  }>;
  spawnPoints: Array<{ x: number; y: number }>;
  recommendedSettings: {
    maxPlayers: number;
    seekerCount: number;
    roundTime: number;
  };
}

export const worldTemplates: WorldTemplate[] = [
  {
    id: 'school_classic',
    name: 'Classic School',
    description: 'Traditional school layout with classrooms, hallways, and lockers',
    thumbnail: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg',
    category: 'school',
    blocks: [
      // Classroom walls
      { type: 'wall', position: { x: 20, y: 20 }, rotation: 0, properties: {} },
      { type: 'wall', position: { x: 40, y: 20 }, rotation: 0, properties: {} },
      { type: 'wall', position: { x: 60, y: 20 }, rotation: 0, properties: {} },
      { type: 'wall', position: { x: 80, y: 20 }, rotation: 0, properties: {} },
      { type: 'wall', position: { x: 100, y: 20 }, rotation: 0, properties: {} },
      
      // Doors
      { type: 'door', position: { x: 40, y: 60 }, rotation: 0, properties: {} },
      { type: 'door', position: { x: 80, y: 60 }, rotation: 0, properties: {} },
      
      // Hiding spots
      { type: 'locker', position: { x: 20, y: 100 }, rotation: 0, properties: {} },
      { type: 'locker', position: { x: 60, y: 100 }, rotation: 0, properties: {} },
      { type: 'locker', position: { x: 100, y: 100 }, rotation: 0, properties: {} },
    ],
    spawnPoints: [
      { x: 50, y: 150 },
      { x: 90, y: 150 },
    ],
    recommendedSettings: {
      maxPlayers: 8,
      seekerCount: 2,
      roundTime: 180,
    },
  },
  {
    id: 'park_playground',
    name: 'Playground Park',
    description: 'Outdoor park with playground equipment and natural hiding spots',
    thumbnail: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg',
    category: 'outdoor',
    blocks: [
      // Trees
      { type: 'tree', position: { x: 30, y: 40 }, rotation: 0, properties: {} },
      { type: 'tree', position: { x: 70, y: 30 }, rotation: 0, properties: {} },
      { type: 'tree', position: { x: 110, y: 50 }, rotation: 0, properties: {} },
      { type: 'tree', position: { x: 150, y: 35 }, rotation: 0, properties: {} },
      
      // Playground equipment (using buildings as placeholders)
      { type: 'building', position: { x: 60, y: 80 }, rotation: 0, properties: { name: 'slide' } },
      { type: 'building', position: { x: 100, y: 90 }, rotation: 0, properties: { name: 'swing' } },
      
      // Hiding spots
      { type: 'barrel', position: { x: 40, y: 120 }, rotation: 0, properties: {} },
      { type: 'barrel', position: { x: 120, y: 110 }, rotation: 0, properties: {} },
    ],
    spawnPoints: [
      { x: 80, y: 140 },
      { x: 120, y: 140 },
    ],
    recommendedSettings: {
      maxPlayers: 10,
      seekerCount: 2,
      roundTime: 240,
    },
  },
  {
    id: 'neon_arcade',
    name: 'Neon Arcade',
    description: 'Futuristic arcade with glowing machines and tech hiding spots',
    thumbnail: 'https://images.pexels.com/photos/2796154/pexels-photo-2796154.jpeg',
    category: 'futuristic',
    blocks: [
      // Arcade machines (using buildings)
      { type: 'building', position: { x: 40, y: 40 }, rotation: 0, properties: { name: 'arcade1' } },
      { type: 'building', position: { x: 80, y: 40 }, rotation: 0, properties: { name: 'arcade2' } },
      { type: 'building', position: { x: 120, y: 40 }, rotation: 0, properties: { name: 'arcade3' } },
      { type: 'building', position: { x: 40, y: 100 }, rotation: 0, properties: { name: 'arcade4' } },
      { type: 'building', position: { x: 80, y: 100 }, rotation: 0, properties: { name: 'arcade5' } },
      { type: 'building', position: { x: 120, y: 100 }, rotation: 0, properties: { name: 'arcade6' } },
      
      // Tech hiding spots
      { type: 'barrel', position: { x: 160, y: 60 }, rotation: 0, properties: { name: 'server_rack' } },
      { type: 'barrel', position: { x: 160, y: 120 }, rotation: 0, properties: { name: 'power_unit' } },
    ],
    spawnPoints: [
      { x: 20, y: 70 },
      { x: 140, y: 130 },
    ],
    recommendedSettings: {
      maxPlayers: 8,
      seekerCount: 1,
      roundTime: 200,
    },
  },
];

export function getTemplateByCategory(category: string): WorldTemplate[] {
  return worldTemplates.filter(template => template.category === category);
}

export function getTemplateById(id: string): WorldTemplate | undefined {
  return worldTemplates.find(template => template.id === id);
}

export function applyTemplate(template: WorldTemplate) {
  return {
    name: template.name,
    description: template.description,
    blocks: template.blocks.map(block => ({
      ...block,
      id: uuid.v4() as string,
    })),
    spawnPoints: template.spawnPoints,
    settings: template.recommendedSettings,
  };
}