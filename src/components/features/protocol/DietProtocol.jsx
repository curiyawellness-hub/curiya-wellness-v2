import React, { useEffect, useState, useRef } from 'react';
import {
    ChevronLeft,
    Calendar,
    Eye,
    Download,
    Check,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import ContactModal from '../home/ContactModal';
import QueryBanner from '../../ui/QueryBanner';
import GlobalShimmer from '../../ui/GlobalShimmer';
import HeroBanner from '../../ui/HeroBanner';

const ShimmerLoader = () => (
    <div style={{ padding: '20px 0' }}>
        <GlobalShimmer type="greeting" style={{ height: '165px', borderRadius: '24px' }} />
        <GlobalShimmer type="card" count={1} />
        <div style={{ marginTop: '24px' }}>
            <GlobalShimmer type="row" count={1} style={{ width: '40%', marginBottom: '12px' }} />
            <GlobalShimmer type="card" count={2} />
        </div>
    </div>
);

const DietProtocol = ({ onBack }) => {
    const { patientId } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    
    // Live Data States
    const [dietData, setDietData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('--:--');
    const isFetching = useRef(false);

    const fetchDietData = async (isSilent = false) => {
        if (!patientId || isFetching.current) return;
        
        if (!isSilent) setLoading(true);
        isFetching.current = true;
        
        try {
            const url = `https://n8n.curiyawellness.com/webhook/patient-diet?patient_id=${encodeURIComponent(patientId)}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Diet Data Fetched:', data); // Added log per requirements
                setDietData(data);
                setError(false);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } else {
                if (!isSilent) setError(true);
            }
        } catch (err) {
            console.error('Failed to fetch diet data:', err);
            if (!isSilent) setError(true);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    };

    useEffect(() => {
        setIsVisible(true);
        fetchDietData();

        // 60s visibility-aware polling
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchDietData(true);
            }
        }, 60000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchDietData(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [patientId]);

    const viewUrl = `https://n8n.curiyawellness.com/webhook/diet?patient_id=${encodeURIComponent(patientId || '')}&type=view`;
    const downloadUrl = `https://n8n.curiyawellness.com/webhook/diet?patient_id=${encodeURIComponent(patientId || '')}&type=download`;

    const colors = {
        g1: '#1B4332', // Deep forest for text
        g2: '#2D6A4F', // Core branding green
        g3: '#40916C', // Medium green
        g4: '#52B788', // Light green
        g5: '#74C69D', // Mint green
        g6: '#B7E4C7', // Very light mint
        lightBg: '#D8F3DC',
        freshGreen: '#4ade80'
    };

    const heroCardBaseStyle = {
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)'
    };

    const renderHeroBanner = () => (
        <HeroBanner
            title="Diet Protocol"
            label="NUTRITION PLAN"
            onBack={onBack}
            backText="Back to Protocol"
            badge={
                (dietData?.status === 'Approved' || dietData?.approved) && !loading
                    ? 'Doctor Approved'
                    : null
            }
            badgeIcon={
                (dietData?.status === 'Approved' || dietData?.approved) && !loading
                    ? <Check size={12} strokeWidth={2.5} />
                    : null
            }
        />
    );

    return (
        <div style={{ paddingBottom: '40px' }}>
            {renderHeroBanner()}

            {loading && !dietData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <GlobalShimmer type="card" count={1} />
                    <div style={{ marginTop: '8px' }}>
                        <GlobalShimmer type="row" count={1} style={{ width: '40%', marginBottom: '12px' }} />
                        <GlobalShimmer type="card" count={2} />
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 1 }}>
                    {/* Follow Duration Card */}
                    <div className="hero-card" style={{
                        ...heroCardBaseStyle,
                        padding: '20px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '13px', background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: colors.g1 }}>
                                    {dietData?.diet_ready && dietData?.status === 'ready' ? `Follow for ${dietData?.duration || '2 Weeks'}` : 'Preparing Your Plan'}
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>
                                    {dietData?.diet_ready && dietData?.status === 'ready' ? 'Your personalised recommendations' : 'Checking latest updates from Notion'}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12.5px', color: colors.g2, lineHeight: 1.65 }}>
                            {dietData?.diet_ready && dietData?.status === 'ready' 
                                ? (dietData?.instruction || `Stick to these food recommendations consistently for ${dietData?.duration || '2 weeks'}.`)
                                : "We couldn't find an active diet plan for this period. If you recently consulted, your plan might be processing."
                            }
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', padding: '0 4px' }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4 }}>
                            YOUR DIET PLAN
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 600, color: colors.g4, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                            <RefreshCw size={10} className={isFetching.current ? 'animate-spin' : ''} />
                            Last Synced: {lastUpdated}
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {dietData?.diet_ready && dietData?.status === 'ready' ? (
                            <>
                                <div
                                    onClick={() => window.open(viewUrl, '_blank')}
                                    className="hero-card action-card"
                                    style={{
                                        ...heroCardBaseStyle,
                                        padding: '16px 18px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px'
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(64,145,108,0.15), rgba(116,198,157,0.08))', border: '1px solid rgba(82,183,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Eye size={22} color={colors.g3} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1 }}>View Diet</div>
                                        <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Open and read your full diet plan</div>
                                    </div>
                                    <button style={{ height: '34px', borderRadius: '11px', background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`, color: 'white', border: 'none', padding: '0 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,106,79,0.2)' }}>
                                        Open <ArrowRight size={12} strokeWidth={2.5} />
                                    </button>
                                </div>

                                <div
                                    onClick={() => window.open(downloadUrl, '_blank')}
                                    className="hero-card action-card"
                                    style={{
                                        ...heroCardBaseStyle,
                                        padding: '16px 18px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px'
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(27,67,50,0.1), rgba(45,106,79,0.06))', border: '1px solid rgba(45,106,79,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Download size={22} color={colors.g2} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1 }}>Download Diet</div>
                                        <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Save as PDF to your device</div>
                                    </div>
                                    <button style={{ height: '34px', borderRadius: '11px', background: 'rgba(64,145,108,0.08)', border: '1px solid rgba(64,145,108,0.15)', color: colors.g2, padding: '0 12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                        Save <ArrowRight size={12} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="hero-card" style={{
                                ...heroCardBaseStyle,
                                padding: '30px 20px',
                                textAlign: 'center',
                                border: '1px dashed rgba(27, 67, 50, 0.2)',
                                color: colors.g2
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Plan not yet available</div>
                                <div style={{ fontSize: '11px', opacity: 0.7 }}>New plans usually appear within 24 hours of consultation.</div>
                            </div>
                        )}
                    </div>

                    {/* Need Help Card */}
                    <div style={{ marginTop: '12px' }}>
                        <QueryBanner 
                            type="amber"
                            title="Need Help?"
                            buttonText="Ask Now"
                            onClick={() => setIsContactOpen(true)}
                            whatsappMessage={`Hi, I have a query regarding my diet plan. Patient ID: ${patientId}`}
                            className="hero-card"
                        />
                    </div>
                </div>
            )}

            <ContactModal 
                isOpen={isContactOpen} 
                onClose={() => setIsContactOpen(false)} 
                patientId={patientId}
                initialCategory="diet"
            />

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};


export default DietProtocol;
