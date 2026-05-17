import React, { useState } from 'react';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { XCircle, Clock, MessageCircle, RefreshCw, HelpCircle } from 'lucide-react';
import ContactModal from '../home/ContactModal';

const BillSummary = ({ 
    billing, 
    payment, 
    onPay, 
    trackingId, 
    pollOutcome, 
    onPayInitiated, 
    onRestartPolling,
    onSimulateOutcome,
    patientId 
}) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const isPaid = payment?.status === 'PAID';
    const isActionable = payment?.status === 'ACTIVE';

    const handlePaymentClick = () => {
        if (onPayInitiated) onPayInitiated();
        
        if (payment?.link) {
            window.open(payment.link, '_blank');
        } else if (onPay) {
            onPay();
        }
    };

    const handleWhatsAppHelp = (type) => {
        const text = type === 'failed' 
            ? `Hi, I had a payment issue. Patient ID: ${patientId}`
            : `Hi, I have a question about my payment. Patient ID: ${patientId}`;
        window.open(`https://wa.me/919632128711?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <Card className="hero-card" style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden'
        }}>

            <div style={{ position: 'relative', zIndex: 2 }}>
                {pollOutcome !== 'success' && (
                    <>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, color: '#1B4332', marginBottom: '16px', marginTop: 0 }}>Bill Summary</h2>
                        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-text-secondary)' }}>
                                        <th style={{ padding: '8px 0', fontWeight: 500 }}>Supplement</th>
                                        <th style={{ padding: '8px 0', fontWeight: 500 }}>Pack</th>
                                        <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billing?.items?.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                            <td style={{ padding: '12px 0' }}>
                                                <span style={{ display: 'block', fontWeight: 600, color: '#1B4332' }}>{item.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}>x{item.qty}</span>
                                            </td>
                                            <td style={{ padding: '12px 0', color: '#40916C' }}>{item.pack}</td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', color: '#1B4332', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>₹{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <span>Subtotal</span>
                            <span style={{ fontFamily: 'var(--font-heading)' }}>₹{billing?.subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            <span>Courier Charges</span>
                            <span style={{ fontFamily: 'var(--font-heading)' }}>₹{billing?.courier}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                            <span>Total Payable</span>
                            <span style={{ fontFamily: 'var(--font-heading)' }}>₹{billing?.total}</span>
                        </div>

                        {!isPaid && (payment?.link || isActionable) && (
                            <Button
                                variant="primary"
                                onClick={handlePaymentClick}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    boxShadow: '0 8px 25px rgba(27, 67, 50, 0.25)'
                                }}
                            >
                                Pay <span style={{ fontFamily: 'var(--font-heading)' }}>₹{billing?.total || billing?.total_payable || '0'}</span> Securely
                            </Button>
                        )}

                        {isPaid && (
                            <div style={{ textAlign: 'center' }}>
                                <Badge type="primary">Paid Successfully</Badge>
                                {trackingId ? (
                                    <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
                                        Track Shipment: {trackingId}
                                    </p>
                                ) : (
                                    <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        Dispatch in progress...
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            
            {/* Outcome 2: FAILED */}
            {pollOutcome === 'failed' && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'rgba(255, 245, 245, 0.6)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    border: '1px solid rgba(220, 50, 50, 0.15)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: '20px',
                    animation: 'slideUp 0.3s ease-out',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Subtle Highlight for Outcome Card */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }} />
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: 'rgba(220, 50, 50, 0.1)', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <XCircle size={22} color="#dc2626" />
                        </div>
                        <div>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '1.05rem', 
                                color: '#991B1B', 
                                fontWeight: 600,
                                fontFamily: 'var(--font-heading)'
                            }}>
                                Payment Unsuccessful
                            </h3>
                            <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '0.88rem', 
                                color: '#B91C1C', 
                                lineHeight: 1.5,
                                fontWeight: 500
                            }}>
                                Your payment could not be processed. Please try again or use a different payment method.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handlePaymentClick}
                            className="btn-primary"
                            style={{
                                flex: 1.2,
                                padding: '12px',
                                borderRadius: '14px',
                                fontSize: '0.95rem'
                            }}
                        >
                            <RefreshCw size={15} /> Try Again
                        </button>
                        <button 
                            onClick={() => setIsContactOpen(true)}
                            style={{
                                flex: 1,
                                background: 'rgba(255, 243, 220, 0.45)',
                                border: '1.5px solid rgba(217, 119, 6, 0.2)',
                                color: '#d97706',
                                borderRadius: '14px',
                                padding: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <HelpCircle size={15} /> Need Help?
                        </button>
                    </div>
                </div>
            )}

            {/* Outcome 3: TIMEOUT */}
            {pollOutcome === 'timeout' && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'rgba(255, 250, 240, 0.6)',
                    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                    border: '1px solid rgba(217, 119, 6, 0.15)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: '20px',
                    animation: 'slideUp 0.3s ease-out',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Subtle Highlight for Outcome Card */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }} />
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: 'rgba(217, 119, 6, 0.1)', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Clock size={22} color="#d97706" />
                        </div>
                        <div>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '1.05rem', 
                                color: '#78350f', 
                                fontWeight: 600,
                                fontFamily: 'var(--font-heading)'
                            }}>
                                Taking longer than expected
                            </h3>
                            <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '0.88rem', 
                                color: '#92400e', 
                                lineHeight: 1.5,
                                fontWeight: 500
                            }}>
                                Payment is taking longer than expected. If you already paid, it will reflect shortly.
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={onRestartPolling}
                            className="btn-primary"
                            style={{
                                flex: 1.2,
                                padding: '12px',
                                borderRadius: '14px',
                                fontSize: '0.95rem'
                            }}
                        >
                            <RefreshCw size={15} /> Check Again
                        </button>
                        <button 
                            onClick={() => setIsContactOpen(true)}
                            style={{
                                flex: 1,
                                background: 'rgba(255, 243, 220, 0.45)',
                                border: '1.5px solid rgba(217, 119, 6, 0.2)',
                                color: '#d97706',
                                borderRadius: '14px',
                                padding: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <MessageCircle size={15} /> Contact Us
                        </button>
                    </div>
                </div>
            )}

            {/* Mimic Buttons for Testing */}
            <div style={{
                marginTop: pollOutcome === 'success' ? '0' : '32px',
                paddingTop: pollOutcome === 'success' ? '0' : '16px',
                borderTop: pollOutcome === 'success' ? 'none' : '1px dashed rgba(27, 67, 50, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🛠️ Developer Mimic Tools
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button 
                        onClick={() => onSimulateOutcome('success')}
                        style={{
                            flex: 1,
                            minWidth: '100px',
                            background: 'rgba(82, 183, 136, 0.1)',
                            border: '1px solid rgba(82, 183, 136, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: 'var(--color-primary-dark)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)'
                        }}
                    >
                        Mimic Paid
                    </button>
                    <button 
                        onClick={() => onSimulateOutcome('dispatched')}
                        style={{
                            flex: 1,
                            minWidth: '100px',
                            background: 'rgba(45, 106, 79, 0.1)',
                            border: '1px solid rgba(45, 106, 79, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: '#1B4332',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)'
                        }}
                    >
                        Mimic Dispatched
                    </button>
                    <button 
                        onClick={() => onSimulateOutcome('failed')}
                        style={{
                            flex: 1,
                            minWidth: '100px',
                            background: 'rgba(220, 50, 50, 0.05)',
                            border: '1px solid rgba(220, 50, 50, 0.1)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)'
                        }}
                    >
                        Mimic Failed
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                patientId={patientId}
                initialCategory="medicine"
            />
            </div>
        </Card>
    );
};

export default BillSummary;
