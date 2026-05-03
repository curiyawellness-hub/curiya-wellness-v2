import React from 'react';
import { Leaf } from 'lucide-react';

const getMarkerStatusConfig = (status, value, min, max) => {
    let resolvedStatus = status;
    
    if (!resolvedStatus && min != null && max != null) {
        if (value < min) resolvedStatus = 'Low';
        else if (value > max) resolvedStatus = 'High';
        else resolvedStatus = 'Optimal';
    }

    const s = (resolvedStatus || '').toLowerCase();
    
    if (s === 'optimal' || s === 'normal') {
        return {
            color: '#16a34a',
            bgColor: '#dcfce7',
            label: 'OPTIMAL',
            family: 'green'
        };
    }
    if (s === 'low' || s === 'very low' || s === 'too low') {
        return {
            color: '#2563eb',
            bgColor: '#dbeafe',
            label: resolvedStatus.toUpperCase(),
            family: 'blue'
        };
    }
    if (s === 'high' || s === 'very high' || s === 'too high') {
        return {
            color: '#d97706',
            bgColor: '#fef3c7',
            label: resolvedStatus.toUpperCase(),
            family: 'amber'
        };
    }

    return {
        color: '#4b5563',
        bgColor: '#f3f4f6',
        label: resolvedStatus ? resolvedStatus.toUpperCase() : 'UNKNOWN',
        family: 'neutral'
    };
};

const MarkerCard = ({ 
    label, 
    value, 
    unit, 
    referenceMin, 
    referenceMax, 
    status 
}) => {
    const numValue = parseFloat(value) || 0;
    const numMin = parseFloat(referenceMin);
    const numMax = parseFloat(referenceMax);
    
    const hasRange = referenceMin !== undefined && referenceMax !== undefined && 
                     referenceMin !== null && referenceMax !== null &&
                     !isNaN(numMin) && !isNaN(numMax);
    const config = getMarkerStatusConfig(status, numValue, numMin, numMax);

    let trackMin = 0;
    let trackMax = 100;
    let greenZoneStartPct = 0;
    let greenZoneWidthPct = 0;
    let dotPositionPct = 0;

    if (hasRange) {
        const rangeSpan = numMax - numMin;
        trackMin = Math.max(0, numMin - rangeSpan);
        trackMax = numMax + rangeSpan;
        
        const totalTrackRange = trackMax - trackMin;

        if (totalTrackRange > 0) {
            const startPct = ((numMin - trackMin) / totalTrackRange) * 100;
            const endPct = ((numMax - trackMin) / totalTrackRange) * 100;
            greenZoneStartPct = Math.max(0, Math.min(100, startPct));
            greenZoneWidthPct = Math.max(0, Math.min(100 - greenZoneStartPct, endPct - startPct));
            
            let rawDotPct = ((numValue - trackMin) / totalTrackRange) * 100;
            if (numValue > trackMax) rawDotPct = 96;
            else if (numValue < trackMin) rawDotPct = 4;
            else rawDotPct = Math.max(4, Math.min(96, rawDotPct));
            
            dotPositionPct = rawDotPct;
        }
    }

    const tagPositionPct = Math.max(10, Math.min(90, dotPositionPct));

    return (
        <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: '24px',
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: '#0f2314', 
                    margin: 0,
                    paddingRight: '12px',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em'
                }}>
                    {label}
                </h3>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: config.bgColor,
                    padding: '3px 8px',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(0,0,0,0.03)'
                }}>
                    <div style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: config.color
                    }} />
                    <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: config.color,
                        letterSpacing: '0.04em'
                    }}>
                        {config.label}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: hasRange ? '2px' : '0' }}>
                <span style={{
                    fontFamily: 'monospace',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#0f2314',
                    lineHeight: 1,
                    letterSpacing: '-0.02em'
                }}>
                    {value}
                </span>
                {unit && (
                    <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: '#7a8c7c',
                        fontWeight: 500,
                        opacity: 0.7
                    }}>
                        {unit}
                    </span>
                )}
            </div>

            <div style={{ 
                height: '1px', 
                backgroundColor: 'rgba(0,0,0,0.04)', 
                width: '100%',
                margin: '0 0 2px 0'
            }} />

            {hasRange && (
                <div style={{ position: 'relative', paddingBottom: '20px', paddingTop: '22px' }}>
                    <div style={{
                        position: 'absolute',
                        left: `${tagPositionPct}%`,
                        top: 0,
                        transform: 'translateX(-50%)',
                        backgroundColor: config.color,
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}>
                        {value}
                        <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0, 
                            height: 0, 
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: `4px solid ${config.color}`,
                        }} />
                    </div>

                    <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#e2ebe3',
                        borderRadius: '100px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: `${greenZoneStartPct}%`,
                            width: `${greenZoneWidthPct}%`,
                            height: '100%',
                            backgroundColor: '#4ade80',
                            borderRadius: '100px'
                        }} />

                        <div style={{
                            position: 'absolute',
                            left: `${dotPositionPct}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '14px',
                            height: '14px',
                            backgroundColor: config.color,
                            borderRadius: '50%',
                            border: '3px solid #ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            zIndex: 5
                        }} />
                    </div>

                    <div style={{
                        width: '100%',
                        bottom: 0,
                        display: 'flex',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#9ca3af',
                        fontWeight: 600
                    }}>
                        <span style={{ position: 'absolute', left: 0 }}>{Math.round(trackMin)}</span>
                        <span style={{ 
                            position: 'absolute', 
                            left: `${greenZoneStartPct}%`, 
                            transform: 'translateX(-50%)',
                            color: '#16a34a',
                            fontWeight: 700
                        }}>{referenceMin}</span>
                        <span style={{ 
                            position: 'absolute', 
                            left: `${greenZoneStartPct + greenZoneWidthPct}%`, 
                            transform: 'translateX(-50%)',
                            color: '#16a34a',
                            fontWeight: 700
                        }}>{referenceMax}</span>
                        <span style={{ position: 'absolute', right: 0 }}>{Math.round(trackMax)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarkerCard;
