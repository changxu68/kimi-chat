const express = require('express');
const router = express.Router();
const nodecallspython = require('node-calls-python');
const py = nodecallspython.interpreter;
const path = require('path');

// Initialize Python module
let imageGenerator = null;
const API_KEY = process.env.ZHIPUAI_API_KEY;

// Initialize Python interpreter and load the module
(async () => {
    try {
        const pymodule = await py.import(path.join(__dirname, '../scripts/image_generator.py'));
        imageGenerator = await py.create(pymodule, "ImageGenerator", API_KEY);
    } catch (error) {
        console.error('Failed to initialize Python module:', error);
    }
})();

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

        if (!imageGenerator) {
            throw new Error('Image generator not initialized');
        }

        const response = await py.call(imageGenerator, "generate_image", prompt);
        
        if (!response) {
            throw new Error('Failed to generate image');
        }

        if (response.error) {
            return res.status(400).json({ error: response.error });
        }

        res.json({ imageUrl: response.url });

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

module.exports = router; 