const express = require('express');
const router = express.Router();

// Render the PDF generation page
router.get('/', (req, res) => {
    res.render('pdf-gen', {
        title: 'PDF Generation',
        layout: 'layouts/main'  // Assuming you're using a layout system
    });
});

module.exports = router;
