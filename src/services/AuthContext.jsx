import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
    fetchFromWebhook,
    resolvePatientIdentity,
    selectScopedPatientRecord
} from './patientApi';

const AuthContext = createContext(null);
const PATIENT_REFRESH_INTERVAL_MS = 15000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [accessError, setAccessError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(false);

    const logout = useCallback((message) => {
        const errorMsg = typeof message === 'string' ? message : null;
        setUser(null);
        setIsAuthenticated(false);
        setPatientData(null);
        setPatientLoading(false);
        setAccessError(errorMsg);
        localStorage.removeItem('curiya_user');
    }, []);

    const fetchPatientData = useCallback(async (authenticatedUser, isSilent = false) => {
        if (!authenticatedUser?.email) return null;

        if (!isSilent) {
            setPatientLoading(true);
        }

        try {
            const identity = resolvePatientIdentity(authenticatedUser);
            identity.idToken = authenticatedUser.idToken;

            const payload = await fetchFromWebhook('fetch-patient', {
                method: 'POST',
                identity
            });

            if (payload) {
                const record = selectScopedPatientRecord(payload, identity);
                if (record) {
                    setPatientData(record);
                    setAccessError(null);
                    return record;
                } else {
                    console.warn('Patient identity resolved but no record found in payload');
                    setPatientData(null);
                }
            }
            return null;
        } catch (err) {
            console.error('Patient data fetch failed:', err);
            if (!isSilent) {
                setAccessError(err.message || 'Unable to load patient data.');
            }
            throw err;
        } finally {
            setPatientLoading(false);
        }
    }, []);

    const verifyAccess = useCallback(async (token, isSilent = false) => {
        if (!token) {
            console.warn('⚠️ verifyAccess called without token');
            if (!isSilent) logout();
            return false;
        }

        try {
            const authResponse = await fetch(`https://solitary-frost-385a.curiyawellness.workers.dev/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const authData = await authResponse.json();

            if (!authResponse.ok) {
                throw new Error("Worker request failed");
            }

            if (authData.allowed === true) {
                const workerUser = authData.user || {};
                setUser(workerUser);
                setIsAuthenticated(true);
                setAccessError(null);
                return workerUser;
            } else {
                setUser(null);
                setIsAuthenticated(false);
                throw new Error(authData.reason || "Access denied");
            }
        } catch (err) {
            console.error('Access verification failed:', err);
            if (!isSilent) {
                setAccessError(err.message || 'System offline. Please try again later.');
            }
            return false;
        }
    }, [logout]);

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
            const idToken = credentialResponse.credential;
            const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            const email = payload.email?.toLowerCase().trim();

            const userData = {
                email: email,
                name: payload.name,
                picture: payload.picture,
                id: payload.sub,
                idToken: idToken
            };

            const workerUser = await verifyAccess(userData.idToken);
            if (workerUser) {
                const finalUser = { ...userData, ...workerUser };
                setUser(finalUser);
                localStorage.setItem('curiya_user', JSON.stringify(finalUser));
                await fetchPatientData(finalUser);
                return finalUser;
            }
        } catch (error) {
            console.error('✗ LOGIN FAILED:', error);
            throw error;
        }
    }, [fetchPatientData, verifyAccess]);

    const refreshData = useCallback(async (isSilent) => {
        try {
            const validToken = await getValidToken();
            const workerUser = await verifyAccess(validToken, isSilent);
            if (!workerUser) {
                return false;
            }

            const refreshedUser = { ...user, ...workerUser, idToken: validToken };
            setUser(refreshedUser);
            localStorage.setItem('curiya_user', JSON.stringify(refreshedUser));
            return fetchPatientData(refreshedUser, isSilent);
        } catch (e) {
            console.error('Refresh failed:', e);
            return false;
        }
    }, [fetchPatientData, getValidToken, user, verifyAccess]);

    useEffect(() => {
        const checkSession = async () => {
            const savedUser = localStorage.getItem('curiya_user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    const workerUser = await verifyAccess(parsedUser.idToken, true);
                    if (workerUser) {
                        const mergedUser = { ...parsedUser, ...workerUser, idToken: parsedUser.idToken };
                        setUser(mergedUser);
                        await fetchPatientData(mergedUser, true);
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
    }, [fetchPatientData, verifyAccess]);

    useEffect(() => {
        if (!isAuthenticated || !user?.idToken) return undefined;

        const refreshLivePatientData = () => {
            if (document.visibilityState === 'hidden') return;
            refreshData(true).catch((error) => {
                console.error('Silent patient refresh failed:', error);
            });
        };

        const interval = setInterval(refreshLivePatientData, PATIENT_REFRESH_INTERVAL_MS);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshLivePatientData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, refreshData, user?.idToken]);

    const authValue = React.useMemo(() => ({
        user,
        patientData,
        patientId: resolvePatientIdentity(patientData, user).patientId,
        accessError,
        login,
        logout,
        getValidToken,
        refreshData,
        fetchPatientData,
        isAuthenticated,
        isVerifying: loading,
        patientLoading,
        loading
    }), [
        user, patientData, accessError, login, logout, getValidToken, 
        refreshData, fetchPatientData, isAuthenticated, loading, patientLoading
    ]);

    return (
        <AuthContext.Provider value={authValue}>
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
