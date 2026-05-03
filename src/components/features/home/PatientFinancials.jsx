import React from 'react';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import { DollarSign, Utensils } from 'lucide-react';

const PatientFinancials = ({ diet, amount }) => {
    return (
        <Card title="Plan Details" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Utensils size={20} color="#2F5E44" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescribed Diet</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{diet || 'Pending Assessment'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(45, 79, 42, 0.08)' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <DollarSign size={20} color="#2F5E44" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consultation Dues</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>{amount || 'No dues'}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PatientFinancials;
