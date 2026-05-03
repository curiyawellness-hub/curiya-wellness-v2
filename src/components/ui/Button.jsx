import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', style = {} }) => {
    const baseStyle = {
        padding: '16px 24px',
        borderRadius: '24px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        fontSize: '0.95rem',
        position: 'relative',
        overflow: 'hidden'
    };

    const variants = {
        primary: {}, // Handled by CSS class .btn-primary
        secondary: {
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(255,255,255,0.5)'
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--color-primary)',
            color: 'var(--color-primary)'
        },
        danger: {
            background: 'transparent',
            border: '1.5px solid #EF4444',
            color: '#EF4444'
        }
    };

    return (
        <button
            onClick={onClick}
            style={{ ...baseStyle, ...variants[variant], ...style }}
            className={`btn-${variant} ${className}`}
        >
            {/* Icon/Text Container */}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                {children}
            </span>
        </button>
    );
};

export default Button;
