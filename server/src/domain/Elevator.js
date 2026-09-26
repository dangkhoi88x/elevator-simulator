import { EventEmitter } from 'node:events';
import { WaitingState } from './states/WaitingState.js';
import { MovingState } from './states/MovingState.js';
import { DoorOpenState } from './states/DoorOpenState.js';

export class Elevator extends EventEmitter {
  #id;
  #currentFloor;
  #stops = new Set(); // ghé không trùng
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

  get stops() {
    return [...this.#stops].sort((a, b) => a - b); // copy mảng mới - sắp xếp theo số
  }

  get state() {
    return this.#state.name;
  }

  // ---- Dành cho bên ngoài gọi ----

  addStop(floor) {
    if (!Number.isInteger(floor)) {
      throw new Error(`Invalid floor: ${floor}`);
    }
    this.#stops.add(floor);
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

  hasStops() {
    return this.#stops.size > 0;
  }

  hasStopHere() {
    return this.#stops.has(this.#currentFloor);
  }

  moveOneFloor() {
    const target = this.#findNearestStop();
    this.#currentFloor += target > this.#currentFloor ? 1 : -1; // nhích 1 tầng về phía tầng gần nhất
  }

  arriveHere() {
    this.#stops.delete(this.#currentFloor);
    this.emit('arrived', { elevatorId: this.#id, floor: this.#currentFloor });
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

  #findNearestStop() {
    let nearest = null;
    for (const floor of this.#stops) {
      if (nearest === null ||
          Math.abs(floor - this.#currentFloor) < Math.abs(nearest - this.#currentFloor)) {
        nearest = floor;
      }
    }
    return nearest;
  }
}
