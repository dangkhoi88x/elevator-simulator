import { DispatchStrategy } from './DispatchStrategy.js';

export class NearestElevatorStrategy extends DispatchStrategy {
  get name() {
    return 'NEAREST';
  }

  selectElevator(elevators, floor) {
    return elevators.reduce((best, e) =>
      Math.abs(e.currentFloor - floor) < Math.abs(best.currentFloor - floor) ? e : best
    );
  }
}
