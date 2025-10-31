import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AvatarCreator from '@/components/avatar/AvatarCreator';

export default function AvatarCreatorScreen() {
  const handleSave = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <AvatarCreator onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
});