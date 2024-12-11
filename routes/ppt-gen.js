const express = require('express');
const router = express.Router();
const aipptAuth = require('../utils/aipptAuth');

// Render the PPT generation page
router.get('/', (req, res) => {
    res.render('ppt-gen', {
        title: 'PPT Generation',
        layout: 'layouts/main'
    });
});

// Get AIPPT authentication code
router.post('/auth', async (req, res) => {
    try {
        const userId = req.body.userId || '1';
        const channel = 'web';
        
        console.log('Auth Request:', { userId, channel });
        
        const authData = await aipptAuth.getCode(userId, channel);
        console.log('Auth Response:', authData);
        
        res.json({
            appkey: authData.api_key,
            code: authData.code,
            channel: channel
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data || 'No additional details'
        });
    }
});

module.exports = router; 