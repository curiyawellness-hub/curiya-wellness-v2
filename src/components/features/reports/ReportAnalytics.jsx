import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../ui/Card';
import { 
    ChevronLeft, 
    Trash2, 
    Activity, 
    AlertCircle, 
    Clock, 
    Download, 
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    FileText
} from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';
import { 
    fetchFromWebhook,
    resolvePatientIdentity
} from '../../../services/patientApi';
import GlobalShimmer from '../../ui/GlobalShimmer';
import '../../ui/shimmer.css';

const ShimmerLoader = () => (
    <div style={{ padding: '20px' }}>
        <GlobalShimmer type="row" count={1} style={{ width: '40%', marginBottom: '24px' }} />
        <GlobalShimmer type="card" count={3} />
    </div>
);

const ReportAnalytics = ({ report, onBack, onDelete }) => {
    const auth = useAuth();
    const { user, patientData } = auth;
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const reportId = report?.report_id || report?.upload_id;
    const identity = useMemo(() => resolvePatientIdentity(patientData, user, report), [patientData, user, report]);

    const fetchResults = useCallback(async (isSilent = false) => {
        if (!reportId) return;
        if (!isSilent) setIsLoading(true);

        try {
            const data = await fetchFromWebhook('patient/report/results', {
                method: 'GET',
                extras: { report_id: reportId },
                identity: { ...identity, idToken: user?.idToken }
            });

            // Robust unwrapping
            let markers = null;
            if (Array.isArray(data)) {
                markers = data;
            } else if (data && typeof data === 'object') {
                markers = (
                    (Array.isArray(data.results) ? data.results : null) ||
                    (Array.isArray(data.data) ? data.data : null) ||
                    (Array.isArray(data.items) ? data.items : null) ||
                    (Array.isArray(data.markers) ? data.markers : null) ||
                    (data.success && Array.isArray(data.results) ? data.results : null) ||
                    (data.success && Array.isArray(data.data) ? data.data : null)
                );
            }

            if (markers && markers.length > 0) {
                setResults(markers);
                setError(null);
            } else if (data && !data.success && data.status === 'processing') {
                setResults({ status: 'processing' });
            } else if (data?.success) {
                setResults(null);
                if (!isSilent) setError('Report analysis complete, but no markers found.');
            } else {
                setResults(null);
                if (!isSilent) setError('No analysis markers found for this report yet.');
            }
        } catch (err) {
            console.error('Failed to fetch results:', err);
            if (!isSilent) setError('Unable to load report markers.');
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [reportId, identity, user?.idToken]);

    useEffect(() => {
        fetchResults();
        const interval = setInterval(() => {
            if (results?.status === 'processing') fetchResults(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchResults, results?.status]);

    const handleDelete = async () => {
        if (isDeleting) return; // Guard against double-clicks
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                // Use the specific delete webhook
                await fetchFromWebhook('patient/report/delete', {
                    method: 'DELETE',
                    extras: { report_id: reportId },
                    identity: { ...identity, idToken: user?.idToken }
                });
                onDelete(reportId);
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Failed to delete report. Please try again.');
                setIsDeleting(false);
            }
        }
    };

    if (isLoading && !results) return <ShimmerLoader />;

    const isProcessing = results?.status === 'processing';
    
    // Calculate Stats
    const stats = {
        total: Array.isArray(results) ? results.length : 0,
        optimal: Array.isArray(results) ? results.filter(m => m.status?.toLowerCase() === 'optimal' || m.status?.toLowerCase() === 'normal').length : 0,
        high: Array.isArray(results) ? results.filter(m => m.status?.toLowerCase() === 'high').length : 0,
        low: Array.isArray(results) ? results.filter(m => m.status?.toLowerCase() === 'low').length : 0
    };

    const colors = {
        primary: '#1B4332',
        secondary: '#2D6A4F',
        accent: '#40916C',
        normal: '#4ade80',
        high: '#fb923c',
        low: '#ef4444',
        danger: '#ef4444',
        glass: 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.2)'
    };

    const MarkerGauge = ({ value, range, status }) => {
        let min = 0;
        let max = 100;
        let valid = false;

        const rangeStr = String(range || '');
        const numbers = rangeStr.match(/\d+(\.\d+)?/g);

        if (numbers && numbers.length >= 2) {
            min = parseFloat(numbers[0]);
            max = parseFloat(numbers[1]);
            valid = true;
        } else if (numbers && numbers.length === 1) {
            const val = parseFloat(numbers[0]);
            if (rangeStr.includes('>')) { min = val; max = val * 2; }
            else { min = 0; max = val; }
            valid = true;
        }

        const current = parseFloat(value);
        if (isNaN(current) || !valid) return null;

        if (max <= min) max = min + 1;
        
        const rangeDiff = max - min;
        const sliderMin = 0;
        let sliderMax = Math.max(current * 1.2, max + rangeDiff * 0.8);
        sliderMax = Math.ceil(sliderMax);

        const toPercent = (val) => Math.min(Math.max(((val - sliderMin) / (sliderMax - sliderMin)) * 100, 0), 100);
        
        const rangeStartPct = toPercent(min);
        const rangeEndPct = toPercent(max);
        const currentPct = toPercent(current);

        const isOptimal = status?.toLowerCase() === 'optimal' || status?.toLowerCase() === 'normal';
        const isHigh = status?.toLowerCase() === 'high';
        
        const statusColor = isOptimal ? '#059669' : (isHigh ? '#d97706' : '#dc2626'); 
        const trackColor = '#e5e7eb';
        const rangeColor = '#4ade80';
        
        return (
            <div style={{ marginTop: '45px', marginBottom: '10px', position: 'relative', padding: '0 10px' }}>
                <div style={{ position: 'relative', height: '6px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: trackColor, borderRadius: '10px' }} />
                    <div style={{ 
                        position: 'absolute', top: 0, left: `${rangeStartPct}%`, width: `${rangeEndPct - rangeStartPct}%`, height: '6px', background: rangeColor, borderRadius: '10px'
                    }} />
                    <div style={{ 
                        position: 'absolute', top: '3px', left: `${currentPct}%`, transform: 'translate(-50%, -50%)', zIndex: 2,
                    }}>
                        <div style={{
                            position: 'relative', width: '16px', height: '16px', borderRadius: '50%', background: statusColor, border: '3px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{
                                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: statusColor, color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
                            }}>
                                {current}
                                <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `4px solid ${statusColor}` }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', position: 'relative', marginTop: '10px', fontSize: '10px', color: '#9ca3af', fontWeight: 600, fontFamily: 'monospace' }}>
                    <span style={{ position: 'absolute', left: '0', transform: 'translateX(-50%)' }}>{sliderMin}</span>
                    <span style={{ position: 'absolute', left: `${rangeStartPct}%`, transform: 'translateX(-50%)', color: '#059669' }}>{min}</span>
                    <span style={{ position: 'absolute', left: `${rangeEndPct}%`, transform: 'translateX(-50%)', color: '#059669' }}>{max}</span>
                    <span style={{ position: 'absolute', left: '100%', transform: 'translateX(-50%)' }}>{sliderMax}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="report-analytics animate-slide-up" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.04)', border: 'none', padding: '10px 16px', borderRadius: '14px', color: colors.primary, fontWeight: 500, cursor: 'pointer' }}>
                    <ChevronLeft size={18} />
                    Back
                </button>

                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'rgba(239,68,68,0.06)', 
                        border: 'none', 
                        padding: '10px 16px', 
                        borderRadius: '14px', 
                        color: colors.danger, 
                        fontWeight: 600, 
                        fontSize: '13px',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isDeleting ? 0.6 : 1
                    }}
                >
                    <Trash2 size={16} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            {/* Title Card */}
            <Card className="hero-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '52px', height: '52px', background: 'rgba(27,67,50,0.06)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                    <FileText size={26} />
                </div>
                <div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: colors.accent, letterSpacing: '0.12em', marginBottom: '4px', opacity: 0.7 }}>LAB REPORT</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.primary, margin: 0, lineHeight: 1.2 }}>{report?.title}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            <Clock size={12} /> {report?.date}
                        </span>
                        <div style={{ padding: '2px 10px', background: 'rgba(74,222,128,0.12)', color: '#2d6a4f', borderRadius: '20px', fontSize: '10px', fontWeight: 600 }}>Ready</div>
                    </div>
                </div>
            </Card>

            {/* Summary Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {[
                    { label: 'TOTAL', val: stats.total, bg: 'rgba(0,0,0,0.02)', col: colors.primary },
                    { label: 'OPTIMAL', val: stats.optimal, bg: 'rgba(74,222,128,0.06)', col: '#2d6a4f' },
                    { label: 'HIGH', val: stats.high, bg: 'rgba(251,146,60,0.06)', col: '#c2410c' },
                    { label: 'LOW', val: stats.low, bg: 'rgba(239,68,68,0.06)', col: '#b91c1c' }
                ].map((s, i) => (
                    <Card key={i} style={{ padding: '16px 4px', textAlign: 'center', background: s.bg, border: 'none', borderRadius: '18px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 600, color: s.col, marginBottom: '2px' }}>{s.val}</div>
                        <div style={{ fontSize: '9px', fontWeight: 600, color: s.col, opacity: 0.5, letterSpacing: '0.05em' }}>{s.label}</div>
                    </Card>
                ))}
            </div>

            {/* Markers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: colors.accent, letterSpacing: '0.12em', padding: '0 4px', opacity: 0.8 }}>YOUR BIOMARKERS</div>
                
                {isProcessing ? (
                    <Card style={{ padding: '48px', textAlign: 'center' }}>
                        <Activity className="animate-spin" size={32} color={colors.accent} style={{ marginBottom: '16px' }} />
                        <div style={{ fontWeight: 500, color: colors.primary }}>Analyzing Report...</div>
                    </Card>
                ) : Array.isArray(results) ? results.map((marker, idx) => {
                    const isOptimal = marker.status?.toLowerCase() === 'optimal' || marker.status?.toLowerCase() === 'normal';
                    const isHigh = marker.status?.toLowerCase() === 'high';
                    const statusBg = isOptimal ? 'rgba(167, 243, 208, 0.4)' : (isHigh ? 'rgba(253, 230, 138, 0.5)' : 'rgba(254, 202, 202, 0.5)');
                    const statusColor = isOptimal ? '#059669' : (isHigh ? '#d97706' : '#dc2626');

                    return (
                    <Card key={idx} style={{ padding: '20px 24px', borderRadius: '24px', marginBottom: '16px', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: '12px' }}>
                                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', lineHeight: 1.3 }}>{marker.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '32px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{marker.value}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>{marker.unit}</span>
                                </div>
                            </div>
                            <div style={{ 
                                padding: '6px 12px', 
                                background: statusBg,
                                color: statusColor,
                                borderRadius: '20px',
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusColor }} />
                                {marker.status}
                            </div>
                        </div>
                        
                        <MarkerGauge value={marker.value} range={marker.range} status={marker.status} />
                    </Card>
                )}) : (
                    <Card style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{error || 'No markers available.'}</div>
                    </Card>
                )}
            </div>

            {/* Original Documents */}
            <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: colors.accent, letterSpacing: '0.1em', padding: '0 4px', marginBottom: '12px' }}>ORIGINAL DOCUMENTS</div>
                <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondary }}>
                            <Activity size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: colors.primary }}>View Original File</div>
                            <div style={{ fontSize: '11px', color: colors.accent, fontWeight: 500 }}>Open and read your full report</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => report?.url && window.open(report.url, '_blank')}
                        style={{ background: colors.secondary, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        Open <ChevronRight size={16} />
                    </button>
                </Card>
            </div>

            <style>{`
                .animate-spin { animation: spin 3s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ReportAnalytics;
