import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Target, Eye, EyeOff, Star } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const winRate = 0; // Placeholder until profile system is implemented

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        // Navigation will happen automatically via auth state change
      } catch (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button
            onClick={() => navigate('/settings')}
            className="text-white/80 hover:text-white transition-colors"
          >
            Settings
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{user?.user_metadata?.username || 'Player'}</h2>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Level 1</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '25%' }}
              ></div>
            </div>
            <p className="text-white/80 text-sm mt-1">250 XP</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-white/80 text-sm">Wins</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-white/80 text-sm">Games</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Eye className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-white/80 text-sm">Seeks</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <EyeOff className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-white/80 text-sm">Hides</p>
            </div>
          </div>

          {/* Win Rate */}
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-white">{winRate}%</p>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm">Coins</p>
              <p className="text-2xl font-bold text-white">100</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          className="button"
          style={{ 
            width: '100%', 
            backgroundColor: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {/* Compact Help Text */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="max-w-md mx-auto">
          <p className="text-white/60 text-xs text-center bg-black/20 rounded-lg px-3 py-2">
            View your stats and achievements
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
}