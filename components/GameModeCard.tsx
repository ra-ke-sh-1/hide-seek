import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GameModeCardProps {
  title: string;
  description: string;
  players: string;
  duration: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export default function GameModeCard({
  title,
  description,
  players,
  duration,
  icon,
  selected,
  onPress,
}: GameModeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>👥 {players}</Text>
          <Text style={styles.statText}>⏱️ {duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FF6B6B',
    backgroundColor: '#3D4852',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
    color: '#718096',
    marginRight: 16,
  },
});