import 'dotenv/config';
import { Building } from './domain/Building.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const STEP_INTERVAL_MS = Number(process.env.STEP_INTERVAL_MS) || 1000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const building = new Building();
const { httpServer, io } = createApp({ building, clientOrigin: CLIENT_ORIGIN });

httpServer.listen(PORT, () => {
  building.start(STEP_INTERVAL_MS);
  console.log(`Elevator server running at http://localhost:${PORT}`);
  console.log(`Strategy: ${building.strategyName}, step every ${STEP_INTERVAL_MS}ms`);
});

function shutdown() {
  console.log('Shutting down...');
  building.stop();
  io.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
