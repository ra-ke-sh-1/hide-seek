import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
      }
    } catch (error: any) {
        console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Sparkles size={48} color="#FF6B6B" />
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            margin: '16px 0 8px 0'
          }}>
            Hide&Seek Worlds
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Build, Hide, Seek, Repeat!
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'signin' ? '#FF6B6B' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              background: mode === 'signup' ? '#FF6B6B' : 'transparent',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                color: '#ffffff', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              color: '#ffffff', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: '#ffffff', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '48px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '16px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleAuth}
            disabled={loading || !email.trim() || !password.trim() || (mode === 'signup' && !username.trim())}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || !email.trim() || !password.trim() || (mode === 'signup' && !username.trim())) ? '#4A5568' : '#FF6B6B',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: (loading || !email.trim() || !password.trim() || (mode === 'signup' && !username.trim())) ? 'not-allowed' : 'pointer',
              opacity: (loading || !email.trim() || !password.trim() || (mode === 'signup' && !username.trim())) ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <p style={{ 
          fontSize: '12px', 
          color: 'rgba(255, 255, 255, 0.6)', 
          textAlign: 'center' 
        }}>
          By playing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}