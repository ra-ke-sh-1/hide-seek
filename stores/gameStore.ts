import { create } from 'zustand';

interface Player {
  id: string;
  name: string;
  role: 'hider' | 'seeker';
  position: { x: number; y: number };
  isFound: boolean;
  isHost: boolean;
  avatar: any;
}

interface GameSettings {
  maxPlayers: number;
  roundTime: number;
  seekerCount: number;
  enableAbilities: boolean;
  worldId: string;
}

interface GameStore {
  currentGame: {
    id: string | null;
    lobbyCode: string | null;
    players: Player[];
    settings: GameSettings;
    phase: 'lobby' | 'hiding' | 'seeking' | 'ended';
    timeLeft: number;
    round: number;
    maxRounds: number;
  };
  
  // Actions
  joinGame: (gameId: string, lobbyCode: string) => void;
  leaveGame: () => void;
  updatePlayerPosition: (playerId: string, position: { x: number; y: number }) => void;
  updateGamePhase: (phase: 'lobby' | 'hiding' | 'seeking' | 'ended') => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  markPlayerFound: (playerId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: {
    id: null,
    lobbyCode: null,
    players: [],
    settings: {
      maxPlayers: 8,
      roundTime: 180,
      seekerCount: 2,
      enableAbilities: true,
      worldId: '',
    },
    phase: 'lobby',
    timeLeft: 30,
    round: 1,
    maxRounds: 3,
  },

  joinGame: (gameId, lobbyCode) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        id: gameId,
        lobbyCode,
      },
    })),

  leaveGame: () =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        id: null,
        lobbyCode: null,
        players: [],
        phase: 'lobby',
      },
    })),

  updatePlayerPosition: (playerId, position) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        players: state.currentGame.players.map((player) =>
          player.id === playerId ? { ...player, position } : player
        ),
      },
    })),

  updateGamePhase: (phase) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        phase,
      },
    })),

  addPlayer: (player) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        players: [...state.currentGame.players, player],
      },
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        players: state.currentGame.players.filter((p) => p.id !== playerId),
      },
    })),

  markPlayerFound: (playerId) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        players: state.currentGame.players.map((player) =>
          player.id === playerId ? { ...player, isFound: true } : player
        ),
      },
    })),

  updateSettings: (settings) =>
    set((state) => ({
      currentGame: {
        ...state.currentGame,
        settings: { ...state.currentGame.settings, ...settings },
      },
    })),
}));