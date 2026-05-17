import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { fetchFromWebhook } from './patientApi';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const { user, patientData } = useAuth();
    const [playlist, setPlaylist] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(new Audio());

    const fetchPlaylist = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            console.log('Fetching audio playlist with idToken:', user?.idToken ? 'Present' : 'Missing');
            const data = await fetchFromWebhook('audio/sessions', {
                method: 'GET',
                identity: { email: user?.email, idToken: user?.idToken },
                headers: {
                    'Authorization': `Bearer ${user?.idToken}`
                }
            });

            console.log('Audio playlist response:', data);

            if (data?.success && Array.isArray(data.sessions)) {
                // Flatten all tracks from all sessions
                const allTracks = data.sessions.reduce((acc, session) => {
                    const sessionTracks = (session.tracks || []).map(t => ({
                        ...t,
                        src: t.src || t.url, // Ensure src is available for comparison
                        subtitle: t.subtitle || session.label || 'Relaxation'
                    }));
                    return [...acc, ...sessionTracks];
                }, []);
                console.log('Processed tracks:', allTracks.length);
                setPlaylist(allTracks);
            } else if (data?.success && Array.isArray(data.playlist)) {
                setPlaylist(data.playlist.map(t => ({ ...t, src: t.src || t.url })));
            } else if (Array.isArray(data)) {
                setPlaylist(data.map(t => ({ ...t, src: t.src || t.url })));
            }
        } catch (err) {
            console.error('Playlist fetch failed:', err);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.idToken) {
            fetchPlaylist();
        }
    }, [user?.idToken]);

    useEffect(() => {
        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnd = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnd);
        };
    }, []);

    const playTrack = (track) => {
        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        const trackSrc = track.src || track.url;
        if (!trackSrc) {
            console.error('No audio source found for track:', track);
            return;
        }

        audioRef.current.src = trackSrc;
        audioRef.current.play().catch(err => {
            console.error('Playback failed:', err);
            setIsPlaying(false);
        });
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!currentTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const seek = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const stop = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    const value = {
        playlist,
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        playTrack,
        togglePlay,
        stop,
        seek,
        refreshPlaylist: () => fetchPlaylist(true)
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
