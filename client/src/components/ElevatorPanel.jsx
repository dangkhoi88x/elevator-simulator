const STATE_TEXT = {
  WAITING: 'Idle',
  MOVING: 'Moving',
  DOOR_OPEN: 'Doors open',
};

// Bảng điều khiển của một thang: trạng thái + nút chọn tầng + nút mở/đóng cửa
export function ElevatorPanel({ elevator, floorCount, color, onCommand, disabled }) {
  const floors = [];
  for (let floor = 1; floor <= floorCount; floor++) {
    floors.push(floor);
  }

  let arrow = '';
  if (elevator.state === 'MOVING') {
    arrow = elevator.direction === 'UP' ? ' ▲' : ' ▼';
  }

  return (
    <div className="panel" style={{ borderLeftColor: color }}>
      <div className="panel-header">
        <strong style={{ color }}>Elevator {elevator.id}</strong>
        <span>
          Floor {elevator.floor}
          {arrow}
        </span>
        <span className="state">{STATE_TEXT[elevator.state]}</span>
      </div>

      {/* Nút chọn tầng: sáng khi thang sẽ ghé tầng đó */}
      <div className="floor-grid">
        {floors.map((floor) => {
          const isLit = elevator.stops.includes(floor);
          return (
            <button
              key={floor}
              className="floor-button"
              style={isLit ? { background: color, borderColor: color, color: 'white' } : undefined}
              onClick={() => onCommand('selectFloor', { elevatorId: elevator.id, floor })}
              disabled={disabled}
            >
              {floor}
            </button>
          );
        })}
      </div>

      <div className="door-buttons">
        <button onClick={() => onCommand('openDoor', { elevatorId: elevator.id })} disabled={disabled}>
          ◀ ▶ Open
        </button>
        <button onClick={() => onCommand('closeDoor', { elevatorId: elevator.id })} disabled={disabled}>
          ▶ ◀ Close
        </button>
      </div>
    </div>
  );
}
