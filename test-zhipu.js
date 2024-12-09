const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ZHIPUAI_API_KEY;

function generateToken() {
    try {
        const [apiKey, apiSecret] = API_KEY.split('.');
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Create JWT header and payload according to the documentation
        const header = {
            "alg": "HS256",
            "sign_type": "SIGN"
        };
        
        const payload = {
            "api_key": apiKey,
            "exp": timestamp + 1800, // 30 minutes expiration
            "timestamp": timestamp
        };

        // Generate JWT with custom header
        const token = jwt.sign(payload, apiSecret, { 
            algorithm: 'HS256',
            header: header 
        });

        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw error;
    }
}

async function testImageGeneration() {
    try {
        const token = generateToken();
        console.log('Generated token:', token);

        const response = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/images/generations',
            {
                model: "cogview-3-plus",
                prompt: "A beautiful sunset over mountains",
                n: 1,
                size: "1024x1024"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }
        );

        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Run the test
testImageGeneration();