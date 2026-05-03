import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './services/AuthContext';
import { AudioProvider } from './services/GlobalAudioContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Protocol from './pages/Protocol';
import Profile from './pages/Profile';
import AuthScreen from './components/features/auth/AuthScreen';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * AppContent handles the conditional rendering based on authentication state.
 * This MUST be inside AuthProvider to use useAuth hook.
 */
function AppContent() {
  const { isAuthenticated, loading, accessError } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // 1. Loading State
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#1b4332',
        color: '#FFFFFF',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '10px' }}>Curiya Wellness</div>
        <div style={{ opacity: 0.8 }}>Initializing your experience...</div>
      </div>
    );
  }

  // 2. Auth State
  if (!isAuthenticated) {
    return <AuthScreen error={accessError} />;
  }

  // 3. Main Application
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <Home />}
      {activeTab === 'protocol' && <Protocol />}
      {activeTab === 'profile' && <Profile />}
    </Layout>
  );
}

function App() {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Configuration Error: VITE_GOOGLE_CLIENT_ID is missing.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
