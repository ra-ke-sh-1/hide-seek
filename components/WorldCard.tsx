import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Users, Star, MapPin } from 'lucide-react-native';

interface WorldCardProps {
  name: string;
  creator: string;
  players: number;
  rating: number;
  image?: string;
  onPress?: () => void;
}

export default function WorldCard({
  name,
  creator,
  players,
  rating,
  image,
  onPress,
}: WorldCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.worldImage} />
        ) : (
          <View style={styles.placeholder}>
            <MapPin size={32} color="#A0AEC0" />
          </View>
        )}
      </View>
      
      <View style={styles.worldInfo}>
        <Text style={styles.worldName}>{name}</Text>
        <Text style={styles.worldCreator}>by {creator}</Text>
        
        <View style={styles.worldStats}>
          <View style={styles.stat}>
            <Users size={14} color="#718096" />
            <Text style={styles.statText}>{players}</Text>
          </View>
          <View style={styles.stat}>
            <Star size={14} color="#FFD700" />
            <Text style={styles.statText}>{rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  worldImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldInfo: {
    padding: 16,
  },
  worldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  worldCreator: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  worldStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 4,
  },
});