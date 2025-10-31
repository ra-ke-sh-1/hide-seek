import React from 'react';
import { View, StyleSheet } from 'react-native';
import AccessibilitySettings from '@/components/accessibility/AccessibilitySettings';

export default function AccessibilityScreen() {
  const handleSettingsChange = (newSettings: any) => {
    console.log('Accessibility settings updated:', newSettings);
    // In production, save to user preferences
  };

  return (
    <View style={styles.container}>
      <AccessibilitySettings onSettingsChange={handleSettingsChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
});