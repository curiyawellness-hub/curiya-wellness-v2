import React from 'react';
import { X } from 'lucide-react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end', // Bottom sheet style on mobile usually, but centered is fine
        justifyContent: 'center',
        padding: '20px'
    };

    const contentStyle = {
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: '1px solid rgba(27, 67, 50, 0.1)',
        borderRadius: '28px', // Using var(--radius-lg) equivalently
        padding: '24px',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(27, 67, 50, 0.12)',
        animation: 'slideUp 0.3s ease-out'
    };

    // Simple animation keyframe injection
    if (!document.getElementById('modal-animations')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'modal-animations';
        styleSheet.innerText = `
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    return ReactDOM.createPortal(
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                {/* Specular Highlight Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
                    pointerEvents: 'none',
                    borderRadius: '28px 28px 0 0',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary-dark)' }}>{title}</h3>
                        <button
                            onClick={onClose}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                                padding: 0
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        >
                            <X size={18} color="var(--color-primary-dark)" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
