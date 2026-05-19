import React from 'react';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import { Calendar, User, Activity } from 'lucide-react';

const formatDate = (dateValue) => {
    if (!dateValue || dateValue === '--/--/--') return '--/--/--';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            const d = date.getDate().toString().padStart(2, '0');
            const m = months[date.getMonth()];
            const y = date.getFullYear();
            return `${d} ${m} ${y}`;
        }

        const dmyMatch = dateValue.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (dmyMatch) {
            const d = dmyMatch[1].padStart(2, '0');
            const mIdx = parseInt(dmyMatch[2], 10) - 1;
            let y = parseInt(dmyMatch[3], 10);
            if (y < 100) {
                y = 2000 + y;
            }
            const m = months[mIdx] || 'Jan';
            return `${d} ${m} ${y}`;
        }

        const parts = dateValue.replace(',', '').split(/\s+/);
        if (parts.length === 3) {
            const d = parts[0].padStart(2, '0');
            const monthStr = parts[1].toLowerCase().slice(0, 3);
            let y = parseInt(parts[2], 10);
            if (y < 100) {
                y = 2000 + y;
            }
            const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monthStr);
            if (!isNaN(parseInt(d)) && monthIndex !== -1 && !isNaN(y)) {
                const m = months[monthIndex];
                return `${d} ${m} ${y}`;
            }
        }

        return dateValue;
    } catch (e) {
        return dateValue;
    }
};

const mapStatus = (statusValue) => {
    if (!statusValue) return '';
    const cleanStatus = statusValue.trim();
    const mapping = {
        'Cons. Pending': 'Consult pending',
        'Follow Up': 'Follow-up due',
        'Rep. Pending': 'Report due',
        'Meds Prescribed': 'Meds Prescribed',
        'Payment Link Ready': 'Pay now',
        'Bill Error': 'Meds Prescribed',
        'Fare Pending': 'Pay now',
        'Payment Failed': 'Payment failed',
        'Meds pending': 'Packing meds',
        'Meds Sent': 'Meds dispatched',
        'On Treatment': 'In treatment',
        'On Hold': 'Treatment paused ',
        'Dropped': 'Case closed'
    };
    return mapping[cleanStatus] || cleanStatus;
};

const InfoRow = ({ icon: Icon, label, value, highlight = false, isSmall = false }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
            width: isSmall ? '32px' : '40px',
            height: isSmall ? '32px' : '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
        }}>
            <Icon size={isSmall ? 16 : 20} strokeWidth={1.5} color="#2F5E44" />
        </div>

        <div style={{ flex: 1 }}>
            <p style={{
                fontSize: '0.7rem',
                color: 'var(--color-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '2px',
                minHeight: isSmall ? '28px' : 'auto', // Help alignment if labels wrap
                display: 'flex',
                alignItems: 'center'
            }}>
                {label}
            </p>
            <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: isSmall ? '0.9rem' : '1rem',
                fontWeight: highlight ? 600 : 500,
                color: 'var(--color-primary-dark)',
                lineHeight: 1.2
            }}>
                {value}
            </p>
        </div>
    </div>
);

const ConsultationInfo = ({ doctor, complaint, consultDate, followUp, status }) => {
    return (
        <Card
            className="action-card"
            style={{
                marginBottom: '24px',
                borderRadius: '20px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                /* Frosted glass — using standardized variables */
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
            }}
        >
            {/* Hero-style inner top highlight */}
            <div style={{
                pointerEvents: 'none',
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0.0) 100%)',
                borderRadius: '20px 20px 0 0',
            }} />

            {/* Title */}
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '16px', position: 'relative', fontWeight: 600 }}>
                Your care summary
            </h3>

            {/* Doctor Info */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <InfoRow icon={User} label="Your doctor" value={doctor} highlight />
            </div>

            {/* Chief Complaint */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
                <InfoRow icon={Activity} label="Primary concern" value={complaint} />
            </div>

            {/* Dates Section - Glass inner panel */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '24px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                borderRadius: '14px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.45)',
                position: 'relative',
            }}>
                <InfoRow
                    icon={Calendar}
                    label="Consultation date"
                    value={formatDate(consultDate)}
                    isSmall
                />
                <InfoRow
                    icon={Calendar}
                    label="Next follow-up"
                    value={formatDate(followUp)}
                    isSmall
                />
            </div>

            {/* Status Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.25)',
                position: 'relative',
            }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 500 }}>Treatment status</span>
                <Badge type="primary">{mapStatus(status)}</Badge>
            </div>
        </Card>
    );
};

export default ConsultationInfo;
