import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './transport/registerSocketHandlers.js';

export function createApp({ building, clientOrigin }) {
  const app = express();
  app.use(cors({ origin: clientOrigin }));

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/state', (req, res) => {
    res.json(building.getSnapshot());
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: clientOrigin } });
  registerSocketHandlers(io, building);

  return { app, httpServer, io };
}
