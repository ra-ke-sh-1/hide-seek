import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Volume2, VolumeX, Vibrate, Shield, Accessibility, Battery, Palette, Globe, CircleHelp as HelpCircle, LogOut, Crown, Users, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  icon: React.ReactNode;
  danger?: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    voiceChatEnabled: false,
    colorBlindMode: false,
    batterySaver: false,
    notifications: true,
    crossPlatformPlay: true,
    autoMatchmaking: true,
    friendRequests: true,
    showOnlineStatus: true,
  });

  const { signOut } = useAuth();

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your progress is automatically saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  const audioSettings: SettingItem[] = [
    {
      id: 'sound',
      title: 'Sound Effects',
      subtitle: 'Game sounds and audio feedback',
      type: 'toggle',
      value: settings.soundEnabled,
      icon: <Volume2 size={20} color="#4ECDC4" />
    },
    {
      id: 'music',
      title: 'Background Music',
      subtitle: 'Ambient music during gameplay',
      type: 'toggle',
      value: settings.musicEnabled,
      icon: <Volume2 size={20} color="#4ECDC4" />
    },
    {
      id: 'haptics',
      title: 'Haptic Feedback',
      subtitle: 'Vibration for interactions',
      type: 'toggle',
      value: settings.hapticsEnabled,
      icon: <Vibrate size={20} color="#4ECDC4" />
    }
  ];

  const gameplaySettings: SettingItem[] = [
    {
      id: 'voiceChat',
      title: 'Voice Chat',
      subtitle: 'Push-to-talk voice communication (age-gated)',
      type: 'toggle',
      value: settings.voiceChatEnabled,
      icon: <Volume2 size={20} color="#FFE66D" />
    },
    {
      id: 'crossPlatform',
      title: 'Cross-Platform Play',
      subtitle: 'Play with users on all devices',
      type: 'toggle',
      value: settings.crossPlatformPlay,
      icon: <Globe size={20} color="#FFE66D" />
    },
    {
      id: 'autoMatchmaking',
      title: 'Auto Matchmaking',
      subtitle: 'Automatically find games when available',
      type: 'toggle',
      value: settings.autoMatchmaking,
      icon: <Users size={20} color="#FFE66D" />
    }
  ];

  const socialSettings: SettingItem[] = [
    {
      id: 'friendRequests',
      title: 'Friend Requests',
      subtitle: 'Allow others to send friend requests',
      type: 'toggle',
      value: settings.friendRequests,
      icon: <Users size={20} color="#4ECDC4" />
    },
    {
      id: 'showOnlineStatus',
      title: 'Show Online Status',
      subtitle: 'Let friends see when you\'re online',
      type: 'toggle',
      value: settings.showOnlineStatus,
      icon: <Bell size={20} color="#4ECDC4" />
    },
    {
      id: 'notifications',
      title: 'Game Notifications',
      subtitle: 'Alerts for invites and game events',
      type: 'toggle',
      value: settings.notifications,
      icon: <Bell size={20} color="#4ECDC4" />
    }
  ];

  const accessibilitySettings: SettingItem[] = [
    {
      id: 'colorBlind',
      title: 'Color Blind Support',
      subtitle: 'Enhanced visual indicators',
      type: 'toggle',
      value: settings.colorBlindMode,
      icon: <Accessibility size={20} color="#9F7AEA" />
    },
    {
      id: 'batterySaver',
      title: 'Battery Saver',
      subtitle: 'Reduced visual effects',
      type: 'toggle',
      value: settings.batterySaver,
      icon: <Battery size={20} color="#9F7AEA" />
    },
    {
      id: 'fullAccessibility',
      title: 'Full Accessibility Settings',
      subtitle: 'Complete accessibility customization',
      type: 'navigation',
      icon: <Accessibility size={20} color="#9F7AEA" />
    }
  ];

  const generalSettings: SettingItem[] = [
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      subtitle: 'Manage privacy settings and safety tools',
      type: 'navigation',
      icon: <Shield size={20} color="#68D391" />
    },
    {
      id: 'premium',
      title: 'Premium Features',
      subtitle: 'Unlock exclusive cosmetics and worlds',
      type: 'navigation',
      icon: <Crown size={20} color="#FFE66D" />
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      type: 'navigation',
      icon: <HelpCircle size={20} color="#68D391" />
    },
    {
      id: 'logout',
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      type: 'action',
      icon: <LogOut size={20} color="#F56565" />,
      danger: true
    }
  ];

  const renderSetting = (setting: SettingItem) => {
    const handlePress = () => {
      if (setting.type === 'toggle') {
        toggleSetting(setting.id);
      } else if (setting.type === 'navigation') {
        switch (setting.id) {
          case 'fullAccessibility':
            router.push('/accessibility');
            break;
          case 'privacy':
            Alert.alert('Privacy Settings', 'Privacy settings would open here.');
            break;
          case 'premium':
            Alert.alert('Premium Features', 'Premium features coming soon!');
            break;
          case 'help':
            Alert.alert('Help & Support', 'Help system would open here.');
            break;
        }
      } else if (setting.type === 'action' && setting.danger) {
        handleSignOut();
      }
    };

    return (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingIcon}>
        {setting.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        {setting.subtitle && (
          <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
        )}
      </View>
      {setting.type === 'toggle' && (
        <Switch
          value={setting.value}
          onValueChange={handlePress}
          thumbColor={setting.value ? '#FF6B6B' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#FF6B6B40' }}
        />
      )}
      {(setting.type === 'navigation' || (setting.type === 'action' && !setting.danger)) && (
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.navigationArrow}>›</Text>
        </TouchableOpacity>
      )}
      {setting.type === 'action' && setting.danger && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePress}
        >
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          {audioSettings.map(renderSetting)}
        </View>

        {/* Gameplay Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          {gameplaySettings.map(renderSetting)}
        </View>

        {/* Social Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social</Text>
          {socialSettings.map(renderSetting)}
        </View>

        {/* Accessibility Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          {accessibilitySettings.map(renderSetting)}
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {generalSettings.map(renderSetting)}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Hide&Seek Worlds v1.0.0</Text>
          <Text style={styles.appBuild}>Build 2025.1.1 • Cross-Platform Edition</Text>
          <Text style={styles.appCredits}>Made with ❤️ for the community</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
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
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  navigationArrow: {
    fontSize: 20,
    color: '#A0AEC0',
  },
  actionButton: {
    backgroundColor: '#F56565',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 100,
  },
  appVersion: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 4,
  },
  appBuild: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  appCredits: {
    fontSize: 12,
    color: '#4ECDC4',
    fontStyle: 'italic',
  },
});