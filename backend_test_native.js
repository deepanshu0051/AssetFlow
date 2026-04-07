const http = require('http');

const data = JSON.stringify({
  machineName: 'Machine 123',
  plantName: 'Plant!',
  serialNumber: 'SN-001',
  purchaseDate: '2099-01-01',
  cost: 'abc'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/machines',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', JSON.stringify(res.headers));
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
