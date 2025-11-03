import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Map, Sparkles, Trophy, Star, UserPlus } from 'lucide-react';
import { useWorldStore } from '../stores/worldStore';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [activeNews, setActiveNews] = useState(0);
  const { user } = useAuth();

  const newsItems = [
    { 
      title: 'New Maps Released!', 
      subtitle: 'Check out the Winter Collection - 5 cozy worlds perfect for winter hiding',
      color: '#4ECDC4'
    },
    { 
      title: 'Tournament Mode Live!', 
      subtitle: 'Compete in ranked matches and climb the leaderboard for exclusive rewards',
      color: '#FFE66D'
    },
    { 
      title: 'Avatar Creator Update', 
      subtitle: 'New customization options: 20+ new outfits and animated emotes',
      color: '#FF6B6B'
    }
  ];

  const handleQuickPlay = () => {
    navigate('/play');
  };

  const handleWorldBuilder = () => {
    navigate('/world-builder');
  };

  const handleVibeCode = () => {
    navigate('/vibe-code');
  };

  return (
    <div className="container">
  
      
      {/* Epic floating emojis */}
      <div className="emoji-float">🎮</div>
      <div className="emoji-float">🥷</div>
      <div className="emoji-float">👁️</div>
      <div className="emoji-float">⚡</div>
      <div className="emoji-float">🔥</div>
      <div className="emoji-float">💯</div>

      {/* Header */}
      <div className="header">
        <div style={{ textAlign: 'center' }}>
          <h1 className="title">Hide&Seek Worlds</h1>
          <p className="homesubtitle">Welcome back, {user?.user_metadata?.username || 'Player'}!</p>
        </div>
      </div>

      

        <div style={{ marginBottom: '32px' }}>
          {/* Quick Actions */}
      <div style={{ padding: '24px', paddingBottom: '0'}}>
        <button 
          className="button animate-glow"
          style={{ 
            maxWidth: '420px',
            width: '100%',
            fontSize: '20px',
            padding: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onClick={handleQuickPlay}
        >
          <Play size={28} />
          🚀 QUICK PLAY NOW! 🚀
        </button>

        <button 
            className="button secondary hover-grow"
              style={{ 
            maxWidth: '420px',
            width: '100%',
            fontSize: '20px',
            padding: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
            onClick={handleWorldBuilder}
          >
            <Map size={24} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>BUILD</span>
          </button>
          
          <button 
            className="button accent hover-grow"
              style={{
            maxWidth: '420px', 
            width: '100%',
            fontSize: '20px',
            padding: '24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
            onClick={handleVibeCode}
          >
            <Sparkles size={24} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>VIBE CODE</span>
          </button>
          
          {/* <button 
            className="button secondary hover-grow"
            style={{ 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleWorldBuilder}
          >
            <Map size={24} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>BUILD</span>
          </button>
          
          <button 
            className="button accent hover-grow"
            style={{ 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleVibeCode}
          >
            <Sparkles size={24} />
            <span style={{ fontSize: '14px', fontWeight: '700' }}>VIBE CODE</span>
          </button> */}
        </div>
      </div>

      <Navigation />
    </div>
  );
}