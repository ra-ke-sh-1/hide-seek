import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import LobbyScreen from '@/components/multiplayer/LobbyScreen';
import { useGameStore } from '@/stores/gameStore';

export default function LobbyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { joinGame, leaveGame } = useGameStore();

  useEffect(() => {
    if (id) {
      // Join the game lobby
      joinGame(id, `HSW${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    }
  }, [id, joinGame]);

  const handleStartGame = () => {
    router.push('/game');
  };

  const handleLeaveLobby = () => {
    leaveGame();
    router.back();
  };

  return (
    <View style={styles.container}>
      <LobbyScreen 
        onStartGame={handleStartGame}
        onLeaveLobby={handleLeaveLobby}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
});