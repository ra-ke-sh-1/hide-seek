import { create } from 'zustand';

interface Player {
  id: string;
  name: string;
  role: 'hider' | 'seeker';
  position: { x: number; y: number };
  isFound: boolean;
  score: number;
}

interface GameState {
  gameId: string | null;
  lobbyCode: string | null;
  players: Player[];
  currentPlayer: Player | null;
  gamePhase: 'lobby' | 'hiding' | 'seeking' | 'ended';
  timeRemaining: number;
  isHost: boolean;
  gameSettings: {
    maxPlayers: number;
    roundTime: number;
    seekerCount: number;
    enableAbilities: boolean;
  };
}

interface GameStore extends GameState {
  joinGame: (gameId: string, lobbyCode: string) => void;
  leaveGame: () => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  setTimeRemaining: (time: number) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setCurrentPlayer: (player: Player) => void;
  setIsHost: (isHost: boolean) => void;
  updateGameSettings: (settings: Partial<GameState['gameSettings']>) => void;
  assignRoles: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  gameId: null,
  lobbyCode: null,
  players: [],
  currentPlayer: null,
  gamePhase: 'lobby',
  timeRemaining: 180,
  isHost: false,
  gameSettings: {
    maxPlayers: 8,
    roundTime: 180,
    seekerCount: 2,
    enableAbilities: true,
  },
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  joinGame: (gameId: string, lobbyCode: string) => {
    set({
      gameId,
      lobbyCode,
      gamePhase: 'lobby',
    });
  },

  leaveGame: () => {
    set(initialState);
  },

  updatePlayer: (playerId: string, updates: Partial<Player>) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player
      ),
    }));
  },

  setGamePhase: (phase: GameState['gamePhase']) => {
    set({ gamePhase: phase });
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  addPlayer: (player: Player) => {
    set((state) => ({
      players: [...state.players, player],
    }));
  },

  removePlayer: (playerId: string) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
    }));
  },

  setCurrentPlayer: (player: Player) => {
    set({ currentPlayer: player });
  },

  setIsHost: (isHost: boolean) => {
    set({ isHost });
  },

  updateGameSettings: (settings: Partial<GameState['gameSettings']>) => {
    set((state) => ({
      gameSettings: { ...state.gameSettings, ...settings },
    }));
  },

  assignRoles: () => {
    const { players, gameSettings } = get();
    if (players.length === 0) return;

    // Calculate seeker count based on player count
    const playerCount = players.length;
    let seekerCount = Math.max(1, Math.floor(playerCount / 4));
    seekerCount = Math.min(seekerCount, gameSettings.seekerCount, 3);

    // Shuffle players and assign roles
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const updatedPlayers = shuffledPlayers.map((player, index) => ({
      ...player,
      role: index < seekerCount ? 'seeker' as const : 'hider' as const,
      isFound: false,
      score: 0,
    }));

    set({ players: updatedPlayers });
  },

  resetGame: () => {
    set(initialState);
  },
}));