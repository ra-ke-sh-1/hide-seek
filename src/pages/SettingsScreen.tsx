import React, { useState } from 'react';
import { Volume2, VolumeX, Vibrate, Shield, Accessibility, Battery, Globe, HelpCircle, LogOut } from 'lucide-react';
import Navigation from '../components/Navigation';

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
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    settingKey, 
    action = 'toggle' 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    settingKey?: string;
    action?: 'toggle' | 'navigate';
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#2d3748',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '8px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        backgroundColor: '#4a5568',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '14px', color: '#a0aec0' }}>
          {subtitle}
        </p>
      </div>
      {action === 'toggle' && settingKey && (
        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
          <input
            type="checkbox"
            checked={settings[settingKey as keyof typeof settings] as boolean}
            onChange={() => toggleSetting(settingKey)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: (settings[settingKey as keyof typeof settings] as boolean) ? '#ff6b6b' : '#767577',
            borderRadius: '24px',
            transition: '0.4s',
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '18px',
              width: '18px',
              left: (settings[settingKey as keyof typeof settings] as boolean) ? '26px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: '0.4s',
            }} />
          </span>
        </label>
      )}
      {action === 'navigate' && (
        <span style={{ fontSize: '20px', color: '#a0aec0' }}>›</span>
      )}
    </div>
  );

  return (
    <div className="container">
      {/* Header */}
      <div style={{ padding: '24px', paddingTop: '60px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Settings</h1>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px', paddingBottom: '100px' }}>
        {/* Audio Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Audio
          </h2>
          <SettingRow
            icon={<Volume2 size={20} color="#4ECDC4" />}
            title="Sound Effects"
            subtitle="Game sounds and audio feedback"
            settingKey="soundEnabled"
          />
          <SettingRow
            icon={<Volume2 size={20} color="#4ECDC4" />}
            title="Background Music"
            subtitle="Ambient music during gameplay"
            settingKey="musicEnabled"
          />
          <SettingRow
            icon={<Vibrate size={20} color="#4ECDC4" />}
            title="Haptic Feedback"
            subtitle="Vibration for interactions"
            settingKey="hapticsEnabled"
          />
        </div>

        {/* Gameplay Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Gameplay
          </h2>
          <SettingRow
            icon={<Volume2 size={20} color="#FFE66D" />}
            title="Voice Chat"
            subtitle="Push-to-talk voice communication"
            settingKey="voiceChatEnabled"
          />
          <SettingRow
            icon={<Globe size={20} color="#FFE66D" />}
            title="Cross-Platform Play"
            subtitle="Play with users on all devices"
            settingKey="crossPlatformPlay"
          />
        </div>

        {/* Accessibility Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Accessibility
          </h2>
          <SettingRow
            icon={<Accessibility size={20} color="#9F7AEA" />}
            title="Color Blind Support"
            subtitle="Enhanced visual indicators"
            settingKey="colorBlindMode"
          />
          <SettingRow
            icon={<Battery size={20} color="#9F7AEA" />}
            title="Battery Saver"
            subtitle="Reduced visual effects"
            settingKey="batterySaver"
          />
        </div>

        {/* General Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            General
          </h2>
          <SettingRow
            icon={<Shield size={20} color="#68D391" />}
            title="Privacy & Safety"
            subtitle="Manage privacy settings and safety tools"
            action="navigate"
          />
          <SettingRow
            icon={<HelpCircle size={20} color="#68D391" />}
            title="Help & Support"
            subtitle="Get help and contact support"
            action="navigate"
          />
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '4px' }}>
            Hide&Seek Worlds v1.0.0
          </p>
          <p style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
            Build 2025.1.1 • Cross-Platform Edition
          </p>
          <p style={{ fontSize: '12px', color: '#4ecdc4', fontStyle: 'italic' }}>
            Made with ❤️ for the community
          </p>
        </div>

        {/* Sign Out */}
        <button
          className="button"
          style={{ 
            width: '100%', 
            backgroundColor: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => alert('Sign out functionality would be implemented here')}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <Navigation />
    </div>
  );
}