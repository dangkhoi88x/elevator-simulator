import 'dotenv/config';
import { Building } from './models/Building.js';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT) || 3000;
const STEP_INTERVAL_MS = Number(process.env.STEP_INTERVAL_MS) || 1000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Toà nhà 10 tầng, 3 thang máy
const building = new Building(10, 3);
const { httpServer, sendStateToAll } = createServer(building, CLIENT_ORIGIN);

// Nhịp thời gian: mỗi giây, mọi thang đi một bước rồi gửi trạng thái mới cho trình duyệt
setInterval(() => {
  building.step();
  sendStateToAll();
}, STEP_INTERVAL_MS);

httpServer.listen(PORT, () => {
  console.log(`Elevator server running at http://localhost:${PORT}`);
});
