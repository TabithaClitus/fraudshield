import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const navLinks = [
    { path: '/', label: '🏠 Home' },
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/heatmap', label: '🗺️ Heatmap' },
    { path: '/guardian', label: '👨‍👩‍👧 Guardian' },
    { path: '/predictor', label: '🤖 AI Predictor' },
  ];

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: '60px',
    background: isDark ? '#0d0d1a' : '#ffffff',
    borderBottom: isDark ? '1px solid #2a2a3e' : '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  return (
    <div>
      <nav style={navStyle}>
        {/* Left section: Hamburger (mobile) + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', display: 'flex', flexDirection: 'column',
                gap: '5px', justifyContent: 'center' }}>
              {menuOpen ? (
                <span style={{ fontSize: '20px', color: isDark ? '#fff' : '#1a1a2e', lineHeight: 1 }}>✕</span>
              ) : (
                <>
                  <div style={{ width: '22px', height: '2px', background: isDark ? '#fff' : '#1a1a2e', borderRadius: '2px' }} />
                  <div style={{ width: '22px', height: '2px', background: isDark ? '#fff' : '#1a1a2e', borderRadius: '2px' }} />
                  <div style={{ width: '22px', height: '2px', background: isDark ? '#fff' : '#1a1a2e', borderRadius: '2px' }} />
                </>
              )}
            </button>
          )}
          <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#7c3aed', cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            🛡️ FraudShield
          </span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {navLinks.map(link => (
              <button key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: location.pathname === link.path ? '#7c3aed' : 'transparent',
                  color: location.pathname === link.path ? '#fff' : (isDark ? '#fff' : '#1a1a2e'),
                  border: 'none', borderRadius: '6px', padding: '6px 12px',
                  cursor: 'pointer', fontSize: '14px'
                }}>
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            {isDark ? '🌙' : '☀️'}
          </button>
          <span style={{ fontSize: '20px' }}>🔔</span>
        </div>
      </nav>

      {/* Overlay */}
      {isMobile && (
        <div 
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: menuOpen ? 'rgba(0,0,0,0.5)' : 'transparent',
            zIndex: menuOpen ? 9998 : -1,
            transition: 'background 0.3s ease',
            pointerEvents: menuOpen ? 'auto' : 'none'
          }}
        />
      )}

      {/* Side Drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '75%',
          maxWidth: '280px',
          height: '100vh',
          background: isDark ? '#1a1a2e' : '#ffffff',
          zIndex: 9999,
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          transition: 'transform 0.3s ease',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
          {/* Drawer Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#7c3aed' }}>
              🛡️ FraudShield
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: isDark ? '#fff' : '#1a1a2e'
              }}>
              ✕
            </button>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 24px',
                    background: isActive ? (isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.08)') : 'transparent',
                    color: isDark ? '#fff' : '#1a1a2e',
                    fontSize: '16px',
                    cursor: 'pointer',
                    border: 'none',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderLeft: isActive ? '4px solid #7c3aed' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? '600' : '500'
                  }}>
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle at Bottom */}
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1,
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 16px',
                color: isDark ? '#fff' : '#1a1a2e',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
