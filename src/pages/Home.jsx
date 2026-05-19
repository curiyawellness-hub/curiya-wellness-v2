import React, { useState, useEffect, useRef } from 'react';
import GreetingCard from '../components/features/home/GreetingCard';
import ConsultationInfo from '../components/features/home/ConsultationInfo';
import ContactModal from '../components/features/home/ContactModal';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import GlobalShimmer from '../components/ui/GlobalShimmer';
import QueryBanner from '../components/ui/QueryBanner';
import '../components/ui/shimmer.css';

const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const Home = () => {
    const { user, patientData, patientId, refreshData, loading, patientLoading, accessError } = useAuth();
    const isFetching = useRef(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isManualRefreshing, setIsManualRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Sync visibility and data
    useEffect(() => {
        if (!user?.idToken) return;

        const performRefresh = async (isSilent = false) => {
            if (isFetching.current) return;
            if (document.visibilityState === 'hidden' && isSilent) return;

            isFetching.current = true;
            try {
                await refreshData(isSilent);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } finally {
                isFetching.current = false;
            }
        };

        performRefresh(true); // Silent refresh on mount
        // Note: Global refresh is handled by AuthContext interval
    }, [user?.idToken, refreshData]);

    const handleManualRefresh = async () => {
        setIsManualRefreshing(true);
        try {
            await refreshData();
            setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } finally {
            setIsManualRefreshing(false);
        }
    };

    const activeData = patientData || {};

    const currentPatient = {
        id: pickFirst(
            activeData?.patient_id,
            activeData?.patientId,
            activeData?.['Patient ID'],
            activeData?.id,
            patientId
        ),
        name: pickFirst(
            activeData?.name,
            activeData?.Name,
            user?.name,
            'Wellness Guest'
        ),
        doctor: pickFirst(
            activeData?.doctor,
            activeData?.handled_by,
            activeData?.['Handled by'],
            'Consultant Assigned'
        ),
        chiefComplaint: pickFirst(
            activeData?.chief_complaint,
            activeData?.complaint,
            activeData?.['Chief Complaint'],
            activeData?.['C/o'],
            'Consultation Pending'
        ),
        consultDate: pickFirst(
            activeData?.consult_date,
            activeData?.consultDate,
            activeData?.Date,
            '--/--/--'
        ),
        followUpDate: pickFirst(
            activeData?.follow_up_date,
            activeData?.followUp,
            activeData?.['Follow-up'],
            '--/--/--'
        ),
        status: pickFirst(
            activeData?.status,
            activeData?.Status,
            'Processing'
        ),
        quote: pickFirst(
            activeData?.quote,
            "Healing is a journey, not a destination."
        )
    };

    if (!user) return null;

    if ((loading || patientLoading) && !patientData) {
        return (
            <div style={{ paddingBottom: '20px' }}>
                <GlobalShimmer type="greeting" style={{ marginBottom: '16px' }} />
                <GlobalShimmer type="card" count={2} />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '20px' }}>
            {/* Non-blocking Connection Info */}
            {accessError && patientData && (
                <div style={{
                    background: 'rgba(217, 119, 6, 0.15)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '10px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#D97706',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(217, 119, 6, 0.2)'
                }}>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Using offline data. Attempting to sync...</span>
                </div>
            )}

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <GreetingCard name={currentPatient.name} quote={currentPatient.quote} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <ConsultationInfo
                    doctor={currentPatient.doctor}
                    complaint={currentPatient.chiefComplaint}
                    consultDate={currentPatient.consultDate}
                    followUp={currentPatient.followUpDate}
                    status={currentPatient.status}
                />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <QueryBanner 
                    type="amber"
                    title="Have a question about your care?"
                    buttonText="Talk to us"
                    onClick={() => setIsContactOpen(true)}
                    className="action-card"
                />
            </div>

            <p style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                marginTop: '24px',
                fontStyle: 'italic'
            }}>
                Last Synchronized: {lastUpdated}
            </p>

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                patientId={currentPatient.id}
            />

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
};

export default Home;
