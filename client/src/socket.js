import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Một kết nối duy nhất cho cả app
export const socket = io(SERVER_URL);
