const url = 'https://n8n.curiyawellness.com/webhook/fetch-medicines';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer curiya_portal_secret_2026'
};
const body = JSON.stringify({
    idToken: 'PROPER_TEST_TOKEN_2026'
});

console.log(`Verifying POST request to: ${url}`);
console.log('Headers:', JSON.stringify(headers, null, 2));
console.log('Payload:', body);

fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
})
    .then(async response => {
        console.log('\n--- Verification Result ---');
        console.log(`Status Code: ${response.status}`);
        const text = await response.text();
        console.log(`Response Body: ${text}`);

        if (response.status === 200) {
            console.log('\n✅ Webhook REACHED successfully with POST.');
        } else if (response.status === 401 || response.status === 403) {
            console.log('\n✅ Webhook REACHED, but token was rejected (expected for a dummy token).');
        } else {
            console.log(`\n❌ Webhook returned unexpected status: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('\n❌ Failed to connect to webhook.');
        console.error('Error:', error.message);
    });
