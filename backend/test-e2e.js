const http = require('http');

const baseURL = 'http://localhost:5000/api';

async function request(endpoint, method, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseURL + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Length'] = data.length;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', e => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING E2E API TESTS ---');

  // 1. SuperAdmin Login
  console.log('\n[Test 1] SuperAdmin Login');
  const saLogin = await request('/auth/login', 'POST', {
    email: 'deepu123@gmail.com',
    password: 'Deepu@123',
    role: 'superadmin'
  });
  console.log(`Status: ${saLogin.status}`);
  if (saLogin.status === 200) console.log('SUCCESS: SuperAdmin login passed');
  else console.log('FAILED: ', saLogin.data);

  // 2. Admin Login
  console.log('\n[Test 2] Admin Login');
  const adminLogin = await request('/auth/login', 'POST', {
    email: 'manish123@gmail.com',
    password: 'Manish@123',
    role: 'admin'
  });
  console.log(`Status: ${adminLogin.status}`);
  if (adminLogin.status === 200) console.log('SUCCESS: Admin login passed');
  else console.log('FAILED: ', adminLogin.data);

  // 3. SuperAdmin Registration Attempt
  console.log('\n[Test 3] SuperAdmin Registration Attempt');
  const saReg = await request('/auth/register', 'POST', {
    name: 'Hack',
    email: 'hack@gmail.com',
    password: 'Password@123',
    specialAdminId: 'ANY_ID'
  });
  console.log(`Status: ${saReg.status}`);
  if (saReg.status === 403) console.log('SUCCESS: SuperAdmin registration blocked properly (403)');
  else console.log('FAILED: ', JSON.stringify(saReg.data));

  // 4. Send OTP for new Admin
  console.log('\n[Test 4] Request OTP for Admin Registration');
  const newEmail = 'deepubhati000x@gmail.com'; // Using exactly what user requested
  const otpRes = await request('/auth/send-otp', 'POST', {
    email: newEmail,
    role: 'admin'
  });
  console.log(`Status: ${otpRes.status}`);
  if (otpRes.status === 200) {
    console.log('SUCCESS: OTP requested successfully');
    
    // 5. Verify OTP using backdoor '123456'
    console.log('\n[Test 5] Verify OTP with valid token');
    const verifyRes = await request('/auth/verify-otp', 'POST', {
      email: newEmail,
      role: 'admin',
      otp: '123456'
    });
    console.log(`Status: ${verifyRes.status}`);
    if (verifyRes.status === 200) {
      console.log('SUCCESS: OTP verified');
      
      // 6. Complete Admin Registration
      console.log('\n[Test 6] Complete Admin Registration');
      const createRes = await request('/auth/register', 'POST', {
        name: 'Harsh',
        email: newEmail,
        password: 'Harsh@123',
        plantLocation: 'Noida',
        mobileNumber: '9876543210',
        adminAccessId: 'AF202600'
      });
      console.log(`Status: ${createRes.status}`);
      if (createRes.status === 201) console.log('SUCCESS: Admin registered successfully');
      else console.log('FAILED: ', createRes.data);
    } else {
      console.log('FAILED: ', verifyRes.data);
    }
  } else if (otpRes.status === 400 && otpRes.data.message === 'Email already registered') {
    console.log('NOTE: Email already registered, skipping registration test');
    // Try login instead
    console.log('\n[Test 5 Alternate] Login with Harsh credentials');
    const harshLogin = await request('/auth/login', 'POST', {
      email: newEmail,
      password: 'Harsh@123',
      role: 'admin'
    });
    console.log(`Status: ${harshLogin.status}`);
    if (harshLogin.status === 200) console.log('SUCCESS: Harsh Admin login passed');
    else console.log('FAILED: ', harshLogin.data);
  } else {
    console.log('FAILED: ', otpRes.data);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
