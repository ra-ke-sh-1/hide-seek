import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Copy, Users, Clock, Eye, Play, UserPlus, Crown, Settings } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useRealtime } from '../hooks/useRealtime';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Player {
  id: string;
  player_id: string;
  game_id: string;
  role: 'hider' | 'seeker';
  position: { x: number; y: number };
  is_found: boolean;
  score: number;
  profile?: {
    username: string;
  };
}

interface Game {
  id: string;
  lobby_code: string;
  host_id: string;
  world_id: string;
  max_players: number;
  current_players: number;
  status: string;
}

export default function MultiplayerLobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const gameId = searchParams.get('game');

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Load game and players - ONLY ONCE on mount
  useEffect(() => {
    if (!gameId) {
      navigate('/play');
      return;
    }

    if (!user) {
      console.log('[Lobby] Waiting for user to load...');
      return; // Wait for user to load
    }

    let mounted = true;

    const loadGameData = async () => {
      try {
        console.log('[Lobby] Initial load starting...');

        // Fetch game details
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;
        if (!mounted) return;

        console.log('[Lobby] Game data loaded:', gameData);
        setGame(gameData);
        setIsHost(gameData.host_id === user.id);

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select('*')
          .eq('game_id', gameId);

        if (playersError) throw playersError;
        if (!mounted) return;

        console.log('[Lobby] Players data loaded:', playersData);

        // Fetch profiles for players
        if (playersData && playersData.length > 0) {
          const playerIds = playersData.map(p => p.player_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', playerIds);

          if (!mounted) return;

          console.log('[Lobby] Profiles loaded:', profiles);

          // Merge profiles with players
          const playersWithProfiles = playersData.map(player => ({
            ...player,
            profile: profiles?.find(p => p.id === player.player_id)
          }));

          console.log('[Lobby] Initial players loaded:', playersWithProfiles);
          setPlayers(playersWithProfiles);
        } else {
          console.log('[Lobby] No players found initially');
          setPlayers([]);
        }

        console.log('[Lobby] Setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('[Lobby] Failed to load game data:', error);
        if (mounted) {
          alert('Failed to load lobby');
          navigate('/play');
        }
      }
    };

    loadGameData();

    return () => {
      mounted = false;
    };
  }, [gameId, user, navigate]); // Added back user and navigate but with proper logic

  // Function to reload players (memoized to prevent infinite loops)
  const reloadPlayers = useCallback(async () => {
    if (!gameId || isReloading) {
      console.log('[Lobby] Skipping reload - already in progress');
      return;
    }

    setIsReloading(true);
    console.log('[Lobby] Starting player reload...');

    try {
      // First get all players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId);

      if (playersError) {
        console.error('Error loading players:', playersError);
        setIsReloading(false);
        return;
      }

      if (playersData) {
        // Then get profiles for each player
        const playerIds = playersData.map(p => p.player_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', playerIds);

        // Merge profiles with players
        const playersWithProfiles = playersData.map(player => ({
          ...player,
          profile: profiles?.find(p => p.id === player.player_id)
        }));

        console.log('[Lobby] Players reloaded:', playersWithProfiles);
        setPlayers(playersWithProfiles);

        // Update game player count
        setGame(prev => prev ? { ...prev, current_players: playersWithProfiles.length } : prev);
      }
    } catch (error) {
      console.error('Error reloading players:', error);
    } finally {
      setIsReloading(false);
    }
  }, [gameId, isReloading]);

  // Real-time player updates via Supabase Realtime
  const { sendMessage, isConnected } = useRealtime(`game_${gameId}`, async (payload) => {
    console.log('[Lobby] ========================================');
    console.log('[Lobby] Realtime event received:', JSON.stringify(payload, null, 2));
    console.log('[Lobby] Current game object:', game);
    console.log('[Lobby] ========================================');

    // Check different possible event type fields
    const eventType = payload.eventType || payload.event;

    // Only reload on game_players table changes (INSERT/DELETE), not on every UPDATE
    if (payload.table === 'game_players') {
      console.log(`[Lobby] game_players event detected: ${eventType}`);

      if (eventType === 'INSERT' || eventType === 'DELETE') {
        console.log(`[Lobby] ✅ Player ${eventType === 'INSERT' ? 'joined' : 'left'}, reloading player list`);
        await reloadPlayers();
      } else if (eventType === 'UPDATE') {
        console.log(`[Lobby] ⏭️  Ignoring UPDATE event on game_players`);
      } else {
        console.log(`[Lobby] ⚠️  Unknown event type: ${eventType}`);
        // Reload anyway if we're not sure what it is
        await reloadPlayers();
      }
    }

    // Handle game start
    console.log('[Lobby] Checking if game should start...');
    console.log('[Lobby] - payload.table:', payload.table);
    console.log('[Lobby] - payload.new:', payload.new);
    console.log('[Lobby] - payload.new?.status:', payload.new?.status);

    if (payload.table === 'games') {
      console.log('[Lobby] ✓ Event is for games table');
      if (payload.new?.status === 'in_progress') {
        console.log('[Lobby] 🎮🎮🎮 GAME STARTING! Navigating to game screen...');
        console.log('[Lobby] Navigation URL:', `/game?world=${game?.world_id}&multiplayer=true&game=${gameId}`);
        navigate(`/game?world=${game?.world_id}&multiplayer=true&game=${gameId}`);
      } else {
        console.log('[Lobby] ❌ Game status is NOT in_progress, it is:', payload.new?.status);
      }
    } else {
      console.log('[Lobby] ❌ Event is NOT for games table, it is for:', payload.table);
    }
  });

  // Log realtime connection status only
  useEffect(() => {
    if (!gameId) return;

    if (isConnected) {
      console.log('[Lobby] ✅ Realtime connected - live updates active');
    } else {
      console.log('[Lobby] ⚠️ Realtime not connected yet...');
    }
  }, [gameId, isConnected]);

  // Polling fallback for local development (postgres_changes may not work in local Supabase)
  // This will be redundant but harmless in production if postgres_changes works
  useEffect(() => {
    if (!gameId || !game) return;

    console.log('[Lobby] 🔄 Starting polling fallback (every 2 seconds)');

    const pollInterval = setInterval(async () => {
      try {
        // Poll for game status changes
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) {
          console.error('[Lobby Polling] Error fetching game:', gameError);
          return;
        }

        // Check if game started
        if (gameData && gameData.status === 'in_progress' && game.status !== 'in_progress') {
          console.log('[Lobby Polling] 🎮 Game started! Navigating...');
          navigate(`/game?world=${game.world_id}&multiplayer=true&game=${gameId}`);
          return; // Stop polling after navigation
        }

        // Poll for player list changes
        const { data: playersData, error: playersError } = await supabase
          .from('game_players')
          .select(`
            *,
            profile:profiles(username)
          `)
          .eq('game_id', gameId);

        if (playersError) {
          console.error('[Lobby Polling] Error fetching players:', playersError);
          return;
        }

        // Update players if count changed
        if (playersData && playersData.length !== players.length) {
          console.log('[Lobby Polling] 👥 Player count changed, updating list');
          setPlayers(playersData);
        }

        // Update game state
        if (gameData && gameData.current_players !== game.current_players) {
          console.log('[Lobby Polling] 📊 Player count updated');
          setGame(gameData);
        }
      } catch (error) {
        console.error('[Lobby Polling] Error:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('[Lobby] 🛑 Stopping polling fallback');
      clearInterval(pollInterval);
    };
  }, [gameId, game, players.length, navigate]);

  const copyLobbyCode = async () => {
    if (!game?.lobby_code) return;

    try {
      await navigator.clipboard.writeText(game.lobby_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = game.lobby_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleStartGame = async () => {
    if (!isHost || !game || players.length < 2) return;

    try {
      // Update game status to in_progress
      const { error } = await supabase
        .from('games')
        .update({ status: 'in_progress' })
        .eq('id', gameId);

      if (error) throw error;

      // Assign roles (1 seeker, rest hiders)
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffledPlayers.length; i++) {
        await supabase
          .from('game_players')
          .update({ role: i === 0 ? 'seeker' : 'hider' })
          .eq('id', shuffledPlayers[i].id);
      }

      // Navigate to game
      navigate(`/game?world=${game.world_id}&multiplayer=true&game=${gameId}`);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game');
    }
  };

  const handleLeaveLobby = async () => {
    if (!user || !gameId) return;

    try {
      if (isHost) {
        // Host leaving - delete entire game
        await supabase.from('games').delete().eq('id', gameId);
      } else {
        // Player leaving - remove from game_players
        await supabase
          .from('game_players')
          .delete()
          .eq('game_id', gameId)
          .eq('player_id', user.id);

        // Update player count
        if (game) {
          await supabase
            .from('games')
            .update({ current_players: game.current_players - 1 })
            .eq('id', gameId);
        }
      }

      navigate('/play');
    } catch (error) {
      console.error('Failed to leave lobby:', error);
      alert('Failed to leave lobby');
    }
  };

  if (loading || !game) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2>Loading lobby...</h2>
        </div>
      </div>
    );
  }

  const canStart = players.length >= 2 && isHost;
  const emptySlots = game.max_players - players.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      padding: '20px',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <button
          onClick={handleLeaveLobby}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          <ArrowLeft size={16} />
          Leave
        </button>

        <div style={{ flex: 1, textAlign: 'center', minWidth: '200px' }}>
          <h1 style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            🎮 Game Lobby
          </h1>
          <button
            onClick={copyLobbyCode}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #26D0CE)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '3px'
            }}
          >
            {game.lobby_code}
            <Copy size={16} />
          </button>
          {copiedCode && (
            <div style={{
              fontSize: '12px',
              color: '#4ECDC4',
              marginTop: '4px'
            }}>
              ✓ Copied!
            </div>
          )}
          {/* Realtime connection status */}
          <div style={{
            fontSize: '10px',
            color: isConnected ? '#4ECDC4' : '#FFE66D',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isConnected ? '#4ECDC4' : '#FFE66D',
              boxShadow: isConnected ? '0 0 8px #4ECDC4' : '0 0 8px #FFE66D'
            }}></div>
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </div>
        </div>

        <div style={{ width: '100px' }}></div>
      </div>

      {/* Game Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
        maxWidth: '600px',
        margin: '0 auto 24px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Users size={20} color="#4ECDC4" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', color: '#a0aec0' }}>Players</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {players.length}/{game.max_players}
          </div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Clock size={20} color="#FFE66D" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', color: '#a0aec0' }}>Round Time</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>180s</div>
        </div>

        <div style={{
          background: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Eye size={20} color="#FF6B6B" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', color: '#a0aec0' }}>Seekers</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1</div>
        </div>
      </div>

      {/* Players List */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Players in Lobby
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {players.map((player) => (
            <div
              key={player.id}
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: player.player_id === user?.id ? '2px solid #4ECDC4' : '2px solid transparent'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B9D, #4ECDC4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🥷
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {player.profile?.username || 'Player'}
                  {player.player_id === game.host_id && (
                    <Crown size={14} color="#FFE66D" />
                  )}
                  {player.player_id === user?.id && (
                    <span style={{
                      fontSize: '10px',
                      background: '#4ECDC4',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                  {player.player_id === game.host_id ? 'Host' : 'Player'}
                </div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ECDC4',
                boxShadow: '0 0 8px #4ECDC4'
              }}></div>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`empty_${index}`}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '2px dashed rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(75, 85, 99, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus size={20} color="#718096" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Waiting for player...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
      }}>
        <button
          onClick={handleStartGame}
          disabled={!canStart}
          style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: canStart
              ? 'linear-gradient(135deg, #FF6B6B, #FF1744)'
              : 'rgba(75, 85, 99, 0.5)',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: canStart ? 'pointer' : 'not-allowed',
            opacity: canStart ? 1 : 0.6,
            transition: 'all 0.3s ease'
          }}
        >
          <Play size={20} />
          {canStart
            ? '🎮 Start Game'
            : `⏳ Need ${2 - players.length} more player${2 - players.length === 1 ? '' : 's'}`}
        </button>

        {!isHost && (
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            fontSize: '12px',
            color: '#a0aec0'
          }}>
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
