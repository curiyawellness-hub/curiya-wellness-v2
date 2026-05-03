import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { MessageSquare, Pill, Utensils, Truck, HelpCircle, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
    { id: 'medical', label: 'Medical / Consultation', icon: MessageSquare },
    { id: 'medicine', label: 'Herbals & Supplements', icon: Pill },
    { id: 'diet', label: 'Diet Related', icon: Utensils },
    { id: 'delivery', label: 'Delivery / Tracking', icon: Truck },
    { id: 'other', label: 'Other', icon: HelpCircle },
];

const ContactModal = ({ isOpen, onClose, patientId, initialCategory }) => {
    const [step, setStep] = useState(initialCategory ? 2 : 1);
    const [category, setCategory] = useState(initialCategory ? CATEGORIES.find(c => c.id === initialCategory) : null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setStep(initialCategory ? 2 : 1);
            setCategory(initialCategory ? CATEGORIES.find(c => c.id === initialCategory) : null);
        }
    }, [isOpen, initialCategory]);

    const reset = () => {
        setStep(1);
        setCategory(null);
        setMessage('');
        setSending(false);
        onClose();
    };

    const handleCategorySelect = (cat) => {
        setCategory(cat);
        setStep(2);
    };

    const handleSubmit = () => {
        setSending(true);
        // Simulate API call
        console.log('Sending webhook:', {
            patient_id: patientId,
            category: category.id,
            message_text: message,
            timestamp: new Date().toISOString()
        });

        setTimeout(() => {
            alert("Message sent! We'll get back to you shortly.");
            reset();
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={reset} title={step === 1 ? "How can we help?" : category?.label}>
            {step === 1 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat.id}
                            variant="secondary"
                            onClick={() => handleCategorySelect(cat)}
                            style={{
                                justifyContent: 'flex-start',
                                padding: '18px 24px',
                                background: '#ffffff',
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                                border: '1px solid rgba(27, 67, 50, 0.15)',
                                boxShadow: '0 2px 8px rgba(27, 67, 50, 0.08)'
                            }}
                        >
                            <cat.icon size={22} color="var(--color-icon)" />
                            <span style={{ fontSize: '1rem', color: 'var(--color-primary-body)' }}>{cat.label}</span>
                        </Button>
                    ))}
                </div>
            ) : (
                <div>
                <div style={{ marginBottom: '16px' }}>
                    <button
                        onClick={() => setStep(1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f5f5f5',
                            backdropFilter: 'none',
                            WebkitBackdropFilter: 'none',
                            border: '1px solid rgba(27, 67, 50, 0.12)',
                            borderRadius: '10px',
                            padding: '6px 12px',
                            color: 'var(--color-primary-dark)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#efefef'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                </div>

                    <textarea
                        placeholder={`Describe your ${category?.label?.toLowerCase() || 'query'} here...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                            width: '100%',
                            minHeight: '140px',
                            padding: '18px',
                            borderRadius: '20px',
                            border: '1px solid rgba(27, 67, 50, 0.15)',
                            background: '#f9f9f9',
                            backdropFilter: 'none',
                            WebkitBackdropFilter: 'none',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            color: 'var(--color-primary-dark)',
                            marginBottom: '20px',
                            outline: 'none',
                            resize: 'none'
                        }}
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={!message.trim() || sending}
                        style={{ width: '100%' }}
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default ContactModal;
