import { ElevatorState } from './ElevatorState.js';
import { MovingState } from './MovingState.js';
import { DoorOpenState } from './DoorOpenState.js';

// Thang đứng yên, cửa đóng, chờ việc
export class WaitingState extends ElevatorState {
  name = 'WAITING';

  step(elevator) {
    if (!elevator.hasWork()) {
      return; // không ai gọi -> tiếp tục đứng yên
    }
    elevator.setState(new MovingState()); // có việc -> chuyển sang chạy
    elevator.step(); // và chạy luôn trong nhịp này
  }

  pressOpen(elevator) {
    elevator.setState(new DoorOpenState());
  }

  // pressClose: cửa đang đóng sẵn -> dùng hàm mặc định của lớp cha (không làm gì)
}
