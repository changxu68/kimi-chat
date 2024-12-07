const express = require('express');
const { create } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const kimiAPI = require('./utils/kimiAPI');
const imageChatRouter = require('./routes/image-chat');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const hbs = create({
  defaultLayout: 'main',
  extname: '.handlebars'
});

// Middleware
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/text-chat', require('./routes/text-chat'));
app.use('/image-chat', imageChatRouter);
app.use('/ppt-gen', require('./routes/ppt-gen'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected');
    const userId = socket.id;
    
    // Immediately initialize chat when user connects
    (async () => {
        try {
            const initialMessage = await kimiAPI.initializeTeacherChat(userId);
            console.log('Sending initial message:', initialMessage); // Debug log
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
            const response = await kimiAPI.chatCompletion(message, userId);
            
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 