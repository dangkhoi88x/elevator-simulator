import { ElevatorState } from './ElevatorState.js';

export class WaitingState extends ElevatorState {
  get name() {
    return 'WAITING';
  }

  step(elevator) {
    if (!elevator.hasStops()) return;
    elevator.startMoving();
    elevator.step();
  }

  pressOpen(elevator) {
    elevator.openDoors();
  }
}