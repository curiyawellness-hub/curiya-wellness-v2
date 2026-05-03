import React, { useEffect, useRef } from 'react';

const PALETTES = [
    ['#1b4332', '#2d6a4f', '#40916c', '#74c69d'],
    ['#0a3d62', '#1a6fa8', '#38ada9', '#78e08f'],
    ['#1e3a5f', '#2c698d', '#72b4b4', '#a8d8a8'],
    ['#2c2f70', '#3b4fa8', '#7090d8', '#95d5b2'],
    ['#1b4332', '#52b788', '#b7e4c7', '#d8f3dc'],
    ['#0d3349', '#1a5276', '#2e86c1', '#74c69d'],
    ['#1a3a1a', '#2d5a27', '#52b788', '#95d5b2'],
    ['#2d2520', '#6b4226', '#c97c3a', '#74c69d'],
    ['#1b3a4b', '#2196a8', '#52b788', '#d8f3dc'],
    ['#0e2738', '#1b6b8a', '#52b788', '#b7e4c7'],
];

const drawCardArt = (canvas, palette, seed) => {
    const dpr = window.devicePixelRatio || 1;
    const W = 88;
    const H = 88;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // bg gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, palette[0]);
    bg.addColorStop(0.5, palette[1]);
    bg.addColorStop(1, palette[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // seeded pseudo-random
    let s = seed * 9301 + 49297;
    const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };

    // Draw flowing wave lines
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 8; i++) {
        const yBase = rand() * H;
        const amp = 10 + rand() * 20;
        const freq = 0.02 + rand() * 0.04;
        const phase = rand() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 2) {
            const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase + 1) * (amp * 0.4);
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = palette[3];
        ctx.lineWidth = 0.8 + rand() * 1.2;
        ctx.stroke();
    }

    // Soft circles
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 5; i++) {
        const x = rand() * W;
        const y = rand() * H;
        const r = 15 + rand() * 40;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, palette[3]);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fine dot grid
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = palette[3];
    for (let x = 8; x < W; x += 12) {
        for (let y = 8; y < H; y += 12) {
            ctx.beginPath();
            ctx.arc(x + rand() * 3 - 1.5, y + rand() * 3 - 1.5, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1;
};

const TrackCard = ({ track, index, isActive, isPlaying, onClick }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const palette = PALETTES[index % PALETTES.length];
            drawCardArt(canvasRef.current, palette, index + 1);
        }
    }, [index]);

    return (
        <div
            onClick={onClick}
            style={{
                flexShrink: 0,
                width: '88px',
                height: '88px',
                borderRadius: '16px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                backgroundColor: PALETTES[index % PALETTES.length][0],
                boxShadow: isActive
                    ? `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 15px ${PALETTES[index % PALETTES.length][1]}55`
                    : '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: isActive
                    ? '1.5px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                transform: isActive ? 'scale(1.08) translateY(-8px)' : 'scale(1)',
                zIndex: isActive ? 10 : 1,
                isolation: 'isolate',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
            }}
        >
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 'inherit' }} />

            <div style={{
                position: 'absolute',
                top: '6px',
                right: '7px',
                fontSize: '9px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.55)',
                letterSpacing: '0.05em'
            }}>
                {String(index + 1).padStart(2, '0')}
            </div>

            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 0
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '5px 7px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderBottomLeftRadius: 'inherit',
                    borderBottomRightRadius: 'inherit'
                }}>
                    {isActive && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '1.5px',
                            height: '8px',
                            marginBottom: '2px'
                        }}>
                            {[1, 2, 3, 4].map((bar) => (
                                <div
                                    key={bar}
                                    className="card-eq-bar"
                                    style={{
                                        width: '2px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '1px',
                                        height: '100%',
                                        transformOrigin: 'bottom',
                                        animation: isPlaying
                                            ? `eqb 0.6s ease-in-out infinite alternate`
                                            : `eq-breath 3s ease-in-out infinite alternate`,
                                        animationDelay: `${bar * 0.15}s`,
                                        opacity: isPlaying ? 1 : 0.4
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    <div style={{
                        fontSize: '9.5px',
                        fontWeight: '600',
                        color: 'white',
                        lineHeight: '1.2',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {track.title}
                    </div>
                    <div style={{
                        fontSize: '8px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        marginTop: '1px',
                        fontWeight: '500'
                    }}>
                        {track.duration_label || '0:00'}
                    </div>
                </div>
            </div>
            <style>{`
          @keyframes eqb {
            from { transform: scaleY(0.2); }
            to { transform: scaleY(1); }
          }
          @keyframes eq-breath {
            from { transform: scaleY(0.15); }
            to { transform: scaleY(0.35); }
          }
        `}</style>
        </div>
    );
};

export default TrackCard;
