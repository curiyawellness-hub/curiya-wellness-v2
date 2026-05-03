import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Button from '../../ui/Button';
import logoData from '../../../assets/logo_final_png.png';
import bgTexture from '../../../assets/green_wave_bg.jpg';

const introSlides = [
    {
        id: 1,
        quote: "Your personalized wellness journey begins here.",
        sub: "Curiya Wellness",
        bg: "radial-gradient(circle at 80% 20%, rgba(190, 220, 190, 0.4) 0%, transparent 60%)"
    },
];

const IntroScreen = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < introSlides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            background: 'linear-gradient(180deg, #EEF8F1 0%, #E3F2E8 50%, #D6EBDD 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            overflow: 'hidden'
        }}>
            {/* Organic Contour Background Texture */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${bgTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 1,
                zIndex: 0
            }} />

            {/* Animated Background Blob */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: introSlides[currentSlide].bg,
                transition: 'background 1s ease',
                zIndex: 0
            }} />

            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '400px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {/* Floating Glass Card */}
                <div className="glass-card intro-animate" style={{
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: '32px',
                    padding: '32px 24px'
                }}>
                    <div className="intro-content-animate" style={{
                        width: '80px',
                        height: '80px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={logoData}
                            alt="Curiya Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                mixBlendMode: 'multiply',
                                filter: 'drop-shadow(0 4px 12px rgba(45,79,42,0.15))'
                            }}
                        />
                    </div>

                    <h2 className="intro-content-animate" style={{
                        fontSize: '1.8rem',
                        marginBottom: '16px',
                        lineHeight: 1.5,
                        color: 'var(--color-primary-dark)'
                    }}>
                        {introSlides[currentSlide].quote}
                    </h2>

                    <p className="intro-content-animate" style={{
                        fontSize: '1rem',
                        color: 'var(--color-secondary)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        {introSlides[currentSlide].sub}
                    </p>
                </div>

                {/* Dot Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                    {introSlides.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: idx === currentSlide ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: idx === currentSlide ? 'var(--color-primary-dark)' : 'rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                <Button
                    variant="primary"
                    onClick={handleNext}
                    style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '1.1rem'
                    }}
                >
                    {currentSlide === introSlides.length - 1 ? 'Begin My Healing' : 'Continue'}
                    {currentSlide !== introSlides.length - 1 && <ChevronRight size={20} />}
                </Button>
            </div>

            <style>{`
                @keyframes intro-reveal {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px) scale(0.98); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                @keyframes content-fade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes breathe-subtle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }

                .intro-animate {
                    animation: 
                        intro-reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                        breathe-subtle 8s ease-in-out 1.2s infinite;
                }

                .intro-content-animate {
                    opacity: 0;
                    animation: content-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
                }
            `}</style>
        </div>
    );
};

export default IntroScreen;
