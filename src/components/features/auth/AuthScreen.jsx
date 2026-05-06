import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../services/AuthContext';
import logoData from '../../../assets/curiya_logo_new.png';
import bgTexture from '../../../assets/green_wave_bg.jpg';
import Card from '../../ui/Card';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';

const AuthScreen = ({ error: propError }) => {
    const { login, logout } = useAuth();
    const [localError, setLocalError] = useState(null);

    // Combine external context errors and local login errors
    const displayError = localError || propError;

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('✓ Google Sign-In Success');
        setLocalError(null);
        
        try {
            const user = await login(credentialResponse);
            
            // If login succeeds but returns no user, the Worker/Backend denied it
            if (!user) {
                setLocalError("Your consultation is not active. Please contact clinic.");
            }
        } catch (error) {
            console.error('Login failed:', error);
            setLocalError("Unable to sign in. Please try again or contact support.");
        }
    };

    const handleGoogleError = () => {
        setLocalError("Google Sign-In was unsuccessful. Please try again.");
    };

    const handleWhatsAppHelp = () => {
        const text = encodeURIComponent('Hi, I am unable to access my account. My consultation status might be inactive.');
        window.open(`https://wa.me/919632128711?text=${text}`, '_blank');
    };

    const handleSignOut = () => {
        logout();
        setLocalError(null);
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
            {/* Background Texture */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${bgTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
            }} />

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

                {displayError ? (
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
                                    Access Restricted
                                </h3>
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: '0.95rem', 
                                    color: '#B91C1C',
                                    lineHeight: 1.5,
                                    fontWeight: 500
                                }}>
                                    {displayError}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '8px' }}>
                            <button 
                                onClick={handleSignOut}
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
                            >
                                <RefreshCw size={16} /> Sign in with another account
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
                            >
                                <MessageCircle size={16} /> Contact Clinic Support
                            </button>
                        </div>
                    </Card>
                ) : (
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
