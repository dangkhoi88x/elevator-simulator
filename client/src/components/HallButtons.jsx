import { Direction } from '../constants.js';

// Cặp nút ▲▼ ở sảnh một tầng; đèn sáng theo pendingPickups từ server
export function HallButtons({ floor, floorCount, pendingPickups, onCall, disabled }) {
  return (
    <div className="hall-buttons">
      <HallButton
        floor={floor}
        direction={Direction.UP}
        hidden={floor === floorCount}
        on={pendingPickups[Direction.UP].includes(floor)}
        onCall={onCall}
        disabled={disabled}
      />
      <HallButton
        floor={floor}
        direction={Direction.DOWN}
        hidden={floor === 1}
        on={pendingPickups[Direction.DOWN].includes(floor)}
        onCall={onCall}
        disabled={disabled}
      />
    </div>
  );
}

function HallButton({ floor, direction, hidden, on, onCall, disabled }) {
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
