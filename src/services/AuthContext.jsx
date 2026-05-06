import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [patientData, setPatientData] = useState(null);
    const [accessError, setAccessError] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((message) => {
        // Prevent event objects from being treated as error messages
        const errorMsg = typeof message === 'string' ? message : null;
        setUser(null);
        setIsAuthenticated(false);
        setPatientData(null);
        setAccessError(errorMsg);
        localStorage.removeItem('curiya_user');
    }, []);

    const verifyAccess = useCallback(async (token, isSilent = false) => {
        if (!token) {
            console.warn('⚠️ verifyAccess called without token');
            if (!isSilent) logout();
            return false;
        }

        try {
            console.log("🛡️ Verifying access via Worker...");
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
            const idToken = credentialResponse.credential;
            // Manual decode to handle normalization
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
                // Ensure we merge the worker's user data with our local idToken for persistence
                const finalUser = { ...userData, ...workerUser };
                setUser(finalUser);
                localStorage.setItem('curiya_user', JSON.stringify(finalUser));
                return finalUser;
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
            isAuthenticated,
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
