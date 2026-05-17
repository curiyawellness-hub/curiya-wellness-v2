import React, { useState, useEffect, useMemo } from 'react';
import ReportList from '../components/features/reports/ReportList';
import ReportAnalytics from '../components/features/reports/ReportAnalytics';
import ReportUpload from '../components/features/reports/ReportUpload';
import HeroBanner from '../components/ui/HeroBanner';
import { useAuth } from '../services/AuthContext';
import {
    fetchFromPatientWebhook,
    resolvePatientIdentity
} from '../services/patientApi';

const LabReports = ({ onBack }) => {
    const auth = useAuth();
    const { user, patientData, getValidToken } = auth;
    
    const identity = useMemo(() => resolvePatientIdentity(patientData, user), [patientData, user]);
    const patientId = identity.patientId;

    const [view, setView] = useState('list');
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        if (view !== 'list') return undefined;
        if (!patientData) return undefined;

        if (!identity.patientId && !identity.email) {
            setIsLoading(false);
            setFetchError('Could not identify the authenticated patient for reports.');
            return undefined;
        }

        let cancelled = false;

        const fetchReports = async (isSilent = false) => {
            if (!isSilent) setIsLoading(true);
            setFetchError(null);

            try {
                const data = await fetchFromPatientWebhook('patient-reports', auth);
                if (cancelled) return;

                let raw = [];
                if (Array.isArray(data)) raw = data;
                else if (Array.isArray(data?.data)) raw = data.data;
                else if (Array.isArray(data?.reports)) raw = data.reports;
                else if (Array.isArray(data?.items)) raw = data.items;
                else if (Array.isArray(data?.results)) raw = data.results;
                else if (data && typeof data === 'object' && (data.report_id || data.upload_id || data.file_name)) raw = [data];

                const normalised = raw
                    .filter((report) => report && (report.report_id || report.upload_id || report.file_name))
                    .map((report) => ({
                        upload_id: report.upload_id || report.report_id,
                        report_id: report.report_id || report.id || report.upload_id,
                        title: report.file_name || report.title || 'Untitled Report',
                        date: report.uploaded_at
                            ? new Date(report.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '--',
                        uploaded_at: report.uploaded_at,
                        status: report.processed ? 'Ready' : 'Processing',
                        processed: report.processed,
                        file_name: report.file_name
                    }))
                    .sort((a, b) => {
                        const dateA = a.uploaded_at ? new Date(a.uploaded_at) : 0;
                        const dateB = b.uploaded_at ? new Date(b.uploaded_at) : 0;
                        return dateB - dateA;
                    });

                if (!cancelled) {
                    setReports(normalised);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Report fetch failed:', error);
                    setFetchError(error.message || 'Failed to load reports.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchReports();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchReports(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [identity.email, identity.patientId, view]);

    const handleSelectReport = (report) => {
        setSelectedReport(report);
        setView('detail');
    };

    const handleDeleteReport = async (reportId) => {
        try {
            await fetchFromPatientWebhook('patient/report/delete', auth, {
                method: 'DELETE',
                bodyExtras: { report_id: reportId }
            });

            setReports((previousReports) => previousReports.filter((report) => report.report_id !== reportId));
            setView('list');
            setSelectedReport(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.message || 'An error occurred while deleting the report.');
        }
    };

    const renderHeroBanner = (reportCount = null, isLoadingCount = false) => (
        <HeroBanner
            title="Lab Reports"
            label="WELLNESS TRACKING"
            onBack={onBack}
            backText="Back to Protocol"
            badge={isLoadingCount ? '--' : `${reportCount || 0} Report${reportCount === 1 ? '' : 's'}`}
        />
    );

    if (view === 'detail') {
        return (
            <div className="reports-container">
                <ReportAnalytics
                    report={selectedReport}
                    onBack={() => setView('list')}
                    onDelete={handleDeleteReport}
                />
            </div>
        );
    }

    if (view === 'upload') {
        return (
            <div className="reports-container">
                <ReportUpload
                    onBack={() => setView('list')}
                    onSuccess={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="reports-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {renderHeroBanner(reports.length, isLoading)}
                <ReportList
                    reports={reports}
                    isLoading={isLoading}
                    fetchError={fetchError}
                    onSelect={handleSelectReport}
                    onUpload={() => setView('upload')}
                    onBack={null}
                    showHeader={false}
                />
                {/* Removed Fetched for ID watermark */}
            </div>
        </div>
    );
};

export default LabReports;
