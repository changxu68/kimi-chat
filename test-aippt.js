require('dotenv').config();
const CryptoJS = require('crypto-js');

// Test configuration
console.log('API Key:', process.env.AIPPT_API_KEY ? 'Present' : 'Missing');
console.log('Secret Key:', process.env.AIPPT_SECRET_KEY ? 'Present' : 'Missing');

async function testAuth() {
    const API_KEY = process.env.AIPPT_API_KEY;
    const API_SECRET = process.env.AIPPT_SECRET_KEY;
    const BASE_URL = 'https://co.aippt.cn';
    
    // Generate signature
    const timestamp = Math.floor(Date.now() / 1000);
    const method = 'GET';
    const uri = '/api/grant/code/';
    const stringToSign = `${method}@${uri}@${timestamp}`;
    const hash = CryptoJS.HmacSHA1(stringToSign, API_SECRET);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    console.log('Test Parameters:');
    console.log('Timestamp:', timestamp);
    console.log('String to Sign:', stringToSign);
    console.log('Generated Signature:', signature);

    try {
        const response = await fetch(
            `${BASE_URL}/api/grant/code?uid=test_user&channel=web`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                    'x-timestamp': timestamp.toString(),
                    'x-signature': signature
                }
            }
        );

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAuth(); 