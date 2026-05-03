import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Card from './Card';

/**
 * HeroBanner - A unified header component for all pages.
 * Features premium glassmorphism, glossy highlight, and decorative background circles.
 */
const HeroBanner = ({
    title,
    label,
    onBack = null,
    backText = "Back",
    subtitle = null,
    badge = null,
    height = '165px',
    marginBottom = '20px',
    style = {},
    children = null
}) => {
    const colors = {
        primary: '#1B4332',
        secondary: 'rgba(27,67,50,0.45)',
        accent: '#2D6A4F'
    };

    return (
        <Card className="hero-card" style={{
            height: height,
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: marginBottom,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            ...style
        }}>

            {/* Decorative Background Circles */}
            <div style={{ position: 'absolute', width: '200px', height: '200px', top: '-60px', right: '-60px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '130px', height: '130px', top: '-15px', right: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '80px', height: '80px', bottom: '-15px', left: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)', pointerEvents: 'none' }} />

            {/* Content Layer */}
            <div style={{ 
                position: 'absolute', 
                inset: 0, 
                padding: '16px 18px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                zIndex: 2 
            }}>
                {/* Top Row: Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {onBack ? (
                        <button
                            onClick={onBack}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(27,67,50,0.08)',
                                border: '1px solid rgba(27,67,50,0.12)',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: colors.primary,
                                alignSelf: 'flex-start'
                            }}
                        >
                            <ChevronLeft size={12} strokeWidth={2.5} />
                            {backText}
                        </button>
                    ) : <div />}
                </div>

                {/* Bottom Row: Title and Info */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        {label && (
                            <div style={{ 
                                fontFamily: 'var(--font-body)', 
                                fontSize: '10px', 
                                fontWeight: 600, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.15em', 
                                color: colors.secondary, 
                                marginBottom: '4px' 
                            }}>
                                {label}
                            </div>
                        )}
                        <div style={{ 
                            fontFamily: 'var(--font-heading)', 
                            fontSize: title && title.length > 20 ? '22px' : '26px', 
                            fontWeight: 600, 
                            color: colors.primary, 
                            lineHeight: 1.1 
                        }}>
                            {title}
                        </div>
                        {subtitle && (
                            <div style={{ 
                                fontSize: '12px', 
                                color: colors.accent, 
                                marginTop: '4px',
                                opacity: 0.8,
                                fontWeight: 500
                            }}>
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {badge && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(27,67,50,0.08)',
                            border: '1px solid rgba(27,67,50,0.12)',
                            borderRadius: '12px',
                            padding: '6px 11px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: colors.primary
                        }}>
                            {badge}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Custom Children Support (for specialized layouts like GreetingCard) */}
            {children && (
                <div style={{ position: 'relative', zIndex: 3, height: '100%', pointerEvents: 'none' }}>
                    {children}
                </div>
            )}
        </Card>
    );
};

export default HeroBanner;
