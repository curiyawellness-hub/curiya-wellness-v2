import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange, flags = {} }) => {
    // Positioning styles kept functional, visual styles moved to CSS .nav-pill
    const containerStyle = {
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '360px', 
        height: '56px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', 
        padding: '0 48px', 
        gap: '0' 
    };

    const itemStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isActive ? 'var(--color-primary-dark)' : 'rgba(27, 67, 50, 0.4)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        transition: 'all 0.3s ease',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        position: 'relative',
        zIndex: 2
    });



    const highlightStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0.0) 100%)',
        pointerEvents: 'none',
        zIndex: 1
    };

    return (
        <nav style={containerStyle} className="nav-pill">
            <div style={highlightStyle} />
            <button
                style={itemStyle(activeTab === 'home')}
                onClick={() => onTabChange('home')}
                aria-label="Home"
            >
                <Home size={24} strokeWidth={1.7} />
            </button>

            {flags?.protocol_enabled !== false && (
                <button
                    style={itemStyle(activeTab === 'protocol')}
                    onClick={() => onTabChange('protocol')}
                    aria-label="Protocol"
                >
                    <ClipboardList size={24} strokeWidth={1.7} />
                </button>
            )}

            <button
                style={itemStyle(activeTab === 'profile')}
                onClick={() => onTabChange('profile')}
                aria-label="Profile"
            >
                <User size={24} strokeWidth={1.7} />
            </button>
        </nav>
    );
};

export default BottomNav;
