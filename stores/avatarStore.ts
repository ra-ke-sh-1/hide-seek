import { create } from 'zustand';

interface AvatarConfig {
  bodyType: 'slim' | 'regular' | 'chunky';
  skin: string;
  hair: string;
  hairColor: string;
  outfit: string;
  outfitColor: string;
  accessories: string[];
  emotes: string[];
}

interface AvatarStore {
  currentAvatar: AvatarConfig;
  unlockedCosmetics: {
    hair: string[];
    outfits: string[];
    accessories: string[];
    emotes: string[];
  };
  
  // Actions
  updateAvatar: (config: Partial<AvatarConfig>) => void;
  unlockCosmetic: (category: keyof AvatarStore['unlockedCosmetics'], item: string) => void;
  resetAvatar: () => void;
}

const defaultAvatar: AvatarConfig = {
  bodyType: 'regular',
  skin: '#FDBCB4',
  hair: 'short',
  hairColor: '#8B4513',
  outfit: 'casual',
  outfitColor: '#4299E1',
  accessories: [],
  emotes: ['wave', 'thumbsup'],
};

export const useAvatarStore = create<AvatarStore>((set) => ({
  currentAvatar: defaultAvatar,
  unlockedCosmetics: {
    hair: ['short', 'long', 'curly'],
    outfits: ['casual', 'formal', 'sporty'],
    accessories: ['hat', 'glasses'],
    emotes: ['wave', 'thumbsup', 'dance'],
  },

  updateAvatar: (config) =>
    set((state) => ({
      currentAvatar: { ...state.currentAvatar, ...config },
    })),

  unlockCosmetic: (category, item) =>
    set((state) => ({
      unlockedCosmetics: {
        ...state.unlockedCosmetics,
        [category]: [...state.unlockedCosmetics[category], item],
      },
    })),

  resetAvatar: () => set({ currentAvatar: defaultAvatar }),
}));