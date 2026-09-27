import { EventEmitter } from 'node:events';
import { Direction, opposite } from './Direction.js';
import { WaitingState } from './states/WaitingState.js';
import { MovingState } from './states/MovingState.js';
import { DoorOpenState } from './states/DoorOpenState.js';

export class Elevator extends EventEmitter {
  #id;
  #currentFloor;
  #direction = Direction.UP;
  #stops = new Set(); // tầng khách trong thang chọn (không trùng)
  #pickups = { [Direction.UP]: new Set(), [Direction.DOWN]: new Set() }; // tầng có người chờ, theo hướng muốn đi
  #state = new WaitingState();
  #doorHoldSteps;

  constructor(id, startFloor = 1, { doorHoldSteps = 3 } = {}) {
    super();
    this.#id = id;
    this.#currentFloor = startFloor;
    this.#doorHoldSteps = doorHoldSteps;
  }

  get id() {
    return this.#id;
  }

  get currentFloor() {
    return this.#currentFloor;
  }

  get direction() {
    return this.#direction;
  }

  get stops() {
    return [...this.#stops].sort((a, b) => a - b); // copy mảng mới - sắp xếp theo số
  }

  get pickups() {
    return {
      [Direction.UP]: [...this.#pickups[Direction.UP]].sort((a, b) => a - b),
      [Direction.DOWN]: [...this.#pickups[Direction.DOWN]].sort((a, b) => a - b),
    };
  }

  get state() {
    return this.#state.name;
  }

  // ---- Dành cho bên ngoài gọi ----

  addStop(floor) {
    this.#validateFloor(floor);
    if (this.#isDoorOpenHere(floor)) {
      this.pressOpen();
      return;
    }
    this.#stops.add(floor);
  }

  requestPickup(floor, direction) {
    this.#validateFloor(floor);
    if (!Object.values(Direction).includes(direction)) {
      throw new Error(`Invalid direction: ${direction}`);
    }
    // Cửa đang mở ngay tầng này và thang đi được hướng khách muốn -> chỉ giữ cửa cho khách vào.
    // Thang không còn việc gì thì quay sang hướng khách muốn luôn, khỏi đóng cửa rồi mở lại.
    if (this.#isDoorOpenHere(floor) && (direction === this.#direction || !this.hasRequests())) {
      this.#direction = direction;
      this.pressOpen();
      return;
    }
    this.#pickups[direction].add(floor);
  }

  step() {
    this.#state.step(this); // giao cho trạng thái hiện tại xử lý
  }

  pressOpen() {
    this.#state.pressOpen(this);
  }

  pressClose() {
    this.#state.pressClose(this);
  }

  // ---- Dành cho các State gọi ----

  hasRequests() {
    return this.#allRequestFloors().length > 0;
  }

  hasRequestsAhead() {
    return this.#allRequestFloors().some((floor) =>
      this.#direction === Direction.UP ? floor > this.#currentFloor : floor < this.#currentFloor
    );
  }

  shouldStopHere() {
    const floor = this.#currentFloor;
    if (this.#stops.has(floor)) return true;
    if (this.#pickups[this.#direction].has(floor)) return true;
    if (this.#pickups[opposite(this.#direction)].has(floor) && !this.hasRequestsAhead()) return true;
    return false;
  }

  chooseDirection() {
    if (this.shouldStopHere() || this.hasRequestsAhead()) return;
    this.reverseDirection();
  }

  reverseDirection() {
    this.#direction = opposite(this.#direction);
  }

  moveOneFloor() {
    this.#currentFloor += this.#direction === Direction.UP ? 1 : -1; // nhích 1 tầng theo hướng đang đi
  }

  arriveHere() {
    const floor = this.#currentFloor;
    this.#stops.delete(floor);

    if (this.#pickups[this.#direction].has(floor)) {
      this.#pickups[this.#direction].delete(floor);
    } else if (this.#pickups[opposite(this.#direction)].has(floor) && !this.hasRequestsAhead()) {
      this.#pickups[opposite(this.#direction)].delete(floor);
      this.reverseDirection();
    }

    this.emit('arrived', { elevatorId: this.#id, floor, direction: this.#direction });
    this.openDoors();
  }

  startMoving() {
    this.#state = new MovingState();
  }

  becomeWaiting() {
    this.#state = new WaitingState();
  }

  openDoors() {
    this.#state = new DoorOpenState(this.#doorHoldSteps);
    this.emit('doorOpened', { elevatorId: this.#id, floor: this.#currentFloor });
  }

  closeDoors() {
    this.#state = new WaitingState();
    this.emit('doorClosed', { elevatorId: this.#id, floor: this.#currentFloor });
  }

  // ---- Private ----

  #validateFloor(floor) {
    if (!Number.isInteger(floor)) {
      throw new Error(`Invalid floor: ${floor}`);
    }
  }

  #isDoorOpenHere(floor) {
    return this.state === 'DOOR_OPEN' && floor === this.#currentFloor;
  }

  #allRequestFloors() {
    return [...this.#stops, ...this.#pickups[Direction.UP], ...this.#pickups[Direction.DOWN]];
  }
}
