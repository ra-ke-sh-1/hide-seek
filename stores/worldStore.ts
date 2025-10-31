import { create } from 'zustand';

interface Block {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  properties: any;
}

interface World {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  thumbnail: string;
  blocks: Block[];
  spawnPoints: { x: number; y: number }[];
  playCount: number;
  rating: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface WorldStore {
  currentWorld: World | null;
  savedWorlds: World[];
  featuredWorlds: World[];
  isBuilding: boolean;
  selectedBlock: string | null;
  
  // Actions
  createWorld: (name: string, description: string) => void;
  saveWorld: (world: World) => void;
  loadWorld: (worldId: string) => void;
  deleteWorld: (worldId: string) => void;
  addBlock: (block: Block) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  setSelectedBlock: (blockType: string | null) => void;
  generateFromPrompt: (prompt: string) => Promise<World>;
  publishWorld: (worldId: string) => void;
  loadFeaturedWorlds: () => void;
  rateWorld: (worldId: string, rating: number) => void;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  currentWorld: null,
  savedWorlds: [],
  featuredWorlds: [],
  isBuilding: false,
  selectedBlock: null,

  createWorld: (name, description) =>
    set(() => ({
      currentWorld: {
        id: `world_${Date.now()}`,
        name,
        description,
        creatorId: 'current_user',
        creatorName: 'You',
        thumbnail: '',
        blocks: [],
        spawnPoints: [{ x: 50, y: 50 }],
        playCount: 0,
        rating: 0,
        isPublic: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isBuilding: true,
    })),

  saveWorld: (world) =>
    set((state) => ({
      savedWorlds: state.savedWorlds.some(w => w.id === world.id) 
        ? state.savedWorlds.map(w => w.id === world.id ? world : w)
        : [...state.savedWorlds, world],
      currentWorld: world,
    })),

  loadWorld: (worldId) => {
    const world = get().savedWorlds.find(w => w.id === worldId);
    if (world) {
      set({ currentWorld: world, isBuilding: true });
    }
  },

  deleteWorld: (worldId) =>
    set((state) => ({
      savedWorlds: state.savedWorlds.filter(w => w.id !== worldId),
      currentWorld: state.currentWorld?.id === worldId ? null : state.currentWorld,
    })),

  addBlock: (block) =>
    set((state) => ({
      currentWorld: state.currentWorld
        ? {
            ...state.currentWorld,
            blocks: [...state.currentWorld.blocks, block],
            updatedAt: new Date().toISOString(),
          }
        : null,
    })),

  removeBlock: (blockId) =>
    set((state) => ({
      currentWorld: state.currentWorld
        ? {
            ...state.currentWorld,
            blocks: state.currentWorld.blocks.filter(b => b.id !== blockId),
            updatedAt: new Date().toISOString(),
          }
        : null,
    })),

  updateBlock: (blockId, updates) =>
    set((state) => ({
      currentWorld: state.currentWorld
        ? {
            ...state.currentWorld,
            blocks: state.currentWorld.blocks.map(b =>
              b.id === blockId ? { ...b, ...updates } : b
            ),
            updatedAt: new Date().toISOString(),
          }
        : null,
    })),

  setSelectedBlock: (blockType) => set({ selectedBlock: blockType }),

  generateFromPrompt: async (prompt) => {
    // Simulate AI generation - in production this would call an AI service
    return new Promise<World>((resolve) => {
      setTimeout(() => {
        const generatedWorld: World = {
          id: `ai_world_${Date.now()}`,
          name: `${prompt.split(' ').slice(0, 3).join(' ')} World`,
          description: `AI-generated world from prompt: "${prompt}"`,
          creatorId: 'current_user',
          creatorName: 'You',
          thumbnail: '',
          blocks: [
            { id: '1', type: 'wall', position: { x: 20, y: 20 }, rotation: 0, properties: {} },
            { id: '2', type: 'door', position: { x: 60, y: 20 }, rotation: 0, properties: {} },
            { id: '3', type: 'tree', position: { x: 100, y: 60 }, rotation: 0, properties: {} },
            { id: '4', type: 'hiding_spot', position: { x: 140, y: 100 }, rotation: 0, properties: { type: 'locker' } },
          ],
          spawnPoints: [{ x: 40, y: 40 }],
          playCount: 0,
          rating: 0,
          isPublic: false,
          tags: ['ai-generated'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(generatedWorld);
      }, 2000);
    });
  },

  publishWorld: (worldId) =>
    set((state) => ({
      savedWorlds: state.savedWorlds.map(w =>
        w.id === worldId ? { ...w, isPublic: true } : w
      ),
    })),

  loadFeaturedWorlds: () => {
    // In production, this would fetch from Supabase
    const featured: World[] = [
      {
        id: '1',
        name: 'School Mayhem',
        description: 'Classic school setting with classrooms and hallways',
        creatorId: 'creator1',
        creatorName: 'BuilderPro',
        thumbnail: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg',
        blocks: [],
        spawnPoints: [],
        playCount: 234,
        rating: 4.8,
        isPublic: true,
        tags: ['school', 'classic'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        name: 'Neon Arcade',
        description: 'Futuristic arcade with glowing hiding spots',
        creatorId: 'creator2',
        creatorName: 'NeonMaster',
        thumbnail: 'https://images.pexels.com/photos/2796154/pexels-photo-2796154.jpeg',
        blocks: [],
        spawnPoints: [],
        playCount: 189,
        rating: 4.9,
        isPublic: true,
        tags: ['futuristic', 'arcade'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    
    set({ featuredWorlds: featured });
  },

  rateWorld: (worldId, rating) =>
    set((state) => ({
      featuredWorlds: state.featuredWorlds.map(w =>
        w.id === worldId ? { ...w, rating } : w
      ),
    })),
}));