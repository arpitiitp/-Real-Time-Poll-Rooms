require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./db');
const pollRoutes = require('./routes/polls');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (simplifies dev/demo)
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.set('trust proxy', true); // Needed for Render/Heroku IP forwarding

// Make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use('/', (req, res) => {
    res.send("Backend is running")
})

app.use('/api/polls', pollRoutes);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinPoll', (pollId) => {
        socket.join(pollId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
