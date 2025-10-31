import React, { useState, useRef } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useWorldStore } from '@/stores/worldStore';
import { useGameStore } from '@/stores/gameStore';

const { width } = Dimensions.get('window');

interface GameCanvasProps {
  isEditing?: boolean;
  onBlockPlace?: (x: number, y: number) => void;
  gridSize?: number;
  canvasHeight?: number;
}

export default function GameCanvas({ 
  isEditing = false, 
  onBlockPlace,
  gridSize = 20,
  canvasHeight = 300 
}: GameCanvasProps) {
  const { currentWorld } = useWorldStore();
  const { currentGame } = useGameStore();
  const [showGrid, setShowGrid] = useState(isEditing);

  const canvasWidth = width - 48;

  const handleCanvasPress = (event: any) => {
    if (!isEditing || !onBlockPlace) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const gridX = Math.floor(locationX / gridSize) * gridSize;
    const gridY = Math.floor(locationY / gridSize) * gridSize;
    
    onBlockPlace(gridX, gridY);
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const rows = Math.ceil(canvasHeight / gridSize);
    const cols = Math.ceil(canvasWidth / gridSize);

    return (
      <View style={styles.gridOverlay}>
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              style={[
                styles.gridCell,
                {
                  left: col * gridSize,
                  top: row * gridSize,
                  width: gridSize,
                  height: gridSize,
                }
              ]}
            />
          ))
        )}
      </View>
    );
  };

  const renderBlocks = () => {
    if (!currentWorld) return null;

    return currentWorld.blocks.map((block) => (
      <TouchableOpacity
        key={block.id}
        style={[
          styles.block,
          {
            left: block.position.x,
            top: block.position.y,
            backgroundColor: getBlockColor(block.type),
          }
        ]}
        onLongPress={() => {
          if (isEditing) {
            // Remove block logic would go here
          }
        }}
      >
        {getBlockIcon(block.type)}
      </TouchableOpacity>
    ));
  };

  const renderPlayers = () => {
    if (!currentGame.players.length) return null;

    return currentGame.players.map((player) => (
      <Animated.View
        key={player.id}
        style={[
          styles.player,
          {
            left: player.position.x,
            top: player.position.y,
            backgroundColor: player.role === 'seeker' ? '#FF6B6B' : '#4ECDC4',
            opacity: player.isFound ? 0.5 : 1,
          }
        ]}
      >
        <Text style={styles.playerEmoji}>
          {player.role === 'hider' ? '🥷' : '👁️'}
        </Text>
      </Animated.View>
    ));
  };

  const getBlockColor = (type: string) => {
    const colors: { [key: string]: string } = {
      wall: '#8B5CF6',
      door: '#F59E0B', 
      tree: '#10B981',
      car: '#EF4444',
      building: '#6B7280',
      locker: '#EC4899',
      barrel: '#F97316',
    };
    return colors[type] || '#4A5568';
  };

  const getBlockIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      wall: <Box size={16} color="#FFFFFF" />,
      door: <Door size={16} color="#FFFFFF" />,
      tree: <TreePine size={16} color="#FFFFFF" />,
      car: <Car size={16} color="#FFFFFF" />,
      building: <Building size={16} color="#FFFFFF" />,
    };
    return icons[type] || <Box size={16} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.canvas,
          { width: canvasWidth, height: canvasHeight },
          showGrid && styles.canvasWithGrid
        ]}
        onPress={handleCanvasPress}
        activeOpacity={1}
      >
        {renderGrid()}
        {renderBlocks()}
        {renderPlayers()}
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity
          style={styles.gridToggle}
          onPress={() => setShowGrid(!showGrid)}
        >
          <Text style={styles.gridToggleText}>
            {showGrid ? 'Hide Grid' : 'Show Grid'}
            
            {/* Render seeker den if in editing mode */}
            {isEditing && currentWorld?.seekerDen && (
              <View
                style={[
                  styles.seekerDen,
                  {
                    left: currentWorld.seekerDen.x,
                    top: currentWorld.seekerDen.y,
                  }
                ]}
              >
                <Text style={styles.seekerDenText}>🏠</Text>
              </View>
            )}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  canvas: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasWithGrid: {
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  gridCell: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#4A556820',
  },
  block: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  playerEmoji: {
    fontSize: 16,
  },
  gridToggle: {
    marginTop: 8,
    backgroundColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gridToggleText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '600',
  },
  seekerDen: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  seekerDenText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});