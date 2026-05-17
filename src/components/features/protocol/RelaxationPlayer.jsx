import React, { useState, useEffect, useRef } from 'react';
import Card from '../../ui/Card';
import HeroBanner from '../../ui/HeroBanner';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, Loader } from 'lucide-react';
import { useAudio } from '../../../services/GlobalAudioContext';
import WaveVisualizer from './WaveVisualizer';
import TrackCard from './TrackCard';
import GlobalShimmer from '../../ui/GlobalShimmer';
import '../../ui/shimmer.css';

const EmptyState = ({ onBack }) => (
    <div style={{ paddingBottom: '40px' }}>
        <HeroBanner
            title="Relaxation & Sleep"
            label="AUDIO SESSIONS"
            onBack={onBack}
            backText="Back to Protocol"
            badge="0 Tracks"
        />
        
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Card className="hero-card" style={{
                textAlign: 'center',
                padding: '60px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Hero-style inner top highlight */}
                <div style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '40%',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0.0) 100%)',
                    borderRadius: '24px 24px 0 0',
                    zIndex: 1
                }} />

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(27, 67, 50, 0.08)',
                        border: '1px solid rgba(27, 67, 50, 0.12)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#1B4332'
                    }}>
                        <Play size={32} style={{ marginLeft: '4px', opacity: 0.6 }} />
                    </div>
                    <h2 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        color: '#1B4332', 
                        marginBottom: '12px', 
                        fontWeight: 600,
                        fontSize: '1.25rem' 
                    }}>No audio sessions available</h2>
                    <p style={{ 
                        fontFamily: 'var(--font-body)', 
                        color: '#2D5E44', 
                        opacity: 0.7, 
                        maxWidth: '260px', 
                        lineHeight: 1.6, 
                        fontSize: '0.95rem',
                        fontWeight: 400
                    }}>
                        We couldn't load any relaxation tracks right now. Please check back later.
                    </p>
                </div>
            </Card>
        </div>
    </div>
);

