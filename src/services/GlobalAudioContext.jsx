import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
    const { isAuthenticated, user, getValidToken } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const currentTrackRef = useRef(null);

    // The SINGLE audio instance
    const audioRef = useRef(new Audio());

    const fetchPlaylist = async () => {
        if (!user?.idToken) return;

        setIsLoading(true);
        try {
            const validToken = await getValidToken();

            const response = await fetch(`https://n8n.curiyawellness.com/webhook/audio/sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${validToken}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                console.warn('Playlist fetch failed:', response.status);
                setPlaylist([]); // FAIL-CLOSED
                return;
            }

            const data = await response.json();
            if (data?.success && Array.isArray(data.sessions)) {
                const allTracks = data.sessions.flatMap(session =>
                    (session.tracks || []).map(track => ({
                        ...track,
                        src: track.url || track.audio_url || track.file_url || track.src || track.file || track.url_link,
                        subtitle: session.label
                    }))
                );
                // Update playlist first
                setPlaylist(allTracks);

                // Fetch durations for ALL tracks in the background to avoid "0:00"
                allTracks.forEach((track, idx) => {
                    if (track.src && (!track.duration_label || track.duration_label === '0:00')) {
                        const temp = new Audio();
                        temp.preload = "metadata";
                        temp.onloadedmetadata = () => {
                            const minutes = Math.floor(temp.duration / 60);
                            const seconds = Math.floor(temp.duration % 60);
                            const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                            setPlaylist(prev => prev.map((t, i) =>
                                i === idx ? { ...t, duration_label: label, duration_seconds: temp.duration } : t
                            ));

                            // If this is the first track, also set the global duration state
                            if (idx === 0) setDuration(temp.duration);

                            temp.src = "";
                            temp.load();
                        };
                        temp.src = track.src;
                    }
                });

                // Prime the main audio element with the first track
                if (allTracks.length > 0 && !currentTrackRef.current) {
                    const firstTrack = allTracks[0];
                    if (firstTrack.src) {
                        console.log('--- GLOBAL AUDIO: PRIMING ---', firstTrack.title);
                        audioRef.current.preload = "metadata";
                        audioRef.current.src = firstTrack.src;
                        currentTrackRef.current = { ...firstTrack, primed: true };
                        setCurrentTrack(firstTrack);
                    }
                }
            } else {
                setPlaylist([]); // FALLBACK FOR MALFORMED DATA
            }
        } catch (err) {
            console.error('Failed to fetch playlist:', err);
            setPlaylist([]); // FAIL-CLOSED ON NETWORK ERROR
        } finally {
            setIsLoading(false);
        }
    };

    // Stop and cleanup audio
    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            currentTrackRef.current = null;
            setCurrentTrack(null);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    };

    // Handle Authentication changes (Logout/Session Expiry)
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('--- GLOBAL AUDIO: STOPPING ON LOGOUT ---');
            stop();
            setPlaylist([]);
        } else {
            // fetch happens when tapping 'Relaxation & Sleep'
        }
    }, [isAuthenticated, user?.idToken]);

    // Set up audio events
    useEffect(() => {
        const audio = audioRef.current;

        const handlePlaying = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = (e) => {
            console.error("Global Audio Error:", e);
            setError("Playback failed. Please check your connection.");
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    const play = (track) => {
        const audio = audioRef.current;
        console.log("▶️ Attempting to play track:", track);

        if (!track || (!track.src && !track.url)) {
            console.error("❌ Track has no valid src or url property!", track);
            setError("Invalid track audio URL.");
            return;
        }

        // Efficiently check if we need to change the source.
        // We compare against the current audio element's src to be absolutely sure.
        const currentAudioSrc = audio.src.split('?')[0]; // Strip cache busters if any
        const trackSrc = track.src.split('?')[0];

        // If it's a completely new track, or the player is currently empty/reset
        if (!currentTrackRef.current || currentTrackRef.current.src !== track.src || !audio.src || audio.src === "" || audio.src === window.location.href) {
            console.log("🔄 Loading audio source:", track.src);
            audio.src = track.src;
            // Removed redundant audio.load() as setting src triggers it.
            currentTrackRef.current = track;
            setCurrentTrack(track);
            setCurrentTime(0);
            setError(null);
        } else if (currentTrackRef.current?.primed) {
            // IF it's primed (pre-loaded), some browsers need a "nudge" to realize it's a user gesture
            console.log("⚡ Re-syncing primed track for gesture...");
            audio.src = track.src;
            currentTrackRef.current = { ...track, primed: false }; // Clear primed flag
        } else {
            console.log("⏯️ Resuming existing audio source:", track.src);
        }

        console.log("⏳ Calling audio.play()...");
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.error("❌ Play failed:", e.name, e.message);
                setIsPlaying(false);
            });
        }
    };

    const pause = () => {
        audioRef.current.pause();
    };

    const togglePlay = (track) => {
        const audio = audioRef.current;
        const isSameTrack = currentTrackRef.current && currentTrackRef.current.src === track.src;

        // If clicking the current track AND it's physically playing in the DOM, pause it
        if (isSameTrack && !audio.paused) {
            pause();
        } else {
            // Otherwise, play the requested track (whether it's the current paused one, or a new one)
            play(track);
        }
    };

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return (
        <AudioContext.Provider value={{
            isPlaying,
            playlist,
            currentTrack,
            currentTime,
            duration,
            isLoading,
            error,
            play,
            pause,
            stop,
            togglePlay,
            seek,
            refreshPlaylist: fetchPlaylist
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
