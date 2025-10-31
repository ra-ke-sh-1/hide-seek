import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Download,
  Heart,
  Share,
  Play
} from 'lucide-react-native';
import { useWorldStore } from '@/stores/worldStore';
import WorldCard from '@/components/WorldCard';

interface WorldBrowserProps {
  onWorldSelect?: (worldId: string) => void;
  showPlayButton?: boolean;
}

export default function WorldBrowser({ onWorldSelect, showPlayButton = false }: WorldBrowserProps) {
  const { featuredWorlds, loadFeaturedWorlds } = useWorldStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: 'All', emoji: '🌟' },
    { id: 'school', name: 'School', emoji: '🏫' },
    { id: 'outdoor', name: 'Outdoor', emoji: '🌳' },
    { id: 'futuristic', name: 'Sci-Fi', emoji: '🚀' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🏰' },
    { id: 'urban', name: 'Urban', emoji: '🏙️' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular', icon: '🔥' },
    { id: 'newest', name: 'Newest', icon: '✨' },
    { id: 'rating', name: 'Highest Rated', icon: '⭐' },
    { id: 'plays', name: 'Most Played', icon: '🎮' },
  ];

  useEffect(() => {
    loadFeaturedWorlds();
  }, []);

  const filteredWorlds = featuredWorlds.filter(world => {
    const matchesSearch = world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         world.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || world.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedWorlds = [...filteredWorlds].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.playCount - a.playCount;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'plays':
        return b.playCount - a.playCount;
      default:
        return 0;
    }
  });

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search worlds..."
            placeholderTextColor="#718096"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        style={styles.categoriesContainer}
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView 
        horizontal 
        style={styles.sortContainer}
        showsHorizontalScrollIndicator={false}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortOption,
              sortBy === option.id && styles.selectedSort
            ]}
            onPress={() => setSortBy(option.id)}
          >
            <Text style={styles.sortEmoji}>{option.icon}</Text>
            <Text style={[
              styles.sortText,
              sortBy === option.id && styles.selectedSortText
            ]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {sortedWorlds.length} worlds found
        </Text>
      </View>

      {/* World Grid */}
      <ScrollView style={styles.worldGrid} showsVerticalScrollIndicator={false}>
        {sortedWorlds.map((world) => (
          <View key={world.id} style={styles.worldCardContainer}>
            <TouchableOpacity 
              style={styles.worldCard}
              onPress={() => onWorldSelect?.(world.id)}
            >
              <Image source={{ uri: world.thumbnail }} style={styles.worldImage} />
              <View style={styles.worldOverlay}>
                {showPlayButton && (
                  <TouchableOpacity style={styles.playOverlay}>
                    <Play size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
            
            <View style={styles.worldInfo}>
              <Text style={styles.worldName}>{world.name}</Text>
              <Text style={styles.worldCreator}>by {world.creatorName}</Text>
              
              <View style={styles.worldStats}>
                <View style={styles.statItem}>
                  <Users size={12} color="#718096" />
                  <Text style={styles.statText}>{world.playCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <Star size={12} color="#FFD700" />
                  <Text style={styles.statText}>{world.rating}</Text>
                </View>
              </View>

              <View style={styles.worldActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={14} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={14} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Share size={14} color="#A0AEC0" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  selectedCategory: {
    backgroundColor: '#FF6B6B',
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  sortContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedSort: {
    backgroundColor: '#4ECDC4',
  },
  sortEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  sortText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  selectedSortText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  worldGrid: {
    flex: 1,
    paddingHorizontal: 24,
  },
  worldCardContainer: {
    marginBottom: 20,
  },
  worldCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  worldImage: {
    width: '100%',
    height: 160,
  },
  worldOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldInfo: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
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
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 4,
  },
  worldActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
});