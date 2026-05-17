const https = require('https');

const data = JSON.stringify({
  email: 'mathewalphanatural@gmail.com'
});

const options = {
  hostname: 'n8n.curiyawellness.com',
  port: 443,
  path: '/webhook/fetch-patient',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer curiya_portal_secret_2026',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => {
    body += d;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', JSON.stringify(res.headers));
    console.log('RESPONSE:', body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
