export class ElevatorState {
  constructor() {
    if (new.target === ElevatorState) {
      throw new Error('ElevatorState is abstract and cannot be instantiated');
    }
  }

  get name() {
    throw new Error(`${this.constructor.name} must implement name`);
  }

  step(elevator) {
    throw new Error(`${this.constructor.name} must implement step()`);
  }

  pressOpen(elevator) {}

  pressClose(elevator) {}
}