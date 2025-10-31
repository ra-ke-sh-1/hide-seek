import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Users, Lock, Trophy, Zap, Map, Star, Bot, Crown, Target, Gamepad2, Copy } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useWorldStore } from '../stores/worldStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

// Remove React Native import and use standard UUID generation
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function PlayScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('mode');
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState('quick');
  const [joinCode, setJoinCode] = useState('');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [showWorldSelector, setShowWorldSelector] = useState(false);
  const [createdLobbyCode, setCreatedLobbyCode] = useState<string | null>(null);
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const { joinGame } = useGameStore();
  const { featuredWorlds, savedWorlds, loadFeaturedWorlds, loadSavedWorlds } = useWorldStore();

  useEffect(() => {
    loadFeaturedWorlds();
    loadSavedWorlds();
  }, []);

  const allWorlds = [...featuredWorlds, ...savedWorlds];
  const selectedWorld = allWorlds.find(w => w.id === selectedWorldId);

  const gameModes = [
    {
      id: 'quick',
      name: '⚡ INSTANT BATTLE!',
      description: 'Jump into action with random players - NO WAITING!',
      players: '6-12 players',
      duration: '5-8 min',
      icon: <Zap size={36} color="#FFFFFF" />,
      gradient: 'linear-gradient(145deg, #FF6B9D 0%, #FF1744 100%)',
      emoji: '🚀'
    },
    {
      id: 'friends',
      name: '👥 SQUAD UP!',
      description: 'Create epic private rooms with your bestiesss!',
      players: '2-12 players',
      duration: 'Custom vibes',
      icon: <Users size={36} color="#FFFFFF" />,
      gradient: 'linear-gradient(145deg, #4ECDC4 0%, #26D0CE 100%)',
      emoji: '🎉'
    },
    {
      id: 'ai',
      name: '🤖 AI SHOWDOWN!',
      description: 'Test your ninja skills against AI - choose your difficulty!',
      players: '1v1 battle',
      duration: '3-5 min',
      icon: <Bot size={36} color="#FFFFFF" />,
      gradient: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
      emoji: '🧠'
    },
    {
      id: 'tournament',
      name: '🏆 RANKED BATTLES!',
      description: 'Compete for glory and flex on everyone with rewards!',
      players: '8-16 players',
      duration: '15-25 min',
      icon: <Trophy size={36} color="#FFFFFF" />,
      gradient: 'linear-gradient(145deg, #FFE66D 0%, #FF9F43 100%)',
      emoji: '👑'
    }
  ];

  const handleModeSelect = (modeId: string) => {
    setGameMode(modeId);
    setStep('world');
  };

  const handleStartGame = () => {
    if (!selectedWorldId) {
      setShowWorldSelector(true);
      return;
    }

    if (selectedMode === 'quick') {
      handleQuickPlay();
    } else if (selectedMode === 'friends') {
      createPrivateLobby();
    } else if (selectedMode === 'ai') {
      handlePlayWithAI();
    } else if (selectedMode === 'tournament') {
      alert('🏆 Tournament mode coming soon! Get ready for EPIC battles! 💯');
    }
  };

  const handleQuickPlay = () => {
    if (!selectedWorldId) {
      setShowWorldSelector(true);
      return;
    }
    setIsMatchmaking(true);
    setTimeout(() => {
      const gameId = `game_${Date.now()}`;
      const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      joinGame(gameId, lobbyCode);
      setIsMatchmaking(false);
      navigate(`/game?world=${selectedWorldId}`);
    }, 2000);
  };

  const handlePlayWithAI = () => {
    if (!selectedWorldId) {
      setShowWorldSelector(true);
      return;
    }
    navigate(`/game?mode=ai&world=${selectedWorldId}`);
  };

  const createPrivateLobby = () => {
    if (!selectedWorldId) {
      setShowWorldSelector(true);
      return;
    }
    const gameId = `private_${Date.now()}`;
    const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    joinGame(gameId, lobbyCode);
    navigate(`/game?world=${selectedWorldId}`);
  };

  const handleStartFriendsGame = () => {
    if (!selectedWorldId) return;
    createMultiplayerLobby();
  };

  const createMultiplayerLobby = async () => {
    if (!selectedWorldId) return;
    
    setIsCreatingLobby(true);
    
    try {
      const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      // Create local game session
      const gameId = `local_${Date.now()}`;
      
      setCreatedLobbyCode(lobbyCode);
      joinGame(gameId, lobbyCode);
      
    } catch (error) {
      console.error('Failed to create lobby:', error);
      // Fallback to local lobby creation
      const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      const gameId = `local_${Date.now()}`;
      setCreatedLobbyCode(lobbyCode);
      joinGame(gameId, lobbyCode);
    } finally {
      setIsCreatingLobby(false);
    }
  };

  const handleJoinWithCode = () => {
    if (joinCode.length !== 6) {
      alert('Please enter a valid 6-character room code.');
      return;
    }
    
    joinMultiplayerGame(joinCode);
  };

  const joinMultiplayerGame = async (code: string) => {
    if (!code) return;
    
    try {
      console.log('Attempting to join game with code:', code);
      
      // Find game by lobby code
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('lobby_code', code)
        .eq('status', 'waiting')
        .single();
      
      if (gameError) {
        console.error('Game lookup error:', gameError);
        throw new Error('Game not found or already started. Please check the code.');
      }
      
      console.log('Found game:', gameData);
      
      // Check if game is full
      const { count, error: countError } = await supabase
        .from('game_players')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameData.id);
      
      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }
      
      console.log('Current player count:', count);
      
      if (count && count >= gameData.max_players) {
        throw new Error('This game is full. Please try another code.');
      }
      
      // Add player to game
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          game_id: gameData.id,
          player_id: user.id,
          role: 'hider', // Default role, will be reassigned when game starts
          position: { x: 100, y: 150 },
          is_found: false,
          score: 0
        });
      
      if (playerError) {
        console.error('Player insert error:', playerError);
        throw playerError;
      }
      
      // Update current players count
      const { error: updateError } = await supabase
        .from('games')
        .update({ current_players: (count || 0) + 1 })
        .eq('id', gameData.id);
      
      if (updateError) {
        console.error('Game update error:', updateError);
        throw updateError;
      }
      
      console.log('Successfully joined game');
      joinGame(gameData.id, code);
      navigate(`/game?world=${gameData.world_id}&multiplayer=true`);
      
    } catch (error) {
      console.error('Failed to join game:', error);
      alert(`Failed to join game: ${error.message || 'Unknown error'}`);
    }
  };

  const copyLobbyCode = async () => {
    if (!createdLobbyCode) return;
    
    try {
      await navigator.clipboard.writeText(createdLobbyCode);
      alert('Lobby code copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = createdLobbyCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Lobby code copied!');
    }
  };

  const handleWorldSelect = (worldId: string) => {
    setSelectedWorldId(worldId);
    setShowWorldSelector(false);
    
    if (gameMode === 'friends') {
      setStep('lobby');
    } else if (gameMode === 'ai') {
      navigate(`/game?mode=ai&world=${worldId}`);
    }
  };

  return (
    <div className="container">
      {/* Epic floating emojis */}
      <div className="emoji-float">🎮</div>
      <div className="emoji-float">🥷</div>
      <div className="emoji-float">👁️</div>
      <div className="emoji-float">⚡</div>
      <div className="emoji-float">🔥</div>
      <div className="emoji-float">💯</div>

      {/* Header */}
      <div className="header">
        <button 
          className="button secondary hover-bounce"
          style={{ 
            padding: '16px 20px',
            transform: 'rotate(-1deg)'
          }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={24} />
          BACK HOME!
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900',
            background: 'linear-gradient(45deg, #FF6B9D, #4ECDC4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(255, 107, 157, 0.8)',
            transform: 'rotate(1deg)'
          }}>
            🎮 CHOOSE YOUR BATTLE! 🎮
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '700',
            marginTop: '8px'
          }}>
            Time to show everyone who's boss! 💪
          </p>
        </div>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', paddingBottom: '120px', position: 'relative', zIndex: 5 }}>
        {/* Step 1: Choose Game Mode */}
        {step === 'mode' && (
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              textAlign: 'center',
              color: '#ffffff'
            }}>
              How do you want to play?
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                className="button"
                style={{ 
                  width: '100%',
                  fontSize: '18px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #A855F7, #7C3AED)'
                }}
                onClick={() => handleModeSelect('ai')}
              >
                🤖 Play vs AI Bot
              </button>
              
              <button 
                className="button secondary"
                style={{ 
                  width: '100%',
                  fontSize: '18px',
                  padding: '20px'
                }}
                onClick={() => handleModeSelect('friends')}
              >
                👥 Play with Friends
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose World */}
        {step === 'world' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                style={{
                  background: 'rgba(75, 85, 99, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setStep('mode')}
              >
                ← Back
              </button>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
                flex: 1
              }}>
                Choose World {gameMode === 'ai' ? '(vs AI)' : '(with Friends)'}
              </h2>
            </div>
            
            {allWorlds.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <Map size={48} color="rgba(255, 255, 255, 0.6)" />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '16px 0', color: '#ffffff' }}>
                  No worlds available
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
                  Create your first world to start playing!
                </p>
                <button 
                  className="button accent"
                  onClick={() => navigate('/world-builder')}
                >
                  <Map size={20} />
                  Create World
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {allWorlds.map((world) => (
                  <div
                    key={world.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleWorldSelect(world.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={world.thumbnail} 
                        alt={world.name}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '12px',
                          marginRight: '16px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          marginBottom: '4px',
                          color: '#ffffff'
                        }}>
                          {world.name}
                        </h3>
                        <p style={{ 
                          fontSize: '12px', 
                          color: 'rgba(255, 255, 255, 0.7)',
                          marginBottom: '8px'
                        }}>
                          by {world.creatorName}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            👥 {world.playCount}
                          </span>
                          <span style={{ 
                            fontSize: '10px', 
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            ⭐ {world.rating}
                          </span>
                        </div>
                      </div>
                      <Play size={20} color="#4ECDC4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Friends Lobby Setup */}
        {step === 'lobby' && gameMode === 'friends' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                style={{
                  background: 'rgba(75, 85, 99, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setStep('world')}
              >
                ← Back
              </button>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
                flex: 1
              }}>
                Friends Game Setup
              </h2>
            </div>
            
            {/* Show created lobby code */}
            {createdLobbyCode && (
              <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#4ECDC4' }}>
                  🎉 Lobby Created!
                </h3>
                <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '16px' }}>
                  Share this code with your friends:
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #4ECDC4, #26D0CE)',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    letterSpacing: '3px'
                  }}>
                    {createdLobbyCode}
                  </div>
                  <button 
                    className="button secondary"
                    style={{ padding: '12px 16px' }}
                    onClick={copyLobbyCode}
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <button 
                  className="button"
                  style={{ width: '100%', fontSize: '16px', padding: '16px' }}
                  onClick={() => navigate(`/game?world=${selectedWorldId}&multiplayer=true`)}
                >
                  <Play size={20} />
                  Enter Lobby
                </button>
              </div>
            )}
            
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>
                {createdLobbyCode ? 'Create Another Room' : 'Create Private Room'}
              </h3>
              <button 
                className={`button ${isCreatingLobby ? 'secondary' : ''}`}
                style={{ 
                  width: '100%', 
                  fontSize: '16px', 
                  padding: '16px',
                  opacity: isCreatingLobby ? 0.6 : 1
                }}
                onClick={handleStartFriendsGame}
                disabled={isCreatingLobby}
              >
                {isCreatingLobby ? (
                  <>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid #ffffff', 
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Users size={20} />
                    Create Room & Get Code
                  </>
                )}
              </button>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>
                Join Friend's Room
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                  }}
                />
                <button 
                  className="button secondary"
                  style={{ 
                    padding: '12px 20px',
                    opacity: joinCode.length === 6 ? 1 : 0.6
                  }}
                  onClick={handleJoinWithCode}
                  disabled={joinCode.length !== 6}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Compact Help Text */}
      <div style={{
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.5)',
        background: 'rgba(15, 23, 42, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        💡 Choose your game mode and world to start playing!
      </div>

      <Navigation />
    </div>
  );
}