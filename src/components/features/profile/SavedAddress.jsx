import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { MapPin, CheckCircle, Edit2, Phone } from 'lucide-react';

const SavedAddress = ({ data, onEdit }) => {
    return (
        <Card className="glass-card" style={{
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)'
        }}>
            {/* Glossy Highlight */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 100%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                color: 'var(--color-primary-dark)',
                background: 'rgba(255, 255, 255, 0.45)',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px) saturate(140%)',
                WebkitBackdropFilter: 'blur(12px) saturate(140%)',
                boxShadow: '0 4px 12px rgba(45, 79, 68, 0.05)',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{
                    background: 'rgba(22, 163, 74, 0.1)',
                    borderRadius: '50%',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16a34a',
                    border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                    <CheckCircle size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 500, letterSpacing: '0.01em' }}>Delivery Address Saved</h3>
            </div>

            <div style={{
                marginBottom: '28px',
                padding: '0 4px',
                position: 'relative',
                zIndex: 2
            }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary-dark)' }}>{data.fullName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    <Phone size={16} style={{ color: 'var(--color-primary-dark)', opacity: 0.9 }} />
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>{data.phone}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    <MapPin size={18} style={{ minWidth: '18px', marginTop: '2px', color: 'var(--color-primary-dark)', opacity: 0.9 }} />
                    <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{data.address}, {data.state} - {data.pincode}</p>
                </div>
            </div>

            <Button
                variant="secondary"
                onClick={onEdit}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    zIndex: 2
                }}
                className="edit-button"
            >
                <Edit2 size={18} />
                Edit Address
            </Button>

            <style>{`
                .edit-button:hover {
                    background: rgba(255, 255, 255, 0.5);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
            `}</style>
        </Card>
    );
};

export default SavedAddress;
