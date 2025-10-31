import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Slider,
} from 'react-native';
import {
  Accessibility,
  Eye,
  Volume2,
  Vibrate,
  Palette,
  Type,
  Battery,
  Smartphone,
} from 'lucide-react-native';

interface AccessibilitySettingsProps {
  onSettingsChange?: (settings: any) => void;
}

export default function AccessibilitySettings({ onSettingsChange }: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState({
    // Visual Accessibility
    colorBlindMode: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    textSize: 1.0,
    
    // Audio Accessibility
    audioDescriptions: false,
    soundVisualization: false,
    hapticFeedback: true,
    
    // Motor Accessibility
    oneHandedMode: false,
    simplifiedControls: false,
    holdToPress: false,
    
    // Performance
    batterySaver: false,
    reducedEffects: false,
    lowBandwidthMode: false,
  });

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const SettingRow = ({ 
    icon, 
    title, 
    description, 
    type, 
    value, 
    onValueChange,
    min = 0.5,
    max = 2.0,
    step = 0.1
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    type: 'toggle' | 'slider';
    value: any;
    onValueChange: (value: any) => void;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
        {type === 'slider' && (
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={min}
              maximumValue={max}
              step={step}
              value={value}
              onValueChange={onValueChange}
              minimumTrackTintColor="#4ECDC4"
              maximumTrackTintColor="#4A5568"
              thumbStyle={{ backgroundColor: '#4ECDC4' }}
            />
            <Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
          </View>
        )}
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          thumbColor={value ? '#4ECDC4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#4ECDC440' }}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Accessibility size={24} color="#4ECDC4" />
        <Text style={styles.title}>Accessibility Settings</Text>
      </View>

      {/* Visual Accessibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👁️ Visual Accessibility</Text>
        
        <SettingRow
          icon={<Palette size={20} color="#8B5CF6" />}
          title="Color Blind Support"
          description="Enhanced visual indicators and alternative color schemes"
          type="toggle"
          value={settings.colorBlindMode}
          onValueChange={(value) => updateSetting('colorBlindMode', value)}
        />

        <SettingRow
          icon={<Eye size={20} color="#F59E0B" />}
          title="High Contrast Mode"
          description="Increased contrast for better visibility"
          type="toggle"
          value={settings.highContrast}
          onValueChange={(value) => updateSetting('highContrast', value)}
        />

        <SettingRow
          icon={<Type size={20} color="#10B981" />}
          title="Text Size"
          description="Adjust text size for better readability"
          type="slider"
          value={settings.textSize}
          onValueChange={(value) => updateSetting('textSize', value)}
          min={0.8}
          max={1.5}
          step={0.1}
        />

        <SettingRow
          icon={<Vibrate size={20} color="#EC4899" />}
          title="Reduced Motion"
          description="Minimize animations and transitions"
          type="toggle"
          value={settings.reducedMotion}
          onValueChange={(value) => updateSetting('reducedMotion', value)}
        />
      </View>

      {/* Audio Accessibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Audio Accessibility</Text>
        
        <SettingRow
          icon={<Volume2 size={20} color="#3B82F6" />}
          title="Audio Descriptions"
          description="Spoken descriptions of visual elements"
          type="toggle"
          value={settings.audioDescriptions}
          onValueChange={(value) => updateSetting('audioDescriptions', value)}
        />

        <SettingRow
          icon={<Eye size={20} color="#06B6D4" />}
          title="Sound Visualization"
          description="Visual indicators for audio cues"
          type="toggle"
          value={settings.soundVisualization}
          onValueChange={(value) => updateSetting('soundVisualization', value)}
        />

        <SettingRow
          icon={<Vibrate size={20} color="#8B5CF6" />}
          title="Haptic Feedback"
          description="Vibration for game events and interactions"
          type="toggle"
          value={settings.hapticFeedback}
          onValueChange={(value) => updateSetting('hapticFeedback', value)}
        />
      </View>

      {/* Motor Accessibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✋ Motor Accessibility</Text>
        
        <SettingRow
          icon={<Smartphone size={20} color="#F59E0B" />}
          title="One-Handed Mode"
          description="Optimize controls for single-hand use"
          type="toggle"
          value={settings.oneHandedMode}
          onValueChange={(value) => updateSetting('oneHandedMode', value)}
        />

        <SettingRow
          icon={<Accessibility size={20} color="#10B981" />}
          title="Simplified Controls"
          description="Larger buttons and simplified gestures"
          type="toggle"
          value={settings.simplifiedControls}
          onValueChange={(value) => updateSetting('simplifiedControls', value)}
        />

        <SettingRow
          icon={<Volume2 size={20} color="#EF4444" />}
          title="Hold to Press"
          description="Convert taps to hold gestures"
          type="toggle"
          value={settings.holdToPress}
          onValueChange={(value) => updateSetting('holdToPress', value)}
        />
      </View>

      {/* Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Performance</Text>
        
        <SettingRow
          icon={<Battery size={20} color="#22C55E" />}
          title="Battery Saver"
          description="Reduce visual effects to save battery"
          type="toggle"
          value={settings.batterySaver}
          onValueChange={(value) => updateSetting('batterySaver', value)}
        />

        <SettingRow
          icon={<Vibrate size={20} color="#A855F7" />}
          title="Reduced Effects"
          description="Minimize particle effects and animations"
          type="toggle"
          value={settings.reducedEffects}
          onValueChange={(value) => updateSetting('reducedEffects', value)}
        />
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Our accessibility features are designed to make Hide&Seek Worlds enjoyable for everyone. 
          If you need additional accommodations or have suggestions, please contact our support team.
        </Text>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Contact Support</Text>
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
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 18,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginLeft: 12,
    minWidth: 40,
  },
  helpSection: {
    padding: 24,
    backgroundColor: '#2D3748',
    margin: 24,
    borderRadius: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});