import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Eye, Download, Trash2, FileText, Clock } from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import MarkerCard from '../../ui/MarkerCard';

const RESULTS_CHECK_ENDPOINT = 'https://n8n.curiyawellness.com/webhook/patient/report/results';

const colors = {
    g1: '#1B4332',
    g2: '#2D6A4F',
    g3: '#40916C',
    g4: '#52B788',
};

const glass = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    border: 'var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
    borderRadius: '24px',
};

const ReportAnalytics = ({ report, onBack, onDelete }) => {
    const { getValidToken } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [results, setResults] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState(null);
    const [localStatus, setLocalStatus] = useState(report?.status || 'Processing');

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    const checkResults = useCallback(async (isPolling = false) => {
        if (!report?.report_id && !report?.upload_id) return;
        
        if (!isPolling) setIsChecking(true);
        setCheckError(null);

        try {
            const reportId = report.report_id || report.upload_id;
            const url = `${RESULTS_CHECK_ENDPOINT}?report_id=${encodeURIComponent(reportId)}`;
            
            const response = await fetch(url, {
                method: 'GET'
            });

            if (!response.ok) throw new Error(`Check failed: ${response.status}`);
            
            const data = await response.json();
            console.log('🔍 Results check response:', data);

            // Webhook returns success: true, overall_summary, markers
            const isProcessed = data.success === true || data.processed === true || data.status === 'Ready' || data.status === 'processed' || !!data.markers || !!data.results;
            
            if (isProcessed) {
                setResults(data);
                setLocalStatus('Ready');
                setIsChecking(false);
            } else if (isPolling) {
                // Continue polling if still processing and we are in polling mode
                return false;
            } else {
                setLocalStatus('Processing');
                setIsChecking(false);
            }
            return isProcessed;
        } catch (error) { // Modified catch block
            console.error('Error checking report results:', error);
            setCheckError(error.message);
            // Stop polling on terminal error
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
            return false;
        }
    }, [report, getValidToken]);

    // Initial check for processing reports (single check, no polling)
    useEffect(() => {
        let isSubscribed = true;

        const startChecking = async () => {
            if (isSubscribed) {
                await checkResults();
            }
        };

        startChecking();

        return () => {
            isSubscribed = false;
        };
    }, [checkResults]);

    if (!report) return null;

    const { title, date, upload_id, report_id } = report;
    const isProcessing = localStatus === 'Processing';

    return (
        <div style={{ paddingBottom: '40px' }}>

            {/* ── Hero Banner ───────────────────────────────────────────── */}
            <div style={{
                ...glass,
                minHeight: '165px',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '16px',
            }}>
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', width: '200px', height: '200px', top: '-60px', right: '-60px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)' }} />
                <div style={{ position: 'absolute', width: '130px', height: '130px', top: '-15px', right: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.06)' }} />
                <div style={{ position: 'absolute', width: '80px', height: '80px', bottom: '-15px', left: '-15px', borderRadius: '50%', border: '1px solid rgba(27,67,50,0.08)' }} />

                <div style={{ position: 'relative', zIndex: 2, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Back button */}
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
                        Back to Reports
                    </button>

                    {/* File icon + Title */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '15px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 3px 10px rgba(45,106,79,0.2)',
                        }}>
                            <FileText size={20} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(27,67,50,0.45)', marginBottom: '4px' }}>
                                LAB REPORT
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700,
                                color: colors.g1, lineHeight: 1.3, wordBreak: 'break-all'
                            }}>
                                {title}
                            </div>
                        </div>
                    </div>

                    {/* Date + Status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={12} color={colors.g4} />
                            <span style={{ fontSize: '12px', color: colors.g4, fontWeight: 500 }}>{date}</span>
                        </div>
                        <span style={{
                            padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: isProcessing ? 'rgba(239,108,0,0.12)' : 'rgba(46,125,50,0.12)',
                            color: isProcessing ? '#EF6C00' : '#2E7D32',
                            border: isProcessing ? '1px solid rgba(239,108,0,0.2)' : '1px solid rgba(46,125,50,0.2)',
                        }}>
                            {localStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Results / Processing Section ──────────────────────────── */}
            <div style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.4s ease 0.1s',
                marginBottom: '20px'
            }}>
                {isChecking ? (
                    <div style={{ ...glass, padding: '24px', textAlign: 'center' }}>
                        <div className="pulse-loader" style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            background: colors.g4, margin: '0 auto 12px', opacity: 0.6 
                        }} />
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: colors.g1 }}>Checking for results...</div>
                    </div>
                ) : results ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* unified Glassy Report Summary Card */}
                        <div style={{ 
                            ...glass,
                            padding: '24px 20px',
                            marginBottom: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                         }}>
                            {/* Decorative background pulse/glow */}
                            <div style={{
                                position: 'absolute',
                                top: '-60px',
                                right: '-60px',
                                width: '180px',
                                height: '180px',
                                background: 'radial-gradient(circle, rgba(74, 222, 128, 0.08) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* Header with Type and Ready Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{
                                        background: 'rgba(27, 67, 50, 0.05)',
                                        borderRadius: '100px',
                                        padding: '6px 14px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: colors.g1,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        border: '1px solid rgba(27, 67, 50, 0.05)',
                                        fontFamily: 'var(--font-body)'
                                    }}>
                                        {results.report_type || "Lab Report"}
                                    </div>
                                    <div style={{
                                        background: 'rgba(74, 222, 128, 0.15)',
                                        borderRadius: '100px',
                                        padding: '6px 14px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        color: '#1B4332',
                                        letterSpacing: '0.08em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        border: '1px solid rgba(74, 222, 128, 0.2)',
                                        fontFamily: 'var(--font-body)'
                                    }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
                                        READY
                                    </div>
                                </div>

                                {/* Stat Grid */}
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(4, 1fr)', 
                                    gap: '10px' 
                                }}>
                                    {[
                                        { label: 'TOTAL', val: results.markers?.length || 0, color: '#1B4332', tint: 'rgba(27, 67, 50, 0.03)' },
                                        { label: 'OPTIMAL', val: results.markers?.filter(m => (m.status||'').toLowerCase().includes('optimal') || (m.status||'').toLowerCase().includes('normal')).length, color: '#16A34A', tint: 'rgba(22, 163, 74, 0.05)' },
                                        { label: 'HIGH', val: results.markers?.filter(m => (m.status||'').toLowerCase().includes('high')).length, color: '#D97706', tint: 'rgba(217, 119, 6, 0.05)' },
                                        { label: 'LOW', val: results.markers?.filter(m => (m.status||'').toLowerCase().includes('low')).length, color: '#2563EB', tint: 'rgba(37, 99, 235, 0.05)' }
                                    ].map((stat, i) => (
                                        <div key={i} style={{
                                            ...glass,
                                            padding: '12px 6px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: `linear-gradient(180deg, rgba(255,255,255,0.05), ${stat.tint})`,
                                            borderRadius: '20px',
                                        }}>
                                            <div style={{
                                                fontSize: '22px',
                                                fontWeight: 600,
                                                color: stat.color,
                                                fontFamily: 'monospace',
                                                lineHeight: 1
                                            }}>
                                                {stat.val}
                                            </div>
                                            <div style={{
                                                fontSize: '8px',
                                                fontWeight: 800,
                                                color: 'rgba(27, 67, 50, 0.4)',
                                                letterSpacing: '0.08em',
                                                fontFamily: 'var(--font-body)'
                                            }}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Text/Interpretation */}
                        {(results.overall_summary || results.summary) && (
                            <div style={{ 
                                ...glass, 
                                padding: '24px', 
                                marginBottom: '28px',
                             }}>
                                <div style={{ 
                                    padding: '0 0 16px', 
                                    fontSize: '11px', 
                                    fontWeight: 700, 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.12em', 
                                    color: colors.g2,
                                    fontFamily: 'var(--font-body)'
                                 }}>
                                    ANALYSIS SUMMARY
                                </div>
                                <div style={{ 
                                    fontSize: '14.5px', 
                                    color: colors.g1, 
                                    lineHeight: 1.7, 
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-body)',
                                    opacity: 0.95
                                 }}>
                                    {results.overall_summary || results.summary}
                                </div>
                            </div>
                        )}

                        {/* Render Markers if available */}
                        {Array.isArray(results.markers) && results.markers.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ 
                                    padding: '0 4px 8px', 
                                    fontSize: '11px', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.12em', 
                                    color: colors.g1,
                                    fontFamily: 'var(--font-body)',
                                    opacity: 0.8
                                 }}>
                                    YOUR BIOMARKERS
                                </div>
                                {results.markers.map((marker, idx) => (
                                    <MarkerCard 
                                        key={idx}
                                        label={marker.marker_name || marker.label || marker.name}
                                        value={marker.value}
                                        unit={marker.unit}
                                        referenceMin={marker.normal_min || marker.referenceMin || marker.min}
                                        referenceMax={marker.normal_max || marker.referenceMax || marker.max}
                                        status={marker.status}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : isProcessing ? (
                    <div style={{
                        ...glass,
                        padding: '14px 16px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '11px', flexShrink: 0,
                                background: 'linear-gradient(135deg, rgba(239,108,0,0.2), rgba(239,108,0,0.1))',
                                border: '1px solid rgba(239,108,0,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Clock size={15} color="#EF6C00" />
                            </div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: colors.g1 }}>Processing in progress</div>
                        </div>
                        <div style={{ height: '1px', background: 'rgba(82,183,136,0.15)', marginBottom: '8px' }} />
                        <div style={{ fontSize: '12.5px', color: colors.g2, lineHeight: 1.6 }}>
                            Your report is being analyzed by our AI system. This usually takes a few minutes. We'll update this page automatically once the results are ready.
                        </div>
                        {checkError && (
                            <div style={{ marginTop: '10px', fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>
                                {checkError}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* ── Section Label ─────────────────────────────────────────── */}
            <div style={{ padding: '0 4px 8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.g4 }}>
                ORIGINAL DOCUMENTS
            </div>

            {/* ── Action Cards (View + Download) ────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>

                {/* View Original File */}
                <div
                    className="action-card"
                    style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.4s ease 0.1s' }}
                >
                    <a
                        href={`https://n8n.curiyawellness.com/webhook/files?upload_id=${upload_id}&type=view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', display: 'block' }}
                    >
                        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: `linear-gradient(135deg, rgba(64,145,108,0.15), rgba(116,198,157,0.08))`,
                                border: '1px solid rgba(82,183,136,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Eye size={22} color={colors.g3} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1 }}>View Original File</div>
                                <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Open and read your full report</div>
                            </div>
                            <button style={{
                                height: '34px', padding: '0 14px', borderRadius: '11px',
                                background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                                color: 'white', border: 'none', fontSize: '12px', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '4px',
                                cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,106,79,0.2)',
                                whiteSpace: 'nowrap', flexShrink: 0,
                            }}>
                                Open →
                            </button>
                        </div>
                    </a>
                </div>

                {/* Download Original File */}
                <div
                    className="action-card"
                    style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.4s ease 0.17s' }}
                >
                    <a
                        href={`https://n8n.curiyawellness.com/webhook/files?upload_id=${upload_id}&type=download`}
                        style={{ textDecoration: 'none', display: 'block' }}
                    >
                        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: `linear-gradient(135deg, rgba(64,145,108,0.15), rgba(116,198,157,0.08))`,
                                border: '1px solid rgba(82,183,136,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Download size={22} color={colors.g3} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: colors.g1 }}>Download Report</div>
                                <div style={{ fontSize: '11px', color: colors.g4, marginTop: '2px', fontWeight: 500 }}>Save a copy to your device</div>
                            </div>
                            <button style={{
                                height: '34px', padding: '0 14px', borderRadius: '11px',
                                background: `linear-gradient(135deg, ${colors.g3}, ${colors.g2})`,
                                color: 'white', border: 'none', fontSize: '12px', fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '4px',
                                cursor: 'pointer', boxShadow: '0 3px 10px rgba(45,106,79,0.2)',
                                whiteSpace: 'nowrap', flexShrink: 0,
                            }}>
                                Save →
                            </button>
                        </div>
                    </a>
                </div>
            </div>

            {/* ── Delete Row ────────────────────────────────────────────── */}
            <div style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.4s ease 0.24s',
            }}>
                <button
                    className="delete-btn"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                            onDelete(report_id || upload_id);
                        }
                    }}
                    style={{
                        width: '100%', padding: '14px 16px', borderRadius: '20px',
                        border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.06)',
                        color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                    }}
                >
                    <Trash2 size={16} />
                    Delete Report
                </button>
            </div>

            <style>{`
                .action-card:hover > a > div,
                .action-card:hover > div { transform: translateY(-3px) !important; box-shadow: 0 12px 30px rgba(27,67,50,0.15) !important; }
                .action-card:active > a > div,
                .action-card:active > div { transform: scale(0.98) !important; }
                .delete-btn:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.35) !important; transform: translateY(-2px); }
                .delete-btn:active { transform: translateY(0); }
                .pulse-loader { animation: pulse 1.5s ease-in-out infinite; }
                @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(0.9); opacity: 0.3; } }
            `}</style>
        </div>
    );
};

export default ReportAnalytics;
