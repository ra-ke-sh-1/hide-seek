import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
  seekerDen?: { x: number; y: number };
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
  loadSavedWorlds: () => void;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  currentWorld: null,
  savedWorlds: [],
  featuredWorlds: [],
  isBuilding: false,
  selectedBlock: null,

  // Initialize store and load saved worlds
  loadSavedWorlds: async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user logged in, loading from localStorage only');
        const saved = localStorage.getItem('savedWorlds');
        if (saved) {
          const worlds = JSON.parse(saved);
          set({ savedWorlds: worlds });
        }
        return;
      }

      // Load worlds from database
      const { data: dbWorlds, error } = await supabase
        .from('worlds')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        console.error('Failed to load worlds from database:', error);
        throw error;
      }

      // Transform database format to app format
      const worlds: World[] = (dbWorlds || []).map(dbWorld => ({
        id: dbWorld.id,
        name: dbWorld.name,
        description: dbWorld.description || '',
        creatorId: dbWorld.creator_id,
        creatorName: 'You',
        thumbnail: dbWorld.thumbnail_url || '',
        blocks: dbWorld.world_data?.blocks || [],
        spawnPoints: dbWorld.world_data?.spawnPoints || [{ x: 50, y: 50 }],
        seekerDen: dbWorld.world_data?.seekerDen || { x: 100, y: 100 },
        playCount: dbWorld.play_count || 0,
        rating: dbWorld.rating || 0,
        isPublic: dbWorld.is_public || false,
        tags: [],
        createdAt: dbWorld.created_at,
        updatedAt: dbWorld.updated_at,
      }));

      console.log('Loaded worlds from database:', worlds.length);

      set({ savedWorlds: worlds });

      // Also save to localStorage as cache
      localStorage.setItem('savedWorlds', JSON.stringify(worlds));
    } catch (error) {
      console.error('Error loading worlds:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('savedWorlds');
      if (saved) {
        const worlds = JSON.parse(saved);
        set({ savedWorlds: worlds });
      }
    }
  },

  createWorld: (name, description) => {
    // Generate a proper UUID v4
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    set(() => ({
      currentWorld: {
        id: generateUUID(),
        name,
        description,
        creatorId: 'current_user',
        creatorName: 'You',
        thumbnail: '',
        blocks: [],
        spawnPoints: [{ x: 50, y: 50 }],
        seekerDen: { x: 100, y: 100 },
        playCount: 0,
        rating: 0,
        isPublic: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isBuilding: true,
    }));
  },

  saveWorld: async (world) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not logged in');
        return;
      }

      // Prepare world data for database
      const worldData = {
        id: world.id,
        creator_id: user.id,
        name: world.name,
        description: world.description,
        world_data: {
          blocks: world.blocks,
          spawnPoints: world.spawnPoints,
          seekerDen: world.seekerDen,
        },
        thumbnail_url: world.thumbnail || '',
        is_public: world.isPublic,
        play_count: world.playCount,
        rating: world.rating,
      };

      // Check if world exists
      const { data: existingWorld } = await supabase
        .from('worlds')
        .select('id')
        .eq('id', world.id)
        .single();

      if (existingWorld) {
        // Update existing world
        const { error } = await supabase
          .from('worlds')
          .update(worldData)
          .eq('id', world.id);

        if (error) {
          console.error('Failed to update world in database:', error);
          throw error;
        }
      } else {
        // Insert new world
        const { error } = await supabase
          .from('worlds')
          .insert(worldData);

        if (error) {
          console.error('Failed to save world to database:', error);
          throw error;
        }
      }

      console.log('World saved to database successfully:', world.id);

      // Also save to localStorage as backup
      set((state) => {
        const updatedWorlds = state.savedWorlds.some(w => w.id === world.id)
          ? state.savedWorlds.map(w => w.id === world.id ? world : w)
          : [...state.savedWorlds, world];

        localStorage.setItem('savedWorlds', JSON.stringify(updatedWorlds));

        return {
          savedWorlds: updatedWorlds,
          currentWorld: world,
        };
      });
    } catch (error) {
      console.error('Error saving world:', error);
      alert(`Failed to save world: ${error.message || 'Unknown error'}`);
    }
  },

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
    // Generate a proper UUID v4
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    return new Promise<World>((resolve) => {
      setTimeout(() => {
        const generatedWorld: World = {
          id: generateUUID(),
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
    // Only show user-created worlds
    const featured: World[] = [];
    
    set({ featuredWorlds: featured });
  },

  rateWorld: (worldId, rating) =>
    set((state) => ({
      featuredWorlds: state.featuredWorlds.map(w =>
        w.id === worldId ? { ...w, rating } : w
      ),
    })),
}));