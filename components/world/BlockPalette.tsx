import React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Box, DoorOpen as Door, TreePine, Car, Building, Archive, Cylinder, Triangle, Circle, Square } from 'lucide-react-native';

interface BlockType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: 'structure' | 'decoration' | 'interactive' | 'hiding';
}

interface BlockPaletteProps {
  selectedBlock: string | null;
  onBlockSelect: (blockType: string) => void;
}

const blockTypes: BlockType[] = [
  // Structure blocks
  { id: 'wall', name: 'Wall', icon: <Box size={20} color="#FFFFFF" />, color: '#8B5CF6', category: 'structure' },
  { id: 'floor', name: 'Floor', icon: <Square size={20} color="#FFFFFF" />, color: '#6B7280', category: 'structure' },
  { id: 'roof', name: 'Roof', icon: <Triangle size={20} color="#FFFFFF" />, color: '#DC2626', category: 'structure' },
  { id: 'seeker_den', name: 'Seeker Den', icon: <Circle size={20} color="#FFFFFF" />, color: '#F59E0B', category: 'structure' },
  
  // Interactive blocks
  { id: 'door', name: 'Door', icon: <Door size={20} color="#FFFFFF" />, color: '#F59E0B', category: 'interactive' },
  { id: 'window', name: 'Window', icon: <Circle size={20} color="#FFFFFF" />, color: '#3B82F6', category: 'interactive' },
  
  // Decoration blocks
  { id: 'tree', name: 'Tree', icon: <TreePine size={20} color="#FFFFFF" />, color: '#10B981', category: 'decoration' },
  { id: 'car', name: 'Car', icon: <Car size={20} color="#FFFFFF" />, color: '#EF4444', category: 'decoration' },
  { id: 'building', name: 'Building', icon: <Building size={20} color="#FFFFFF" />, color: '#6B7280', category: 'decoration' },
  
  // Hiding spots
  { id: 'locker', name: 'Locker', icon: <Archive size={20} color="#FFFFFF" />, color: '#EC4899', category: 'hiding' },
  { id: 'barrel', name: 'Barrel', icon: <Cylinder size={20} color="#FFFFFF" />, color: '#F97316', category: 'hiding' },
];

export default function BlockPalette({ selectedBlock, onBlockSelect }: BlockPaletteProps) {
  const categories = ['structure', 'decoration', 'interactive', 'hiding'] as const;
  const [activeCategory, setActiveCategory] = useState<string>('structure');

  const filteredBlocks = blockTypes.filter(block => block.category === activeCategory);

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        style={styles.categoryTabs}
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              activeCategory === category && styles.activeCategoryTab
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryTabText,
              activeCategory === category && styles.activeCategoryTabText
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Block Grid */}
      <ScrollView 
        horizontal 
        style={styles.blockGrid}
        showsHorizontalScrollIndicator={false}
      >
        {filteredBlocks.map((block) => (
          <TouchableOpacity
            key={block.id}
            style={[
              styles.blockButton,
              { backgroundColor: block.color },
              selectedBlock === block.id && styles.selectedBlock
            ]}
            onPress={() => onBlockSelect(block.id)}
          >
            {block.icon}
            <Text style={styles.blockButtonText}>{block.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A202C',
    paddingVertical: 16,
  },
  categoryTabs: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryTab: {
    backgroundColor: '#4A5568',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B6B',
  },
  categoryTabText: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  blockGrid: {
    paddingHorizontal: 24,
  },
  blockButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBlock: {
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blockButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
});