import { Direction, ElevatorStateName } from '../constants.js';
import { elevatorColor } from '../theme.js';

const STATE_LABEL = {
  [ElevatorStateName.WAITING]: 'Idle',
  [ElevatorStateName.MOVING]: 'Moving',
  [ElevatorStateName.DOOR_OPEN]: 'Doors open',
};

// Bản chữ của cảnh 3D: đọc nhanh số liệu, và cho trình đọc màn hình
export function ElevatorStatus({ elevators }) {
  return (
    <ul className="status-list">
      {elevators.map((e, i) => {
        const pickups = [
          ...e.pickups[Direction.UP].map((f) => `${f}▲`),
          ...e.pickups[Direction.DOWN].map((f) => `${f}▼`),
        ];
        const moving = e.state === ElevatorStateName.MOVING;
        return (
          <li key={e.id} className="status-card" style={{ '--car-color': elevatorColor(i) }}>
            <div className="status-head">
              <span className="status-id">{e.id}</span>
              <span className="status-floor">
                {e.currentFloor}
                {moving && <span aria-label={e.direction === Direction.UP ? 'going up' : 'going down'}>
                  {e.direction === Direction.UP ? ' ▲' : ' ▼'}
                </span>}
              </span>
              <span className={`status-state state-${e.state.toLowerCase()}`}>{STATE_LABEL[e.state] ?? e.state}</span>
            </div>
            <dl>
              <dt>Stops</dt>
              <dd>{e.stops.length ? e.stops.join(', ') : '—'}</dd>
              <dt>Pickups</dt>
              <dd>{pickups.length ? pickups.join(', ') : '—'}</dd>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
