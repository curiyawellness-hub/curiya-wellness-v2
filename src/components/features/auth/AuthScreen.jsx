import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../services/AuthContext';
import logoData from '../../../assets/curiya_logo_new.png';
import bgTexture from '../../../assets/green_wave_bg.jpg';
import Card from '../../ui/Card';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';

const AuthScreen = ({ error }) => {
    const { login, logout } = useAuth();

    const handleGoogleSuccess = (credentialResponse) => {
        console.log('✓ Google Sign-In Success');
        console.log('Calling login function...');
        try {
            login(credentialResponse);
        } catch (error) {
            console.error('Error in handleGoogleSuccess:', error);
        }
    };

    const handleGoogleError = () => {
        console.error('✗ Google Sign-In Failed');
        console.error('User cancelled or Google OAuth error occurred');
    };

    const handleWhatsAppHelp = () => {
        const text = encodeURIComponent('Hi, I am unable to access my account. Please help me.');
        window.open(`https://wa.me/919632128711?text=${text}`, '_blank');
    };

    const handleRetry = () => {
        logout();
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Usual Background Texture */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${bgTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
            }} />

            {/* Content Overlay */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '180px',
                    height: 'auto',
                    marginTop: '110px',
                    marginBottom: '10px',
                    filter: 'drop-shadow(0 8px 16px rgba(45,79,42,0.15))'
                }}>
                    <img
                        src={logoData}
                        alt="Curiya Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                    />
                </div>

                {error ? (
                    // Error State
                    <Card className="glass-card" style={{ maxWidth: '380px', padding: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ 
                                width: '44px', 
                                height: '44px', 
                                background: 'rgba(220, 50, 50, 0.1)', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <AlertCircle size={24} color="#dc2626" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '1.1rem', 
                                    color: '#991B1B', 
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-heading)'
                                }}>
                                    Access Denied
                                </h3>
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: '0.9rem', 
                                    color: '#B91C1C',
                                    lineHeight: 1.5,
                                    fontWeight: 500
                                }}>
                                    {error}
                                </p>
                            </div>
                        </div>

                        <div style={{ 
                            marginBottom: '16px',
                            padding: '12px',
                            background: 'rgba(255, 243, 220, 0.45)',
                            border: '1px solid rgba(217, 119, 6, 0.15)',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            color: '#92400e',
                            lineHeight: 1.5
                        }}>
                            This email is not registered for access. Please contact support or try with a different email.
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button 
                                onClick={handleRetry}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #2D6A4F, #1B4332)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <RefreshCw size={16} /> Try Again with Different Email
                            </button>
                            <button 
                                onClick={handleWhatsAppHelp}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255, 243, 220, 0.45)',
                                    color: '#d97706',
                                    border: '1.5px solid rgba(217, 119, 6, 0.2)',
                                    borderRadius: '14px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 243, 220, 0.6)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 243, 220, 0.45)'}
                            >
                                <MessageCircle size={16} /> Contact Support
                            </button>
                        </div>
                    </Card>
                ) : (
                    // Normal Login State
                    <>
                        <Card className="glass-card" style={{ maxWidth: '340px', padding: '32px 24px' }}>
                            <p style={{
                                fontSize: '1.4rem',
                                lineHeight: 1.4,
                                color: 'var(--color-primary-dark)',
                                fontWeight: 600,
                                marginBottom: '8px'
                            }}>
                                "Your personalized wellness journey begins here."
                            </p>
                            <p style={{
                                fontSize: '0.9rem',
                                color: 'var(--color-secondary)',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Curiya Wellness
                            </p>
                        </Card>

                        <div style={{
                            marginTop: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            width: '100%',
                            minHeight: '44px'
                        }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="250"
                            />

                            <p style={{
                                fontSize: '0.85rem',
                                color: '#FFFFFF',
                                maxWidth: '280px',
                                lineHeight: 1.6,
                                opacity: 0.9
                            }}>
                                By continuing, you agree to our terms of service and privacy policy.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;
