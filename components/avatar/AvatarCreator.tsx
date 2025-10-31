import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Slider,
} from 'react-native';
import { useAvatarStore } from '@/stores/avatarStore';

interface AvatarCreatorProps {
  onSave?: () => void;
}

export default function AvatarCreator({ onSave }: AvatarCreatorProps) {
  const { currentAvatar, updateAvatar, unlockedCosmetics } = useAvatarStore();
  const [activeTab, setActiveTab] = useState<'body' | 'hair' | 'outfit' | 'accessories'>('body');

  const bodyTypes = [
    { id: 'slim', name: 'Slim', emoji: '🚶' },
    { id: 'regular', name: 'Regular', emoji: '🧍' },
    { id: 'chunky', name: 'Chunky', emoji: '🤸' },
  ];

  const skinTones = [
    '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#654321'
  ];

  const hairStyles = [
    { id: 'short', name: 'Short', emoji: '👨‍🦲' },
    { id: 'long', name: 'Long', emoji: '👩‍🦱' },
    { id: 'curly', name: 'Curly', emoji: '👨‍🦱' },
    { id: 'bald', name: 'Bald', emoji: '👨‍🦲' },
  ];

  const outfits = [
    { id: 'casual', name: 'Casual', emoji: '👕', unlocked: true },
    { id: 'formal', name: 'Formal', emoji: '👔', unlocked: true },
    { id: 'sporty', name: 'Sporty', emoji: '🎽', unlocked: false },
    { id: 'ninja', name: 'Ninja', emoji: '🥷', unlocked: false },
  ];

  const renderBodyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Body Type</Text>
      <View style={styles.optionGrid}>
        {bodyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionButton,
              currentAvatar.bodyType === type.id && styles.selectedOption
            ]}
            onPress={() => updateAvatar({ bodyType: type.id as any })}
          >
            <Text style={styles.optionEmoji}>{type.emoji}</Text>
            <Text style={styles.optionText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Skin Tone</Text>
      <View style={styles.colorGrid}>
        {skinTones.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              currentAvatar.skin === color && styles.selectedColor
            ]}
            onPress={() => updateAvatar({ skin: color })}
          />
        ))}
      </View>
    </View>
  );

  const renderHairTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Hair Style</Text>
      <View style={styles.optionGrid}>
        {hairStyles.map((hair) => (
          <TouchableOpacity
            key={hair.id}
            style={[
              styles.optionButton,
              currentAvatar.hair === hair.id && styles.selectedOption
            ]}
            onPress={() => updateAvatar({ hair: hair.id })}
          >
            <Text style={styles.optionEmoji}>{hair.emoji}</Text>
            <Text style={styles.optionText}>{hair.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Hair Color</Text>
      <View style={styles.colorGrid}>
        {['#000000', '#8B4513', '#FFD700', '#FF4500', '#8A2BE2'].map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              currentAvatar.hairColor === color && styles.selectedColor
            ]}
            onPress={() => updateAvatar({ hairColor: color })}
          />
        ))}
      </View>
    </View>
  );

  const renderOutfitTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Outfits</Text>
      <View style={styles.optionGrid}>
        {outfits.map((outfit) => (
          <TouchableOpacity
            key={outfit.id}
            style={[
              styles.optionButton,
              currentAvatar.outfit === outfit.id && styles.selectedOption,
              !outfit.unlocked && styles.lockedOption
            ]}
            onPress={() => {
              if (outfit.unlocked) {
                updateAvatar({ outfit: outfit.id });
              }
            }}
          >
            <Text style={styles.optionEmoji}>{outfit.emoji}</Text>
            <Text style={styles.optionText}>{outfit.name}</Text>
            {!outfit.unlocked && (
              <Text style={styles.lockText}>🔒</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'body': return renderBodyTab();
      case 'hair': return renderHairTab();
      case 'outfit': return renderOutfitTab();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar Preview */}
      <View style={styles.avatarPreview}>
        <View style={[styles.avatarDisplay, { backgroundColor: currentAvatar.skin }]}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.previewLabel}>Your Avatar</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {['body', 'hair', 'outfit', 'accessories'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Avatar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  avatarPreview: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#2D3748',
  },
  avatarDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  previewLabel: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    paddingHorizontal: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
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
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#5A4568',
  },
  lockedOption: {
    opacity: 0.6,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lockText: {
    fontSize: 10,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  saveButton: {
    margin: 24,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});