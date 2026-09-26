import { Direction } from '../constants.js';

// Bảng nút gọi thang dạng HTML: dùng được bằng bàn phím / trình đọc màn hình,
// song song với nút bấm trong cảnh 3D
export function HallPanel({ floorCount, pendingPickups, onCall, disabled }) {
  const floors = Array.from({ length: floorCount }, (_, i) => floorCount - i); // tầng cao ở trên

  return (
    <section className="hall-panel" aria-labelledby="hall-panel-title">
      <h2 id="hall-panel-title">Call an elevator</h2>
      <ol className="hall-rows">
        {floors.map((floor) => (
          <li key={floor} className="hall-row">
            <span className="hall-floor">{floor}</span>
            <HallCallButton
              floor={floor}
              direction={Direction.UP}
              hidden={floor === floorCount}
              on={pendingPickups[Direction.UP].includes(floor)}
              onCall={onCall}
              disabled={disabled}
            />
            <HallCallButton
              floor={floor}
              direction={Direction.DOWN}
              hidden={floor === 1}
              on={pendingPickups[Direction.DOWN].includes(floor)}
              onCall={onCall}
              disabled={disabled}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function HallCallButton({ floor, direction, hidden, on, onCall, disabled }) {
  // Giữ chỗ trống để các cột thẳng hàng (tầng 1 không có ▼, tầng trên cùng không có ▲)
  if (hidden) return <span className="hall-btn-spacer" />;

  const up = direction === Direction.UP;
  return (
    <button
      type="button"
      className={`hall-btn${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={`Floor ${floor}, going ${up ? 'up' : 'down'}`}
      disabled={disabled}
      onClick={() => onCall(floor, direction)}
    >
      {up ? '▲' : '▼'}
    </button>
  );
}
