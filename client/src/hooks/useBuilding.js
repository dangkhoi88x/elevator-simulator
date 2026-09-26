import { useCallback, useEffect, useState } from 'react';
import { socket } from '../socket.js';

const ACK_TIMEOUT_MS = 5000;

export function useBuilding() {
  const [snapshot, setSnapshot] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state', setSnapshot);

    // Gỡ đúng listener đã gắn -> StrictMode mount 2 lần cũng không bị nhân đôi
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state', setSnapshot);
    };
  }, []);

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
