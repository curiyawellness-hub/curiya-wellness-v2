import React from 'react';
import './shimmer.css';

const GlobalShimmer = ({ type = 'card', count = 1, style = {} }) => {
    const renderShimmer = (key) => {
        switch (type) {
            case 'greeting':
                return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', ...style }}>
                        <div className="glass-shimmer" style={{ height: '40px', width: '60%', borderRadius: '12px' }} />
                        <div className="glass-shimmer" style={{ height: '80px', width: '100%', borderRadius: '24px' }} />
                    </div>
                );
            case 'card':
                return (
                    <div key={key} className="glass-shimmer" style={{ height: '180px', width: '100%', borderRadius: '24px', marginBottom: '16px', ...style }} />
                );
            case 'row':
                return (
                    <div key={key} style={{ display: 'flex', gap: '12px', marginBottom: '16px', ...style }}>
                        <div className="glass-shimmer" style={{ height: '48px', width: '48px', borderRadius: '50%' }} />
                        <div className="glass-shimmer" style={{ height: '48px', flex: 1, borderRadius: '12px' }} />
                    </div>
                );
            case 'text-block':
                return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', ...style }}>
                        <div className="glass-shimmer" style={{ height: '20px', width: '100%', borderRadius: '4px' }} />
                        <div className="glass-shimmer" style={{ height: '20px', width: '90%', borderRadius: '4px' }} />
                        <div className="glass-shimmer" style={{ height: '20px', width: '40%', borderRadius: '4px' }} />
                    </div>
                );
            default:
                return <div key={key} className="glass-shimmer" style={{ height: '100px', width: '100%', borderRadius: '16px', ...style }} />;
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {Array.from({ length: count }).map((_, i) => renderShimmer(i))}
        </div>
    );
};

export default GlobalShimmer;
