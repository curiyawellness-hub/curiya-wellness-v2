import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [accessError, setAccessError] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((message) => {
        // Prevent event objects from being treated as error messages
        const errorMsg = typeof message === 'string' ? message : null;
        setUser(null);
        setPatientData(null);
        setAccessError(errorMsg);
        localStorage.removeItem('curiya_user');
    }, []);

    const verifyAccess = useCallback(async (token, isSilent = false) => {
        if (!token) {
            console.warn('⚠️ verifyAccess called without token');
            return false;
        }

        try {
            // 1. Cloudflare Worker Authorization (Primary Gate)
            const decoded = jwtDecode(token);
            const email = decoded.email;
            
            console.log(`🛡️ Verifying Worker access via token...`);
            const authResponse = await fetch(`https://solitary-frost-385a.curiyawellness.workers.dev/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const authData = await authResponse.json();

            if (authData.allowed !== true) {
                if (!isSilent) {
                    setAccessError("You are not registered as a patient");
                }
                return false;
            }

            // 2. Existing Backend Check
            const endpoint = `${import.meta.env.VITE_API_BASE_URL}/fetch-patient`;
            console.log(`📡 Calling backend: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_AUTHORIZATION_SECRET}`
                },
                body: JSON.stringify({ idToken: token })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout('Your session expired. Please log in again.');
                    return false;
                }

                let errorMessage = 'Access Denied';
                try {
                    const data = await response.json();
                    errorMessage = data.error || data.message || errorMessage;
                } catch (e) {
                    errorMessage = `Server Error (${response.status})`;
                }

                if (!isSilent || response.status === 404) {
                    setAccessError(errorMessage);
                    setPatientData(null);
                }
                return false;
            }

            const data = await response.json();
            setPatientData(data);
            setAccessError(null);
            return true;
        } catch (err) {
            console.error('Access verification failed:', err);
            if (!isSilent) {
                const isNetworkError = err.name === 'TypeError' || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network');
                setAccessError(isNetworkError
                    ? 'Service temporarily unavailable. Please check your connection.'
                    : 'System offline. Please try again later.');
            }
            return false;
        }
    }, [logout]);

    useEffect(() => {
        const checkSession = async () => {
            const savedUser = localStorage.getItem('curiya_user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    // Verify access BEFORE setting user state to prevent UI flashes
                    const isAuthorized = await verifyAccess(parsedUser.idToken, true);
                    if (isAuthorized) {
                        setUser(parsedUser);
                    } else {
                        localStorage.removeItem('curiya_user');
                    }
                } catch (error) {
                    console.error('❌ Failed to parse saved user:', error);
                    localStorage.removeItem('curiya_user');
                }
            }
            setLoading(false);
        };
        checkSession();
    }, [verifyAccess]);

    const getValidToken = useCallback(async () => {
        if (!user?.idToken) {
            throw new Error('No user session found. Please log in.');
        }

        try {
            const decoded = jwtDecode(user.idToken);
            const expiresAt = decoded.exp * 1000;
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (now >= expiresAt - fiveMinutes) {
                logout('Your session has expired. Please log in again.');
                throw new Error('Session expired. Please log in again.');
            }
            return user.idToken;
        } catch (error) {
            if (error.message === 'Session expired. Please log in again.') {
                throw error;
            }
            throw new Error('Failed to validate session. Please log in again.');
        }
    }, [user, logout]);

    const login = useCallback(async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userData = {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                id: decoded.sub,
                idToken: credentialResponse.credential
            };

            const isAuthorized = await verifyAccess(userData.idToken);
            if (isAuthorized) {
                setUser(userData);
                localStorage.setItem('curiya_user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('✗ LOGIN FAILED:', error);
            throw error;
        }
    }, [verifyAccess]);

    const refreshData = useCallback(async (isSilent) => {
        try {
            const validToken = await getValidToken();
            return verifyAccess(validToken, isSilent);
        } catch (e) {
            console.error('Refresh failed:', e);
            return false;
        }
    }, [getValidToken, verifyAccess]);

    return (
        <AuthContext.Provider value={{
            user,
            patientData,
            patientId: patientData?.patient_id, // Explicitly expose patientId
            accessError,
            login,
            logout,
            getValidToken, // Expose token validation function
            refreshData,
            isAuthenticated: !!user && !accessError,
            isVerifying: loading,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
