const N8N_WEBHOOK_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const INTERNAL_AUTH_SECRET = import.meta.env.VITE_AUTHORIZATION_SECRET || 'curiya_portal_secret_2026';

const WEBHOOK_PATH_ALIASES = {
    'fetch-patient': ['fetch-patient', 'patient', 'fetch-patient-data'],
    'fetch-medicines': ['fetch-medicines', 'medicines', 'get-medicines'],
    'patient-reports': ['patient-reports', 'reports', 'get-reports'],
    'patient/report/upload': ['patient/report/upload', 'upload-report'],
    'patient/report/results': ['patient/report/results', 'get-report-results', 'report-results'],
    'patient/report/delete': ['patient/report/delete', 'delete-report'],
    'patient-diet': ['patient-diet', 'diet', 'get-diet'],
    'diet': ['diet', 'view-download-diet'],
    'yoga-sync': ['yoga-sync', 'yoga', 'get-yoga'],
    'audio/sessions': ['audio/sessions']
};

/**
 * Normalizes a patient ID to string and removes any leading '#' or whitespace.
 */
export const normalizePatientId = (id) => {
    if (id === null || id === undefined) return null;
    return String(id).trim().replace(/^#/, '');
};

/**
 * Normalizes an email address.
 */
export const normalizeEmail = (email) => {
    if (!email) return null;
    return String(email).trim().toLowerCase();
};

/**
 * Resolves patient identity from multiple potential sources.
 * Sources are checked in order. First one to provide a valid ID or Email wins.
 */
export const resolvePatientIdentity = (...sources) => {
    let patientId = null;
    let email = null;

    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;

        const foundId = normalizePatientId(
            source.patient_id
            || source.patientId
            || source.id
        );

        if (foundId && !patientId) {
            patientId = foundId;
        }

        const foundEmail = normalizeEmail(
            source.email 
            || source.Email 
            || source['E-mail']
            || source.patient_email
            || source.patientEmail
            || source.user?.email
        );
        if (foundEmail && !email) {
            email = foundEmail;
        }
    }

    return { patientId, email };
};

/**
 * Safely parses a JSON string, returning null on error.
 */
export const parseJsonSafely = (text) => {
    if (!text || !text.trim()) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
};

/**
 * Normalizes an identity object to ensure it has patientId and email.
 */
export const normalizeIdentity = (identity) => {
    if (!identity) return { patientId: null, email: null };
    return {
        patientId: normalizePatientId(identity.patientId || identity.patient_id),
        email: normalizeEmail(identity.email)
    };
};

/**
 * Builds the identity parameters (query or body) based on the identity object.
 */
export const buildIdentityParams = (identity, extras = {}) => {
    const params = { ...extras };

    if (identity?.patientId) {
        params.patient_id = identity.patientId;
    }

    if (identity?.email) {
        params.email = identity.email;
    }

    // Add session validation token if provided
    if (identity?.idToken) {
        params.idToken = identity.idToken;
    }

    return params;
};

/**
 * Given a canonical path, returns all known aliases/candidates.
 */
export const getWebhookPathCandidates = (path) => {
    const sanitizedPath = String(path || '').replace(/^\/+/, '');
    const aliases = WEBHOOK_PATH_ALIASES[sanitizedPath] || [];
    return [...new Set([sanitizedPath, ...aliases].filter(Boolean))];
};

/**
 * Builds a basic webhook URL for a specific path and extra params.
 */
export const buildWebhookUrl = (path, extras = {}) => {
    const sanitizedPath = String(path || '').replace(/^\/+/, '');
    const url = new URL(`${N8N_WEBHOOK_BASE}/${sanitizedPath}`);

    Object.entries(extras).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
};

/**
 * Builds a patient-scoped body (for POST) or params (for GET) based on identity.
 */
export const buildPatientScopedBody = (identity, extras = {}) => {
    return buildIdentityParams(identity, extras);
};

/**
 * Builds a patient-scoped URL with identity params in the query string.
 */
export const buildPatientScopedUrl = (path, identity, extras = {}) => {
    const params = buildIdentityParams(identity, extras);
    return buildWebhookUrl(path, params);
};

/**
 * Returns list of candidate URLs for a patient-scoped request.
 */
export const buildPatientScopedCandidateUrls = (path, identity, extras = {}) => (
    getWebhookPathCandidates(path).map((candidatePath) => (
        buildPatientScopedUrl(candidatePath, identity, extras)
    ))
);

/**
 * Returns list of candidate URLs for a general webhook request.
 */
export const buildWebhookCandidateUrls = (path, extras = {}) => (
    getWebhookPathCandidates(path).map((candidatePath) => (
        buildWebhookUrl(candidatePath, extras)
    ))
);

/**
 * Internal Auth Headers for n8n communication.
 */
export const getInternalAuthHeaders = () => ({
    'Authorization': `Bearer ${INTERNAL_AUTH_SECRET}`
});

/**
 * Robust fetch helper that iterates through candidates and handles auth/tokens.
 */
