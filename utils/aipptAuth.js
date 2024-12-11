const CryptoJS = require('crypto-js');

class AipptAuth {
    constructor() {
        if (!process.env.AIPPT_API_KEY || !process.env.AIPPT_SECRET_KEY) {
            throw new Error('AIPPT API keys not found in environment variables');
        }
        this.API_KEY = process.env.AIPPT_API_KEY;
        this.API_SECRET = process.env.AIPPT_SECRET_KEY;
        this.BASE_URL = 'https://co.aippt.cn';
    }

    generateSignature(method, uri, timestamp) {
        const stringToSign = `${method}@${uri}@${timestamp}`;
        console.log('String to Sign:', stringToSign);
        
        const hash = CryptoJS.HmacSHA1(stringToSign, this.API_SECRET);
        const signature = CryptoJS.enc.Base64.stringify(hash);
        console.log('Generated Signature:', signature);
        
        return signature;
    }

    async getCode(userId, channel) {
        const timestamp = Math.floor(Date.now() / 1000);
        const uri = '/api/grant/code/';
        const signature = this.generateSignature('GET', uri, timestamp);

        console.log('Debug Info:', {
            url: `${this.BASE_URL}/api/grant/code?uid=${userId}&channel=${channel}`,
            headers: {
                'x-api-key': this.API_KEY,
                'x-timestamp': timestamp.toString(),
                'x-signature': signature
            }
        });

        try {
            const response = await fetch(`${this.BASE_URL}/api/grant/code?uid=${userId}&channel=${channel}`, {
                method: 'GET',
                headers: {
                    'x-api-key': this.API_KEY,
                    'x-timestamp': timestamp.toString(),
                    'x-signature': signature
                }
            });

            const data = await response.json();
            console.log('Response:', data);

            if (data.code === 0) {
                return data.data;
            } else {
                throw new Error(data.msg);
            }
        } catch (error) {
            console.error('AIPPT Auth Error:', error);
            throw error;
        }
    }
}

module.exports = new AipptAuth();