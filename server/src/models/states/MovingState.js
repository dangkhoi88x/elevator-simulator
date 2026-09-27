import { ElevatorState } from './ElevatorState.js';
import { WaitingState } from './WaitingState.js';

// Thang đang chạy giữa các tầng
export class MovingState extends ElevatorState {
  name = 'MOVING';

  step(elevator) {
    // 1. Hết việc -> dừng lại chờ
    if (!elevator.hasWork()) {
      elevator.setState(new WaitingState());
      return;
    }

    // 2. Có việc ngay tầng đang đứng -> dừng luôn, không cần đi
    if (elevator.shouldStopHere()) {
      elevator.stopHere();
      return;
    }

    // 3. Phía trước hết việc (việc còn lại đều ở phía sau) -> quay đầu
    if (!elevator.hasWorkAhead()) {
      elevator.turnAround();
    }

    // 4. Đi 1 tầng, tới tầng cần ghé thì dừng
    elevator.moveOneFloor();
    if (elevator.shouldStopHere()) {
      elevator.stopHere();
    }
  }

  // pressOpen / pressClose: đang chạy thì không cho mở cửa -> dùng hàm mặc định (không làm gì)
}
