const axios = require('axios');
const crypto = require('crypto');

class VolcengineImageAPI {
    constructor() {
        this.AK = process.env.VOLC_ACCESS_KEY;
        this.SK = process.env.VOLC_SECRET_KEY;
        this.HOST = 'visual.volcengineapi.com';
        this.SERVICE = 'cv';
        this.REGION = 'cn-north-1';
    }

    getSignUrl(method, path, query, body = '') {
        const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
        const date = datetime.substring(0, 8);

        // Calculate body hash
        const bodyHash = crypto.createHash('sha256')
            .update(typeof body === 'string' ? body : JSON.stringify(body))
            .digest('hex');

        // Get signed headers
        const headers = {
            'host': this.HOST,
            'x-date': datetime
        };

        const [signedHeaderKeys, canonicalHeaders] = this.getSignHeaders(headers);

        // Create canonical request
        const canonicalRequest = [
            method.toUpperCase(),
            path,
            this.queryParamsToString(query),
            `${canonicalHeaders}\n`,
            signedHeaderKeys,
            bodyHash,
        ].join('\n');

        // Create credential scope
        const credentialScope = [date, this.REGION, this.SERVICE, "request"].join('/');

        // Create string to sign
        const stringToSign = [
            "HMAC-SHA256",
            datetime,
            credentialScope,
            crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex')
        ].join('\n');

        // Calculate signature
        const kDate = this.hmac(this.SK, date);
        const kRegion = this.hmac(kDate, this.REGION);
        const kService = this.hmac(kRegion, this.SERVICE);
        const kSigning = this.hmac(kService, "request");
        const signature = this.hmac(kSigning, stringToSign).toString('hex');

        // Create authorization header
        const authorization = [
            "HMAC-SHA256",
            `Credential=${this.AK}/${credentialScope},`,
            `SignedHeaders=${signedHeaderKeys},`,
            `Signature=${signature}`,
        ].join(' ');

        return {
            headers: {
                ...headers,
                'Authorization': authorization,
                'Content-Type': 'application/json'
            }
        };
    }

    hmac(secret, string) {
        return crypto.createHmac('sha256', secret).update(string, 'utf8').digest();
    }

    getSignHeaders(headers) {
        const h = Object.keys(headers).filter(k => 
            !['authorization', 'content-type', 'content-length', 'user-agent', 'presigned-expires', 'expect']
                .includes(k.toLowerCase())
        );

        const signedHeaderKeys = h
            .map(k => k.toLowerCase())
            .sort()
            .join(';');

        const canonicalHeaders = h
            .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            .map(k => `${k.toLowerCase()}:${headers[k].toString().trim().replace(/\s+/g, ' ')}`)
            .join('\n');

        return [signedHeaderKeys, canonicalHeaders];
    }

    queryParamsToString(params) {
        return Object.keys(params)
            .sort()
            .map(key => {
                const val = params[key];
                if (val === undefined || val === null) {
                    return undefined;
                }
                const escapedKey = this.uriEscape(key);
                if (!escapedKey) {
                    return undefined;
                }
                return `${escapedKey}=${this.uriEscape(val)}`;
            })
            .filter(v => v)
            .join('&');
    }

    uriEscape(str) {
        try {
            return encodeURIComponent(str)
                .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
                .replace(/[*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
        } catch (e) {
            return '';
        }
    }

    async generateImage(prompt) {
        try {
            const query = {
                Action: 'CVProcess',
                Version: '2022-08-31'
            };

            const requestBody = {
                req_key: "high_aes_general_v20_L",
                prompt: prompt,
                model_version: "general_v2.0_L",
                req_schedule_conf: "general_v20_9B_rephraser",
                seed: -1,
                scale: 3.5,
                ddim_steps: 16,
                width: 512,
                height: 512,
                use_sr: true,
                return_url: true,
                logo_info: {
                    add_logo: false,
                    position: 0,
                    language: 0,
                    opacity: 0.3
                }
            };

            const signResult = this.getSignUrl('POST', '/', query, requestBody);
            const queryString = this.queryParamsToString(query);

            const response = await axios({
                method: 'POST',
                url: `https://${this.HOST}/?${queryString}`,
                headers: signResult.headers,
                data: requestBody
            });

            console.log('API Response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.code === 10000 && response.data.data.image_urls?.length > 0) {
                return { url: response.data.data.image_urls[0] };
            }

            throw new Error(response.data?.message || 'Failed to generate image');

        } catch (error) {
            console.error('Image generation error:', error);
            return { 
                error: error.response?.data?.message || error.message || 'Failed to generate image'
            };
        }
    }
}

module.exports = new VolcengineImageAPI(); 