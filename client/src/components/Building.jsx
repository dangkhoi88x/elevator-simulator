import { HallButtons } from './HallButtons.jsx';
import { Shaft } from './Shaft.jsx';
import { elevatorColor } from '../theme.js';

// Mặt cắt toà nhà dạng lưới: mỗi hàng là một tầng, cột trái là số tầng + nút gọi, còn lại là các trục thang
export function Building({ snapshot, onCall, disabled }) {
  const { floorCount, elevators, pendingPickups } = snapshot;
  const floors = Array.from({ length: floorCount }, (_, i) => floorCount - i);

  return (
    <div className="building-scroll">
      <div
        className="building"
        style={{ '--floors': floorCount, '--shafts': elevators.length }}
      >
        {floors.map((floor, row) => (
          <div key={floor} className="lobby" style={{ gridRow: row + 1 }}>
            <span className="floor-number">{floor}</span>
            <HallButtons
              floor={floor}
              floorCount={floorCount}
              pendingPickups={pendingPickups}
              onCall={onCall}
              disabled={disabled}
            />
          </div>
        ))}

        {elevators.map((elevator, i) => (
          <Shaft
            key={elevator.id}
            elevator={elevator}
            floorCount={floorCount}
            color={elevatorColor(i)}
            column={i + 2}
          />
        ))}
      </div>
    </div>
  );
}
