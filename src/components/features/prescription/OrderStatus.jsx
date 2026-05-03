import React, { useState } from 'react';
import { Check, Clock, Truck } from 'lucide-react';
import QueryBanner from '../../ui/QueryBanner';
import ContactModal from '../home/ContactModal';

const OrderStatus = ({ patientData }) => {
    if (!patientData) return null;

    const { 
        status, 
        tracking_id, 
        courier_name,
        patient_id 
    } = patientData;
    const [isContactOpen, setIsContactOpen] = useState(false);

    // Dispatched if status is 'Meds Sent' and tracking id exists
    const isDispatched = status === 'Meds Sent' && tracking_id;

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
                {isDispatched ? (
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
                                {tracking_id}
                            </div>
                        </div>
                        
                        {courier_name && (
                            <div style={{ fontSize: '14px', color: '#52b788', fontWeight: 600, marginTop: '8px' }}>
                                Courier: <span style={{ color: '#1b4332' }}>{courier_name}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <Clock size={28} style={{ color: '#52b788', marginBottom: '12px', opacity: 0.8 }} />
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Packing your order</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', marginBottom: '12px', fontWeight: 500 }}>
                            Your health supplements are being carefully packed.
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
