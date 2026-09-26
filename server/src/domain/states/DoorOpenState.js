import { ElevatorState } from './ElevatorState.js';

export class DoorOpenState extends ElevatorState {
  #holdSteps;
  #stepsLeft;

  constructor(holdSteps) {
    super();
    this.#holdSteps = holdSteps;
    this.#stepsLeft = holdSteps;
  }

  get name() {
    return 'DOOR_OPEN';
  }

  step(elevator) {
    this.#stepsLeft--;
    if (this.#stepsLeft <= 0) {
      elevator.closeDoors();
    }
  }

  pressOpen() {
    this.#stepsLeft = this.#holdSteps;
  }

  pressClose(elevator) {
    elevator.closeDoors();
  }
}