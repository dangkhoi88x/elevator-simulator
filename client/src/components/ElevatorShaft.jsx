import { FLOOR_HEIGHT } from '../constants.js';

// Một trục thang. Cabin nằm ở tầng hiện tại và trượt lên xuống nhờ CSS transition.
export function ElevatorShaft({ elevator, floorCount, color }) {
  const isOpen = elevator.state === 'DOOR_OPEN';

  let arrow = '';
  if (elevator.state === 'MOVING') {
    arrow = elevator.direction === 'UP' ? '▲' : '▼';
  }

  return (
    <div className="shaft" style={{ height: floorCount * FLOOR_HEIGHT }}>
      <div
        className={isOpen ? 'car open' : 'car'}
        style={{
          height: FLOOR_HEIGHT - 6,
          // Tầng 1 nằm ở đáy trục, mỗi tầng cao hơn FLOOR_HEIGHT px
          bottom: (elevator.floor - 1) * FLOOR_HEIGHT + 3,
          borderColor: color,
        }}
      >
        <div className="car-label" style={{ background: color }}>
          {elevator.id} {arrow}
        </div>
        <div className="door left" />
        <div className="door right" />
      </div>
    </div>
  );
}
