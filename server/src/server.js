import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'node:http';
import { Server } from 'socket.io';
import { setupSocket } from './socket.js';

// Tạo server web (Express) + Socket.IO cho một toà nhà
export function createServer(building, clientOrigin) {
  const app = express();
  app.use(cors({ origin: clientOrigin }));

  // Xem nhanh trạng thái toà nhà trên trình duyệt: http://localhost:3000/api/state
  app.get('/api/state', (req, res) => {
    res.json(building.getState());
  });

  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, { cors: { origin: clientOrigin } });
  const sendStateToAll = setupSocket(io, building);

  return { httpServer, io, sendStateToAll };
}
