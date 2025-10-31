import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Sparkles size={48} color="#FF6B6B" />
        <ActivityIndicator size="large" color="#4ECDC4" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});