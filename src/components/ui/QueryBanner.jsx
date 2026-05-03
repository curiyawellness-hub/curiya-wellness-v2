import React from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';

const QueryBanner = ({ 
    type = 'amber', 
    title = 'Taking longer?', 
    buttonText = 'Raise Query', 
    whatsappMessage = 'Hi, I need help with my order.',
    onClick = null,
    className = ""
}) => {
    const handleAction = () => {
        if (onClick) {
            onClick();
            return;
        }
        const text = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/919632128711?text=${text}`, '_blank');
    };

    const styles = {
        amber: {
            bg: 'rgba(255, 243, 220, 0.6)',
            border: '1px solid rgba(217, 119, 6, 0.2)',
            icon: '#d97706',
            text: '#78350f',
            btnBorder: '#d97706',
            btnText: '#d97706'
        },
        green: {
            bg: 'rgba(216, 243, 220, 0.45)',
            border: '1px solid rgba(45, 106, 79, 0.2)',
            icon: '#1B4332',
            text: '#1B4332',
            btnBorder: '#1B4332',
            btnText: '#1B4332'
        }
    };

    const current = styles[type] || styles.amber;

    return (
        <div 
            className={className}
            style={{
            width: '100%',
            background: current.bg,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: current.border,
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HelpCircle size={20} style={{ color: current.icon }} />
                <span style={{ color: current.text, fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{title}</span>
            </div>
            <button 
                onClick={handleAction}
                style={{
                    background: 'transparent',
                    border: `1.5px solid ${current.btnBorder}`,
                    borderRadius: '12px',
                    padding: '6px 14px',
                    color: current.btnText,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-body)',
                    transition: 'transform 0.2s ease'
                }}
                className="btn-query-standard"
            >
                <MessageCircle size={14} />
                {buttonText}
            </button>
            <style>{`
                .btn-query-standard:active { transform: scale(0.95); }
            `}</style>
        </div>
    );
};

export default QueryBanner;
