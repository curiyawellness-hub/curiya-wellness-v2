import React, { useState, useEffect } from 'react';
import AddressForm from '../components/features/profile/AddressForm';
import SavedAddress from '../components/features/profile/SavedAddress';
import HeroBanner from '../components/ui/HeroBanner';
import { useAuth } from '../services/AuthContext';

const Profile = () => {
    const { logout, patientData } = useAuth();
    const [savedData, setSavedData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Initialize savedData from patientData if it exists
    useEffect(() => {
        if (!patientData) return;

        // 1. Find the actual data object (handles nesting and arrays)
        let data = patientData;
        if (Array.isArray(patientData)) data = patientData[0];
        if (data && data.patient) data = data.patient;
        else if (data && data.data) data = data.data;

        if (!data || typeof data !== 'object') return;

        // 2. Exhaustive Search Helper
        const findVal = (term, fallbacks = []) => {
            const keys = Object.keys(data);
            const lowerTerm = term.toLowerCase().replace(/[\s_]/g, '');

            // Priority 1: Exact or Normalized Match
            const match = keys.find(k => k.toLowerCase().replace(/[\s_]/g, '') === lowerTerm);
            if (match && data[match]) return data[match];

            // Priority 2: Contains Match
            const containsMatch = keys.find(k => k.toLowerCase().includes(lowerTerm));
            if (containsMatch && data[containsMatch]) return data[containsMatch];

            // Priority 3: Fallbacks
            for (const f of fallbacks) {
                const fMatch = keys.find(k => k.toLowerCase().replace(/[\s_]/g, '') === f.toLowerCase().replace(/[\s_]/g, ''));
                if (fMatch && data[fMatch]) return data[fMatch];
            }
            return '';
        };

        const mappedData = {
            fullName: findVal('Delivery Name', ['name', 'full_name', 'Patient Name'])?.toString().trim() || '',
            phone: findVal('Delivery Phone', ['phone', 'contact', 'mobile'])?.toString().trim() || '',
            address: findVal('Delivery Address', ['address', 'location'])?.toString().trim() || '',
            state: findVal('Delivery State', ['state', 'province'])?.toString().trim() || '',
            pincode: findVal('Delivery Pincode', ['pincode', 'zip', 'zipcode', 'pin_code'])?.toString().trim() || ''
        };

        const isUpdated = findVal('Delivery Updated') === true || findVal('Delivery Updated') === 'True';
        const hasAddressData = !!(mappedData.address || mappedData.phone || isUpdated);

        setSavedData(mappedData);

        if (!hasInitialized) {
            if (hasAddressData) {
                setIsEditing(false);
            } else {
                setIsEditing(true);
            }
            setHasInitialized(true);
        }
    }, [patientData, hasInitialized]);

    const handleSave = (data) => {
        // Immediately update local state to reflect what the user just saved
        setSavedData(data);
        setIsEditing(false);
    };

    return (
        <div style={{ paddingBottom: '30px' }}>
            <HeroBanner
                title="My Profile"
                label="ACCOUNT SETTINGS"
                backText="Back to Home"
            />

            <div style={{ flex: 1 }}>
                {patientData?.config?.featureFlags?.delivery_enabled === false ? (
                    <div style={{
                        padding: '24px',
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        color: 'var(--color-primary-dark)',
                        border: '1px solid rgba(255, 255, 255, 0.55)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}>
                        <p style={{ opacity: 0.8 }}>Delivery address management is currently unavailable.</p>
                    </div>
                ) : (isEditing || !savedData) ? (
                    <AddressForm onSave={handleSave} initialData={savedData || {}} />
                ) : (
                    <SavedAddress data={savedData} onEdit={() => setIsEditing(true)} />
                )}
            </div>

        </div>
    );
};

export default Profile;
