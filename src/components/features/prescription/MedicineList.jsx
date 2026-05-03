import React from 'react';
// Removed Card import
import { Pill, Clock, Activity } from 'lucide-react';

const MedicineCard = ({ med, idx, isVisible }) => (
    <div 
        className="animate-slide-up" 
        style={{ 
            animationDelay: `${0.1 + idx * 0.1}s`,
            opacity: 0
        }}
    >
        <div 
            className="action-card"
            style={{
                marginBottom: '16px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '20px',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Pill size={20} color="var(--color-primary)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, color: '#1B4332', margin: 0 }}>{med.name}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <Clock size={16} />
                <span>{med.dosage || med.instruction}</span>
            </div>
            {med.benefit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    <Activity size={16} />
                    <span>{med.benefit}</span>
                </div>
            )}
            {med.instruction && med.dosage && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', paddingLeft: '24px', fontStyle: 'italic' }}>
                    Note: {med.instruction}
                </div>
            )}
        </div>
    </div>
    </div>
);

const MedicineList = ({ medicines, isVisible, isPaid }) => {
    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: '24px',
                padding: '18px',
                position: 'relative',
                overflow: 'hidden'
            }}>
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
                <div style={{ position: 'relative', zIndex: 2 }}>
                    {!isPaid && (
                        <div style={{
                            fontFamily: 'var(--font-body)',
                            padding: '0 4px 6px',
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: '#52B788'
                        }}>
                            SUPPLEMENTS & HERBALS
                        </div>
                    )}
                    {medicines.map((med, idx) => (
                        <MedicineCard key={med.id} med={med} idx={idx} isVisible={isVisible} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MedicineList;
