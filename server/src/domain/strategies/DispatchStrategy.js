export class DispatchStrategy {
  constructor() {
    if (new.target === DispatchStrategy) {
      throw new Error('DispatchStrategy is abstract and cannot be instantiated');
    }
  }

  get name() {
    throw new Error(`${this.constructor.name} must implement name`);
  }

  selectElevator(elevators, floor, direction) {
    throw new Error(`${this.constructor.name} must implement selectElevator()`);
  }
}
