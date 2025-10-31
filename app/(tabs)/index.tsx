import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Play, Users, Map, Sparkles, Trophy, Star, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWorldStore } from '@/stores/worldStore';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeNews, setActiveNews] = useState(0);
  const { featuredWorlds, loadFeaturedWorlds } = useWorldStore();
  const { user } = useAuth();

  useEffect(() => {
    loadFeaturedWorlds();
  }, []);

  const newsItems = [
    { 
      title: 'New Maps Released!', 
      subtitle: 'Check out the Winter Collection - 5 cozy worlds perfect for winter hiding',
      color: '#4ECDC4'
    },
    { 
      title: 'Tournament Mode Live!', 
      subtitle: 'Compete in ranked matches and climb the leaderboard for exclusive rewards',
      color: '#FFE66D'
    },
    { 
      title: 'Avatar Creator Update', 
      subtitle: 'New customization options: 20+ new outfits and animated emotes',
      color: '#FF6B6B'
    }
  ];

  const handleQuickPlay = () => {
    router.push('/play');
  };

  const handleWorldBuilder = () => {
    router.push('/world-builder');
  };

  const handleVibeCode = () => {
    router.push('/vibe-code');
  };

  const handleFriends = () => {
    router.push('/friends');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Hide&Seek Worlds</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.user_metadata?.username || 'Player'}!</Text>
        </View>
        <TouchableOpacity style={styles.friendsButton} onPress={handleFriends}>
          <UserPlus size={20} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleQuickPlay}
        >
          <Play size={24} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Quick Play</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={handleWorldBuilder}
          >
            <Map size={20} color="#FF6B6B" />
            <Text style={styles.secondaryActionText}>Build</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={handleVibeCode}
          >
            <Sparkles size={20} color="#4ECDC4" />
            <Text style={styles.secondaryActionText}>Vibe Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* News Carousel */}
      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveNews(page);
          }}
        >
          {newsItems.map((item, index) => (
            <View key={index} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.newsIndicators}>
          {newsItems.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.newsIndicator, 
                activeNews === index && styles.newsIndicatorActive
              ]} 
            />
          ))}
        </View>
      </View>

      {/* Featured Worlds */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Worlds</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {featuredWorlds.map((world) => (
          <TouchableOpacity key={world.id} style={styles.worldCard}>
            <Image source={{ uri: world.thumbnail }} style={styles.worldImage} />
            <View style={styles.worldInfo}>
              <Text style={styles.worldName}>{world.name}</Text>
              <Text style={styles.worldCreator}>by {world.creatorName}</Text>
              <View style={styles.worldStats}>
                <View style={styles.stat}>
                  <Users size={14} color="#718096" />
                  <Text style={styles.statText}>{world.playCount}</Text>
                </View>
                <View style={styles.stat}>
                  <Star size={14} color="#FFD700" />
                  <Text style={styles.statText}>{world.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Challenges */}
      <View style={styles.challengeSection}>
        <Text style={styles.sectionTitle}>Daily Challenge</Text>
        <TouchableOpacity style={styles.challengeCard}>
          <Trophy size={32} color="#FFE66D" />
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>Master Hider</Text>
            <Text style={styles.challengeDesc}>Stay hidden for 5 minutes total</Text>
            <Text style={styles.challengeReward}>Reward: 100 Coins</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 4,
  },
  friendsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    padding: 24,
    paddingTop: 0,
  },
  actionButton: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryAction: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  newsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    width: width - 48,
  },
  newsAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  newsSubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  newsIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  newsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A5568',
    marginHorizontal: 4,
  },
  newsIndicatorActive: {
    backgroundColor: '#FF6B6B',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAll: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  worldCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    margin: 8,
    marginHorizontal: 24,
    overflow: 'hidden',
  },
  worldImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  },
  challengeInfo: {
    marginLeft: 16,
    flex: 1,
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
  },
});