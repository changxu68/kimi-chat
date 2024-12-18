const express = require('express');
const router = express.Router();
const axios = require('axios');
const volcengineImageAPI = require('../utils/volcengineImageAPI');

// Route to render the chat page
router.get('/', (req, res) => {
    res.render('image-chat', {
        title: 'Image Chat',
        layout: 'layouts/main'
    });
});

// API endpoint for image generation
router.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await volcengineImageAPI.generateImage(prompt);
        
        if (response.error) {
            return res.status(400).json({ error: response.error });
        }

        res.json({ imageUrl: response.url });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// Keep the existing download endpoint
router.post('/api/download-image', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        res.set({
            'Content-Type': response.headers['content-type'],
            'Content-Disposition': 'attachment; filename=generated-image.png'
        });

        res.send(Buffer.from(response.data, 'binary'));

    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to download image' });
    }
});

module.exports = router; 