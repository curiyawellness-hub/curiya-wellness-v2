import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import HeroBanner from '../../ui/HeroBanner';
import { Download, ExternalLink, Apple, ChevronLeft, Sprout, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import GlobalShimmer from '../../ui/GlobalShimmer';
import '../../ui/shimmer.css';
import {
    fetchFromPatientWebhook
} from '../../../services/patientApi';

const DietProtocol = ({ onBack }) => {
    const auth = useAuth();
    const { user, patientData, patientId } = auth;
    const [dietData, setDietData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDietData = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setError(null);

        try {
            const data = await fetchFromPatientWebhook('patient-diet', auth);
            
            // Handle different payload formats from n8n
            let diet = null;
            if (data?.status === 'ready' || data?.diet_ready) {
                const pid = data.patient_id || patientId;
                // Override URLs with the new /diet webhook path provided by the user
                diet = {
                    ...data,
                    pdf_url: `https://n8n.curiyawellness.com/webhook/diet?patient_id=${pid}&type=view`,
                    download_url: `https://n8n.curiyawellness.com/webhook/diet?patient_id=${pid}&type=download`
                };
            } else if (data?.success && data.diet) {
                diet = data.diet;
            } else if (data?.success && data.data) {
                diet = data.data;
            } else if (data && typeof data === 'object' && !data.success && data.diet) {
                diet = data.diet;
            }

            setDietData(diet);
        } catch (err) {
            console.error('Failed to fetch diet plan:', err);
            if (!isSilent) {
                setError('Unable to load diet plan. Please try again later.');
            }
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDietData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchDietData(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [patientData, patientId, user?.idToken]);

    const handleViewPDF = () => {
        if (dietData?.pdf_url) {
            window.open(dietData.pdf_url, '_blank');
        }
    };

    const handleDownload = () => {
        const url = dietData?.download_url || dietData?.pdf_url;
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `Diet_Plan_${patientId || 'Patient'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderHeroBanner = (isLoadingCount = false) => (
        <HeroBanner
            title="Diet Protocol"
            label="NUTRITION PLAN"
            onBack={onBack}
            backText="Back to Protocol"
            badge={isLoadingCount ? "– –" : (dietData ? "Plan Ready" : "No Plan")}
        />
    );

    if (isLoading && !dietData) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                {renderHeroBanner(true)}
                <div style={{ padding: '20px' }}>
                    <GlobalShimmer type="card" count={2} />
                    <GlobalShimmer type="row" count={1} style={{ width: '80%' }} />
                </div>
            </div>
        );
    }

    if (!dietData) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                {renderHeroBanner()}
                <div style={{
                    padding: '40px 24px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }} />
                    <Sprout size={40} strokeWidth={1.5} style={{ color: '#2D5E44', opacity: 0.75 }} />
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#1B4332',
                        margin: 0,
                    }}>
                        Personalising your diet plan
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem',
                        color: 'var(--color-secondary)',
                        lineHeight: 1.6,
                        maxWidth: '260px',
                        margin: 0,
                        opacity: 0.85,
                    }}>
                        Your nutritionist is crafting a unique dietary protocol tailored specifically to your needs. Check back shortly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            {renderHeroBanner()}

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Card className="hero-card" style={{
                    padding: '24px',
                    borderRadius: '24px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(27, 67, 50, 0.08)',
                            border: '1px solid rgba(27, 67, 50, 0.12)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1B4332'
                        }}>
                            <Apple size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1B4332' }}>Follow for 2 Weeks</h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#2D5E44', fontWeight: 500 }}>Your personalised recommendations</p>
                        </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1B4332', opacity: 0.8, lineHeight: 1.5, fontWeight: 400 }}>
                        Stick to these food recommendations consistently for 2 weeks to see the best results for your recovery.
                    </p>
                </Card>
            </div>

            <div className="animate-slide-up" style={{ 
                animationDelay: '0.2s', 
                marginBottom: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0 4px'
            }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#2D5E44', opacity: 0.8 }}>YOUR DIET PLAN</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2D5E44', opacity: 0.5 }}>
                    <RefreshCw size={10} />
                    <span style={{ fontSize: '0.7rem' }}>Last Synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.3s', display: 'grid', gap: '12px' }}>
                {/* View Row */}
                <div 
                    onClick={handleViewPDF}
                    className="hero-card"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                >
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'rgba(27, 67, 50, 0.06)',
                        border: '1px solid rgba(27, 67, 50, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1B4332'
                    }}>
                        <ExternalLink size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1B4332' }}>View Diet</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#2D5E44', opacity: 0.7, fontWeight: 400 }}>Open and read your full diet plan</p>
                    </div>
                    <div style={{
                        background: '#1B4332',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        Open <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </div>
                </div>

                {/* Download Row */}
                <div 
                    onClick={handleDownload}
                    className="hero-card"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                >
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'rgba(27, 67, 50, 0.06)',
                        border: '1px solid rgba(27, 67, 50, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1B4332'
                    }}>
                        <Download size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1B4332' }}>Download Diet</h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#2D5E44', opacity: 0.7, fontWeight: 400 }}>Save as PDF to your device</p>
                    </div>
                    <div style={{
                        background: 'rgba(27, 67, 50, 0.08)',
                        color: '#1B4332',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(27, 67, 50, 0.15)'
                    }}>
                        Save <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </div>
                </div>
            </div>

            {/* Help Banner */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s', marginTop: '40px' }}>
                <div className="hero-card" style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    borderRadius: '24px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1.5px solid #E67700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#E67700',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}>?</div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1B4332' }}>Need Help?</span>
                    </div>

                    <button 
                        onClick={() => window.open('https://wa.me/919894275855', '_blank')}
                        style={{
                            background: 'rgba(230, 119, 0, 0.05)',
                            border: '1.2px solid rgba(230, 119, 0, 0.4)',
                            color: '#E67700',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <MessageCircle size={16} />
                        Ask Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DietProtocol;
