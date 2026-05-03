import React from 'react';

const Badge = ({ children, type = 'neutral', className = '' }) => {
    const styles = {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: type === 'primary' ? 'rgba(63, 100, 55, 0.1)' : 'rgba(0,0,0,0.05)',
        color: type === 'primary' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        border: type === 'primary' ? '1px solid rgba(63, 100, 55, 0.2)' : '1px solid rgba(0,0,0,0.1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
    };

    return (
        <span style={styles} className={className}>
            {children}
        </span>
    );
};

export default Badge;
