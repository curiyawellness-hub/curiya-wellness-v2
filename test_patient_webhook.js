const url = 'https://n8n.curiyawellness.com/webhook/fetch-patient';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer curiya_portal_secret_2026'
};
const body = JSON.stringify({
    idToken: 'test_token'
});

console.log(`Testing POST to: ${url}`);

fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
})
    .then(async response => {
        console.log('\n--- Result ---');
        console.log(`Status Code: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);
    })
    .catch(error => {
        console.error('\n❌ Webhook is NOT REACHABLE.');
        console.error('Error:', error.message);
    });