const RelaxationPlayer = ({ onBack, mockPlaylist = null }) => {
    const audioContext = useAudio();
    const {
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        isLoading,
        error,
        playTrack,
        togglePlay,
        stop,
        seek,
        refreshPlaylist,
        playlist: contextPlaylist
    } = audioContext;

    const playlist = (contextPlaylist && contextPlaylist.length > 0) ? contextPlaylist : (mockPlaylist || []);

    const [localTrackIndex, setLocalTrackIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        refreshPlaylist();
    }, []);

    // Sync localTrackIndex with currentTrack from context
    useEffect(() => {
        if (currentTrack && playlist) {
            const idx = playlist.findIndex(t => t.src === currentTrack.src);
            if (idx !== -1 && idx !== localTrackIndex) {
                setLocalTrackIndex(idx);
            }
        }
    }, [currentTrack, playlist]);

    // Scroll active card into view
    useEffect(() => {
        if (carouselRef.current) {
            const activeCard = carouselRef.current.children[localTrackIndex];
            if (activeCard) {
                const timeoutId = setTimeout(() => {
                    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }, 100);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [localTrackIndex]);

    const activeTrack = (playlist && playlist.length > 0) ? playlist[localTrackIndex] : null;

    const handleTogglePlay = () => {
        if (!activeTrack) return;
        playTrack(activeTrack);
    };

    const handleNext = () => {
        if (!playlist || playlist.length === 0) return;
        const nextIndex = (localTrackIndex + 1) % playlist.length;
        setLocalTrackIndex(nextIndex);
        if (playlist[nextIndex]) playTrack(playlist[nextIndex]);
    };

    const handlePrev = () => {
        if (!playlist || playlist.length === 0) return;
        const prevIndex = (localTrackIndex - 1 + playlist.length) % playlist.length;
        setLocalTrackIndex(prevIndex);
        if (playlist[prevIndex]) playTrack(playlist[prevIndex]);
    };

    const handleSelectTrack = (idx) => {
        setLocalTrackIndex(idx);
        if (playlist[idx]) togglePlay(playlist[idx]);
    };

    const formatTime = (time) => {
        const t = parseFloat(time);
        if (isNaN(t) || t === Infinity) return "0:00";
        const minutes = Math.floor(t / 60);
        const seconds = Math.floor(t % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e) => {
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        seek(newTime);
    };

    const handleBack = () => {
        stop();
        onBack();
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    const isThisTrackPlaying = isPlaying &&
        (currentTrack?.src === activeTrack?.src || currentTrack?.id === activeTrack?.id || currentTrack?.title === activeTrack?.title);

    // If loading AND no playlist, we still want to show the frame + hero top bar
    const isActuallyLoading = isLoading && (!playlist || playlist.length === 0);

    if (!isLoading && (!playlist || !Array.isArray(playlist) || playlist.length === 0)) {
        return <EmptyState onBack={onBack} />;
    }

    return (
        <div style={{ paddingBottom: '40px' }}>
            <HeroBanner
                title="Relaxation & Sleep"
                label="AUDIO SESSIONS"
                onBack={handleBack}
                backText="Back to Protocol"
                badge={isActuallyLoading ? "– –" : `${playlist.length} Tracks`}
            />

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Card className="hero-card" style={{
                    textAlign: 'center',
                    padding: '16px 0',
                    minHeight: '580px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: '24px'
                }}>
                    {/* Hero-style inner top highlight */}
                    <div style={{
                        pointerEvents: 'none',
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '40%',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0.0) 100%)',
                        borderRadius: '24px 24px 0 0',
                        zIndex: 1
                    }} />

                    {isActuallyLoading ? (
                        <div style={{ width: '100%', padding: '20px', position: 'relative', zIndex: 2 }}>
                            <GlobalShimmer type="greeting" style={{ height: '220px', borderRadius: '30px', margin: '0 auto 20px' }} />
                            <GlobalShimmer type="row" count={1} style={{ width: '60%', margin: '0 auto 8px' }} />
                            <GlobalShimmer type="row" count={1} style={{ width: '40%', margin: '0 auto 20px' }} />
                            <GlobalShimmer type="card" count={2} />
                        </div>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                            {/* Wave Visualizer */}
                            <WaveVisualizer isPlaying={isThisTrackPlaying} />

                            {/* Now Playing Info */}
                            <div style={{ textAlign: 'center', padding: '16px 24px 6px', width: '100%' }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '1.4rem',
                                    fontWeight: 600,
                                    color: '#1B4332',
                                    lineHeight: 1.25,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '4px'
                                }}>
                                    {activeTrack?.title || "No Title"}
                                </h2>
                                <div style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '11px',
                                    color: '#2D5E44',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: 0.7
                                }}>
                                    <div style={{ width: '20px', height: '1px', background: 'rgba(27, 67, 50, 0.15)' }} />
                                    {activeTrack?.subtitle || "Curiya Wellness"}
                                    <div style={{ width: '20px', height: '1px', background: 'rgba(27, 67, 50, 0.15)' }} />
                                </div>
                            </div>

                            {/* Progress Group */}
                            <div style={{ width: '100%', padding: '20px 26px 8px', opacity: isLoading ? 0.5 : 1 }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: '4px', 
                                    background: 'rgba(27, 67, 50, 0.08)', 
                                    borderRadius: '4px', 
                                    position: 'relative', 
                                    cursor: 'pointer' 
                                }}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progressPercent}
                                        onChange={handleProgressChange}
                                        disabled={isLoading || !!error}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: 5
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        width: `${progressPercent}%`,
                                        background: '#1B4332',
                                        borderRadius: '4px'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            right: '-6px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            border: '3px solid #1B4332',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#2D5E44', fontWeight: 600, marginTop: '12px', opacity: 0.8 }}>
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{activeTrack?.duration_label || formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '16px 24px 20px' }}>
                                <button
                                    onClick={handlePrev}
                                    disabled={isLoading}
                                    style={{
                                        background: 'rgba(27, 67, 50, 0.05)',
                                        border: '1px solid rgba(27, 67, 50, 0.08)',
                                        color: '#1B4332',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <SkipBack size={20} fill="#1B4332" />
                                </button>

                                <button
                                    onClick={handleTogglePlay}
                                    disabled={isLoading || !!error}
                                    style={{
                                        width: '68px',
                                        height: '68px',
                                        borderRadius: '50%',
                                        background: '#1B4332',
                                        color: '#fff',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.25)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader size={26} className="animate-spin" />
                                    ) : (
                                        isThisTrackPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" style={{ marginLeft: '4px' }} />
                                    )}
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    style={{
                                        background: 'rgba(27, 67, 50, 0.05)',
                                        border: '1px solid rgba(27, 67, 50, 0.08)',
                                        color: '#1B4332',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <SkipForward size={20} fill="#1B4332" />
                                </button>
                            </div>

                            <div style={{ margin: '8px 22px 0', height: '1px', width: 'calc(100% - 44px)', background: 'linear-gradient(90deg, transparent, rgba(27, 67, 50, 0.1), transparent)' }} />

                            {/* Tracks Carousel */}
                            <div style={{ width: '100%', marginTop: 'auto', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px 8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1B4332', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Up Next</span>
                                    <span style={{ 
                                        fontSize: '10px', 
                                        padding: '4px 10px', 
                                        background: 'rgba(27, 67, 50, 0.06)', 
                                        border: '1px solid rgba(27, 67, 50, 0.1)',
                                        borderRadius: '12px', 
                                        color: '#1B4332', 
                                        fontWeight: 600 
                                    }}>
                                        {playlist.length} sessions
                                    </span>
                                </div>

                                <div
                                    ref={carouselRef}
                                    style={{
                                        display: 'flex',
                                        gap: '18px',
                                        overflowX: 'auto',
                                        padding: '24px 24px 20px',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        scrollSnapType: 'x mandatory'
                                    }}
                                >
                                    {playlist.map((track, idx) => (
                                        <div key={idx} style={{ scrollSnapAlign: 'center' }}>
                                            <TrackCard
                                                track={track}
                                                index={idx}
                                                isActive={localTrackIndex === idx}
                                                isPlaying={isPlaying && currentTrack?.src === track.src}
                                                onClick={() => handleSelectTrack(idx)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card >
            </div>

            <style>{`
                @keyframes bm { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,30px) scale(1.1)} }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default RelaxationPlayer;
