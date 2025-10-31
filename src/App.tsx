import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthScreen from './components/auth/AuthScreen';
import HomeScreen from './pages/HomeScreen';
import PlayScreen from './pages/PlayScreen';
import WorldBuilderScreen from './pages/WorldBuilderScreen';
import VibeCodeScreen from './pages/VibeCodeScreen';
import ProfileScreen from './pages/ProfileScreen';
import SettingsScreen from './pages/SettingsScreen';
import ActualGameScreen from './pages/ActualGameScreen';
import MultiplayerLobby from './pages/MultiplayerLobby';

import './App.css';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2>Loading Hide&Seek Worlds...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/world-builder" element={<WorldBuilderScreen />} />
        <Route path="/vibe-code" element={<VibeCodeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/lobby" element={<MultiplayerLobby />} />
        <Route path="/game" element={<ActualGameScreen />} />
      </Routes>
    </div>
  );
}