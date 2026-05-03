import React from 'react';

const Card = ({ children, className = '', title, subtitle, style }) => {
    return (
        <div className={`glass-card ${className}`} style={style}>
            {(title || subtitle) && (
                <div style={{ marginBottom: '16px' }}>
                    {title && <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>{title}</h3>}
                    {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
