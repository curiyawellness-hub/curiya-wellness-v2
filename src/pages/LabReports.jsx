import React, { useState, useEffect } from 'react';
import ReportList from '../components/features/reports/ReportList';
import ReportAnalytics from '../components/features/reports/ReportAnalytics';
import ReportViewer from '../components/features/reports/ReportViewer';
import ReportUpload from '../components/features/reports/ReportUpload';
import { ChevronLeft, FileText } from 'lucide-react';
import HeroBanner from '../components/ui/HeroBanner';
import { useAuth } from '../services/AuthContext';

const REPORTS_ENDPOINT = 'https://n8n.curiyawellness.com/webhook/patient-reports';

const LabReports = ({ onBack, flags }) => {
    const { patientData, getValidToken } = useAuth();

    // Debug: log the full patientData object to find the correct patient ID field
    console.log('🔍 patientData keys:', patientData ? Object.keys(patientData) : 'null');
    console.log('🔍 patientData full:', patientData);

    // Backend may return patient_id, id, Patient_ID, patientId — try all common variants
    const patientId = patientData?.patient_id
        || patientData?.id
        || patientData?.patientId
        || patientData?.Patient_ID
        || patientData?.patient_ID;

    console.log('🔍 Resolved patientId:', patientId);

    const [view, setView] = useState('list'); // list, detail, upload
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const colors = {
        g1: '#1B4332',
        g2: '#2D6A4F',
        g3: '#40916C',
        g4: '#52B788',
        g5: '#74C69D',
        g6: '#B7E4C7',
    };

    // Fetch fresh reports every time the list view is shown
    useEffect(() => {
        if (view !== 'list') return;

        // If patientData not loaded yet, wait — but don't stay stuck forever
        if (!patientData) return; // Still loading auth

        // patientData loaded but no patient_id found — stop loading, show error
        if (!patientId) {
            setIsLoading(false);
            setFetchError(`Could not identify patient. Available fields: ${patientData ? Object.keys(patientData).join(', ') : 'none'}`);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setFetchError(null);

        console.log('📋 Fetching reports for patient_id:', patientId);

        fetch(`${REPORTS_ENDPOINT}?patient_id=${encodeURIComponent(patientId)}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                // Read as text first — an empty body causes res.json() to throw
                return res.text();
            })
            .then(text => {
                if (cancelled) return;

                // Empty body = no reports yet, show empty state
                if (!text || !text.trim()) {
                    setReports([]);
                    return;
                }
                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    // Unparseable body — treat as no reports
                    setReports([]);
                    return;
                }
                console.log('📋 Reports response:', data);

                let raw = [];
                if (Array.isArray(data)) {
                    raw = data;
                } else if (data && Array.isArray(data.data)) {
                    raw = data.data;
                } else if (data && Array.isArray(data.reports)) {
                    raw = data.reports;
                } else if (data && Array.isArray(data.items)) {
                    raw = data.items;
                } else if (data && Array.isArray(data.results)) {
                    raw = data.results;
                } else if (data && typeof data === 'object' && (data.report_id || data.upload_id || data.file_name)) {
                    raw = [data];
                }
                console.log('📋 Parsed raw reports count:', raw.length);

                const normalised = raw
                    .filter(r => r && (r.report_id || r.upload_id || r.file_name))
                    .map(r => ({
                        upload_id: r.upload_id || r.report_id,
                        report_id: r.report_id || r.id || r.upload_id,
                        title: r.file_name || r.title || 'Untitled Report',
                        date: r.uploaded_at
                            ? new Date(r.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—',
                        uploaded_at: r.uploaded_at,
                        status: r.processed ? 'Ready' : 'Processing',
                        processed: r.processed,
                        file_name: r.file_name,
                    }));

                normalised.sort((a, b) => {
                    const dateA = a.uploaded_at ? new Date(a.uploaded_at) : 0;
                    const dateB = b.uploaded_at ? new Date(b.uploaded_at) : 0;
                    return dateB - dateA;
                });

                setReports(normalised);
            })
            .catch(err => {
                if (!cancelled) {
                    console.error('❌ Fetch error:', err);
                    setFetchError(err.message || 'Failed to load reports.');
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [view, patientId, patientData]);

    const handleSelectReport = (report) => {
        setSelectedReport(report);
        setView('detail');
    };

    const handleDeleteReport = async (reportId) => {
        try {
            // Get valid token for authentication
            const token = await getValidToken();

            // Using the new delete endpoint provided by the user with the idToken in the Authorization header
            const response = await fetch(`https://n8n.curiyawellness.com/webhook/patient/report/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    report_id: reportId
                })
            });
            if (response.ok) {
                // Remove from local state
                setReports(prev => prev.filter(r => r.report_id !== reportId));
                setView('list');
                setSelectedReport(null);
            } else {
                alert('Failed to delete report. Please try again.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the report.');
        }
    };

    const renderHeroBanner = (reportCount = null, isLoadingCount = false) => (
        <HeroBanner
            title="Lab Reports"
            label="WELLNESS TRACKING"
            onBack={onBack}
            backText="Back to Protocol"
            badge={isLoadingCount ? "– –" : `${reportCount || 0} Report${reportCount === 1 ? '' : 's'}`}
        />
    );

    const renderView = () => {
        switch (view) {
            case 'detail':
                return (
                    <ReportAnalytics
                        report={selectedReport}
                        onBack={() => setView('list')}
                        onDelete={handleDeleteReport}
                    />
                );
            case 'upload':
                return (
                    <ReportUpload
                        onBack={() => setView('list')}
                        onSuccess={() => setView('list')}
                    />
                );
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {renderHeroBanner(reports.length, isLoading)}
                        <ReportList
                            reports={reports}
                            isLoading={isLoading}
                            fetchError={fetchError}
                            onSelect={handleSelectReport}
                            onUpload={() => setView('upload')}
                            onBack={null} // Hero handles back button
                            showHeader={false}
                        />
                        {!isLoading && reports.length === 0 && !fetchError && (
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.4)',
                                textAlign: 'center',
                                marginTop: '12px'
                            }}>
                                Fetched for ID: {patientId}
                            </p>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="reports-container">
            {renderView()}
        </div>
    );
};

export default LabReports;
