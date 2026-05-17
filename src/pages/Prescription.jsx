import React, { useState, useEffect, useRef } from 'react';
import HeroBanner from '../components/ui/HeroBanner';
import { Sprout, Pill } from 'lucide-react';
import BillSummary from '../components/features/prescription/BillSummary';
import MedicineList from '../components/features/prescription/MedicineList';
import OrderStatus from '../components/features/prescription/OrderStatus';
import { useAuth } from '../services/AuthContext';
import GlobalShimmer from '../components/ui/GlobalShimmer';
import {
    fetchFromPatientWebhook
} from '../services/patientApi';

const ShimmerLoader = () => (
    <div style={{ padding: '12px 0' }}>
        <GlobalShimmer type="row" count={1} style={{ width: '60%' }} />
        <GlobalShimmer type="card" count={3} />
    </div>
);

const Prescription = ({ onBack }) => {
    const auth = useAuth();
    const { user, patientData, patientId } = auth;
    const [localPatientData, setLocalPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Payment Polling States
    const [isPolling, setIsPolling] = useState(false);
    const [pollOutcome, setPollOutcome] = useState(null);
    const [pollingStartTime, setPollingStartTime] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const fetchPrescriptionData = async (isSilent = false) => {
        if (!user?.idToken) return;

        if (!isSilent) {
            setLoading(true);
            setError(false);
            setLocalPatientData(null);
        }

        try {
            // Using POST as primary for medicines to ensure body identity is accepted
            const data = await fetchFromPatientWebhook('fetch-medicines', auth, {
                method: 'POST'
            });

            if (data) {
                setLocalPatientData(data);
                setError(false);

                // Detect Payment Outcomes
                if (data.status === 'Meds pending' || data.status === 'Meds Sent') {
                    setPollOutcome('success');
                    setIsPolling(false);
                } else if (data.status === 'Payment Failed') {
                    setPollOutcome('failed');
                    setIsPolling(false);
                }
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Prescription fetch failed:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const isFetching = useRef(false);

    const performFetch = async (isSilent = false) => {
        if (!user?.idToken || isFetching.current) return;
        if (document.visibilityState === 'hidden' && isSilent) return;

        isFetching.current = true;
        try {
            await fetchPrescriptionData(isSilent);
        } finally {
            isFetching.current = false;
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        performFetch();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                performFetch(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [patientData, patientId, user?.idToken]);

    // Payment Polling Logic
    useEffect(() => {
        let pollTimer;

        if (isPolling && !pollOutcome) {
            pollTimer = setInterval(() => {
                performFetch(true);

                // Check for Timeout (10 minutes)
                if (pollingStartTime && (Date.now() - pollingStartTime >= 10 * 60 * 1000)) {
                    if (localPatientData?.status === 'Payment Link Ready') {
                        setPollOutcome('timeout');
                        setIsPolling(false);
                    }
                }
            }, 10000);
        } else if (pollOutcome === 'success') {
            pollTimer = setInterval(() => {
                performFetch(true);
            }, 30000);
        }

        return () => {
            if (pollTimer) {
                clearInterval(pollTimer);
            }
        };
    }, [isPolling, pollOutcome, pollingStartTime, user?.idToken]);

    const handlePayInitiated = () => {
        setIsPolling(true);
        setPollingStartTime(Date.now());
        setPollOutcome(null);
    };

    const handleRestartPolling = () => {
        setIsPolling(true);
        setPollingStartTime(Date.now());
        setPollOutcome(null);
    };

    const handleSimulateOutcome = (outcome) => {
        setPollOutcome(outcome === 'dispatched' ? 'success' : outcome);
        setIsPolling(false);
        
        if (outcome === 'success') {
            setLocalPatientData(prev => ({ ...prev, status: 'Meds pending', tracking_id: null }));
        } else if (outcome === 'dispatched') {
            setLocalPatientData(prev => ({ 
                ...prev, 
                status: 'Meds Sent', 
                tracking_id: 'CURI-7892341',
                courier_name: 'BlueDart Express'
            }));
        } else if (outcome === 'failed') {
            setLocalPatientData(prev => ({ ...prev, status: 'Payment Failed' }));
        } else if (outcome === 'timeout') {
            setLocalPatientData(prev => ({ ...prev, status: 'Payment Link Ready' }));
        }
    };

    const colors = {
        g1: '#1B4332',
        g2: '#2D6A4F',
        g3: '#40916C',
        g4: '#52B788',
        g5: '#74C69D',
        g6: '#B7E4C7',
    };

    const renderHeroBanner = (medCount = null, isLoadingCount = false) => (
        <HeroBanner
            title="Herbals & Supplements"
            label="WELLNESS PLAN"
            onBack={onBack}
            backText="Back to Protocol"
            badge={isLoadingCount ? "– –" : `${medCount || 0} Item${medCount === 1 ? '' : 's'}`}
            badgeIcon={<Pill size={12} strokeWidth={2.5} />}
        />
    );

    if (loading && !localPatientData) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                {renderHeroBanner(0, true)}
                <ShimmerLoader />
            </div>
        );
    }

    const prescriptions = localPatientData?.prescriptions || [];
    const billing = localPatientData?.billing;
    const hasMedicines = prescriptions.length > 0;
    const hasBilling = hasMedicines && billing && (billing.total > 0 || billing.total_payable > 0);

    if (error || !localPatientData || (!hasMedicines && !hasBilling)) {
        return (
            <div style={{ paddingBottom: '40px' }}>
                {renderHeroBanner()}

                <div style={{
                    padding: '40px 24px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }} />
                    <Sprout size={40} strokeWidth={1.5} style={{ color: '#2D5E44', opacity: 0.75 }} />
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: colors.g1,
                        margin: 0,
                    }}>
                        Your wellness plan is on its way
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem',
                        color: 'var(--color-secondary)',
                        lineHeight: 1.6,
                        maxWidth: '260px',
                        margin: 0,
                        opacity: 0.85,
                    }}>
                        Your personalised natural supplement protocol is being carefully put together by your health practitioner. Check back soon.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '40px' }}>
            {renderHeroBanner(prescriptions.length)}

            {hasMedicines && (
                <MedicineList 
                    medicines={prescriptions} 
                    isVisible={isVisible} 
                    isPaid={pollOutcome === 'success'} 
                />
            )}

            {/* Show Order Status if payment is successful/processed */}
            {pollOutcome === 'success' && (
                <OrderStatus patientData={localPatientData} />
            )}

            {/* Always show Bill Summary if billing data exists, regardless of payment status */}
            {hasBilling && (
                <div style={{ 
                    opacity: isVisible ? 1 : 0, 
                    transform: isVisible ? 'translateY(0)' : 'translateY(10px)', 
                    transition: 'all 0.4s ease 0.2s',
                    zIndex: 1
                }}>
                    <BillSummary
                        billing={billing}
                        payment={localPatientData.payment}
                        trackingId={localPatientData.trackingId}
                        pollOutcome={pollOutcome}
                        onPayInitiated={handlePayInitiated}
                        onRestartPolling={handleRestartPolling}
                        onSimulateOutcome={handleSimulateOutcome}
                        patientId={patientId}
                    />
                </div>
            )}
        </div>
    );
};

export default Prescription;
