import { ElevatorState } from './ElevatorState.js';

export class MovingState extends ElevatorState {
  get name() {
    return 'MOVING';
  }

  step(elevator) {
    if (!elevator.hasRequests()) {
      elevator.becomeWaiting();
      return;
    }

    if (!elevator.shouldStopHere()) {
      if (!elevator.hasRequestsAhead()) {
        elevator.reverseDirection();
      }
      elevator.moveOneFloor();
    }

    if (elevator.shouldStopHere()) {
      elevator.arriveHere();
    }
  }
}
