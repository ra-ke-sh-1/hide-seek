import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { 
  Play, 
  Users, 
  Lock, 
  Search, 
  Filter, 
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Trophy,
  Zap
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { useWorldStore } from '@/stores/worldStore';
import { generateLobbyCode, validateLobbyCode } from '@/utils/gameLogic';

interface GameMode {
  id: string;
  name: string;
  description: string;
  players: string;
  duration: string;
  icon: React.ReactNode;
}

const gameModes: GameMode[] = [
  {
    id: 'quick',
    name: 'Quick Play',
    description: 'Fast 3-round matches with auto-matchmaking',
    players: '6-12',
    duration: '8-12 min',
    icon: <Play size={24} color="#FF6B6B" />
  },
  {
    id: 'private',
    name: 'Private Lobby',
    description: 'Invite friends with custom room codes',
    players: '2-12',
    duration: 'Custom',
    icon: <Lock size={24} color="#4ECDC4" />
  },
  {
    id: 'tournament',
    name: 'Tournament',
    description: 'Ranked competitive matches with rewards',
    players: '8-16',
    duration: '15-25 min',
    icon: <Trophy size={24} color="#FFE66D" />
  }
];

export default function PlayScreen() {
  const [selectedMode, setSelectedMode] = useState('quick');
  const [showLobbyModal, setShowLobbyModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const { joinGame, updateSettings } = useGameStore();
  const { featuredWorlds, loadFeaturedWorlds } = useWorldStore();

  useEffect(() => {
    loadFeaturedWorlds();
  }, []);

  const handleQuickPlay = () => {
    setIsMatchmaking(true);
    // Simulate matchmaking delay
    setTimeout(() => {
      const gameId = `game_${Date.now()}`;
      const lobbyCode = generateLobbyCode();
      joinGame(gameId, lobbyCode);
      setIsMatchmaking(false);
      router.push(`/lobby/${gameId}`);
    }, 2000);
  };

  const createPrivateLobby = () => {
    const gameId = `private_${Date.now()}`;
    const lobbyCode = generateLobbyCode();
    joinGame(gameId, lobbyCode);
    router.push(`/lobby/${gameId}`);
  };

  const handleJoinWithCode = () => {
    if (!validateLobbyCode(joinCode)) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character room code.');
      return;
    }
    
    // In production, this would validate the code with the server
    const gameId = `join_${joinCode}`;
    joinGame(gameId, joinCode);
    router.push(`/lobby/${gameId}`);
  };

  const handleTournamentPlay = () => {
    Alert.alert(
      'Tournament Mode',
      'Join ranked matches and compete for exclusive rewards!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Find Match', onPress: handleQuickPlay }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Play Hide&Seek</Text>
          <Text style={styles.subtitle}>Choose your game mode</Text>
        </View>

        {/* Game Mode Selection */}
        <View style={styles.modeSection}>
          {gameModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                selectedMode === mode.id && styles.selectedMode
              ]}
              onPress={() => setSelectedMode(mode.id)}
            >
              <View style={styles.modeIcon}>
                {mode.icon}
              </View>
              <View style={styles.modeInfo}>
                <Text style={styles.modeName}>{mode.name}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
                <View style={styles.modeStats}>
                  <Text style={styles.modeStatText}>👥 {mode.players}</Text>
                  <Text style={styles.modeStatText}>⏱️ {mode.duration}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {selectedMode === 'quick' && (
            <TouchableOpacity 
              style={[styles.playButton, isMatchmaking && styles.disabledButton]}
              onPress={handleQuickPlay}
              disabled={isMatchmaking}
            >
              {isMatchmaking ? (
                <>
                  <Zap size={24} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>Finding Match...</Text>
                </>
              ) : (
                <>
                  <Play size={24} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>Start Quick Play</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {selectedMode === 'private' && (
            <>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={createPrivateLobby}
              >
                <Lock size={24} color="#FFFFFF" />
                <Text style={styles.playButtonText}>Create Private Lobby</Text>
              </TouchableOpacity>
              
              <View style={styles.joinSection}>
                <Text style={styles.joinTitle}>Join with Code</Text>
                <View style={styles.joinInput}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#718096"
                    value={joinCode}
                    onChangeText={setJoinCode}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={[styles.joinButton, !joinCode.trim() && styles.disabledJoinButton]}
                    onPress={handleJoinWithCode}
                    disabled={!joinCode.trim()}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          
          {selectedMode === 'tournament' && (
            <TouchableOpacity 
              style={[styles.playButton, styles.tournamentButton]}
              onPress={handleTournamentPlay}
            >
              <Trophy size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Join Tournament</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trending Worlds */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Trending Worlds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredWorlds.slice(0, 5).map((world) => (
              <TouchableOpacity key={world.id} style={styles.worldPreview}>
                <View style={styles.worldImagePlaceholder}>
                  {world.thumbnail ? (
                    <Image source={{ uri: world.thumbnail }} style={styles.worldPreviewImage} />
                  ) : (
                    <MapPin size={32} color="#A0AEC0" />
                  )}
                </View>
                <Text style={styles.worldPreviewName}>{world.name}</Text>
                <Text style={styles.worldPreviewPlayers}>{world.playCount} plays</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Daily Challenge */}
        <View style={styles.challengeSection}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <TouchableOpacity style={styles.challengeCard}>
            <Trophy size={32} color="#FFE66D" />
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Master Hider</Text>
              <Text style={styles.challengeDesc}>Stay hidden for 5 minutes total across all games</Text>
              <Text style={styles.challengeReward}>Reward: 100 Coins + Stealth Emote</Text>
              <View style={styles.challengeProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
                <Text style={styles.progressText}>3:00 / 5:00</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  modeSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  modeCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMode: {
    borderColor: '#FF6B6B',
    backgroundColor: '#3D4852',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  modeStats: {
    flexDirection: 'row',
  },
  modeStatText: {
    fontSize: 12,
    color: '#718096',
    marginRight: 16,
  },
  actionSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  playButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#4A5568',
    opacity: 0.7,
  },
  tournamentButton: {
    backgroundColor: '#FFE66D',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  joinSection: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
  },
  joinTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  joinInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginRight: 12,
  },
  joinButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disabledJoinButton: {
    backgroundColor: '#4A5568',
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  worldPreview: {
    width: 120,
    marginLeft: 24,
    alignItems: 'center',
  },
  worldPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  worldImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  worldPreviewName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  worldPreviewPlayers: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  challengeSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  challengeCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFE66D',
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  challengeReward: {
    fontSize: 12,
    color: '#FFE66D',
    fontWeight: '600',
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#4A5568',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#FFE66D',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});