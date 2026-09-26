import { useCallback, useSyncExternalStore } from 'react';
import { socket } from '../socket.js';

const ACK_TIMEOUT_MS = 5000;

// Giữ snapshot ở cấp module: nghe từ lúc import, nên không lỡ gói 'state'
// server gửi ngay khi vừa kết nối (trước khi component kịp mount)
let latestSnapshot = null;
socket.on('state', (snapshot) => {
  latestSnapshot = snapshot;
});

function subscribe(onChange) {
  socket.on('state', onChange);
  socket.on('connect', onChange);
  socket.on('disconnect', onChange);
  return () => {
    socket.off('state', onChange);
    socket.off('connect', onChange);
    socket.off('disconnect', onChange);
  };
}

const getSnapshot = () => latestSnapshot;
const getConnected = () => socket.connected;

export function useBuilding() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const connected = useSyncExternalStore(subscribe, getConnected);

  // Gửi lệnh lên server, chờ ack: resolve khi ok, reject kèm lỗi từ server
  const send = useCallback((event, payload = {}) => {
    return new Promise((resolve, reject) => {
      socket.timeout(ACK_TIMEOUT_MS).emit(event, payload, (err, res) => {
        if (err) return reject(new Error(`Server did not respond to "${event}"`));
        if (!res?.ok) return reject(new Error(res?.error ?? 'Unknown error'));
        resolve();
      });
    });
  }, []);

  return { snapshot, connected, send };
}
