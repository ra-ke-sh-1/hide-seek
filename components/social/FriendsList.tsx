import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  UserPlus,
  Search,
  MessageCircle,
  GameController2,
  MoreHorizontal,
} from 'lucide-react-native';

interface Friend {
  id: string;
  username: string;
  status: 'online' | 'in_game' | 'away' | 'offline';
  currentGame?: string;
  avatar: string;
}

interface FriendsListProps {
  onInviteToGame?: (friendId: string) => void;
}

export default function FriendsList({ onInviteToGame }: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'add' | 'requests'>('friends');
  
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      username: 'SeekMaster',
      status: 'online',
      avatar: '🎮',
    },
    {
      id: '2',
      username: 'HideNinja',
      status: 'in_game',
      currentGame: 'School Mayhem',
      avatar: '🥷',
    },
    {
      id: '3',
      username: 'WorldBuilder',
      status: 'away',
      avatar: '🏗️',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'in_game': return '#F59E0B';
      case 'away': return '#F97316';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online': return 'Online';
      case 'in_game': return `Playing ${friend.currentGame}`;
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleInviteFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend?.status === 'online') {
      onInviteToGame?.(friendId);
      Alert.alert('Invite Sent', `Invited ${friend.username} to your game!`);
    } else {
      Alert.alert('Unavailable', 'This friend is not available to join right now.');
    }
  };

  const renderFriendsList = () => (
    <ScrollView style={styles.tabContent}>
      {friends
        .filter(friend => 
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((friend) => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.friendInfo}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(friend.status) }
                  ]} 
                />
              </View>
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>{friend.username}</Text>
                <Text style={styles.friendStatus}>{getStatusText(friend)}</Text>
              </View>
            </View>
            
            <View style={styles.friendActions}>
              <TouchableOpacity 
                style={styles.friendAction}
                onPress={() => handleInviteFriend(friend.id)}
                disabled={friend.status !== 'online'}
              >
                <GameController2 
                  size={16} 
                  color={friend.status === 'online' ? '#4ECDC4' : '#718096'} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.friendAction}>
                <MessageCircle size={16} color="#A0AEC0" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.friendAction}>
                <MoreHorizontal size={16} color="#A0AEC0" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
  );

  const renderAddFriends = () => (
    <View style={styles.tabContent}>
      <View style={styles.addFriendSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username or ID"
          placeholderTextColor="#718096"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.suggestionTitle}>Suggested Friends</Text>
      {/* Mock suggested friends */}
      {['ProHider', 'SeekGod', 'BuilderKing'].map((username, index) => (
        <View key={index} style={styles.suggestionCard}>
          <View style={styles.suggestionInfo}>
            <View style={styles.suggestionAvatar}>
              <Text style={styles.suggestionAvatarText}>
                {['🎯', '👑', '🏗️'][index]}
              </Text>
            </View>
            <Text style={styles.suggestionName}>{username}</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <UserPlus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color="#718096" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#718096"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Add Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests (2)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'friends' && renderFriendsList()}
      {activeTab === 'add' && renderAddFriends()}
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
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    margin: 24,
    marginTop: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
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
    flex: 1,
    paddingHorizontal: 24,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2D3748',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  friendActions: {
    flexDirection: 'row',
  },
  friendAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addFriendSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  suggestionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionAvatarText: {
    fontSize: 20,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});