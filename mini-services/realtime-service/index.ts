import { createServer } from 'http';
import { Server } from 'socket.io';

// ---------------------------------------------------------------------------
// HTTP Server + Socket.io
// ---------------------------------------------------------------------------

const httpServer = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // POST /api/emit — REST endpoint to trigger broadcasts from Next.js APIs
  if (req.method === 'POST' && req.url === '/api/emit') {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { event, userId, data } = JSON.parse(body);

        if (!event || !userId) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Missing event or userId' }));
          return;
        }

        // Emit to the specific user's room
        io.to(`user:${userId}`).emit(event, data ?? {});

        // Also emit notification:new globally if the event is a notification
        if (event === 'notification:new') {
          io.emit('notification:new', data ?? {});
        }

        console.log(`[EMIT] event=${event} userId=${userId}`);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, event, userId }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok', service: 'nityodin-realtime', port: 3003 }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const io = new Server(httpServer, {
  // Use default path /socket.io/ so REST endpoints on /api/* work
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ---------------------------------------------------------------------------
// Socket.io connection handling
// ---------------------------------------------------------------------------

io.on('connection', (socket) => {
  console.log(`[CONNECT] socket=${socket.id}`);

  // Join a user's personal room for targeted broadcasts
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`[JOIN] socket=${socket.id} room=user:${userId}`);
  });

  // Leave a user's room
  socket.on('leave:user', (userId: string) => {
    socket.leave(`user:${userId}`);
    console.log(`[LEAVE] socket=${socket.id} room=user:${userId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[DISCONNECT] socket=${socket.id} reason=${reason}`);
  });

  socket.on('error', (err) => {
    console.error(`[ERROR] socket=${socket.id}:`, err);
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`🟢 Nityodin Realtime Service running on port ${PORT}`);
  console.log(`   REST emit: POST http://localhost:${PORT}/api/emit`);
  console.log(`   Health:     GET  http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n[SHUTDOWN] Received ${signal}, closing server...`);
  io.close();
  httpServer.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));