import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', emoji: '🏠' },
    { path: '/play', emoji: '🎮' },
    { path: '/world-builder', emoji: '🏗️' },
    { path: '/settings', emoji: '⚙️' },
  ];

  return (
    <div className="nav-tabs">
      {tabs.map(({ path, emoji }) => (
        <button
          key={path}
          className={`nav-tab ${location.pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)}
        >
          <div style={{ 
            fontSize: '28px', 
            marginBottom: '4px',
            filter: location.pathname === path ? 'none' : 'grayscale(30%)',
            animation: location.pathname === path ? 'funBounce 2s infinite' : 'none'
          }}>
            {emoji}
          </div>
        </button>
      ))}
    </div>
  );
}