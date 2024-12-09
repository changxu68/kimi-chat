const jwt = require('jsonwebtoken');
const axios = require('axios');

class ZhipuAPI {
    constructor() {
        this.API_KEY = process.env.ZHIPUAI_API_KEY;
    }

    generateToken() {
        try {
            const [apiKey, apiSecret] = this.API_KEY.split('.');
            const timestamp = Math.floor(Date.now() / 1000);
            
            const header = {
                "alg": "HS256",
                "sign_type": "SIGN"
            };
            
            const payload = {
                "api_key": apiKey,
                "exp": timestamp + 1800,
                "timestamp": timestamp
            };

            return jwt.sign(payload, apiSecret, { 
                algorithm: 'HS256',
                header: header 
            });
        } catch (error) {
            console.error('Token generation error:', error);
            throw error;
        }
    }

    async generateImage(prompt) {
        try {
            const token = this.generateToken();
            
            const response = await axios.post(
                'https://open.bigmodel.cn/api/paas/v4/images/generations',
                {
                    model: "cogview-3-plus",
                    prompt: prompt,
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

            if (response.data && response.data.data && response.data.data[0]) {
                return { url: response.data.data[0].url };
            }
            throw new Error('Invalid response from API');

        } catch (error) {
            console.error('Image generation error:', error.response?.data || error.message);
            return { error: error.response?.data?.error?.message || 'Failed to generate image' };
        }
    }
}

module.exports = new ZhipuAPI(); 