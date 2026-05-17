const url = 'https://n8n.curiyawellness.com/webhook/patient-reports';
const headers = {
    'Authorization': 'Bearer curiya_portal_secret_2026'
};

fetch(url, {
    method: 'GET',
    headers: headers
})
    .then(async response => {
        console.log('Status Code:', response.status);
        const text = await response.text();
        console.log('Response Body:', text);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
