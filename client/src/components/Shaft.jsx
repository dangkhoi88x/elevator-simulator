import { Direction, ElevatorStateName } from '../constants.js';

// Một trục thang: nền chia ô theo tầng, chấm đánh dấu tầng đã chọn, cabin trượt dọc theo CSS
export function Shaft({ elevator, floorCount, color, column }) {
  const { id, currentFloor, state, direction, stops } = elevator;
  const moving = state === ElevatorStateName.MOVING;
  const doorOpen = state === ElevatorStateName.DOOR_OPEN;
  const floors = Array.from({ length: floorCount }, (_, i) => floorCount - i); // tầng cao ở trên

  return (
    <div
      className="shaft"
      style={{ gridColumn: column, '--car-color': color, '--car-offset': floorCount - currentFloor }}
      aria-hidden="true"
    >
      {floors.map((floor) => (
        <div key={floor} className="shaft-cell">
          {stops.includes(floor) && <span className="stop-dot" />}
        </div>
      ))}

      <div className={`car${doorOpen ? ' is-open' : ''}`}>
        <span className="car-label">
          {id}
          {moving && <span className="car-arrow">{direction === Direction.UP ? '▲' : '▼'}</span>}
        </span>
        <span className="car-door car-door-left" />
        <span className="car-door car-door-right" />
      </div>
    </div>
  );
}
