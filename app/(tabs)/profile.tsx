import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { CreditCard as Edit, Trophy, Star, Users, Clock, Settings, Share as ShareIcon, Award, Crown, Target, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const achievements: Achievement[] = [
  {
    id: '1',
    name: 'Master Hider',
    description: 'Stay hidden for 10 complete rounds',
    icon: '🥷',
    unlocked: true,
    progress: 10,
    maxProgress: 10
  },
  {
    id: '2',
    name: 'Eagle Eye',
    description: 'Found 50 hidden players',
    icon: '👁️',
    unlocked: true,
    progress: 23,
    maxProgress: 50
  },
  {
    id: '3',
    name: 'World Builder',
    description: 'Created 5 custom worlds',
    icon: '🏗️',
    unlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: '4',
    name: 'Social Butterfly',
    description: 'Play with 20 different friends',
    icon: '🦋',
    unlocked: false,
    progress: 7,
    maxProgress: 20
  },
  {
    id: '5',
    name: 'Speed Demon',
    description: 'Find all hiders in under 60 seconds',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  }
];

export default function ProfileScreen() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('stats');
  const { user, signOut } = useAuth();

  const playerStats = {
    gamesPlayed: 247,
    winRate: 73,
    hoursPlayed: 42,
    worldsCreated: 5,
    totalHides: 156,
    totalSeeks: 91,
    favoriteMap: 'School Mayhem',
    currentStreak: 8,
    bestHideTime: '4:32',
    fastestSeek: '0:45',
    coinsEarned: 2840,
    level: 15,
    xp: 8750,
    xpToNext: 1250
  };

  const handleEditAvatar = () => {
    setShowAvatarModal(false);
    router.push('/avatar-creator');
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my Hide&Seek Worlds profile!\n\nLevel ${playerStats.level} • ${playerStats.winRate}% Win Rate\n${playerStats.gamesPlayed} Games Played\n\nJoin me for a game!`,
        title: 'My Hide&Seek Worlds Profile',
      });
    } catch (error) {
      Alert.alert('Share Failed', 'Could not share profile.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.editBadge}>
              <Edit size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.playerName}>{user?.user_metadata?.username || 'Player'}</Text>
            <View style={styles.levelContainer}>
              <Crown size={16} color="#FFE66D" />
              <Text style={styles.playerLevel}>Level {playerStats.level} • Hide Champion</Text>
            </View>
            <Text style={styles.playerID}>ID: HSW-{user?.id?.slice(-8).toUpperCase()}</Text>
            
            {/* XP Progress */}
            <View style={styles.xpContainer}>
              <View style={styles.xpBar}>
                <View 
                  style={[
                    styles.xpFill, 
                    { width: `${(playerStats.xp / (playerStats.xp + playerStats.xpToNext)) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.xpText}>{playerStats.xpToNext} XP to Level {playerStats.level + 1}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
            <ShareIcon size={20} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerStats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerStats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerStats.hoursPlayed}h</Text>
            <Text style={styles.statLabel}>Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{playerStats.coinsEarned}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
            onPress={() => setSelectedTab('stats')}
          >
            <Text style={[styles.tabText, selectedTab === 'stats' && styles.activeTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
            onPress={() => setSelectedTab('achievements')}
          >
            <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'worlds' && styles.activeTab]}
            onPress={() => setSelectedTab('worlds')}
          >
            <Text style={[styles.tabText, selectedTab === 'worlds' && styles.activeTabText]}>
              My Worlds
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'stats' && (
          <View style={styles.tabContent}>
            <View style={styles.detailedStats}>
              <Text style={styles.sectionTitle}>Detailed Statistics</Text>
              
              <View style={styles.statCategory}>
                <Text style={styles.statCategoryTitle}>🥷 Hiding Stats</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Total Hides</Text>
                  <Text style={styles.statRowValue}>{playerStats.totalHides}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Best Hide Time</Text>
                  <Text style={styles.statRowValue}>{playerStats.bestHideTime}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Current Streak</Text>
                  <Text style={styles.statRowValue}>{playerStats.currentStreak} games</Text>
                </View>
              </View>

              <View style={styles.statCategory}>
                <Text style={styles.statCategoryTitle}>👁️ Seeking Stats</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Total Seeks</Text>
                  <Text style={styles.statRowValue}>{playerStats.totalSeeks}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Fastest Find</Text>
                  <Text style={styles.statRowValue}>{playerStats.fastestSeek}</Text>
                </View>
              </View>

              <View style={styles.statCategory}>
                <Text style={styles.statCategoryTitle}>🏗️ Creation Stats</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Worlds Created</Text>
                  <Text style={styles.statRowValue}>{playerStats.worldsCreated}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statRowLabel}>Favorite Map</Text>
                  <Text style={styles.statRowValue}>{playerStats.favoriteMap}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.achievementHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievementProgress}>
                {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
              </Text>
            </View>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                achievement.unlocked && styles.unlockedAchievement
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  {!achievement.unlocked && achievement.progress && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.maxProgress}
                      </Text>
                    </View>
                  )}
                </View>
                {achievement.unlocked && (
                  <Award size={20} color="#FFE66D" />
                )}
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'worlds' && (
          <View style={styles.tabContent}>
            <View style={styles.worldsHeader}>
              <Text style={styles.sectionTitle}>My Created Worlds</Text>
              <TouchableOpacity 
                style={styles.createWorldButton}
                onPress={() => router.push('/world-builder')}
              >
                <Text style={styles.createWorldText}>+ New</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.worldCard}>
              <View style={styles.worldThumbnail}>
                <Text style={styles.worldThumbnailText}>🏫</Text>
              </View>
              <View style={styles.worldInfo}>
                <Text style={styles.worldName}>My School</Text>
                <Text style={styles.worldPlays}>234 plays • ⭐ 4.2</Text>
                <Text style={styles.worldStatus}>Published • 12 likes</Text>
              </View>
              <TouchableOpacity style={styles.worldAction}>
                <Text style={styles.worldActionText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.worldCard}>
              <View style={styles.worldThumbnail}>
                <Text style={styles.worldThumbnailText}>🌳</Text>
              </View>
              <View style={styles.worldInfo}>
                <Text style={styles.worldName}>Forest Hideout</Text>
                <Text style={styles.worldPlays}>89 plays • ⭐ 4.7</Text>
                <Text style={styles.worldStatus}>Draft</Text>
              </View>
              <TouchableOpacity style={styles.worldAction}>
                <Text style={styles.worldActionText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Avatar Options</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleEditAvatar}
            >
              <Edit size={20} color="#4ECDC4" />
              <Text style={styles.modalOptionText}>Customize Avatar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <Trophy size={20} color="#FFE66D" />
              <Text style={styles.modalOptionText}>View Cosmetics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption}>
              <Star size={20} color="#FF6B6B" />
              <Text style={styles.modalOptionText}>Emote Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal for Sign Out */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
    color: '#4ECDC4',
    marginLeft: 4,
  },
  playerID: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  xpContainer: {
    width: '100%',
  },
  xpBar: {
    height: 6,
    backgroundColor: '#4A5568',
    borderRadius: 3,
    marginBottom: 4,
  },
  xpFill: {
    height: 6,
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    color: '#A0AEC0',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.23,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  tabContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailedStats: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 20,
  },
  statCategory: {
    marginBottom: 20,
  },
  statCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  statRowValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementProgress: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  achievementCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  unlockedAchievement: {
    opacity: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FFE66D',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#4A5568',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  worldsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createWorldButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createWorldText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  worldCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  worldThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  worldThumbnailText: {
    fontSize: 24,
  },
  worldInfo: {
    flex: 1,
  },
  worldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  worldPlays: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 2,
  },
  worldStatus: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  worldAction: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  worldActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});