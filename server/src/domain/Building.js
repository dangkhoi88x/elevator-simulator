import { EventEmitter } from 'node:events';
import { Elevator } from './Elevator.js';
import { Direction } from './Direction.js';
import { DispatchStrategy } from './strategies/DispatchStrategy.js';
import { ShortestWaitStrategy } from './strategies/ShortestWaitStrategy.js';

export class Building extends EventEmitter {
  #floorCount;
  #elevators;
  #assignments = new Map(); // "5-UP" -> id thang đã nhận đón
  #timer = null;
  #strategy;

  constructor({
    floorCount = 10,
    elevatorCount = 3,
    doorHoldSteps = 3,
    strategy = new ShortestWaitStrategy(),
  } = {}) {
    super();
    if (!(strategy instanceof DispatchStrategy)) {
      throw new Error('strategy must extend DispatchStrategy');
    }
    this.#floorCount = floorCount;
    this.#strategy = strategy;
    this.#elevators = Array.from({ length: elevatorCount }, (_, i) => {
      const id = String.fromCharCode(65 + i); // 'A', 'B', 'C'
      const elevator = new Elevator(id, 1, { doorHoldSteps });
      elevator.on('arrived', (event) => this.#onElevatorArrived(event));
      return elevator;
    });
  }

  get floorCount() {
    return this.#floorCount;
  }

  get strategyName() {
    return this.#strategy.name;
  }

  get isRunning() {
    return this.#timer !== null;
  }

  // ---- Lệnh từ người dùng ----

  requestPickup(floor, direction) {
    this.#validateFloor(floor);
    this.#validateDirection(floor, direction);

    const key = `${floor}-${direction}`;
    if (this.#assignments.has(key)) return; // đã có thang nhận rồi

    const elevator = this.#strategy.selectElevator(this.#elevators, floor, direction);
    elevator.requestPickup(floor, direction);
    if (elevator.pickups[direction].includes(floor)) {
      this.#assignments.set(key, elevator.id);
    }
    this.#emitUpdate();
  }

  selectFloor(elevatorId, floor) {
    this.#validateFloor(floor);
    this.#getElevator(elevatorId).addStop(floor);
    this.#emitUpdate();
  }

  pressOpen(elevatorId) {
    this.#getElevator(elevatorId).pressOpen();
    this.#emitUpdate();
  }

  pressClose(elevatorId) {
    this.#getElevator(elevatorId).pressClose();
    this.#emitUpdate();
  }

  // ---- Nhịp thời gian ----

  step() {
    for (const elevator of this.#elevators) {
      elevator.step();
    }
    this.#emitUpdate();
  }

  start(intervalMs = 1000) {
    if (this.#timer) return;
    this.#timer = setInterval(() => this.step(), intervalMs);
  }

  stop() {
    clearInterval(this.#timer);
    this.#timer = null;
  }

  // ---- Ảnh chụp trạng thái ----

  getSnapshot() {
    const pendingPickups = { [Direction.UP]: [], [Direction.DOWN]: [] };
    for (const key of this.#assignments.keys()) {
      const [floor, direction] = key.split('-');
      pendingPickups[direction].push(Number(floor));
    }

    return {
      floorCount: this.#floorCount,
      elevators: this.#elevators.map((e) => ({
        id: e.id,
        currentFloor: e.currentFloor,
        direction: e.direction,
        state: e.state,
        stops: e.stops,
      })),
      pendingPickups,
    };
  }

  // ---- Private ----

  #emitUpdate() {
    this.emit('update', this.getSnapshot());
  }

  #onElevatorArrived({ elevatorId, floor, direction }) {
    const key = `${floor}-${direction}`;
    if (this.#assignments.get(key) === elevatorId) {
      this.#assignments.delete(key);
    }
  }

  #getElevator(id) {
    const elevator = this.#elevators.find((e) => e.id === id);
    if (!elevator) {
      throw new Error(`Unknown elevator: ${id}`);
    }
    return elevator;
  }

  #validateFloor(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > this.#floorCount) {
      throw new Error(`Invalid floor: ${floor}`);
    }
  }

  #validateDirection(floor, direction) {
    if (!Object.values(Direction).includes(direction)) {
      throw new Error(`Invalid direction: ${direction}`);
    }
    if (floor === this.#floorCount && direction === Direction.UP) {
      throw new Error(`Cannot go UP from the top floor`);
    }
    if (floor === 1 && direction === Direction.DOWN) {
      throw new Error(`Cannot go DOWN from the ground floor`);
    }
  }
}
