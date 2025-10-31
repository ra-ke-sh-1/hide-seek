import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import {
  Crown,
  Settings,
  Copy,
  UserPlus,
  Play,
  Users,
  Clock,
  Eye,
  Volume2,
  VolumeX,
  Shield
} from 'lucide-react-native';
import { useGameStore } from '@/stores/gameStore';
import { useRealtime } from '@/hooks/useRealtime';
import PlayerCard from '@/components/PlayerCard';

interface LobbyScreenProps {
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export default function LobbyScreen({ onStartGame, onLeaveLobby }: LobbyScreenProps) {
  const { currentGame, updateSettings, addPlayer, removePlayer } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [newSettings, setNewSettings] = useState(currentGame.settings);
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false);

  const { sendMessage } = useRealtime(`game_${currentGame.id}`, (payload) => {
    switch (payload.type) {
      case 'player_joined':
        addPlayer(payload.player);
        break;
      case 'player_left':
        removePlayer(payload.playerId);
        break;
      case 'settings_update':
        updateSettings(payload.settings);
        break;
    }
  });

  useEffect(() => {
    // Simulate other players joining
    const timer = setTimeout(() => {
      if (currentGame.players.length < 3) {
        addPlayer({
          id: `player_${Date.now()}`,
          name: `Player${currentGame.players.length + 1}`,
          role: 'hider',
          position: { x: 50, y: 50 },
          isFound: false,
          isHost: false,
          avatar: { bodyType: 'regular', skin: '#FDBCB4' },
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentGame.players.length]);

  const copyLobbyCode = async () => {
    if (currentGame.lobbyCode) {
      try {
        await Share.share({
          message: `🥷 Join my Hide&Seek Worlds game!\n\nRoom Code: ${currentGame.lobbyCode}\n\nLet's play together!`,
          title: 'Hide&Seek Worlds - Game Invite',
        });
      } catch (error) {
        Alert.alert('Share Failed', 'Could not share the lobby code.');
      }
    }
  };

  const applySettings = () => {
    updateSettings(newSettings);
    setShowSettings(false);
    sendMessage({ type: 'settings_update', settings: newSettings });
    Alert.alert('Settings Updated', 'Game settings have been applied.');
  };

  const currentPlayer = currentGame.players.find(p => p.id === 'current_user');
  const isHost = currentPlayer?.isHost || false;
  const canStart = currentGame.players.length >= 2 && isHost;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeaveLobby}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
        
        <View style={styles.lobbyInfo}>
          <Text style={styles.lobbyTitle}>Game Lobby</Text>
          <TouchableOpacity style={styles.codeContainer} onPress={copyLobbyCode}>
            <Text style={styles.lobbyCode}>{currentGame.lobbyCode}</Text>
            <Copy size={16} color="#4ECDC4" />
          </TouchableOpacity>
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
          {isHost && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
            >
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Game Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Users size={16} color="#4ECDC4" />
          <Text style={styles.statusText}>
            {currentGame.players.length}/{currentGame.settings.maxPlayers}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Clock size={16} color="#FFE66D" />
          <Text style={styles.statusText}>{currentGame.settings.roundTime}s rounds</Text>
        </View>
        <View style={styles.statusItem}>
          <Eye size={16} color="#FF6B6B" />
          <Text style={styles.statusText}>{currentGame.settings.seekerCount} seekers</Text>
        </View>
      </View>

      {/* Player List */}
      <ScrollView style={styles.playerList}>
        <Text style={styles.playerListTitle}>Players</Text>
        {currentGame.players.map((player) => (
          <PlayerCard
            key={player.id}
            name={player.name}
            isHost={player.isHost}
            status="online"
            avatar={player.avatar?.bodyType === 'slim' ? '🚶' : player.avatar?.bodyType === 'chunky' ? '🤸' : '🧍'}
          />
        ))}
        
        {/* Empty slots */}
        {Array.from({ 
          length: currentGame.settings.maxPlayers - currentGame.players.length 
        }).map((_, index) => (
          <View key={`empty_${index}`} style={styles.emptySlot}>
            <UserPlus size={20} color="#718096" />
            <Text style={styles.emptySlotText}>Waiting for player...</Text>
          </View>
        ))}
      </ScrollView>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Shield size={16} color="#4ECDC4" />
        <Text style={styles.safetyText}>
          Safe play environment with moderation and reporting tools
        </Text>
      </View>

      {/* Start Game Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.startButton, !canStart && styles.disabledButton]}
          onPress={onStartGame}
          disabled={!canStart}
        >
          <Play size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>
            {canStart ? 'Start Game' : `Need ${2 - currentGame.players.length} more players`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      {showSettings && (
        <View style={styles.settingsModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Settings</Text>
            
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Max Players: {newSettings.maxPlayers}</Text>
              <View style={styles.sliderContainer}>
                {[4, 6, 8, 10, 12].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderOption,
                      newSettings.maxPlayers === value && styles.selectedSliderOption
                    ]}
                    onPress={() => setNewSettings(prev => ({ ...prev, maxPlayers: value }))}
                  >
                    <Text style={[
                      styles.sliderOptionText,
                      newSettings.maxPlayers === value && styles.selectedSliderOptionText
                    ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Round Time: {newSettings.roundTime}s</Text>
              <View style={styles.sliderContainer}>
                {[60, 120, 180, 240, 300].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderOption,
                      newSettings.roundTime === value && styles.selectedSliderOption
                    ]}
                    onPress={() => setNewSettings(prev => ({ ...prev, roundTime: value }))}
                  >
                    <Text style={[
                      styles.sliderOptionText,
                      newSettings.roundTime === value && styles.selectedSliderOptionText
                    ]}>
                      {value}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Seekers: {newSettings.seekerCount}</Text>
              <View style={styles.sliderContainer}>
                {[1, 2, 3].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.sliderOption,
                      newSettings.seekerCount === value && styles.selectedSliderOption
                    ]}
                    onPress={() => setNewSettings(prev => ({ ...prev, seekerCount: value }))}
                  >
                    <Text style={[
                      styles.sliderOptionText,
                      newSettings.seekerCount === value && styles.selectedSliderOptionText
                    ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applySettings}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  leaveButton: {
    backgroundColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lobbyInfo: {
    alignItems: 'center',
  },
  lobbyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lobbyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginRight: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#2D3748',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  playerList: {
    flex: 1,
    padding: 24,
  },
  playerListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D374860',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  emptySlotText: {
    color: '#718096',
    fontSize: 14,
    marginLeft: 12,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D374860',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  safetyText: {
    color: '#A0AEC0',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  bottomActions: {
    padding: 24,
    paddingBottom: 100,
  },
  startButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#4A5568',
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderOption: {
    backgroundColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedSliderOption: {
    backgroundColor: '#FF6B6B',
  },
  sliderOptionText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedSliderOptionText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 0.45,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});