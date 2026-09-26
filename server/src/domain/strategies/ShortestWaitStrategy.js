import { DispatchStrategy } from './DispatchStrategy.js';
import { Direction } from '../Direction.js';

export class ShortestWaitStrategy extends DispatchStrategy {
  #stopPenalty;

  constructor({ stopPenalty = 2 } = {}) {
    super();
    this.#stopPenalty = stopPenalty; // mỗi lần dừng dọc đường tốn thêm bao nhiêu bước
  }

  get name() {
    return 'SHORTEST_WAIT';
  }

  selectElevator(elevators, floor, direction) {
    let best = null;
    let bestWait = Infinity;
    for (const elevator of elevators) {
      const wait = this.estimateWait(elevator, floor, direction);
      if (wait < bestWait) {
        best = elevator;
        bestWait = wait;
      }
    }
    return best;
  }

  estimateWait(elevator, floor, direction) {
    const here = elevator.currentFloor;
    const requests = allRequestFloors(elevator);
    const doorDelay = elevator.state === 'DOOR_OPEN' ? this.#stopPenalty : 0;

    // 1. Thang rảnh: đi thẳng tới
    if (requests.length === 0) {
      return Math.abs(floor - here) + doorDelay;
    }

    const goingUp = elevator.direction === Direction.UP;
    const isAhead = goingUp ? floor >= here : floor <= here;

    // 2. Tiện đường: cùng hướng và tầng gọi nằm phía trước
    if (elevator.direction === direction && isAhead) {
      const stopsOnTheWay = requests.filter((r) =>
        goingUp ? r > here && r < floor : r < here && r > floor
      ).length;
      return Math.abs(floor - here) + stopsOnTheWay * this.#stopPenalty + doorDelay;
    }

    const farthestAhead = goingUp ? Math.max(here, ...requests) : Math.min(here, ...requests);
    let distance;

    if (elevator.direction !== direction) {
      // 3. Ngược hướng: đi tới cuối chiều hiện tại, quay đầu, về tầng gọi
      const turnFloor = goingUp ? Math.max(farthestAhead, floor) : Math.min(farthestAhead, floor);
      distance = Math.abs(turnFloor - here) + Math.abs(turnFloor - floor);
    } else {
      // 4. Cùng hướng nhưng đã đi qua: phải quay đầu 2 lần
      const farthestBehind = goingUp ? Math.min(floor, ...requests) : Math.max(floor, ...requests);
      distance =
        Math.abs(farthestAhead - here) +
        Math.abs(farthestAhead - farthestBehind) +
        Math.abs(floor - farthestBehind);
    }

    return distance + requests.length * this.#stopPenalty + doorDelay;
  }
}

function allRequestFloors(elevator) {
  const { stops, pickups } = elevator;
  return [...new Set([...stops, ...pickups[Direction.UP], ...pickups[Direction.DOWN]])];
}
