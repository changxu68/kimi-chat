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
        const userId = req.body.userId || '1'; // Get actual user ID from your auth system
        const channel = 'web'; // Use consistent channel name
        
        const authData = await aipptAuth.getCode(userId, channel);
        res.json({
            appkey: authData.api_key,
            code: authData.code,
            channel: channel
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 