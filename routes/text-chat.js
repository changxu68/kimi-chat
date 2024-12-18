const express = require('express');
const router = express.Router();
const volcengineAPI = require('../utils/volcengineAPI');

// Render the text chat page
router.get('/', (req, res) => {
    res.render('text-chat', {
        title: 'Text Chat',
        layout: 'layouts/main'
    });
});

// Setup Socket.IO handlers
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected');
        const userId = socket.id;
        
        // Immediately initialize chat when user connects
        (async () => {
            try {
                const initialMessage = await volcengineAPI.initializeTeacherChat(userId);
                console.log('Sending initial message:', initialMessage);
                socket.emit('chat response', {
                    message: initialMessage
                });
            } catch (error) {
                console.error('Error initializing chat:', error);
                socket.emit('error', { 
                    message: 'Failed to initialize chat'
                });
            }
        })();
        
        socket.on('chat message', async (message) => {
            try {
                // Get response from Kimi API
                const response = await volcengineAPI.chatCompletion(message, userId);
                
                // Send response back to client
                socket.emit('chat response', {
                    message: response
                });
            } catch (error) {
                console.error('Error:', error);
                socket.emit('error', { 
                    message: 'Failed to get response from AI'
                });
            }
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = {
    router,
    setupSocket
}; 