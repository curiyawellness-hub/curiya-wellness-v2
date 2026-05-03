const https = require('https');

const data = JSON.stringify({
    idToken: 'test_token'
});

const options = {
    hostname: 'n8n.curiyawellness.com',
    port: 443,
    path: '/webhook/311728c1-4e9d-485a-9dc6-17ac6396d85d',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer curiya_portal_secret_2026'
    }
};

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
