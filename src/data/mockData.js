export const patient = {
    id: 'CUR-9894', // Using digits from contact
    name: 'Pradeep',
    doctor: 'Dr. Mathew',
    chiefComplaint: 'Acidity Management',
    consultDate: '25 Jan, 2025',
    followUpDate: '30 Jan, 2026',
    status: 'Payment Link Ready',
    quote: "Healing takes time, and asking for help is a courageous step."
};

export const prescription = {
    medicines: [
        {
            id: 1,
            name: 'SBO Probiotic',
            instruction: '1-0-1 Before Food',
            purpose: 'Promotes digestive health and reduces inflammation'
        },
        {
            id: 2,
            name: 'Sibo Care',
            instruction: '1-0-1 After Food',
            purpose: 'Reduce Bloating and Gas'
        }
    ],
    billing: {
        items: [
            { name: 'CalmRest 10mg', pack: '1 Strip', qty: 1, price: 150, amount: 150 },
            { name: 'MigraineRelief', pack: '1 Strip', qty: 1, price: 200, amount: 200 }
        ],
        courier: 50,
        total: 400
    },
    paymentStatus: 'Pending', // Pending, Paid
    courierStatus: 'Pending', // Pending, Dispatched
    trackingId: null
};

export const profile = {
    savedAddress: null // Start with null to show form
};
