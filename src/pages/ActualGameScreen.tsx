import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Clock, Target, Trophy, Star, Grid as Grid3X3 } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import { useRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';

interface GameConfig {
  hidingPhaseDuration: number;
  seekingPhaseDuration: number;
  seekerVisionRadius: number;
  minSpawnDistance: number;
  denRadius: number;
  aiSpeed: number;
}

const gameModeConfigs: { [key: string]: GameConfig } = {
  ai: {
    hidingPhaseDuration: 10,
    seekingPhaseDuration: 180,
    seekerVisionRadius: 80,
    minSpawnDistance: 150,
    denRadius: 30,
    aiSpeed: 2.0,
  },
  easy: {
    hidingPhaseDuration: 15,
    seekingPhaseDuration: 240,
    seekerVisionRadius: 60,
    minSpawnDistance: 200,
    denRadius: 35,
    aiSpeed: 1.5,
  },
  hard: {
    hidingPhaseDuration: 8,
    seekingPhaseDuration: 120,
    seekerVisionRadius: 100,
    minSpawnDistance: 120,
    denRadius: 25,
    aiSpeed: 3.0,
  },
};

export default function ActualGameScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setGamePhase } = useGameStore();
  const { savedWorlds, featuredWorlds } = useWorldStore();

  const worldId = searchParams.get('world');
  const mode = searchParams.get('mode') || 'ai';
  const isMultiplayer = searchParams.get('multiplayer') === 'true';
  const gameId = searchParams.get('game');
  const config = gameModeConfigs[mode] || gameModeConfigs.ai;

  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 140 }); // Grid-aligned to 20px grid
  const [seekerPosition, setSeekerPosition] = useState({ x: 0, y: 0 });
  const [gamePhase, setCurrentPhase] = useState<'hiding' | 'seeking' | 'ended'>('hiding');
  const [timeLeft, setTimeLeft] = useState(config.hidingPhaseDuration);
  const [gameResult, setGameResult] = useState<'hider_wins' | 'seeker_wins' | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [hiderSpotted, setHiderSpotted] = useState(false);
  const [seekerReturning, setSeekerReturning] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<any>(null);
  const [loadingWorld, setLoadingWorld] = useState(true);

  // Multiplayer state
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<any[]>([]);
  const [currentPlayerRole, setCurrentPlayerRole] = useState<'hider' | 'seeker'>('hider');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const hasReachedDenRef = useRef(false); // Track if we've already marked hider as safe

  const gridSize = 20;
  const canvasWidth = Math.min(window.innerWidth - 350, 600); // Match WorldBuilder, account for sidebar
  const canvasHeight = Math.min(window.innerHeight - 300, 400); // Match WorldBuilder

  // Helper function to snap coordinates to grid
  const snapToGrid = (x: number, y: number) => ({
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  });

  // Load world from store or database
  useEffect(() => {
    const loadWorld = async () => {
      if (!worldId) {
        setLoadingWorld(false);
        return;
      }

      // First check if world is already in store
      const allWorlds = [...savedWorlds, ...featuredWorlds];
      const localWorld = allWorlds.find(w => w.id === worldId);

      if (localWorld) {
        setSelectedWorld(localWorld);
        setLoadingWorld(false);
        return;
      }

      // If not in store, fetch from database
      try {
        const { data: dbWorld, error } = await supabase
          .from('worlds')
          .select('*')
          .eq('id', worldId)
          .single();

        if (error) {
          console.error('Failed to load world from database:', error);
          setLoadingWorld(false);
          return;
        }

        // Transform database format to app format
        const world = {
          id: dbWorld.id,
          name: dbWorld.name,
          description: dbWorld.description || '',
          creatorId: dbWorld.creator_id,
          creatorName: 'Creator',
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
        };

        setSelectedWorld(world);
        setLoadingWorld(false);
      } catch (error) {
        console.error('Error loading world:', error);
        setLoadingWorld(false);
      }
    };

    loadWorld();
  }, [worldId, savedWorlds, featuredWorlds]);

  // Load multiplayer game data
  useEffect(() => {
    if (!isMultiplayer || !gameId) return;

    const loadMultiplayerData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // Fetch all players in the game
        const { data: players, error } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:player_id (username)
          `)
          .eq('game_id', gameId);

        if (error) {
          console.error('Error fetching players:', error);
          throw error;
        }

        setMultiplayerPlayers(players || []);

        // Find current player's role
        const currentPlayer = players?.find(p => p.player_id === user.id);
        if (currentPlayer) {
          setCurrentPlayerRole(currentPlayer.role);
        }
      } catch (error) {
        console.error('Failed to load multiplayer data:', error);
      }
    };

    loadMultiplayerData();
  }, [isMultiplayer, gameId]);

  // Real-time position synchronization
  const { sendMessage } = useRealtime(
    isMultiplayer && gameId ? `game_${gameId}` : '',
    async (payload) => {
      if (!isMultiplayer) return;

      // Handle position updates from other players
      if (payload.type === 'position_update' && payload.playerId !== currentUserId) {
        setMultiplayerPlayers(prev =>
          prev.map(p =>
            p.player_id === payload.playerId
              ? { ...p, position: { x: payload.x, y: payload.y } }
              : p
          )
        );
      }

      // Handle player found events
      if (payload.type === 'hider_found') {
        console.log(`Hider ${payload.playerId} was found!`);
        setMultiplayerPlayers(prev =>
          prev.map(p =>
            p.player_id === payload.playerId
              ? { ...p, is_found: true }
              : p
          )
        );
      }

      // Handle hider reached den event - DON'T end game, just update state
      if (payload.type === 'hider_reached_den') {
        console.log(`Hider ${payload.playerId} reached den! Marking as safe...`);
        setMultiplayerPlayers(prev =>
          prev.map(p =>
            p.player_id === payload.playerId
              ? { ...p, has_reached_den: true }
              : p
          )
        );
      }

      // Handle database changes for game_players
      if (payload.table === 'game_players') {
        if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          // Player joined/left - reload full list
          console.log('[Game] Player joined/left, reloading player list');
          const { data: players } = await supabase
            .from('game_players')
            .select(`
              *,
              profile:player_id (username)
            `)
            .eq('game_id', gameId);

          if (players) {
            setMultiplayerPlayers(players);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          // Player state updated (is_found, has_reached_den, etc.) - update specific player
          console.log('[Game] Player state updated:', payload.new);
          setMultiplayerPlayers(prev =>
            prev.map(p =>
              p.player_id === payload.new.player_id
                ? { ...p, ...payload.new }
                : p
            )
          );
        }
      }
    }
  );

  // Broadcast position updates (throttled) - only when position actually changes
  useEffect(() => {
    if (!isMultiplayer || !currentUserId || !sendMessage) return;

    // Throttle position updates to max 5 per second
    const timeoutId = setTimeout(() => {
      sendMessage({
        type: 'position_update',
        playerId: currentUserId,
        x: playerPosition.x,
        y: playerPosition.y,
        timestamp: Date.now()
      });
    }, 200); // 200ms = 5 updates/second max

    return () => clearTimeout(timeoutId);
  }, [isMultiplayer, currentUserId, playerPosition.x, playerPosition.y, sendMessage]);

  // Sync current player's position to multiplayerPlayers state
  useEffect(() => {
    if (!isMultiplayer || !currentUserId) return;

    setMultiplayerPlayers(prev =>
      prev.map(p =>
        p.player_id === currentUserId
          ? { ...p, position: playerPosition }
          : p
      )
    );
  }, [isMultiplayer, currentUserId, playerPosition.x, playerPosition.y]);

  // Collision detection for tagging (seeker touches hider)
  useEffect(() => {
    if (!isMultiplayer || gamePhase !== 'seeking') return;
    if (currentPlayerRole !== 'seeker') return;

    const tagRadius = 25; // Distance for successful tag

    // Check each hider
    multiplayerPlayers.forEach(async (player) => {
      if (player.role !== 'hider' || player.is_found) return;

      const dx = playerPosition.x - player.position.x;
      const dy = playerPosition.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < tagRadius) {
        console.log(`Tagged hider ${player.player_id}!`);

        // Update database
        const { error } = await supabase
          .from('game_players')
          .update({ is_found: true })
          .eq('game_id', gameId)
          .eq('player_id', player.player_id);

        if (error) {
          console.error('Error tagging hider:', error);
          return;
        }

        // Broadcast tag event
        if (sendMessage) {
          sendMessage({
            type: 'hider_found',
            playerId: player.player_id,
            timestamp: Date.now()
          });
        }

        // Update local state
        setMultiplayerPlayers(prev =>
          prev.map(p =>
            p.player_id === player.player_id
              ? { ...p, is_found: true }
              : p
          )
        );
      }
    });
  }, [isMultiplayer, gamePhase, currentPlayerRole, playerPosition, multiplayerPlayers, gameId, sendMessage]);

  // Hider den reach detection - mark as safe, don't end game
  useEffect(() => {
    if (!isMultiplayer || gamePhase !== 'seeking') return;
    if (currentPlayerRole !== 'hider') return;
    if (!selectedWorld?.seekerDen) return;
    if (hasReachedDenRef.current) return; // Already marked

    const denX = selectedWorld.seekerDen.x;
    const denY = selectedWorld.seekerDen.y;
    const denRadius = config.denRadius || 30;

    const dx = playerPosition.x - denX;
    const dy = playerPosition.y - denY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < denRadius) {
      console.log('Hider reached den! Marking as safe...');
      hasReachedDenRef.current = true; // Mark as already processed

      // Update database - mark hider as safe
      supabase
        .from('game_players')
        .update({ has_reached_den: true })
        .eq('game_id', gameId)
        .eq('player_id', currentUserId)
        .then(({ error }) => {
          if (error) {
            console.error('Error marking hider as safe:', error);
          } else {
            console.log('Hider marked as safe in database');
          }
        });

      // Broadcast den reached event
      if (sendMessage) {
        sendMessage({
          type: 'hider_reached_den',
          playerId: currentUserId,
          timestamp: Date.now()
        });
      }
    }
  }, [isMultiplayer, gamePhase, currentPlayerRole, playerPosition, selectedWorld, config, currentUserId, sendMessage, gameId]);

  // Initialize seeker den position
  useEffect(() => {
    if (selectedWorld?.seekerDen) {
      setSeekerPosition(selectedWorld.seekerDen);
    } else {
      // Default den position if not specified
      setSeekerPosition({ x: 450, y: 250 });
    }
  }, [selectedWorld]);

  // Collision detection function
  const checkCollision = (newX: number, newY: number, size: number = 20): boolean => {
    if (!selectedWorld?.blocks) return false;

    const entitySize = size;
    const blockSize = 20;

    // Check bounds
    if (newX < 0 || newY < 0 || newX + entitySize > canvasWidth || newY + entitySize > canvasHeight) {
      return true;
    }

    return selectedWorld.blocks.some(block => {

      const blockX = block.position.x;
      const blockY = block.position.y;

      return (
        newX < blockX + blockSize &&
        newX + entitySize > blockX &&
        newY < blockY + blockSize &&
        newY + entitySize > blockY
      );
    });
  };

  // Initialize player spawn position
  useEffect(() => {
    // In multiplayer, seekers spawn at the den
    if (isMultiplayer && currentPlayerRole === 'seeker') {
      const denPos = selectedWorld?.seekerDen || { x: 460, y: 240 }; // Grid-aligned default
      const snappedDen = snapToGrid(denPos.x, denPos.y);
      setPlayerPosition(snappedDen);
      return;
    }

    // Hiders and single-player spawn at spawn points
    if (selectedWorld?.spawnPoints && selectedWorld.spawnPoints.length > 0) {
      // Find a valid spawn point that's far enough from the den
      const validSpawns = selectedWorld.spawnPoints.filter(spawn => {
        const denPos = selectedWorld.seekerDen || { x: 460, y: 240 }; // Grid-aligned default
        const distance = Math.sqrt(
          Math.pow(spawn.x - denPos.x, 2) + Math.pow(spawn.y - denPos.y, 2)
        );
        return distance >= config.minSpawnDistance;
      });

      if (validSpawns.length > 0) {
        const randomSpawn = validSpawns[Math.floor(Math.random() * validSpawns.length)];
        const snappedSpawn = snapToGrid(randomSpawn.x, randomSpawn.y);
        setPlayerPosition(snappedSpawn);
      }
    }
  }, [selectedWorld, config.minSpawnDistance, isMultiplayer, currentPlayerRole]);

  // Keyboard controls for player movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for arrow keys to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
        event.preventDefault();
      }

      if (gamePhase === 'ended') return;

      // In multiplayer: Prevent seeker from moving during hiding phase
      if (isMultiplayer && currentPlayerRole === 'seeker' && gamePhase === 'hiding') {
        console.log('[Movement] Seeker cannot move during hiding phase');
        return;
      }

      // In multiplayer: Prevent found or safe hiders from moving
      if (isMultiplayer && currentPlayerRole === 'hider') {
        const currentPlayer = multiplayerPlayers.find(p => p.player_id === currentUserId);
        if (currentPlayer?.is_found) {
          console.log('[Movement] Found hider cannot move - eliminated!');
          return;
        }
        if (currentPlayer?.has_reached_den) {
          console.log('[Movement] Safe hider cannot move - already reached den!');
          return;
        }
      }

      const moveDistance = 20;

      // Grid-based movement for all players (hiders and seekers)
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        switch (event.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            newY = Math.max(0, prev.y - moveDistance);
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            newY = Math.min(280, prev.y + moveDistance);
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            newX = Math.max(0, prev.x - moveDistance);
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            newX = Math.min(480, prev.x + moveDistance);
            break;
          default:
            return prev;
        }

        // Check for collisions before moving
        if (checkCollision(newX, newY)) {
          return prev;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, checkCollision, isMultiplayer, currentPlayerRole]);

  // Line of sight calculation
  const hasLineOfSight = (from: { x: number; y: number }, to: { x: number; y: number }): boolean => {
    if (!selectedWorld?.blocks) return true;
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / 5); // Check every 5 pixels
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = from.x + dx * t;
      const checkY = from.y + dy * t;
      
      // Check if this point intersects with any wall or building
      const blocked = selectedWorld.blocks.some(block => {
        if (block.type !== 'wall' && block.type !== 'building') return false;
        
        return (
          checkX >= block.position.x &&
          checkX <= block.position.x + 20 &&
          checkY >= block.position.y &&
          checkY <= block.position.y + 20
        );
      });
      
      if (blocked) return false;
    }
    
    return true;
  };

  // Check if hider can see seeker (for strategic gameplay)
  const canSeeSeeker = (): boolean => {
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - seekerPosition.x, 2) +
      Math.pow(playerPosition.y - seekerPosition.y, 2)
    );
    
    return distance <= config.seekerVisionRadius && hasLineOfSight(playerPosition, seekerPosition);
  };

  // Check if seeker can see hider
  const seekerCanSeeHider = (): boolean => {
    const distance = Math.sqrt(
      Math.pow(seekerPosition.x - playerPosition.x, 2) +
      Math.pow(seekerPosition.y - playerPosition.y, 2)
    );
    
    if (distance > config.seekerVisionRadius) return false;
    
    return hasLineOfSight(seekerPosition, playerPosition);
  };

  // Check if player is at the den
  const isAtDen = (position: { x: number; y: number }): boolean => {
    const denPos = selectedWorld?.seekerDen || { x: 450, y: 250 };
    const distance = Math.sqrt(
      Math.pow(position.x - denPos.x, 2) +
      Math.pow(position.y - denPos.y, 2)
    );
    
    return distance <= config.denRadius;
  };

  // Game timer and phase management
  useEffect(() => {
    if (gamePhase === 'ended') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (gamePhase === 'hiding') {
            // Switch to seeking phase
            setCurrentPhase('seeking');
            setGamePhase('seeking');
            return config.seekingPhaseDuration;
          } else {
            // Seeking phase ended - hider wins by surviving
            setGameResult('hider_wins');
            setCurrentPhase('ended');
            setGamePhase('ended');
            setShowEndModal(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, setGamePhase, config]);

  // Prevent page refresh/reload during active game
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if game is in progress (not ended)
      if (gamePhase !== 'ended') {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // For other browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gamePhase]);

  // Seeker AI behavior
  useEffect(() => {
    // Disable AI in multiplayer mode - human players control seekers
    if (isMultiplayer) return;
    if (gamePhase !== 'seeking') return;

    const aiTimer = setInterval(() => {
      setSeekerPosition(prevSeeker => {
        const denPos = selectedWorld?.seekerDen || { x: 450, y: 250 };
        
        // If seeker is returning to den after spotting hider
        if (seekerReturning) {
          const dx = denPos.x - prevSeeker.x;
          const dy = denPos.y - prevSeeker.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 10) {
            // Seeker reached den - seeker wins
            setGameResult('seeker_wins');
            setCurrentPhase('ended');
            setGamePhase('ended');
            setShowEndModal(true);
            return prevSeeker;
          }
          
          // Move towards den with enhanced speed
          const returnSpeed = config.aiSpeed * 2.5;
          let moveX = distance > 0 ? (dx / distance) * returnSpeed : 0;
          let moveY = distance > 0 ? (dy / distance) * returnSpeed : 0;
          
          let newX = Math.max(0, Math.min(480, prevSeeker.x + moveX));
          let newY = Math.max(0, Math.min(280, prevSeeker.y + moveY));
          
          // Simple and reliable pathfinding
          if (checkCollision(newX, newY)) {
            // Try simple alternatives first - just horizontal or vertical movement
            const simpleAlternatives = [
              { x: prevSeeker.x + (dx > 0 ? returnSpeed : -returnSpeed), y: prevSeeker.y }, // Pure horizontal
              { x: prevSeeker.x, y: prevSeeker.y + (dy > 0 ? returnSpeed : -returnSpeed) }, // Pure vertical
              { x: prevSeeker.x + returnSpeed, y: prevSeeker.y }, // Right
              { x: prevSeeker.x - returnSpeed, y: prevSeeker.y }, // Left  
              { x: prevSeeker.x, y: prevSeeker.y + returnSpeed }, // Down
              { x: prevSeeker.x, y: prevSeeker.y - returnSpeed }, // Up
            ];
            
            for (const alt of simpleAlternatives) {
              const altX = Math.max(0, Math.min(480, alt.x));
              const altY = Math.max(0, Math.min(280, alt.y));
              if (!checkCollision(altX, altY)) {
                return { x: altX, y: altY };
              }
            }
            
            // If simple moves fail, try diagonal movements
            const diagonalMoves = [
              { x: prevSeeker.x + returnSpeed * 0.7, y: prevSeeker.y + returnSpeed * 0.7 },
              { x: prevSeeker.x - returnSpeed * 0.7, y: prevSeeker.y + returnSpeed * 0.7 },
              { x: prevSeeker.x + returnSpeed * 0.7, y: prevSeeker.y - returnSpeed * 0.7 },
              { x: prevSeeker.x - returnSpeed * 0.7, y: prevSeeker.y - returnSpeed * 0.7 },
            ];
            
            for (const move of diagonalMoves) {
              const moveX = Math.max(0, Math.min(480, move.x));
              const moveY = Math.max(0, Math.min(280, move.y));
              if (!checkCollision(moveX, moveY)) {
                return { x: moveX, y: moveY };
              }
            }
            
            // Last resort: try bigger jumps to escape being stuck
            const escapeJumps = [
              { x: prevSeeker.x + returnSpeed * 2, y: prevSeeker.y },
              { x: prevSeeker.x - returnSpeed * 2, y: prevSeeker.y },
              { x: prevSeeker.x, y: prevSeeker.y + returnSpeed * 2 },
              { x: prevSeeker.x, y: prevSeeker.y - returnSpeed * 2 },
            ];
            
            for (const jump of escapeJumps) {
              const jumpX = Math.max(0, Math.min(480, jump.x));
              const jumpY = Math.max(0, Math.min(280, jump.y));
              if (!checkCollision(jumpX, jumpY)) {
                return { x: jumpX, y: jumpY };
              }
            }
          }
          
          return { x: newX, y: newY };
        }
        
        // Check if seeker can see hider
        if (seekerCanSeeHider() && !hiderSpotted) {
          setHiderSpotted(true);
          // Don't return here - let the AI start moving back immediately
        }
        
        // If hider has been spotted, immediately start returning to den
        if (hiderSpotted) {
          setSeekerReturning(true);
          
          const dx = denPos.x - prevSeeker.x;
          const dy = denPos.y - prevSeeker.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 10) {
            // Seeker reached den - seeker wins
            setGameResult('seeker_wins');
            setCurrentPhase('ended');
            setGamePhase('ended');
            setShowEndModal(true);
            return prevSeeker;
          }
          
          // Move towards den with enhanced speed
          const returnSpeed = config.aiSpeed * 2.5;
          let moveX = distance > 0 ? (dx / distance) * returnSpeed : 0;
          let moveY = distance > 0 ? (dy / distance) * returnSpeed : 0;
          
          let newX = Math.max(0, Math.min(480, prevSeeker.x + moveX));
          let newY = Math.max(0, Math.min(280, prevSeeker.y + moveY));
          
          // Smart pathfinding for return journey
          if (checkCollision(newX, newY)) {
            const pathfindingAttempts = [
              { x: prevSeeker.x + moveX * 0.7, y: prevSeeker.y },
              { x: prevSeeker.x, y: prevSeeker.y + moveY * 0.7 },
              { x: prevSeeker.x + returnSpeed, y: prevSeeker.y },
              { x: prevSeeker.x - returnSpeed, y: prevSeeker.y },
              { x: prevSeeker.x, y: prevSeeker.y + returnSpeed },
              { x: prevSeeker.x, y: prevSeeker.y - returnSpeed },
              { x: prevSeeker.x + returnSpeed * 0.7, y: prevSeeker.y + returnSpeed * 0.7 },
              { x: prevSeeker.x - returnSpeed * 0.7, y: prevSeeker.y + returnSpeed * 0.7 },
              { x: prevSeeker.x + returnSpeed * 0.7, y: prevSeeker.y - returnSpeed * 0.7 },
              { x: prevSeeker.x - returnSpeed * 0.7, y: prevSeeker.y - returnSpeed * 0.7 },
            ];
            
            for (const attempt of pathfindingAttempts) {
              const attemptX = Math.max(0, Math.min(480, attempt.x));
              const attemptY = Math.max(0, Math.min(280, attempt.y));
              if (!checkCollision(attemptX, attemptY)) {
                return { x: attemptX, y: attemptY };
              }
            }
          }
          
          return { x: newX, y: newY };
        }
        
        // Normal hunting behavior - move towards hider
        const dx = playerPosition.x - prevSeeker.x;
        const dy = playerPosition.y - prevSeeker.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const huntSpeed = config.aiSpeed;
        let moveX = distance > 0 ? (dx / distance) * huntSpeed : 0;
        let moveY = distance > 0 ? (dy / distance) * huntSpeed : 0;

        let newX = Math.max(0, Math.min(480, prevSeeker.x + moveX));
        let newY = Math.max(0, Math.min(280, prevSeeker.y + moveY));
        
        // Simple pathfinding for hunting
        if (checkCollision(newX, newY)) {
          // Try basic movement alternatives
          const huntingAlternatives = [
            { x: prevSeeker.x + huntSpeed, y: prevSeeker.y },
            { x: prevSeeker.x - huntSpeed, y: prevSeeker.y },
            { x: prevSeeker.x, y: prevSeeker.y + huntSpeed },
            { x: prevSeeker.x, y: prevSeeker.y - huntSpeed },
            { x: prevSeeker.x + huntSpeed * 0.7, y: prevSeeker.y + huntSpeed * 0.7 },
            { x: prevSeeker.x - huntSpeed * 0.7, y: prevSeeker.y + huntSpeed * 0.7 },
            { x: prevSeeker.x + huntSpeed * 0.7, y: prevSeeker.y - huntSpeed * 0.7 },
            { x: prevSeeker.x - huntSpeed * 0.7, y: prevSeeker.y - huntSpeed * 0.7 },
          ];
          
          for (const option of huntingAlternatives) {
            const optionX = Math.max(0, Math.min(480, option.x));
            const optionY = Math.max(0, Math.min(280, option.y));
            if (!checkCollision(optionX, optionY)) {
              return { x: optionX, y: optionY };
            }
          }
        }
        
        return { x: newX, y: newY };
      });
    }, 50); // Faster AI updates for smoother movement

    return () => clearInterval(aiTimer);
  }, [gamePhase, playerPosition, hiderSpotted, seekerReturning, config, selectedWorld, setGamePhase]);

  // Check win conditions
  useEffect(() => {
    if (gamePhase !== 'seeking') return;

    // Multiplayer win conditions
    if (isMultiplayer) {
      const hiders = multiplayerPlayers.filter(p => p.role === 'hider');

      // Check if all hiders are found (seekers win)
      const allHidersFound = hiders.length > 0 && hiders.every(p => p.is_found);

      if (allHidersFound) {
        setGameResult('seeker_wins');
        setCurrentPhase('ended');
        setGamePhase('ended');
        setShowEndModal(true);
        return;
      }

      // Check if all hiders are resolved (found OR reached den)
      // Game ends when ALL hiders are either found or safe
      const allHidersResolved = hiders.length > 0 && hiders.every(p => p.is_found || p.has_reached_den);

      console.log('[Win Condition Check]', {
        totalHiders: hiders.length,
        hidersData: hiders.map(h => ({
          username: h.profile?.username,
          is_found: h.is_found,
          has_reached_den: h.has_reached_den,
          resolved: h.is_found || h.has_reached_den
        })),
        allHidersResolved
      });

      if (allHidersResolved) {
        // Determine winner: if at least one hider reached den, hiders win
        const anyHiderReachedDen = hiders.some(p => p.has_reached_den);

        if (anyHiderReachedDen) {
          console.log('[Win Condition] At least one hider reached den - hiders win!');
          setGameResult('hider_wins');
        } else {
          // All hiders were found - seekers win (redundant with check above, but explicit)
          console.log('[Win Condition] All hiders found - seekers win!');
          setGameResult('seeker_wins');
        }

        setCurrentPhase('ended');
        setGamePhase('ended');
        setShowEndModal(true);
        return;
      }
    } else {
      // Single player AI mode win conditions
      const denPos = selectedWorld?.seekerDen || { x: 450, y: 250 };
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - denPos.x, 2) +
        Math.pow(playerPosition.y - denPos.y, 2)
      );

      if (distance <= config.denRadius) {
        if (!hiderSpotted) {
          // Hider reached den without being spotted - instant win
          setGameResult('hider_wins');
          setCurrentPhase('ended');
          setGamePhase('ended');
          setShowEndModal(true);
        } else if (seekerReturning) {
          // Race condition - hider reached den while seeker was returning
          const seekerDistanceToDen = Math.sqrt(
            Math.pow(seekerPosition.x - (selectedWorld?.seekerDen?.x || 450), 2) +
            Math.pow(seekerPosition.y - (selectedWorld?.seekerDen?.y || 250), 2)
          );

          if (seekerDistanceToDen > config.denRadius) {
            // Hider reached den first
            setGameResult('hider_wins');
            setCurrentPhase('ended');
            setGamePhase('ended');
            setShowEndModal(true);
          }
        }
      }
    }
  }, [playerPosition, gamePhase, hiderSpotted, seekerReturning, seekerPosition, selectedWorld, config, setGamePhase, isMultiplayer, multiplayerPlayers, currentPlayerRole, currentUserId]);

  const movePlayer = (direction: string) => {
    if (gamePhase === 'ended') return;
    if (gamePhase === 'hiding' && seekerPosition.x === (selectedWorld?.seekerDen?.x || 450)) {
      // Seeker must stay in den during hiding phase
    }

    const moveDistance = 20;
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'up': newY = Math.max(0, prev.y - moveDistance); break;
        case 'down': newY = Math.min(280, prev.y + moveDistance); break;
        case 'left': newX = Math.max(0, prev.x - moveDistance); break;
        case 'right': newX = Math.min(480, prev.x + moveDistance); break;
      }
      
      // Check for collisions before moving
      if (checkCollision(newX, newY)) {
        return prev;
      }
      
      return { x: newX, y: newY };
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (gamePhase) {
      case 'hiding': return 'HIDING PHASE - Find your spot!';
      case 'seeking': return hiderSpotted ? (seekerReturning ? 'SPOTTED! Race to the den!' : 'SPOTTED! Seeker returning!') : 'SEEKING PHASE - Stay hidden!';
      case 'ended': return 'GAME OVER';
    }
  };

  const getPhaseColor = () => {
    switch (gamePhase) {
      case 'hiding': return '#4ECDC4';
      case 'seeking': return hiderSpotted ? '#FF6B6B' : '#FFE66D';
      case 'ended': return '#A855F7';
    }
  };

  const getBlockColor = (type: string) => {
    const colors: { [key: string]: string } = {
      wall: '#8B5CF6',
      door: '#F59E0B',
      tree: '#10B981',
      car: '#EF4444',
      building: '#6B7280',
      locker: '#EC4899',
      barrel: '#F97316',
    };
    return colors[type] || '#4A5568';
  };

  const getBlockEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      wall: '🧱',
      door: '🚪',
      tree: '🌳',
      car: '🚗',
      building: '🏢',
      locker: '🗄️',
      barrel: '🛢️',
    };
    return emojis[type] || '⬜';
  };

  const handlePlayAgain = () => {
    setShowEndModal(false);
    setGameResult(null);
    setCurrentPhase('hiding');
    setGamePhase('hiding');
    setTimeLeft(config.hidingPhaseDuration);
    setHiderSpotted(false);
    setSeekerReturning(false);
    
    // Reset positions
    if (selectedWorld?.spawnPoints && selectedWorld.spawnPoints.length > 0) {
      const validSpawns = selectedWorld.spawnPoints.filter(spawn => {
        const denPos = selectedWorld.seekerDen || { x: 460, y: 240 }; // Grid-aligned default
        const distance = Math.sqrt(
          Math.pow(spawn.x - denPos.x, 2) + Math.pow(spawn.y - denPos.y, 2)
        );
        return distance >= config.minSpawnDistance;
      });

      if (validSpawns.length > 0) {
        const randomSpawn = validSpawns[Math.floor(Math.random() * validSpawns.length)];
        const snappedSpawn = snapToGrid(randomSpawn.x, randomSpawn.y);
        setPlayerPosition(snappedSpawn);
      }
    }

    const denPos = selectedWorld?.seekerDen || { x: 460, y: 240 }; // Grid-aligned default
    const snappedDen = snapToGrid(denPos.x, denPos.y);
    setSeekerPosition(snappedDen);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBackToLobby = () => {
    if (gameId) {
      navigate(`/lobby?game=${gameId}`);
    } else {
      navigate('/');
    }
  };

  // Show loading while fetching world
  if (loadingWorld) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading world...</h2>
        </div>
      </div>
    );
  }

  if (!selectedWorld) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>World not found</h2>
          <button
            onClick={() => navigate('/play')}
            style={{
              background: '#FF6B6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      {/* Game Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <button
          onClick={() => navigate('/play')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          Exit
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: getPhaseColor(),
            marginBottom: '4px'
          }}>
            {getPhaseText()}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <Clock size={20} style={{ display: 'inline', marginRight: '8px' }} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{
          background: isMultiplayer
            ? (currentPlayerRole === 'seeker' ? 'linear-gradient(135deg, #FF6B6B, #FF1744)' : 'linear-gradient(135deg, #4ECDC4, #26D0CE)')
            : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {isMultiplayer
            ? (currentPlayerRole === 'seeker' ? '👁️ SEEKER' : '🥷 HIDER')
            : '🥷 vs 🤖'}
        </div>
      </div>

      {/* Game Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '12px 24px',
        background: 'rgba(0, 0, 0, 0.2)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Eye size={14} color={hiderSpotted ? '#FF6B6B' : '#4ECDC4'} />
          <span>{hiderSpotted ? 'SPOTTED!' : 'Hidden'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Target size={14} color="#FFE66D" />
          <span>Den: {Math.round(Math.sqrt(Math.pow(playerPosition.x - (selectedWorld?.seekerDen?.x || 450), 2) + Math.pow(playerPosition.y - (selectedWorld?.seekerDen?.y || 250), 2)))}px</span>
        </div>
        {canSeeSeeker() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF6B6B' }}>
            <Eye size={14} />
            <span>Seeker visible!</span>
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '500px',
          height: '300px',
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          borderRadius: '12px',
          position: 'relative',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
          {/* Grid overlay */}
          {showGrid && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              opacity: 0.3
            }} />
          )}

          {/* World blocks */}
          {selectedWorld?.blocks?.map((block, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${Math.min(block.position.x, canvasWidth - gridSize)}px`,
                top: `${Math.min(block.position.y, canvasHeight - gridSize)}px`,
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                background: getBlockColor(block.type),
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              {getBlockEmoji(block.type)}
            </div>
          ))}

          {/* Seeker's Den */}
          <div style={{
            position: 'absolute',
            left: `${(selectedWorld?.seekerDen?.x || 450) - 25}px`,
            top: `${(selectedWorld?.seekerDen?.y || 250) - 25}px`,
            width: '50px',
            height: '50px',
            background: 'linear-gradient(145deg, #F59E0B, #D97706)',
            borderRadius: '50%',
            border: '3px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.6)',
            zIndex: 5
          }}>
            🏠
          </div>


          {/* Seeker vision radius (when seeking) - Only show in AI mode */}
          {gamePhase === 'seeking' && !isMultiplayer && (
            <div style={{
              position: 'absolute',
              left: `${seekerPosition.x - config.seekerVisionRadius}px`,
              top: `${seekerPosition.y - config.seekerVisionRadius}px`,
              width: `${config.seekerVisionRadius * 2}px`,
              height: `${config.seekerVisionRadius * 2}px`,
              background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 70%, transparent 100%)',
              borderRadius: '50%',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
          )}

          {/* Current Player */}
          <div style={{
            position: 'absolute',
            left: `${playerPosition.x}px`,
            top: `${playerPosition.y}px`,
            width: '20px',
            height: '20px',
            background: (() => {
              if (isMultiplayer && currentPlayerRole === 'hider') {
                const currentPlayer = multiplayerPlayers.find(p => p.player_id === currentUserId);
                if (currentPlayer?.has_reached_den) return '#48BB78'; // Green for safe
                if (currentPlayer?.is_found) return '#A0AEC0'; // Gray for found
              }
              return hiderSpotted ? '#FF6B6B' : '#4ECDC4';
            })(),
            borderRadius: '50%',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 10,
            boxShadow: (() => {
              if (isMultiplayer && currentPlayerRole === 'hider') {
                const currentPlayer = multiplayerPlayers.find(p => p.player_id === currentUserId);
                if (currentPlayer?.has_reached_den) return '0 0 20px #48BB78';
                if (currentPlayer?.is_found) return 'none';
              }
              return hiderSpotted ? '0 0 20px #FF6B6B' : '0 0 15px #4ECDC4';
            })(),
            opacity: (isMultiplayer && currentPlayerRole === 'hider' && multiplayerPlayers.find(p => p.player_id === currentUserId)?.is_found) ? 0.3 : 1
          }}>
            🥷
          </div>
          {/* Current Player Name Label */}
          <div style={{
            position: 'absolute',
            left: `${playerPosition.x + 10}px`,
            top: `${playerPosition.y - 25}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            zIndex: 11,
            pointerEvents: 'none',
            opacity: (isMultiplayer && currentPlayerRole === 'hider' && multiplayerPlayers.find(p => p.player_id === currentUserId)?.is_found) ? 0.3 : 1
          }}>
            {isMultiplayer
              ? `${multiplayerPlayers.find(p => p.player_id === currentUserId)?.profile?.username || 'You'} (${currentPlayerRole === 'seeker' ? 'S' : 'H'})`
              : `You (${currentPlayerRole === 'seeker' ? 'S' : 'H'})`
            }
          </div>

          {/* Other Multiplayer Players */}
          {isMultiplayer && multiplayerPlayers
            .filter(p => p.player_id !== currentUserId)
            .map((player) => (
              <React.Fragment key={player.id}>
                <div
                  style={{
                    position: 'absolute',
                    left: `${player.position?.x || 100}px`,
                    top: `${player.position?.y || 100}px`,
                    width: '20px',
                    height: '20px',
                    background: (() => {
                      if (player.role === 'hider') {
                        if (player.has_reached_den) return '#48BB78'; // Green for safe
                        if (player.is_found) return '#A0AEC0'; // Gray for found
                      }
                      return player.role === 'seeker' ? '#FF6B6B' : '#4ECDC4';
                    })(),
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    zIndex: 10,
                    boxShadow: (() => {
                      if (player.role === 'hider') {
                        if (player.has_reached_den) return '0 0 20px #48BB78';
                        if (player.is_found) return 'none';
                      }
                      return `0 0 15px ${player.role === 'seeker' ? '#FF6B6B' : '#4ECDC4'}`;
                    })(),
                    opacity: player.is_found ? 0.3 : 1
                  }}
                >
                  {player.role === 'seeker' ? '👁️' : '🥷'}
                </div>
                {/* Other Player Name Label */}
                <div style={{
                  position: 'absolute',
                  left: `${(player.position?.x || 100) + 10}px`,
                  top: `${(player.position?.y || 100) - 25}px`,
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  zIndex: 11,
                  pointerEvents: 'none',
                  opacity: player.is_found ? 0.3 : 1
                }}>
                  {player.profile?.username || 'Player'} ({player.role === 'seeker' ? 'S' : 'H'})
                </div>
              </React.Fragment>
            ))}

          {/* Seeker (AI Bot) - Only show in single player */}
          {gamePhase === 'seeking' && !isMultiplayer && (
            <>
              <div style={{
                position: 'absolute',
                left: `${seekerPosition.x}px`,
                top: `${seekerPosition.y}px`,
                width: '20px',
                height: '20px',
                background: seekerReturning ? '#FFE66D' : '#FF6B6B',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                zIndex: 10,
                boxShadow: '0 0 20px #FF6B6B'
              }}>
                🤖
              </div>
              {/* AI Seeker Name Label */}
              <div style={{
                position: 'absolute',
                left: `${seekerPosition.x + 10}px`,
                top: `${seekerPosition.y - 25}px`,
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 11,
                pointerEvents: 'none'
              }}>
                AI Seeker (S)
              </div>
            </>
          )}

          {/* Fog of War - Circular Visibility */}
          {/* Only show fog during seeking phase, or during hiding phase for seekers */}
          {(gamePhase === 'seeking' || (gamePhase === 'hiding' && currentPlayerRole === 'seeker')) && selectedWorld?.seekerDen && (
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 15
            }}>
              <defs>
                {/* Player visibility gradient - reversed for correct mask */}
                <radialGradient id="player-grad">
                  <stop offset="0%" stopColor="black" />
                  <stop offset="40%" stopColor="rgba(0, 0, 0, 0.7)" />
                  <stop offset="100%" stopColor="white" />
                </radialGradient>
                {/* Den visibility gradient - same foggy effect as player */}
                <radialGradient id="den-grad">
                  <stop offset="0%" stopColor="black" />
                  <stop offset="40%" stopColor="rgba(0, 0, 0, 0.7)" />
                  <stop offset="100%" stopColor="white" />
                </radialGradient>
                {/* Mask with both visibility circles */}
                <mask id="fog-mask">
                  {/* Start with white (everything visible/fog shows) */}
                  <rect width="100%" height="100%" fill="white" />
                  {/* Player visibility (black = cut through fog) */}
                  <circle
                    cx={playerPosition.x + 10}
                    cy={playerPosition.y + 10}
                    r={currentPlayerRole === 'seeker' ? 80 : 70}
                    fill="url(#player-grad)"
                  />
                  {/* Den visibility (black = cut through fog) - matches 50px den size */}
                  <circle
                    cx={selectedWorld.seekerDen.x}
                    cy={selectedWorld.seekerDen.y}
                    r={50}
                    fill="url(#den-grad)"
                  />
                </mask>
              </defs>
              {/* Dark fog with mask applied */}
              <rect
                width="100%"
                height="100%"
                fill="black"
                opacity="1"
                mask="url(#fog-mask)"
              />
            </svg>
          )}
        </div>

        {/* Multiplayer Player List */}
        {isMultiplayer && (
          <div style={{
            width: '280px',
            minWidth: '280px',
            background: 'rgba(30, 41, 59, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              Active Players ({multiplayerPlayers.filter(p => (!p.is_found && !p.has_reached_den) || p.role === 'seeker').length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {multiplayerPlayers.filter(p => (!p.is_found && !p.has_reached_den) || p.role === 'seeker').map((player) => (
                <div
                  key={player.id}
                  style={{
                    background: player.player_id === currentUserId
                      ? 'rgba(78, 205, 196, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: player.player_id === currentUserId ? '2px solid #4ECDC4' : '2px solid transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: player.role === 'seeker'
                        ? 'linear-gradient(135deg, #FF6B6B, #FF1744)'
                        : 'linear-gradient(135deg, #4ECDC4, #26D0CE)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      {player.role === 'seeker' ? '👁️' : '🥷'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#ffffff'
                      }}>
                        {player.profile?.username || 'Player'}
                        {player.player_id === currentUserId && (
                          <span style={{
                            fontSize: '10px',
                            marginLeft: '6px',
                            color: '#4ECDC4'
                          }}>
                            (YOU)
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: player.role === 'seeker' ? '#FF6B6B' : '#4ECDC4'
                      }}>
                        {player.role === 'seeker' ? 'Seeker' : 'Hidden'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Safe Players Section */}
            {multiplayerPlayers.filter(p => p.has_reached_den && p.role === 'hider').length > 0 && (
              <>
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '16px',
                  marginTop: '8px'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#48BB78'
                  }}>
                    Safe Players ({multiplayerPlayers.filter(p => p.has_reached_den && p.role === 'hider').length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {multiplayerPlayers.filter(p => p.has_reached_den && p.role === 'hider').map((player) => (
                      <div
                        key={player.id}
                        style={{
                          background: 'rgba(72, 187, 120, 0.1)',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '2px solid rgba(72, 187, 120, 0.3)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #48BB78, #38A169)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}>
                            ✅
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: '#48BB78'
                            }}>
                              {player.profile?.username || 'Player'}
                              {player.player_id === currentUserId && (
                                <span style={{
                                  fontSize: '10px',
                                  marginLeft: '6px',
                                  color: '#48BB78'
                                }}>
                                  (YOU)
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#48BB78'
                            }}>
                              Reached Den
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Found Players Section */}
            {multiplayerPlayers.filter(p => p.is_found && p.role === 'hider').length > 0 && (
              <>
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '16px',
                  marginTop: '8px'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#A0AEC0'
                  }}>
                    Found Players ({multiplayerPlayers.filter(p => p.is_found && p.role === 'hider').length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {multiplayerPlayers.filter(p => p.is_found && p.role === 'hider').map((player) => (
                      <div
                        key={player.id}
                        style={{
                          background: 'rgba(160, 174, 192, 0.1)',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '2px solid rgba(160, 174, 192, 0.3)',
                          opacity: 0.7
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #A0AEC0, #718096)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}>
                            ❌
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: '#A0AEC0'
                            }}>
                              {player.profile?.username || 'Player'}
                              {player.player_id === currentUserId && (
                                <span style={{
                                  fontSize: '10px',
                                  marginLeft: '6px',
                                  color: '#A0AEC0'
                                }}>
                                  (YOU)
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#A0AEC0'
                            }}>
                              Eliminated
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Movement Controls */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '24px',
          justifySelf: 'center'
        }}>
          <button
            onClick={() => movePlayer('up')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ↑
          </button>
          <div style={{ display: 'flex', gap: '48px' }}>
            <button
              onClick={() => movePlayer('left')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ←
            </button>
            <button
              onClick={() => movePlayer('right')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              →
            </button>
          </div>
          <button
            onClick={() => movePlayer('down')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ↓
          </button>
        </div>

        {/* Grid Toggle */}
        <div style={{ justifySelf: 'center' }}>
          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{
              background: showGrid ? '#4ECDC4' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Grid3X3 size={16} />
          </button>
        </div>

        {/* Game Info */}
        <div style={{ justifySelf: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {gamePhase === 'hiding' && 'Seeker is waiting in the den'}
            {gamePhase === 'seeking' && !hiderSpotted && 'Stay out of the red vision circle!'}
            {gamePhase === 'seeking' && hiderSpotted && !seekerReturning && 'You\'ve been spotted! Get to the den!'}
            {gamePhase === 'seeking' && seekerReturning && 'Race to the den before the seeker!'}
          </div>
          {isAtDen(playerPosition) && (
            <div style={{ 
              fontSize: '14px', 
              color: '#4ECDC4', 
              fontWeight: 'bold',
              marginTop: '4px'
            }}>
              🏠 At the Den!
            </div>
          )}
        </div>
      </div>

      {/* Game End Modal */}
      {showEndModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {gameResult === 'hider_wins' ? '🎉' : '🤖'}
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: gameResult === 'hider_wins' ? '#4ECDC4' : '#FF6B6B'
            }}>
              {gameResult === 'hider_wins' ? 'Hider Wins!' : 'Seeker Wins!'}
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: '#A0AEC0', 
              marginBottom: '24px' 
            }}>
              {gameResult === 'hider_wins' 
                ? (hiderSpotted 
                    ? 'You reached the den first! Great escape!' 
                    : 'Perfect hiding! You survived the hunt!')
                : 'The AI caught you! Better luck next time!'}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={isMultiplayer ? handleBackToLobby : handlePlayAgain}
                style={{
                  background: '#FF6B6B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isMultiplayer ? 'Back to Lobby' : 'Play Again'}
              </button>
              <button
                onClick={handleGoHome}
                style={{
                  background: '#4A5568',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}