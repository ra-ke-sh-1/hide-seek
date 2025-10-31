import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import WorldBrowser from '@/components/world/WorldBrowser';

export default function WorldBrowserScreen() {
  const handleWorldSelect = (worldId: string) => {
    // Load world and start game
    router.push('/game');
  };

  return (
    <View style={styles.container}>
      <WorldBrowser 
        onWorldSelect={handleWorldSelect}
        showPlayButton={true}
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