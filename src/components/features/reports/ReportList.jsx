import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Plus, AlertCircle, ClipboardList, Upload, ChevronLeft } from 'lucide-react';

const colors = {
    g1: '#1B4332',
    g2: '#2D6A4F',
    g3: '#40916C',
    g4: '#52B788',
};

const StatusBadge = ({ status }) => {
    const isReady = status === 'Ready';
    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: isReady ? 'rgba(46,125,50,0.12)' : 'rgba(239,108,0,0.12)',
            color: isReady ? '#2E7D32' : '#EF6C00',
            border: isReady ? '1px solid rgba(46,125,50,0.2)' : '1px solid rgba(239,108,0,0.2)',
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
};

const ReportList = ({ reports = [], isLoading, fetchError, onSelect, onUpload, onBack, showHeader = true }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // ── Shared hero card glass style ───────────────────────────────────────
    const heroCardStyle = {
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '24px',
    };

    // ── Hero Banner ───────────────────────────────────────────────────────
    const HeroBanner = () => (
        <div style={{
            ...heroCardStyle,
            height: '165px',
            marginBottom: '16px',
        }}>
            {/* Decorative Circles */}
            <div style={{ position: 'absolute', width: '200px', height: '200px', top: '-60px', right: '-60px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)' }} />
            <div style={{ position: 'absolute', width: '130px', height: '130px', top: '-15px', right: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.06)' }} />
            <div style={{ position: 'absolute', width: '80px', height: '80px', bottom: '-15px', left: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)' }} />

            <div style={{ position: 'absolute', inset: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
                {/* Back to Protocol pill */}
                <button
                    onClick={onBack}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(27,67,50,0.08)', border: '1px solid rgba(27,67,50,0.12)',
                        borderRadius: '20px', padding: '6px 12px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600, color: colors.g1, alignSelf: 'flex-start',
                    }}
                >
                    <ChevronLeft size={12} strokeWidth={2.5} />
                    Back to Protocol
                </button>

                {/* Bottom info row */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(27,67,50,0.45)', marginBottom: '4px' }}>
                            HEALTH RECORDS
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 600, color: colors.g1, lineHeight: 1.1 }}>
                            Lab Reports
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(27,67,50,0.08)', border: '1px solid rgba(27,67,50,0.15)',
                        borderRadius: '12px', padding: '6px 11px',
                        display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                        <ClipboardList size={12} color={colors.g1} strokeWidth={2.5} />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: colors.g1 }}>
                            {reports.length > 0 ? `${reports.length} Report${reports.length > 1 ? 's' : ''}` : 'No Reports'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Upload Info Card (like "Follow for 2 Weeks") ──────────────────────
    const UploadCard = () => (
        <div style={{ ...heroCardStyle, padding: '18px 20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '13px',
                    background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(45,106,79,0.15)', flexShrink: 0
                }}>
                    <Upload size={18} color="white" />
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: colors.g1 }}>Upload Your Reports</div>
                    <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Share results with your practitioner</div>
                </div>
            </div>
            <div style={{ height: '1px', background: 'rgba(82,183,136,0.15)', marginBottom: '10px' }} />
            <div style={{ fontSize: '12.5px', color: colors.g2, lineHeight: 1.65 }}>
                Upload your blood work, scan results, or any lab reports for your practitioner to review. They'll use these to fine-tune your <strong style={{ color: colors.g1, fontWeight: 600 }}>wellness protocol</strong>.
            </div>
        </div>
    );

    // ── Loading ───────────────────────────────────────────────────────────
    if (isLoading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showHeader && <HeroBanner />}
            <UploadCard />
            <div style={{ padding: '0 4px 6px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4 }}>YOUR REPORTS</div>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    ...heroCardStyle,
                    height: '76px',
                    background: 'rgba(255,255,255,0.05)',
                    animation: 'shimmer 1.5s infinite linear',
                }} />
            ))}
            <style>{`@keyframes shimmer { 0%{opacity:0.5} 50%{opacity:1} 100%{opacity:0.5} }`}</style>
        </div>
    );

    // ── Error ─────────────────────────────────────────────────────────────
    if (fetchError) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showHeader && <HeroBanner />}
            <div style={{ ...heroCardStyle, padding: '32px 20px', textAlign: 'center' }}>
                <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.7, color: colors.g1 }} />
                <p style={{ fontWeight: 600, marginBottom: '4px', color: colors.g1 }}>Could not load reports</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.7, color: colors.g2 }}>{fetchError}</p>
            </div>
        </div>
    );

    // ── Empty State ───────────────────────────────────────────────────────
    if (reports.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showHeader && <HeroBanner />}
            <UploadCard />
            <div style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.4s ease 0.1s' }}>
                <div style={{ ...heroCardStyle, padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <ClipboardList size={40} strokeWidth={1.5} style={{ color: colors.g3, opacity: 0.75 }} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.g1, margin: 0 }}>No reports yet</h2>
                    <p style={{ fontSize: '0.9rem', color: colors.g2, lineHeight: 1.6, maxWidth: '240px', margin: 0, opacity: 0.85 }}>
                        Upload your lab reports to track your health progress.
                    </p>
                    <button
                        onClick={onUpload}
                        style={{
                            marginTop: '4px', padding: '11px 22px',
                            background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontWeight: 600, fontSize: '0.9rem',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(45,106,79,0.25)',
                        }}
                    >
                        <Plus size={16} /> Upload your first report
                    </button>
                </div>
            </div>
        </div>
    );

    // ── List ──────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {showHeader && <HeroBanner />}
            <UploadCard />

            {/* Section Label */}
            <div style={{ padding: '0 4px 8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4 }}>YOUR REPORTS</div>

            {/* Report Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reports.map((report, idx) => (
                    <div
                        key={report.upload_id || report.report_id}
                        className="animate-slide-up"
                        style={{ 
                            animationDelay: `${0.05 + idx * 0.07}s`,
                            opacity: 0
                        }}
                    >
                        <div
                            onClick={() => onSelect(report)}
                            className="action-card hero-card"
                            style={{
                                ...heroCardStyle,
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: '14px', padding: '15px 16px',
                            }}
                        >
                            {/* Content layer */}
                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                {/* File Icon */}
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(64,145,108,0.15), rgba(116,198,157,0.08))',
                                    border: '1px solid rgba(82,183,136,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <FileText size={22} color={colors.g3} />
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600,
                                        color: colors.g1, marginBottom: '4px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {report.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: colors.g4, fontWeight: 500 }}>{report.date}</span>
                                        <StatusBadge status={report.status} />
                                    </div>
                                </div>

                                {/* Arrow Button */}
                                <button style={{
                                    height: '34px', width: '34px', borderRadius: '11px',
                                    background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                                    color: 'white', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,106,79,0.2)', flexShrink: 0,
                                }}>
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload More Row */}
            <div
                className="animate-slide-up"
                style={{
                    marginTop: '10px',
                    animationDelay: `${0.05 + reports.length * 0.07}s`,
                    opacity: 0
                }}
            >
                <div
                    onClick={onUpload}
                    className="action-card hero-card"
                    style={{ ...heroCardStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 16px' }}
                >
                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(27,67,50,0.1), rgba(45,106,79,0.06))',
                            border: '1px solid rgba(45,106,79,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Plus size={22} color={colors.g2} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1 }}>Upload New Report</div>
                            <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Add another report to your records</div>
                        </div>
                        <button style={{
                            height: '34px', borderRadius: '11px',
                            background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                            color: 'white', border: 'none', padding: '0 12px',
                            fontSize: '11px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '4px',
                            cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,106,79,0.2)',
                        }}>
                            Upload <Upload size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReportList;
