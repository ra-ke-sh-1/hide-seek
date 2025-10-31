import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PlayerCardProps {
  name: string;
  isHost?: boolean;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
  onPress?: () => void;
}

export default function PlayerCard({ 
  name, 
  isHost = false, 
  avatar = '👤',
  status = 'online',
  onPress 
}: PlayerCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#6B7280';
      default: return '#10B981';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.avatarText}>{avatar}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.playerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.playerName}>{name}</Text>
          {isHost && (
            <Crown size={16} color="#FFE66D" />
          )}
        </View>
        <Text style={styles.playerStatus}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2D3748',
  },
  playerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  playerStatus: {
    fontSize: 12,
    color: '#A0AEC0',
    textTransform: 'capitalize',
  },
});