export const fetchFromWebhook = async (path, options = {}) => {
    const { 
        method = 'GET', 
        extras = {}, 
        bodyExtras = {},
        identity = {},
        headers = {},
        cache = 'no-store'
    } = options;

    // For destructive methods, only try the first (canonical) candidate
    const isDestructive = ['DELETE', 'POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
    const candidates = isDestructive ? [getWebhookPathCandidates(path)[0]] : getWebhookPathCandidates(path);
    
    let lastError = null;

    for (const candidatePath of candidates) {
        try {
            // Build the URL with identity params in query if GET
            const requestExtras = method === 'GET' 
                ? buildIdentityParams(identity, extras) 
                : extras;
            
            const url = buildWebhookUrl(candidatePath, requestExtras);
            
            // Build the request init
            const init = {
                method,
                cache,
                headers: {
                    ...getInternalAuthHeaders(),
                    ...headers
                }
            };

            if (cache === 'no-store') {
                init.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                init.headers['Pragma'] = 'no-cache';
            }

            // Add body if not GET
            if (method !== 'GET') {
                init.headers['Content-Type'] = 'application/json';
                init.body = JSON.stringify(buildIdentityParams(identity, bodyExtras));
            }

            console.log(`Trying webhook candidate: ${method} ${url}`);
            const response = await fetch(url, init);
            const text = await response.text();
            const payload = parseJsonSafely(text);

            if (!response.ok) {
                // If 404/405, try next candidate
                if (response.status === 404 || response.status === 405) {
                    continue;
                }
                throw new Error(`Webhook failed with status ${response.status}: ${text}`);
            }

            return payload;
        } catch (err) {
            lastError = err;
        }
    }

    throw lastError || new Error(`No reachable candidates for path: ${path}`);
};

/**
 * Scoped fetch helper that resolves patient identity automatically.
 */
export const fetchFromPatientWebhook = async (path, authContext, options = {}) => {
    const { user, patientData, patientId } = authContext;
    const identity = resolvePatientIdentity(patientData, user, { patient_id: patientId });
    
    // Add idToken for session validation
    if (user?.idToken) {
        identity.idToken = user.idToken;
    }

    return fetchFromWebhook(path, {
        ...options,
        identity
    });
};

/**
 * Unwraps a payload to find a list of candidates.
 */
const unwrapCandidates = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.patients)) return payload.patients;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.items)) return payload.items;
    if (payload.patient && typeof payload.patient === 'object') return [payload.patient];
    if (payload.data && typeof payload.data === 'object') return [payload.data];
    if (typeof payload === 'object') return [payload];
    return [];
};

/**
 * Checks if a candidate record matches the identity.
 */
const matchesIdentity = (candidate, identity) => {
    const candidateIdentity = resolvePatientIdentity(candidate);

    if (identity?.patientId && candidateIdentity.patientId) {
        return candidateIdentity.patientId === identity.patientId;
    }

    if (identity?.email && candidateIdentity.email) {
        return candidateIdentity.email === identity.email;
    }

    return false;
};

/**
 * Normalizes a raw patient record from n8n to match frontend expectations.
 * Maps n8n-specific keys (complaint, consultDate, etc.) to frontend keys (chief_complaint, consult_date, etc.)
 */
export const normalizePatientRecord = (record) => {
    if (!record || typeof record !== 'object') return null;

    // Preserve original fields but ensure preferred keys exist
    const normalized = {
        ...record,
        // Map keys requested by user
        chief_complaint: record.chief_complaint || record.complaint || record.c_o || '',
        consult_date: record.consult_date || record.consultDate || record.date || '',
        follow_up_date: record.follow_up_date || record.followUp || record.follow_up || '',
        
        // Map other common variations
        doctor: record.doctor || record.handled_by || record['Handled by'] || '',
        patient_id: normalizePatientId(record.patient_id || record.patientId || record['Patient ID']),
        email: normalizeEmail(record.email || record.Email || record['Mail ID|email']),
        name: record.name || record.Name || '',
        status: record.status || record.Status || '',
        contact: record.contact || record.Contact || record.phone || ''
    };

    return normalized;
};

/**
 * Selects the best patient record from a payload based on identity.
 */
export const selectScopedPatientRecord = (payload, identity) => {
    const candidates = unwrapCandidates(payload).filter(Boolean);
    if (!candidates.length) {
        return null;
    }

    const exactMatch = candidates.find((candidate) => matchesIdentity(candidate, identity));
    if (exactMatch) {
        return normalizePatientRecord(exactMatch);
    }

    if (candidates.length === 1) {
        return normalizePatientRecord(candidates[0]);
    }

    return null;
};

/**
 * Fetches order tracking data from n8n backend for a paid prescription.
 */
export const getTrackingDetails = async (idToken, patientId) => {
    if (!idToken || !patientId) {
        throw new Error('User token or patient ID missing');
    }

    const url = `${N8N_WEBHOOK_BASE}/get-tracking`;
    
    console.log(`Trying webhook candidate: POST ${url}`);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...getInternalAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idToken,
            patientId
        })
    });

    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
        throw new Error('FORBIDDEN');
    }
    if (response.status === 404) {
        throw new Error('NOT_FOUND');
    }

    if (!response.ok) {
        throw new Error(`SERVER_ERROR:${response.status}`);
    }

    const text = await response.text();
    return parseJsonSafely(text);
};

export const fetchOrderTracking = async (authContext) => {
    return getTrackingDetails(authContext.user?.idToken, authContext.patientId);
};
