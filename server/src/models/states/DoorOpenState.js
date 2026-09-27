import { ElevatorState } from './ElevatorState.js';
import { WaitingState } from './WaitingState.js';

const OPEN_STEPS = 3; // cửa mở trong 3 nhịp rồi tự đóng

// Thang đang dừng, cửa mở cho khách ra vào
export class DoorOpenState extends ElevatorState {
  name = 'DOOR_OPEN';
  #stepsLeft = OPEN_STEPS; // còn bao nhiêu nhịp nữa thì cửa tự đóng

  step(elevator) {
    this.#stepsLeft--;
    if (this.#stepsLeft === 0) {
      elevator.setState(new WaitingState()); // hết giờ -> đóng cửa
    }
  }

  // Bấm mở: giữ cửa mở thêm (đếm lại từ đầu)
  pressOpen() {
    this.#stepsLeft = OPEN_STEPS;
  }

  // Bấm đóng: đóng cửa ngay
  pressClose(elevator) {
    elevator.setState(new WaitingState());
  }
}
