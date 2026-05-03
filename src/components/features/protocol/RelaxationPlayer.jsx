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
    <div style={{ paddingTop: '12px' }}>
        <Card className="glass-card" style={{
            textAlign: 'center',
            padding: '48px 24px',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 100%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
            <div style={{ width: '100%', position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(27,67,50,0.08)',
                        border: '1px solid rgba(27,67,50,0.12)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        color: '#1B4332',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                    }}
                >
                    <ChevronLeft size={12} strokeWidth={2.5} />
                    Back to Protocol
                </button>
            </div>
            <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(31, 79, 55, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                color: '#1F4F37'
            }}>
                <Play size={32} opacity={0.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary-dark)', marginBottom: '12px', fontWeight: 600 }}>No audio sessions available</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary-body)', opacity: 0.7, maxWidth: '260px', lineHeight: 1.5, fontSize: '0.95rem' }}>
                We couldn't load any relaxation tracks right now. Please check back later.
            </p>
        </Card>
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
        togglePlay,
        seek,
        stop,
        refreshPlaylist
    } = audioContext;

    const playlist = (audioContext.playlist && audioContext.playlist.length > 0) ? audioContext.playlist : (mockPlaylist || []);

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
        togglePlay(activeTrack);
    };

    const handleNext = () => {
        if (!playlist || playlist.length === 0) return;
        const nextIndex = (localTrackIndex + 1) % playlist.length;
        setLocalTrackIndex(nextIndex);
        if (playlist[nextIndex]) togglePlay(playlist[nextIndex]);
    };

    const handlePrev = () => {
        if (!playlist || playlist.length === 0) return;
        const prevIndex = (localTrackIndex - 1 + playlist.length) % playlist.length;
        setLocalTrackIndex(prevIndex);
        if (playlist[prevIndex]) togglePlay(playlist[prevIndex]);
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
            />

            <Card className="glass-card" style={{
                textAlign: 'center',
                padding: '16px 0',
                minHeight: '620px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)'
            }}>
                {/* Glossy Highlight */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 100%)',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />

                {isActuallyLoading ? (
                    <div style={{ width: '100%', padding: '20px' }}>
                        <GlobalShimmer type="greeting" style={{ height: '220px', borderRadius: '30px', margin: '0 auto 20px' }} />
                        <GlobalShimmer type="row" count={1} style={{ width: '60%', margin: '0 auto 8px' }} />
                        <GlobalShimmer type="row" count={1} style={{ width: '40%', margin: '0 auto 20px' }} />
                        <GlobalShimmer type="card" count={2} />
                    </div>
                ) : (
                    <div className="animate-slide-up" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Wave Visualizer */}
                        <WaveVisualizer isPlaying={isThisTrackPlaying} />

                        {/* Now Playing Info */}
                        <div style={{ textAlign: 'center', padding: '16px 24px 6px', width: '100%' }}>
                            <h2 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '22px',
                                fontWeight: 600,
                                color: '#1b4332',
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
                                fontSize: '10.5px',
                                color: '#1b4332',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                <div style={{ width: '18px', height: '1px', background: '#74c69d', opacity: 0.6 }} />
                                {activeTrack?.subtitle || "Curiya Wellness"}
                                <div style={{ width: '18px', height: '1px', background: '#74c69d', opacity: 0.6 }} />
                            </div>
                        </div>

                        {/* Progress Group */}
                        <div style={{ width: '100%', padding: '14px 26px 6px', opacity: isLoading ? 0.5 : 1 }}>
                            <div style={{ width: '100%', height: '3px', background: 'rgba(64,145,108,0.15)', borderRadius: '3px', position: 'relative', cursor: 'pointer' }}>
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
                                    background: 'linear-gradient(90deg, #40916c, #52b788)',
                                    borderRadius: '3px'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        right: '-5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '11px',
                                        height: '11px',
                                        borderRadius: '50%',
                                        background: '#2d6a4f',
                                        boxShadow: '0 0 0 2.5px rgba(255,255,255,0.9)'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#1b4332', fontWeight: 600, marginTop: '10px' }}>
                                <span>{formatTime(currentTime)}</span>
                                <span>{activeTrack?.duration_label || formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: '14px 24px 10px' }}>
                            <button
                                onClick={handlePrev}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#40916c',
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <SkipBack size={22} />
                            </button>

                            <button
                                onClick={handleTogglePlay}
                                disabled={isLoading || !!error}
                                style={{
                                    width: '62px',
                                    height: '62px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(145deg, #40916c, #1b4332)',
                                    color: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(27,67,50,0.35)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {isLoading ? (
                                    <Loader size={24} className="animate-spin" />
                                ) : (
                                    isThisTrackPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: '4px' }} />
                                )}
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#40916c',
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <SkipForward size={22} />
                            </button>
                        </div>

                        <div style={{ margin: '4px 22px 0', height: '1px', width: 'calc(100% - 44px)', background: 'linear-gradient(90deg, transparent, rgba(82,183,136,0.2), transparent)' }} />

                        {/* Tracks Carousel */}
                        <div style={{ width: '100%', marginTop: 'auto', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px 8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1F4F37', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Up Next</span>
                                <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(82, 183, 136, 0.15)', borderRadius: '10px', color: '#40916c', fontWeight: 600 }}>
                                    {playlist.length} tracks
                                </span>
                            </div>

                            <div
                                ref={carouselRef}
                                style={{
                                    display: 'flex',
                                    gap: '18px',
                                    overflowX: 'auto',
                                    padding: '34px 24px 20px',
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

            <style>{`
                @keyframes bm { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,30px) scale(1.1)} }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div >
    );
};

export default RelaxationPlayer;
