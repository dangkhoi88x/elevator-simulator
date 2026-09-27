import { FLOOR_HEIGHT, COLORS } from '../constants.js';
import { FloorButtons } from './FloorButtons.jsx';
import { ElevatorShaft } from './ElevatorShaft.jsx';

// Hình toà nhà: cột trái là các tầng + nút gọi thang, bên phải là các trục thang
export function Building({ building, onCall, disabled }) {
  // Tầng cao nhất vẽ ở trên cùng: [10, 9, ..., 1]
  const floors = [];
  for (let floor = building.floorCount; floor >= 1; floor--) {
    floors.push(floor);
  }

  return (
    <div className="building">
      <div className="floors">
        {floors.map((floor) => (
          <div key={floor} className="floor" style={{ height: FLOOR_HEIGHT }}>
            <span className="floor-number">{floor}</span>
            <FloorButtons
              floor={floor}
              floorCount={building.floorCount}
              upCalls={building.upCalls}
              downCalls={building.downCalls}
              onCall={onCall}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {building.elevators.map((elevator, index) => (
        <ElevatorShaft
          key={elevator.id}
          elevator={elevator}
          floorCount={building.floorCount}
          color={COLORS[index % COLORS.length]}
        />
      ))}
    </div>
  );
}
