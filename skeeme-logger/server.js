const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // In case there are large logs

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store recent logs in memory (last 500)
const logs = [];

io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id);
  // Send recent logs to the new client
  socket.emit('init_logs', logs);
});

// Endpoint for services to push logs
app.post('/ingest', (req, res) => {
  const logEntry = req.body;
  
  // Basic validation
  if (!logEntry || !logEntry.service || !logEntry.message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Ensure timestamp exists
  if (!logEntry.timestamp) {
    logEntry.timestamp = new Date().toISOString();
  }

  // Add an internal ID
  logEntry.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);

  logs.push(logEntry);
  if (logs.length > 500) {
    logs.shift(); // keep it bounded
  }

  // Broadcast to frontend
  io.emit('new_log', logEntry);

  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Live Log Server running on port ${PORT}`);
});
