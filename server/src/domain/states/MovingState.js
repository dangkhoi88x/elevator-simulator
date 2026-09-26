import { ElevatorState } from './ElevatorState.js';

export class MovingState extends ElevatorState {
  get name() {
    return 'MOVING';
  }

  step(elevator) {
    if (!elevator.hasStops()) {
      elevator.becomeWaiting();
      return;
    }

    if (!elevator.hasStopHere()) {
      elevator.moveOneFloor();
    }

    if (elevator.hasStopHere()) {
      elevator.arriveHere();
    }
  }
}