import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { 
  ArrowLeft,
  Eye,
  EyeOff,
  Users,
  Clock,
  MapPin,
  Target,
  MessageCircle,
  Volume2,
  VolumeX,
  Trophy,
  Star
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { GameManager } from '@/utils/gameLogic';
import ChatSystem from '@/app/components/social/ChatSystem';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const { currentGame } = useGameStore();
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 150 });
  const [isHiding, setIsHiding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);

  useEffect(() => {
    if (currentGame.id) {
      const manager = new GameManager(
        {
          maxPlayers: currentGame.settings.maxPlayers,
          roundTime: currentGame.settings.roundTime,
          seekerCount: currentGame.settings.seekerCount,
          rounds: 3,
        },
        (newState) => {
          if (newState.phase === 'ended') {
            setGameResults(newState);
            setShowEndModal(true);
          }
        }
      );
      setGameManager(manager);
      manager.startGame();

      return () => manager.cleanup();
    }
  }, [currentGame.id]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (currentGame.phase) {
      case 'hiding': return 'HIDE!';
      case 'seeking': return 'SEEK!';
      case 'ended': return 'GAME OVER';
      case 'lobby': return 'WAITING...';
    }
  };

  const getPhaseColor = () => {
    switch (currentGame.phase) {
      case 'hiding': return '#4ECDC4';
      case 'seeking': return '#FF6B6B';
      case 'ended': return '#FFE66D';
      default: return '#A0AEC0';
    }
  };

  const movePlayer = (direction: string) => {
    const moveDistance = 20;
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'up': newY = Math.max(0, prev.y - moveDistance); break;
        case 'down': newY = Math.min(300, prev.y + moveDistance); break;
        case 'left': newX = Math.max(0, prev.x - moveDistance); break;
        case 'right': newX = Math.min(width - 80, prev.x + moveDistance); break;
      }
      
      // Update game manager with new position
      gameManager?.updatePlayerPosition('current_user', { x: newX, y: newY });
      
      return { x: newX, y: newY };
    });
  };

  const toggleHiding = () => {
    const currentPlayer = currentGame.players.find(p => p.id === 'current_user');
    if (currentPlayer?.role === 'hider') {
      setIsHiding(!isHiding);
    }
  };

  const handleTagPlayer = () => {
    // Implementation for tagging nearby players
    Alert.alert('Tag!', 'You tagged a player!');
  };

  const handleGameEnd = () => {
    setShowEndModal(false);
    router.back();
  };

  const currentPlayer = currentGame.players.find(p => p.id === 'current_user');

  return (
    <View style={styles.container}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={() => {
            Alert.alert(
              'Leave Game',
              'Are you sure you want to leave the game?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', onPress: () => router.back() }
              ]
            );
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.gameInfo}>
          <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
            {getPhaseText()}
          </Text>
          <Text style={styles.timeText}>{formatTime(currentGame.timeLeft)}</Text>
          <Text style={styles.roundText}>
            Round {currentGame.round}/{currentGame.maxRounds}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={() => setVoiceChatEnabled(!voiceChatEnabled)}
          >
            {voiceChatEnabled ? (
              <Volume2 size={20} color="#4ECDC4" />
            ) : (
              <VolumeX size={20} color="#A0AEC0" />
            )}
          </TouchableOpacity>
          <View style={styles.roleIndicator}>
            <Text style={styles.roleText}>
              {currentPlayer?.role === 'hider' ? '🥷' : '👁️'}
            </Text>
          </View>
        </View>
      </View>

      {/* Game Canvas */}
      <View style={styles.canvasContainer}>
        <GameCanvas canvasHeight={300} />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Movement Controls */}
        <View style={styles.movementControls}>
          <TouchableOpacity 
            style={styles.moveButton}
            onPress={() => movePlayer('up')}
          >
            <Text style={styles.moveButtonText}>↑</Text>
          </TouchableOpacity>
          <View style={styles.horizontalControls}>
            <TouchableOpacity 
              style={styles.moveButton}
              onPress={() => movePlayer('left')}
            >
              <Text style={styles.moveButtonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.moveButton}
              onPress={() => movePlayer('right')}
            >
              <Text style={styles.moveButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.moveButton}
            onPress={() => movePlayer('down')}
          >
            <Text style={styles.moveButtonText}>↓</Text>
          </TouchableOpacity>
        </View>

        {/* Action Controls */}
        <View style={styles.actionControls}>
          {currentPlayer?.role === 'hider' && (
            <TouchableOpacity 
              style={[styles.actionButton, isHiding && styles.activeAction]}
              onPress={toggleHiding}
            >
              {isHiding ? <EyeOff size={20} color="#FFFFFF" /> : <Eye size={20} color="#FFFFFF" />}
              <Text style={styles.actionButtonText}>
                {isHiding ? 'Stop Hiding' : 'Hide'}
              </Text>
            </TouchableOpacity>
          )}
          
          {currentPlayer?.role === 'seeker' && (
            <TouchableOpacity style={styles.actionButton} onPress={handleTagPlayer}>
              <Target size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Tag Player</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Player List */}
      <View style={styles.playerList}>
        <Text style={styles.playerListTitle}>Players ({currentGame.players.length})</Text>
        <View style={styles.playerIcons}>
          {currentGame.players.map((player) => (
            <View 
              key={player.id} 
              style={[
                styles.playerIcon,
                player.role === 'seeker' && styles.seekerIcon,
                player.isFound && styles.foundIcon
              ]}
            >
              <Text style={styles.playerIconText}>{player.name[0]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Game End Modal */}
      <Modal
        visible={showEndModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.endModalContent}>
            <Trophy size={48} color="#FFE66D" />
            <Text style={styles.endTitle}>Game Complete!</Text>
            
            {gameResults && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Final Scores</Text>
                {gameResults.players
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((player: any, index: number) => (
                    <View key={player.id} style={styles.resultRow}>
                      <Text style={styles.resultRank}>#{index + 1}</Text>
                      <Text style={styles.resultName}>{player.id === 'current_user' ? 'You' : `Player${index}`}</Text>
                      <Text style={styles.resultScore}>{player.score} pts</Text>
                      {index === 0 && <Star size={16} color="#FFE66D" />}
                    </View>
                  ))}
              </View>
            )}

            <View style={styles.endActions}>
              <TouchableOpacity style={styles.playAgainButton} onPress={handleGameEnd}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeButton} onPress={handleGameEnd}>
                <Text style={styles.homeButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    alignItems: 'center',
    flex: 1,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roundText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  roleIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 20,
  },
  canvasContainer: {
    flex: 1,
    margin: 24,
  },
  controlsContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  movementControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    marginVertical: 8,
  },
  moveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionControls: {
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeAction: {
    backgroundColor: '#4ECDC4',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playerList: {
    position: 'absolute',
    top: 120,
    right: 24,
    backgroundColor: '#2D374880',
    borderRadius: 12,
    padding: 12,
  },
  playerListTitle: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerIcons: {
    flexDirection: 'column',
  },
  playerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  seekerIcon: {
    backgroundColor: '#FF6B6B',
  },
  foundIcon: {
    backgroundColor: '#718096',
    opacity: 0.6,
  },
  playerIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000090',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endModalContent: {
    backgroundColor: '#2D3748',
    borderRadius: 20,
    padding: 32,
    margin: 24,
    alignItems: 'center',
    width: '90%',
  },
  endTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 24,
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  resultRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE66D',
    width: 40,
  },
  resultName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultScore: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginRight: 8,
  },
  endActions: {
    flexDirection: 'row',
    width: '100%',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  playAgainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});