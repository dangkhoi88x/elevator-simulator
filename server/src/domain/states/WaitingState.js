import { ElevatorState } from './ElevatorState.js';

export class WaitingState extends ElevatorState {
  get name() {
    return 'WAITING';
  }

  step(elevator) {
    if (!elevator.hasRequests()) return;
    elevator.chooseDirection();
    elevator.startMoving();
    elevator.step();
  }

  pressOpen(elevator) {
    elevator.openDoors();
  }
}