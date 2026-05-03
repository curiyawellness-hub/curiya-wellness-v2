import React, { useEffect, useRef } from 'react';

const WAVE_DEFS = [
    { amp: 26, freq: 0.018, speed: 0.018, phase: 0, alpha: 0.18, color: '#1b4332', yOff: 0.45 },
    { amp: 20, freq: 0.022, speed: 0.022, phase: 1.2, alpha: 0.25, color: '#2d6a4f', yOff: 0.50 },
    { amp: 16, freq: 0.028, speed: 0.028, phase: 2.4, alpha: 0.30, color: '#40916c', yOff: 0.55 },
    { amp: 12, freq: 0.034, speed: 0.034, phase: 0.8, alpha: 0.38, color: '#52b788', yOff: 0.58 },
    { amp: 8, freq: 0.042, speed: 0.038, phase: 1.8, alpha: 0.45, color: '#74c69d', yOff: 0.61 },
    { amp: 6, freq: 0.055, speed: 0.045, phase: 3.0, alpha: 0.55, color: '#95d5b2', yOff: 0.63 },
];

const WaveVisualizer = ({ isPlaying }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const tRef = useRef(0);
    const ampRef = useRef(0.0);
    const isPlayingRef = useRef(isPlaying);

    // Sync isPlaying with ref to avoid re-creating animation loop
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        const animate = () => {
            if (!canvas) return;

            ctx.clearRect(0, 0, width, height);

            // Smoothly animate amplitude toward target
            const targetAmp = isPlayingRef.current ? 1.0 : 0.0;
            ampRef.current += (targetAmp - ampRef.current) * 0.04;

            WAVE_DEFS.forEach((wave) => {
                const a = wave.amp * ampRef.current;

                // Draw Fill
                ctx.beginPath();
                ctx.moveTo(0, height);
                for (let x = 0; x <= width; x += 4) { // Step 4 for performance
                    const y = wave.yOff * height +
                        Math.sin(x * wave.freq + tRef.current * wave.speed * 60 + wave.phase) * a +
                        Math.sin(x * wave.freq * 1.7 + tRef.current * wave.speed * 40 + wave.phase + 1) * (a * 0.4);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(width, height);
                ctx.closePath();

                const g = ctx.createLinearGradient(0, wave.yOff * height - a, 0, height);
                const alphaHex = Math.round(wave.alpha * 255).toString(16).padStart(2, '0');
                g.addColorStop(0, wave.color + alphaHex);
                g.addColorStop(1, wave.color + '06');
                ctx.fillStyle = g;
                ctx.fill();

                // Draw Stroke
                ctx.beginPath();
                for (let x = 0; x <= width; x += 4) {
                    const y = wave.yOff * height +
                        Math.sin(x * wave.freq + tRef.current * wave.speed * 60 + wave.phase) * a +
                        Math.sin(x * wave.freq * 1.7 + tRef.current * wave.speed * 40 + wave.phase + 1) * (a * 0.4);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                const strokeAlphaHex = Math.round((wave.alpha + 0.2) * 255).toString(16).padStart(2, '0');
                ctx.strokeStyle = wave.color + strokeAlphaHex;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            if (isPlayingRef.current || ampRef.current > 0.01) {
                tRef.current += 0.016;
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener('resize', resize);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
        };
    }, []); // Only run once on mount

    return (
        <div style={{ width: '100%', height: '130px', position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default WaveVisualizer;
