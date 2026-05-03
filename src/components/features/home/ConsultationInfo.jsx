import React from 'react';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import { Calendar, User, Activity } from 'lucide-react';

const formatDate = (dateValue) => {
    if (!dateValue) return '--/--/--';

    try {
        const date = new Date(dateValue);
        // If it's an invalid date (like our mock strings "25 Jan, 2025"), 
        // return the string as is or try to parse it better.
        if (isNaN(date.getTime())) {
            // Check if it's already in DD/MM/YY format
            if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateValue)) return dateValue;

            // Try to handle "25 Jan, 2025" -> 25/01/25
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const parts = dateValue.toLowerCase().replace(',', '').split(' ');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = (months.indexOf(parts[1]) + 1).toString().padStart(2, '0');
                const year = parts[2].slice(-2);
                if (parseInt(month) > 0) return `${day}/${month}/${year}`;
            }
            return dateValue;
        }

        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        return `${d}/${m}/${y}`;
    } catch (e) {
        return dateValue;
    }
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
                fontWeight: highlight ? 700 : 600,
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
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '16px', position: 'relative' }}>
                Consultation Info
            </h3>

            {/* Doctor Info */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <InfoRow icon={User} label="Assigned Doctor" value={doctor} highlight />
            </div>

            {/* Chief Complaint */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
                <InfoRow icon={Activity} label="Chief Complaint" value={complaint} />
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
                    label="Consult Date"
                    value={formatDate(consultDate)}
                    isSmall
                />
                <InfoRow
                    icon={Calendar}
                    label="Next Follow-up"
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
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 500 }}>Current Status</span>
                <Badge type="primary">{status}</Badge>
            </div>
        </Card>
    );
};

export default ConsultationInfo;
