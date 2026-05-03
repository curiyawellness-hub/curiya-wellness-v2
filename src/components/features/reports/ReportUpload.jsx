import React, { useState } from 'react';
import Card from '../../ui/Card';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { useAuth } from '../../../services/AuthContext';

const ReportUpload = ({ onBack, onSuccess }) => {
    const { user, getValidToken } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && (selected.type === 'application/pdf' || selected.type.startsWith('image/'))) {
            setFile(selected);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !user?.idToken) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Get a valid token (will refresh if expired)
            const validToken = await getValidToken();

            const formData = new FormData();
            formData.append('file', file);
            // MANDATORY: Add metadata fields as form-data (NOT in headers or JSON)
            formData.append('uploaded_by', 'patient');
            formData.append('source', 'webapp');
            // Optional: formData.append('report_context', 'lab_report');

            console.log('📤 Upload Request Details:');
            console.log('  Endpoint:', 'https://n8n.curiyawellness.com/webhook/patient/report/upload');
            console.log('  File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            console.log('  Form-Data Fields:');
            console.log('    - file:', file.name);
            console.log('    - uploaded_by: patient');
            console.log('    - source: webapp');
            console.log('  Authorization: Bearer <token>');

            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setComplete(true);
                    setUploading(false);

                    // Construct a temporary report object or use server response
                    // Optimistic UI update
                    const newReport = {
                        id: Date.now().toString(),
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                        report_date: new Date().toISOString().split('T')[0],
                        status: 'Processing', // Backend will process it
                        type: file.type === 'application/pdf' ? 'document' : 'scan', // Guess type
                        documentType: 'Uploaded'
                    };

                    setTimeout(() => onSuccess(newReport), 1500);
                } else {
                    setUploading(false);
                    setError('Upload failed. Please try again.');
                    console.error('Upload failed:', xhr.status, xhr.responseText);
                }
            };

            xhr.onerror = () => {
                setUploading(false);
                setError('Connection error. Please check your internet.');
                console.error('Upload network error');
            };

            xhr.open('POST', 'https://n8n.curiyawellness.com/webhook/patient/report/upload');
            xhr.setRequestHeader('Authorization', `Bearer ${validToken}`);
            xhr.send(formData);

        } catch (e) {
            setUploading(false);
            setError(`Upload preparation failed: ${e.message}`);
            console.error('Upload preparation error:', e);
        }
    };



    return (
        <Card title="Upload Lab Report">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>


                {!complete ? (
                    <>
                        <div
                            style={{
                                border: error ? '2px dashed #EF4444' : '2px dashed rgba(45, 94, 68, 0.2)',
                                borderRadius: '16px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                background: error ? '#FEF2F2' : 'rgba(45, 94, 68, 0.05)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                hidden
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <div className="glass-bubble" style={{ width: '56px', height: '56px', margin: '0 auto 16px', background: 'white' }}>
                                <Upload size={24} color="#2D5E44" />
                            </div>
                            {file ? (
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{file.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
                                        Tap to select report
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                                        PDF or Images (Max 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '0.9rem', padding: '0 4px' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {uploading && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
                                    <span>Uploading secure file...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: '#2D5E44', transition: 'width 0.1s linear' }} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button
                                variant="danger"
                                style={{ flex: 1 }}
                                onClick={onBack}
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                style={{ flex: 2 }}
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? 'Processing...' : 'Upload Report'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: '#2E7D32', marginBottom: '16px' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
                            Upload Successful
                        </h2>
                        <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
                            Your report has been securely sent for processing.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ReportUpload;
