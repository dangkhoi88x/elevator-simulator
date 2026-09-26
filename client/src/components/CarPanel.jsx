// Bảng nút trong cabin: chọn tầng + mở/đóng cửa. Đèn nút tầng sáng theo stops từ server
export function CarPanel({ elevator, floorCount, onCommand, disabled }) {
  const { id, stops } = elevator;
  const floors = Array.from({ length: floorCount }, (_, i) => i + 1);

  return (
    <div className="car-panel" role="group" aria-label={`Elevator ${id} controls`}>
      <div className="car-floors">
        {floors.map((floor) => {
          const on = stops.includes(floor);
          return (
            <button
              key={floor}
              type="button"
              className={`car-btn${on ? ' is-on' : ''}`}
              aria-pressed={on}
              aria-label={`Elevator ${id}: go to floor ${floor}`}
              disabled={disabled}
              onClick={() => onCommand('selectFloor', { elevatorId: id, floor })}
            >
              {floor}
            </button>
          );
        })}
      </div>
      <div className="car-doors">
        <button
          type="button"
          className="door-btn"
          aria-label={`Elevator ${id}: open doors`}
          disabled={disabled}
          onClick={() => onCommand('openDoor', { elevatorId: id })}
        >
          ◀▶
        </button>
        <button
          type="button"
          className="door-btn"
          aria-label={`Elevator ${id}: close doors`}
          disabled={disabled}
          onClick={() => onCommand('closeDoor', { elevatorId: id })}
        >
          ▶◀
        </button>
      </div>
    </div>
  );
}
