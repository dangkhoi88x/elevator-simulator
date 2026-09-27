import { useEffect, useState } from 'react';
import { socket } from './socket.js';
import { COLORS } from './constants.js';
import { Building } from './components/Building.jsx';
import { ElevatorPanel } from './components/ElevatorPanel.jsx';

function App() {
  const [building, setBuilding] = useState(null); // trạng thái toà nhà do server gửi xuống
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState('');

  // Nghe server: mỗi lần có trạng thái mới thì cập nhật giao diện
  useEffect(() => {
    function handleState(newState) {
      setBuilding(newState);
      setConnected(true); // nhận được dữ liệu nghĩa là đang kết nối
    }
    function handleDisconnect() {
      setConnected(false);
    }

    socket.on('state', handleState);
    socket.on('disconnect', handleDisconnect);

    // Dọn dẹp: gỡ listener khi component không còn trên màn hình
    return () => {
      socket.off('state', handleState);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Thông báo lỗi tự ẩn sau 3 giây
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  // Gửi lệnh lên server. Server trả lời { ok: true } hoặc { ok: false, error: '...' }.
  // Không tự đổi giao diện ở đây: server sẽ gửi trạng thái mới về.
  function sendCommand(eventName, data) {
    socket.emit(eventName, data, (result) => {
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function callElevator(floor, direction) {
    sendCommand('callElevator', { floor, direction });
  }

  if (!building) {
    return <p className="waiting">Connecting to the server…</p>;
  }

  return (
    <main>
      <header>
        <h1>Elevator Simulator</h1>
        <span className={connected ? 'online' : 'offline'}>
          {connected ? '● Connected' : '● Disconnected'}
        </span>
      </header>

      <div className="layout">
        <Building building={building} onCall={callElevator} disabled={!connected} />

        <div className="panels">
          {building.elevators.map((elevator, index) => (
            <ElevatorPanel
              key={elevator.id}
              elevator={elevator}
              floorCount={building.floorCount}
              color={COLORS[index % COLORS.length]}
              onCommand={sendCommand}
              disabled={!connected}
            />
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
    </main>
  );
}

export default App;
