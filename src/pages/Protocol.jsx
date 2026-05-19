import React, { useState, useEffect } from 'react';
import { Pill, Utensils, Zap, Moon, ChevronRight, ChevronLeft, FileText, Eye, Download, Salad } from 'lucide-react';
import Card from '../components/ui/Card';
import HeroBanner from '../components/ui/HeroBanner';
import Prescription from './Prescription';
import LabReports from './LabReports';
import DietProtocol from '../components/features/protocol/DietProtocol';
import RelaxationPlayer from '../components/features/protocol/RelaxationPlayer';
import { useAuth } from '../services/AuthContext';
import { fetchFromWebhook } from '../services/patientApi';

const ProtocolGrid = ({ onSelect, flags = {} }) => {
    const items = [
        { id: 'meds', label: 'Herbs & Supplements', subline: 'Your Prescribed Formulas', icon: Pill, color: '#e0f2f1' },
        { id: 'reports', label: 'Lab Reports', subline: 'Track Your Diagnostics', icon: FileText, color: '#e8f5e9' },
        { id: 'diet', label: 'Nutrition Plan', subline: 'Your Personalised Diet', icon: Utensils, color: '#fbe9e7' },
        { id: 'yoga', label: 'Yoga Therapy', subline: 'Movement For Healing', icon: Zap, color: '#e8f5e9' },
        { id: 'sleep', label: 'Sleep & Recovery', subline: 'Rest Is Part Of Healing', icon: Moon, color: '#ede7f6', enabled: flags.audio_enabled !== false }
    ].filter(item => item.enabled !== false);

    return (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Your wellness plan"
                subtitle="Crafted by Curiya's wellness experts"
                label="CURATED FOR YOU"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {items.map((item) => (
                    <div key={item.id}>
                        <button
                            onClick={() => onSelect(item.id)}
                            className="glass-card action-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 24px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                background: 'var(--glass-bg)',
                                border: 'var(--glass-border)',
                                borderRadius: 'var(--radius-lg)',
                                width: '100%',
                                marginBottom: 0,
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
                                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-dark)', lineHeight: '1.2' }}>
                                    {item.label}
                                </span>
                                {item.subline && (
                                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', opacity: 0.6, marginTop: '2px', fontWeight: 500 }}>
                                        {item.subline}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--color-secondary)" opacity={0.5} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const YogaView = ({ onBack }) => {
    const { user, patientId } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [yogaData, setYogaData] = useState(null);
    const [error, setError] = useState(null);

    const fetchYogaSession = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchFromWebhook('yoga-sync', {
                method: 'GET',
                identity: { email: user?.email, idToken: user?.idToken }
            });
            setYogaData(data);
        } catch (err) {
            console.error('Yoga fetch failed:', err);
            setError('Unable to load session info. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchYogaSession();
    }, [user?.email, user?.idToken]);

    const colors = {
        g1: '#1B4332',
        g2: '#2D6A4F',
        g3: '#40916C',
        g4: '#52B788',
        g5: '#74C69D',
        g6: '#B7E4C7',
    };

    if (isLoading) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                <HeroBanner title="Yoga Therapy" label="LIVE SESSIONS" onBack={onBack} backText="Back to Protocol" badge="Checking..." />
                <div style={{ padding: '20px' }}>
                    <div style={{ height: '180px', borderRadius: '24px', background: 'var(--glass-bg)', border: 'var(--glass-border)', animation: 'pulse 2s infinite' }} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                <HeroBanner title="Yoga Therapy" label="LIVE SESSIONS" onBack={onBack} backText="Back to Protocol" />
                <div className="animate-slide-up" style={{ padding: '24px', margin: '20px', background: 'var(--glass-bg)', borderRadius: '24px', border: 'var(--glass-border)', textAlign: 'center' }}>
                    <p style={{ color: colors.g1, marginBottom: '16px' }}>{error}</p>
                    <button onClick={fetchYogaSession} className="primary-button" style={{ padding: '12px 24px', borderRadius: '14px', background: colors.g1, color: 'white', border: 'none', fontWeight: 600 }}>Retry</button>
                </div>
            </div>
        );
    }

    // Determine State from the new JSON structure
    const liveSession = yogaData?.liveSession;
    const nextSession = yogaData?.nextSession;
    const ui = yogaData?.ui || {};
    
    // Robust Logic: Even if the backend says "LIVE", check if the session's end time has passed.
    const now = new Date();
    const isLiveNow = ui.isLive === true && 
                      liveSession && 
                      liveSession.status === 'LIVE' && 
                      new Date(liveSession.endISO) > now;

    // Determine which session to show
    // Priority: truly live session > next upcoming session
    const activeSession = isLiveNow ? liveSession : nextSession;
    
    const uiState = isLiveNow ? 'LIVE' : (activeSession ? 'UPCOMING' : 'NO_SESSION');

    const formatSessionTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            return 'Scheduled';
        }
    };

    const renderHero = () => (
        <HeroBanner
            title="Yoga Therapy"
            label="LIVE SESSIONS"
            onBack={onBack}
            backText="Back to Protocol"
            badge={isLiveNow ? 'LIVE NOW' : (activeSession ? 'UPCOMING' : 'CLOSED')}
        />
    );

    // Design 1: No Session Today
    if (uiState === 'NO_SESSION' || !activeSession) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                {renderHero()}
                <div className="animate-slide-up" style={{ padding: '40px 24px', margin: '0 4px', borderRadius: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))', border: 'var(--glass-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(27, 67, 50, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.g2 }}>
                        <Zap size={32} opacity={0.3} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.g1, margin: 0 }}>No sessions today</h2>
                    <p style={{ fontSize: '0.9rem', color: colors.g2, opacity: 0.7, maxWidth: '240px', lineHeight: 1.6, margin: 0 }}>
                        There are no live yoga sessions scheduled for today. Check back tomorrow for the new schedule.
                    </p>
                </div>
            </div>
        );
    }

    // Design 2 & 3: Upcoming and Live
    const isLive = uiState === 'LIVE';
    const startTime = formatSessionTime(activeSession.startISO);

    return (
        <div style={{ paddingBottom: '40px' }}>
            {renderHero()}
            
            <div className="animate-slide-up" style={{ padding: '24px', borderRadius: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))', border: 'var(--glass-border)', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}>
                {/* Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#22c55e' : '#eab308', boxShadow: isLive ? '0 0 12px #22c55e' : 'none' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: isLive ? '#15803d' : '#854d0e', textTransform: 'uppercase' }}>
                        {isLive ? 'Session is Live' : 'Upcoming Session'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: isLive ? 'linear-gradient(135deg, #2D6A4F, #1B4332)' : 'rgba(27, 67, 50, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLive ? 'white' : colors.g1, border: isLive ? 'none' : '1px solid rgba(27, 67, 50, 0.12)' }}>
                        <Zap size={28} fill={isLive ? "white" : "none"} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.g1, textTransform: 'capitalize' }}>{activeSession.sessionName || "Healing Yoga"}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: colors.g2, opacity: 0.8, fontWeight: 500 }}>
                            {activeSession.batch ? `${activeSession.batch} Batch • ` : ''}Daily group session
                        </p>
                    </div>
                </div>

                {/* Info Bar */}
                <div style={{ background: 'rgba(27, 67, 50, 0.04)', borderRadius: '16px', padding: '12px 16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(27, 67, 50, 0.06)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: colors.g2, opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>Start Time</span>
                        <span style={{ fontSize: '0.9rem', color: colors.g1, fontWeight: 700 }}>{startTime || 'Today'}</span>
                    </div>
                    {activeSession.endISO && (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: colors.g2, opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>End Time</span>
                            <span style={{ fontSize: '0.9rem', color: colors.g1, fontWeight: 700 }}>{formatSessionTime(activeSession.endISO)}</span>
                        </div>
                    )}
                </div>
                
                <button
                    onClick={() => isLive && activeSession.joinLink && window.open(activeSession.joinLink, '_blank')}
                    disabled={!isLive}
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '20px',
                        background: isLive ? 'linear-gradient(145deg, #2D6A4F, #1B4332)' : 'rgba(27, 67, 50, 0.08)',
                        color: isLive ? 'white' : 'rgba(27, 67, 50, 0.4)',
                        border: isLive ? 'none' : '1px solid rgba(27, 67, 50, 0.1)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: isLive ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: isLive ? '0 10px 20px rgba(27, 67, 50, 0.2)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    {isLive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />}
                    {isLive ? (ui.buttonText || 'Join Live Session') : `Next Class at ${startTime}`}
                </button>
            </div>
        </div>
    );
};

const Protocol = ({ flags = {} }) => {
    const [view, setView] = useState('grid');

    const renderContent = () => {
        switch (view) {
            case 'meds':
                return <Prescription onBack={() => setView('grid')} />;
            case 'reports':
                return <LabReports onBack={() => setView('grid')} flags={flags} />;
            case 'diet':
                return <DietProtocol onBack={() => setView('grid')} />;
            case 'yoga':
                return <YogaView onBack={() => setView('grid')} />;
            case 'sleep':
                return <RelaxationPlayer onBack={() => setView('grid')} />;
            default:
                return <ProtocolGrid onSelect={setView} flags={flags} />;
        }
    };

    return <div>{renderContent()}</div>;
};

export default Protocol;
