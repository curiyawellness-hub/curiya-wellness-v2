import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { MapPin, Phone, User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../../services/AuthContext';

const InputField = ({ label, icon: Icon, ...props }) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={{
            display: 'block',
            fontSize: '0.8rem',
            color: 'var(--color-primary-dark)',
            marginBottom: '6px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            opacity: 0.8
        }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            {Icon && (
                <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.7
                }}>
                    <Icon size={18} />
                </div>
            )}
            <input
                style={{
                    width: '100%',
                    padding: Icon ? '14px 14px 14px 44px' : '14px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: 'var(--color-primary-dark)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
                className="glass-input"
                {...props}
            />
        </div>
    </div>
);

const AddressForm = ({ onSave, initialData = {} }) => {
    const { user, patientId, refreshData } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        state: initialData.state || '',
        pincode: initialData.pincode || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const body = {
                idToken: user?.idToken, // For verification
                patient_id: patientId,   // MANDATORY: Use internal ID
                delivery_name: formData.fullName,
                delivery_phone: formData.phone,
                delivery_address: formData.address,
                delivery_state: formData.state,
                delivery_pincode: formData.pincode,
                delivery_updated: true
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-delivery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_AUTHORIZATION_SECRET}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update details. Please try again.');
            }

            const result = await response.json().catch(() => ({}));
            // Webhook update-delivery success

            // Give the backend more time to persist the changes in Notion before re-fetching
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Trigger global refresh to pull updated data from backend
            if (refreshData && user?.idToken) {
                await refreshData(true);
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onSave(formData);
            }, 1000);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card title="Delivery Details" className="glass-card" style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit}>
                <InputField
                    label="Full Name"
                    name="fullName"
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Riya Sharma"
                    required
                />
                <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                />
                <InputField
                    label="Full Address"
                    name="address"
                    icon={MapPin}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Flat No, Building, Street"
                    required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            color: 'var(--color-primary-dark)',
                            marginBottom: '6px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            opacity: 0.8
                        }}>
                            State
                        </label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                height: '54px',
                                fontSize: '1rem',
                                color: 'var(--color-primary-dark)',
                                outline: 'none',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232F5E44' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '18px'
                            }}
                            required
                        >
                            <option value="">Select</option>
                            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                            <option value="Assam">Assam</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Chandigarh">Chandigarh</option>
                            <option value="Chhattisgarh">Chhattisgarh</option>
                            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Goa">Goa</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Ladakh">Ladakh</option>
                            <option value="Lakshadweep">Lakshadweep</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Manipur">Manipur</option>
                            <option value="Meghalaya">Meghalaya</option>
                            <option value="Mizoram">Mizoram</option>
                            <option value="Nagaland">Nagaland</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Puducherry">Puducherry</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Sikkim">Sikkim</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Tripura">Tripura</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Uttarakhand">Uttarakhand</option>
                            <option value="West Bengal">West Bengal</option>
                        </select>
                    </div>

                    <InputField
                        label="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="000000"
                        required
                    />
                </div>

                {submitError && (
                    <div style={{
                        color: '#991B1B',
                        fontSize: '0.875rem',
                        marginBottom: '20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        textAlign: 'center'
                    }}>
                        {submitError}
                    </div>
                )}

                {showSuccess && (
                    <div style={{
                        color: '#065F46',
                        fontSize: '0.875rem',
                        marginBottom: '20px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        textAlign: 'center',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        Details updated successfully!
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '16px',
                        fontSize: '15px',
                        fontWeight: 700,
                        borderRadius: '24px',
                        boxShadow: '0 8px 25px rgba(27, 67, 50, 0.25)'
                    }}
                >
                    {isSubmitting ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Loader2 size={24} className="animate-spin" />
                            <span>Updating...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Save size={22} />
                            <span>Save Delivery Details</span>
                        </div>
                    )}
                </Button>
            </form>

            <style>{`
                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.7);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 4px rgba(45, 79, 68, 0.1);
                    transform: translateY(-1px);
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Card>
    );
};

export default AddressForm;
