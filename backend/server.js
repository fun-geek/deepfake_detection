import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import detectRouter from './routes/detect.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: '*', // Allow all origins for dev, you can restrict this in prod
  methods: ['GET', 'POST']
}));

// Configure Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
// We pass io down to the upload router so it can emit events
app.use('/api/detect', detectRouter);
app.use('/api/upload', uploadRouter(io));

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
