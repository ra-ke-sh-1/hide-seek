import React from 'react';
import { View, StyleSheet } from 'react-native';
import FriendsList from '@/components/social/FriendsList';

export default function FriendsScreen() {
  const handleInviteToGame = (friendId: string) => {
    console.log('Inviting friend to game:', friendId);
    // Implementation would send game invite
  };

  return (
    <View style={styles.container}>
      <FriendsList onInviteToGame={handleInviteToGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
});