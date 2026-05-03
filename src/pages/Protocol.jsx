import React, { useState, useEffect } from 'react';
import { Pill, Utensils, Zap, Moon, ChevronRight, ChevronLeft, FileText, Eye, Download, Salad } from 'lucide-react';
import Card from '../components/ui/Card';
import HeroBanner from '../components/ui/HeroBanner';
import Prescription from './Prescription';
import LabReports from './LabReports';
import DietProtocol from '../components/features/protocol/DietProtocol';
import RelaxationPlayer from '../components/features/protocol/RelaxationPlayer';

const ProtocolGrid = ({ onSelect, flags = {} }) => {
    const items = [
        { id: 'meds', label: 'Herbals & Supplements', icon: Pill, color: '#e0f2f1' },
        { id: 'reports', label: 'Lab Reports', icon: FileText, color: '#e8f5e9' },
        { id: 'diet', label: 'Diet Plan', icon: Utensils, color: '#fbe9e7' },
        { id: 'yoga', label: 'Yoga Therapy', icon: Zap, color: '#e8f5e9' },
        { id: 'sleep', label: 'Relaxation & Sleep', icon: Moon, color: '#ede7f6', enabled: flags.audio_enabled !== false }
    ].filter(item => item.enabled !== false);

    return (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="My Protocol"
                subtitle="Your daily wellness plan"
                label="WELLNESS REGIMEN"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {items.map((item, index) => (
                    <div key={item.id}>
                        <button
                            onClick={() => onSelect(item.id)}
                            className="glass-card action-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '24px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                background: 'var(--glass-bg)',
                                border: 'var(--glass-border)',
                                borderRadius: 'var(--radius-lg)',
                                width: '100%',
                                marginBottom: 0 // Margin is now controlled by the animate-slide-up wrapper or grid gap
                            }}
                        >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="glass-bubble" style={{
                                width: '48px', height: '48px',
                                background: item.color,
                                color: 'var(--color-primary-dark)',
                                border: '1px solid rgba(255,255,255,0.5)'
                            }}>
                                <item.icon size={22} strokeWidth={1.5} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                                    {item.label}
                                </span>
                                {item.subtitle && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', opacity: 0.8 }}>
                                        {item.subtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// The old DietView is replaced by DietProtocol
const DietView = ({ onBack }) => {
    return <DietProtocol onBack={onBack} />;
};



const PlaceholderView = ({ title, icon: Icon, children, onBack }) => (
    <div>
        <Card title={title}>
            <button
                onClick={onBack}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(27,67,50,0.08)',
                    border: '1px solid rgba(27,67,50,0.12)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    color: 'var(--color-primary-dark)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                <ChevronLeft size={12} strokeWidth={2.5} />
                Back to Protocol
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div className="glass-bubble" style={{ width: '40px', height: '40px' }}>
                    <Icon size={20} />
                </div>
                <p style={{ color: 'var(--color-primary-body)', fontWeight: 500 }}>{children}</p>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--color-secondary)' }}>
                    Detailed plan loading...
                </p>
            </div>
        </Card>
    </div>
);

const YogaView = ({ onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [yogaData, setYogaData] = useState(null);

    const fetchYogaSession = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/yoga-sync');
            if (!response.ok) {
                throw new Error('Failed to fetch yoga session data');
            }
            const data = await response.json();
            setYogaData(data);
        } catch (err) {
            setError('Unable to load session info. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYogaSession();
    }, []);

    const colors = {
        g1: '#1B4332',
        g2: '#2D6A4F',
        g3: '#40916C',
        g4: '#52B788',
        g5: '#74C69D',
        g6: '#B7E4C7',
    };

    const renderLoading = () => (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Yoga Therapy"
                label="LIVE SESSIONS"
                onBack={onBack}
                backText="Back to Protocol"
            />
            <div style={{ marginTop: '20px' }} />
            {/* Loading skeleton */}
            <div className="animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
                <div style={{
                    position: 'relative',
                    padding: '20px',
                    marginBottom: '16px',
                    borderRadius: '24px',
                    background: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                    <div style={{ height: '100px', background: 'rgba(82, 183, 136, 0.1)', borderRadius: '12px' }} />
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );

    const renderError = () => (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Yoga Therapy"
                label="LIVE SESSIONS"
                onBack={onBack}
                backText="Back to Protocol"
            />
            <div style={{ marginTop: '20px' }} />
            <div className="animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
                <div style={{
                    padding: '20px',
                    marginBottom: '16px',
                    borderRadius: '24px',
                    background: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: colors.g1, marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </p>
                    <button
                        onClick={fetchYogaSession}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            background: `linear-gradient(145deg, ${colors.g2}, ${colors.g1})`,
                            color: 'white',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNoSession = () => (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Yoga Therapy"
                label="LIVE SESSIONS"
                onBack={onBack}
                backText="Back to Protocol"
            />
            <div style={{ marginTop: '20px' }} />
            <div className="animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
                <div style={{
                    padding: '24px',
                    borderRadius: '24px',
                    background: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: colors.g2, fontSize: '16px', fontWeight: 500 }}>
                        No session today
                    </p>
                </div>
            </div>
        </div>
    );

    const renderLiveSession = (ui) => (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Yoga Therapy"
                label="LIVE SESSIONS"
                onBack={onBack}
                backText="Back to Protocol"
            />

            {/* Status Badge - Green LIVE */}
            <div style={{
                position: 'relative',
                marginTop: '-56px',
                marginRight: '18px',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-end',
                pointerEvents: 'none'
            }}>
                <div style={{
                    background: 'rgba(76, 175, 80, 0.15)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '12px',
                    padding: '6px 11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: '#4CAF50',
                        boxShadow: '0 0 8px rgba(76, 175, 80, 0.8)',
                        animation: 'pulse-green 2s infinite'
                    }} />
                    <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: '#2D6A4F',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                    }}>
                        {ui.badgeText}
                    </span>
                </div>
            </div>
            
            <div style={{ marginTop: '20px' }} />

            {/* Instruction Card */}
            <div className="animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
                <div 
                    style={{
                        position: 'relative',
                        padding: '20px',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        border: 'var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 10px rgba(45,106,79,0.15)',
                            flexShrink: 0
                        }}>
                            <Zap size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1, marginBottom: '4px' }}>Daily Practice</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: colors.g2, lineHeight: 1.5, fontWeight: 500 }}>
                                Daily group yoga session focusing on overall wellness and mental clarity.
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ height: '1px', background: 'rgba(82,183,136,0.15)', margin: '12px 0' }} />
                    
                    <div style={{ fontSize: '12px', color: colors.g2, fontStyle: 'italic', lineHeight: 1.6 }}>
                        Yoga helps in cultivating mental clarity, reducing stress, and enhancing overall well-being.
                    </div>
                </div>
            </div>

            {/* Section Label */}
            <div style={{ fontFamily: 'var(--font-body)', padding: '0 4px 6px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4, marginTop: '8px' }}>
                LIVE CLASS
            </div>

            {/* Join Button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.12s', opacity: 0 }}>
                <button
                    onClick={() => window.open(ui.joinUrl, '_blank')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '24px',
                        background: `linear-gradient(145deg, ${colors.g2}, ${colors.g1})`,
                        color: 'white',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(27, 67, 50, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        boxShadow: '0 0 12px #FFFFFF, 0 0 4px #FFFFFF',
                        animation: 'pulse-white 2s infinite'
                    }} />
                    {ui.buttonText}
                </button>
            </div>

            <style>{`
                @keyframes pulse-green {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes pulse-white {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );

    const renderUpcomingSession = (ui) => (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Yoga Therapy"
                label="LIVE SESSIONS"
                onBack={onBack}
                backText="Back to Protocol"
            />

            {/* Status Badge - Upcoming */}
            <div style={{
                position: 'relative',
                marginTop: '-56px',
                marginRight: '18px',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-end',
                pointerEvents: 'none'
            }}>
                <div style={{
                    background: 'rgba(27,67,50,0.08)',
                    border: '1px solid rgba(27,67,50,0.12)',
                    borderRadius: '12px',
                    padding: '6px 11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    pointerEvents: 'auto'
                }}>
                    <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: colors.g1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                    }}>
                        {ui.badgeText}
                    </span>
                </div>
            </div>
            
            <div style={{ marginTop: '20px' }} />

            {/* Instruction Card */}
            <div className="animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
                <div 
                    style={{
                        position: 'relative',
                        padding: '20px',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        border: 'var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 3px 10px rgba(45,106,79,0.15)',
                            flexShrink: 0
                        }}>
                            <Zap size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1, marginBottom: '4px' }}>Daily Practice</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: colors.g2, lineHeight: 1.5, fontWeight: 500 }}>
                                Daily group yoga session focusing on overall wellness and mental clarity.
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: colors.g2, fontStyle: 'italic', lineHeight: 1.6 }}>
                        Yoga helps in cultivating mental clarity, reducing stress, and enhancing overall well-being.
                    </div>
                </div>
            </div>

            {/* Section Label */}
            <div style={{ fontFamily: 'var(--font-body)', padding: '0 4px 6px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4, marginTop: '8px' }}>
                UPCOMING CLASS
            </div>

            {/* Disabled Join Button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.12s', opacity: 0 }}>
                <button
                    disabled
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '24px',
                        background: `linear-gradient(145deg, ${colors.g2}, ${colors.g1})`,
                        color: 'white',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: 'not-allowed',
                        marginBottom: '16px',
                        boxShadow: '0 8px 25px rgba(27, 67, 50, 0.25)'
                    }}
                >
                    {ui.buttonText}
                </button>
            </div>
        </div>
    );

    if (loading) return renderLoading();
    if (error) return renderError();
    if (!yogaData || !yogaData.ui) return renderError();

    const { ui } = yogaData;

    switch (ui.uiState) {
        case 'LIVE':
            return renderLiveSession(ui);
        case 'UPCOMING':
            return renderUpcomingSession(ui);
        case 'NO_SESSION':
            return renderNoSession();
        default:
            return renderError();
    }
};

const Protocol = ({ flags = {} }) => {
    const [view, setView] = useState('grid'); // grid, meds, diet, yoga, sleep

    const renderContent = () => {
        switch (view) {
            case 'meds':
                return (
                    <div>
                        <Prescription onBack={() => setView('grid')} />
                    </div>
                );
            case 'reports':
                return <LabReports onBack={() => setView('grid')} flags={flags} />;
            case 'diet':
                return (
                    <DietView
                        onBack={() => setView('grid')}
                    />
                );
            case 'yoga':
                return (
                    <YogaView
                        onBack={() => setView('grid')}
                    />
                );
            case 'sleep':
                if (flags.audio_enabled === false) {
                    setView('grid');
                    return null;
                }
                return <RelaxationPlayer onBack={() => setView('grid')} />;
            default:
                return <ProtocolGrid onSelect={setView} flags={flags} />;
        }
    };

    return (
        <div>
            {renderContent()}
        </div>
    );
};

export default Protocol;
