import React from 'react';
import { ChevronLeft, Eye, Download } from 'lucide-react';
import { buildWebhookUrl } from '../../../services/patientApi';

const ReportViewer = ({ report, onBack }) => {
    if (!report) return null;

    const { title, date, status, upload_id } = report;
    const isProcessing = status === 'Processing';

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        color: 'var(--color-primary-dark)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
            </div>

            {/* Report Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    fontSize: '1.2rem',
                    color: '#f0fdf4',
                    margin: '0 0 6px 0',
                    lineHeight: '1.4',
                    wordBreak: 'break-all',
                    fontWeight: 700,
                    textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {title}
                </h1>
                <p style={{ color: '#dcfce7', fontSize: '0.85rem', margin: 0, opacity: 0.9, fontWeight: 500 }}>
                    Report Date: {date}
                </p>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.4)', marginTop: '16px', borderRadius: '1px' }}></div>
            </div>

            {/* Processing Message */}
            {isProcessing && (
                <div style={{
                    marginBottom: '24px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    color: 'var(--color-primary-dark)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                }}>
                    Your report is being processed. You can still access the original file below.
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                    href={buildWebhookUrl('files', { upload_id, type: 'view' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    <button
                        className="glass-card"
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.6)',
                            color: 'var(--color-primary-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Eye size={20} />
                        View Original File
                    </button>
                </a>

                <a
                    href={buildWebhookUrl('files', { upload_id, type: 'download' })}
                    style={{ textDecoration: 'none' }}
                >
                    <button
                        className="glass-card"
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.6)',
                            color: 'var(--color-primary-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Download size={20} />
                        Download Original File
                    </button>
                </a>
            </div>
        </div>
    );
};

export default ReportViewer;
