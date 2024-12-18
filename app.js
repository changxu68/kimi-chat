const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const imageChatRouter = require('./routes/image-chat');
const textChat = require('./routes/text-chat');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/text-chat', textChat.router);
app.use('/image-chat', imageChatRouter);
app.use('/ppt-gen', require('./routes/ppt-gen'));

// Setup Socket.IO handlers
textChat.setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 