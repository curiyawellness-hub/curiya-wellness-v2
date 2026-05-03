import React from 'react';
import Badge from '../ui/Badge';
import logo from '../../assets/curiya_logo_new.png';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../services/AuthContext';

const Header = () => {
    const { logout } = useAuth();

    const headerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        // Now using synchronized global variables
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        borderBottom: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden'
    };

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
        <header style={headerStyle}>
            <div style={highlightStyle} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="Curiya Wellness" style={{ height: '74px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                <Badge type="primary">Active</Badge>
                <button
                    onClick={() => logout()}
                    className="glass-bubble"
                    style={{
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    title="Log out"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;
