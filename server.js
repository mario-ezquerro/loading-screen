const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Port configuration exactly as required by Cloud Run ($PORT)
const PORT = process.env.PORT || 8080;

// Serve static files (Frontend HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Basic route to verify server is running
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Dynamic music track listing
const fs = require('fs');
app.get('/api/tracks', (req, res) => {
  const audioDir = path.join(__dirname, 'public', 'audio');
  fs.readdir(audioDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read audio directory' });
    }
    // Filter for audio files and exclude INFO.txt
    const tracks = files.filter(file => /\.(mp3|wav|ogg)$/i.test(file));
    res.json(tracks);
  });
});


// Real-time connections handling
io.on('connection', (socket) => {
  console.log(`[+] New connection: ${socket.id}`);

  // When mobile user launches a muggle
  socket.on('launch_muggle', (data) => {
    console.log(`[Muggle Launched] ID: ${socket.id}, Message: ${data.message}`);
    
    // Broadcast to all clients (Stage View will listen for this)
    io.emit('muggle_spawned', {
      id: socket.id,
      message: data.message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 The Loading Screen server is listening on port ${PORT}`);
});
