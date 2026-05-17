import React, { useState, useEffect } from 'react';
import { Check, Clock, Truck, AlertTriangle, MapPin } from 'lucide-react';
import QueryBanner from '../../ui/QueryBanner';
import ContactModal from '../home/ContactModal';
import { useAuth } from '../../../services/AuthContext';
import { getTrackingDetails } from '../../../services/patientApi';
import GlobalShimmer from '../../ui/GlobalShimmer';

const OrderStatus = ({ patientData, isSimulated, dispatchedTrigger }) => {
    const auth = useAuth();
    const [isContactOpen, setIsContactOpen] = useState(false);
    
    // Webhook/polling states
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [loading, setLoading] = useState(!isSimulated);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isSimulated) {
            setLoading(false);
            setError(null);
            return;
        }

        let isMounted = true;

        const loadTracking = async (isSilent = false) => {
            if (!isSilent) {
                setLoading(true);
                setError(null);
            }
            try {
                const data = await getTrackingDetails(auth.user?.idToken, auth.patientId);
                if (isMounted) {
                    setTrackingInfo(data);
                    setError(null);

                    // Alert if webhook returned dispatched: false and it was triggered by click
                    if (dispatchedTrigger > 0 && (!data || data.dispatched === false)) {
                        alert("Dispatch details not filled yet in Notion");
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Order tracking fetch failed:', err);
                    if (err.message === 'UNAUTHORIZED') {
                        setError('unauthorized');
                    } else if (err.message === 'FORBIDDEN') {
                        // 403 Google token invalid -> Force re-login
                        auth.logout('Your session has expired. Please sign in again.');
                    } else if (err.message === 'NOT_FOUND') {
                        setError('not_found');
                    } else {
                        setError('generic');
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadTracking();

        // Establish 60-second polling interval
        const interval = setInterval(() => {
            loadTracking(true);
        }, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isSimulated, auth.user?.idToken, auth.patientId, dispatchedTrigger]);

    // Define active mapping
    const activeData = isSimulated ? {
        patientId: patientData?.patient_id,
        patientName: patientData?.name,
        status: patientData?.status,
        dispatched: patientData?.status === 'Meds Sent',
        courierName: patientData?.courier_name || 'BlueDart Express',
        trackingId: patientData?.tracking_id || 'CURI-7892341',
        deliveryName: patientData?.name || 'Valued Patient',
        deliveryphone: patientData?.deliveryphone || '9894275855',
        deliveryAddress: patientData?.deliveryAddress || '123 Wellness Way, Green Sector',
        deliveryState: patientData?.deliveryState || 'Karnataka',
        deliveryPincode: patientData?.deliveryPincode || '560001',
        message: patientData?.status === 'Meds Sent'
            ? 'Your health supplements have been dispatched and are on the way!'
            : 'Your order is being carefully prepared by our pharmacy team.'
    } : trackingInfo;

    const patient_id = activeData?.patientId || auth.patientId || patientData?.patient_id;

    // Loading State
    if (loading && !activeData) {
        return (
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <GlobalShimmer type="row" count={1} style={{ width: '40%', height: '24px' }} />
                <GlobalShimmer type="card" count={3} />
            </div>
        );
    }

    // Error State Handling
    if (error) {
        let title = "Unable to load tracking details";
        let description = "We are currently having trouble retrieving your tracking details. Please try again later or reach out to support.";
        
        if (error === 'not_found') {
            title = "Order Record Not Found";
            description = `We couldn't locate an order record for Patient ID ${patient_id || ''}. Please contact our care team to check your status.`;
        }

        return (
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                animation: 'slideUp 0.4s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        background: 'rgba(217, 119, 6, 0.15)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertTriangle size={24} color="#d97706" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#78350f' }}>{title}</h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#92400e', fontWeight: 500 }}>{description}</p>
                    </div>
                </div>

                <QueryBanner 
                    type="amber"
                    title="Need Help?"
                    onClick={() => setIsContactOpen(true)}
                    whatsappMessage={`Hi, I'm having trouble checking order tracking for Patient ID: ${patient_id}`}
                    className="action-card"
                />

                <ContactModal
                    isOpen={isContactOpen}
                    onClose={() => setIsContactOpen(false)}
                    patientId={patient_id}
                    initialCategory="medicine"
                />
            </div>
        );
    }

    if (!activeData) return null;

    const { 
        dispatched, 
        courierName, 
        trackingId, 
        message,
        deliveryName,
        deliveryphone,
        deliveryAddress,
        deliveryState,
        deliveryPincode
    } = activeData;

    return (
        <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            animation: 'slideUp 0.4s ease-out',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Glossy Highlight Layer */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'rgba(82, 183, 136, 0.15)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Check size={24} color="var(--color-primary-dark)" strokeWidth={3} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Payment Successful!</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 500 }}>Transaction completed successfully</p>
                </div>
            </div>

            <div style={{ 
                background: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: '16px', 
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                {dispatched ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1b4332', marginBottom: '12px' }}>
                            <Truck size={20} />
                            <span style={{ fontWeight: 600, fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>Order Dispatched</span>
                        </div>
                        
                        <div style={{ 
                            background: 'rgba(82, 183, 136, 0.12)', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            marginBottom: '8px' 
                        }}>
                            <div style={{ fontSize: '11px', color: '#2d6a4f', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Tracking ID
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '22px', color: '#1b4332', fontFamily: 'monospace' }}>
                                {trackingId}
                            </div>
                        </div>
                        
                        {courierName && (
                            <div style={{ fontSize: '14px', color: '#52b788', fontWeight: 600, marginTop: '8px', marginBottom: '12px' }}>
                                Courier: <span style={{ color: '#1b4332' }}>{courierName}</span>
                            </div>
                        )}

                        {message && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', margin: '12px 0 0 0', fontWeight: 500, lineHeight: 1.4 }}>
                                {message}
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <Clock size={28} style={{ color: '#52b788', marginBottom: '12px', opacity: 0.8 }} />
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Packing your order</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', marginBottom: '12px', fontWeight: 500, lineHeight: 1.4 }}>
                            {message || "Your order is being prepared. Tracking details will appear here once dispatched."}
                        </p>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#2d6a4f', 
                            background: 'rgba(82, 183, 136, 0.08)', 
                            padding: '6px 14px', 
                            borderRadius: '20px',
                            display: 'inline-block',
                            fontWeight: 600
                        }}>
                            Updates automatically once shipped
                        </div>
                    </div>
                )}
            </div>

            {/* Optional Delivery Address Card */}
            {trackingInfo && trackingInfo.deliveryAddress && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                }}>
                    <MapPin size={18} color="var(--color-primary-dark)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)', fontWeight: 700 }}>
                            Delivery Address
                        </span>
                        {trackingInfo.deliveryName && (
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {trackingInfo.deliveryName}
                            </span>
                        )}
                        {trackingInfo.deliveryphone && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                                {trackingInfo.deliveryphone}
                            </span>
                        )}
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            {trackingInfo.deliveryAddress + ", " + trackingInfo.deliveryState + " - " + trackingInfo.deliveryPincode}
                        </span>
                    </div>
                </div>
            )}

            <QueryBanner 
                type="amber"
                title="Need Help?"
                onClick={() => setIsContactOpen(true)}
                whatsappMessage={`Hi, I have a query regarding my order. Patient ID: ${patient_id}`}
                className="action-card"
            />

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                patientId={patient_id}
                initialCategory="medicine"
            />
        </div>
    );
};

export default OrderStatus;
