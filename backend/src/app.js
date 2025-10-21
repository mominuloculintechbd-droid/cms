const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const sequelize = require('./config/database');
const routes = require('./routes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('OTBL CMS Backend is running.');
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start Telegram bot for PDF processing only if not in development environment
  if (process.env.NODE_ENV !== 'development') {
    const telegramBotService = require('./services/telegramBotService');
    telegramBotService.start();
  } else {
    console.log('ℹ️  Telegram bot not started in development mode.');
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');

  // Stop Telegram bot only if not in development environment
  if (process.env.NODE_ENV !== 'development') {
    const telegramBotService = require('./services/telegramBotService');
    telegramBotService.stop();
  }

  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('⚠️  Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);