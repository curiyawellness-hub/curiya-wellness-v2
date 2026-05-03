const url = 'https://n8n.curiyawellness.com/webhook/fetch-medicines';
const headers = {
    'Authorization': 'Bearer curiya_portal_secret_2026'
};

console.log(`Testing GET request to: ${url}`);

fetch(url, {
    method: 'GET',
    headers: headers
})
    .then(async response => {
        console.log('\n--- Result ---');
        console.log(`Status Code: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);

        if (response.ok) {
            console.log('\n✅ Webhook is REACHABLE via GET.');
        }
    })
    .catch(error => {
        console.error('\n❌ Webhook is NOT REACHABLE.');
        console.error('Error:', error.message);
    });
