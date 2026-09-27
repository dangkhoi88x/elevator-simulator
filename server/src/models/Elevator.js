import { UP, DOWN } from './Direction.js';
import { WaitingState } from './states/WaitingState.js';
import { DoorOpenState } from './states/DoorOpenState.js';

// Một thang máy.
// Mọi dữ liệu đều private (dấu #): bên ngoài không sửa trực tiếp được,
// chỉ thay đổi qua các hàm public bên dưới.
export class Elevator {
  #id;
  #floor;
  #direction = UP;
  #state = new WaitingState();
  #stops = new Set();     // tầng khách TRONG thang đã bấm
  #upCalls = new Set();   // tầng có người chờ ở sảnh, muốn đi LÊN
  #downCalls = new Set(); // tầng có người chờ ở sảnh, muốn đi XUỐNG

  constructor(id, floor = 1) {
    this.#id = id;
    this.#floor = floor;
  }

  get id() {
    return this.#id;
  }

  get floor() {
    return this.#floor;
  }

  get direction() {
    return this.#direction;
  }

  // Tất cả các tầng thang còn phải ghé (trả về mảng mới, sửa mảng này không ảnh hưởng thang)
  get targets() {
    return [...this.#stops, ...this.#upCalls, ...this.#downCalls];
  }

  // ===== Người dùng bấm nút =====

  // Khách trong thang bấm nút chọn tầng
  selectFloor(floor) {
    if (this.#isDoorOpenAt(floor)) {
      this.pressOpen(); // đang mở cửa đúng tầng đó -> coi như bấm giữ cửa
      return;
    }
    this.#stops.add(floor);
  }

  // Người ở sảnh tầng `floor` gọi thang này, muốn đi hướng `direction`
  addCall(floor, direction) {
    // Thang đang mở cửa ngay tầng đó và đi được hướng khách muốn -> chỉ cần giữ cửa cho khách vào
    if (this.#isDoorOpenAt(floor) && (direction === this.#direction || !this.hasWork())) {
      this.#direction = direction;
      this.pressOpen();
      return;
    }
    this.#callsGoing(direction).add(floor);
  }

  // Thang này đã nhận đón người ở tầng `floor` đi hướng `direction` chưa?
  hasCall(floor, direction) {
    return this.#callsGoing(direction).has(floor);
  }

  // Ba hàm dưới đây giao việc cho trạng thái hiện tại (đa hình):
  // cùng một lời gọi, mỗi trạng thái xử lý một kiểu.
  step() {
    this.#state.step(this);
  }

  pressOpen() {
    this.#state.pressOpen(this);
  }

  pressClose() {
    this.#state.pressClose(this);
  }

  // ===== Các lớp State gọi những hàm này =====

  setState(newState) {
    this.#state = newState;
  }

  // Còn tầng nào phải ghé không?
  hasWork() {
    return this.targets.length > 0;
  }

  // Còn tầng nào phải ghé ở PHÍA TRƯỚC (theo hướng đang đi) không?
  hasWorkAhead() {
    return this.targets.some((floor) =>
      this.#direction === UP ? floor > this.#floor : floor < this.#floor
    );
  }

  // Có nên dừng ở tầng hiện tại không?
  shouldStopHere() {
    const floor = this.#floor;

    // Có khách trong thang muốn ra ở tầng này
    if (this.#stops.has(floor)) return true;

    // Có người chờ đi CÙNG hướng thang đang đi
    if (this.#callsGoing(this.#direction).has(floor)) return true;

    // Có người chờ đi NGƯỢC hướng: chỉ đón khi phía trước hết việc (thang sắp quay đầu).
    // Ví dụ: thang đang lên tầng 10, người ở tầng 5 bấm xuống -> KHÔNG dừng ở 5 lúc đi lên.
    return this.#callsGoing(this.#oppositeDirection()).has(floor) && !this.hasWorkAhead();
  }

  // Dừng ở tầng hiện tại: xoá các yêu cầu đã xong rồi mở cửa
  stopHere() {
    const floor = this.#floor;
    this.#stops.delete(floor);

    if (this.#callsGoing(this.#direction).has(floor)) {
      // Đón người đi cùng hướng
      this.#callsGoing(this.#direction).delete(floor);
    } else if (this.#callsGoing(this.#oppositeDirection()).has(floor) && !this.hasWorkAhead()) {
      // Đón người đi ngược hướng -> thang đổi hướng theo họ
      this.#callsGoing(this.#oppositeDirection()).delete(floor);
      this.turnAround();
    }

    this.setState(new DoorOpenState());
  }

  moveOneFloor() {
    if (this.#direction === UP) {
      this.#floor++;
    } else {
      this.#floor--;
    }
  }

  turnAround() {
    this.#direction = this.#oppositeDirection();
  }

  // Thông tin gửi cho giao diện (object thường, không lộ dữ liệu private)
  getInfo() {
    return {
      id: this.#id,
      floor: this.#floor,
      direction: this.#direction,
      state: this.#state.name,
      stops: sortNumbers(this.#stops),
      upCalls: sortNumbers(this.#upCalls),
      downCalls: sortNumbers(this.#downCalls),
    };
  }

  // ===== Hàm private (chỉ dùng trong lớp này) =====

  #callsGoing(direction) {
    return direction === UP ? this.#upCalls : this.#downCalls;
  }

  #oppositeDirection() {
    return this.#direction === UP ? DOWN : UP;
  }

  #isDoorOpenAt(floor) {
    return this.#state instanceof DoorOpenState && this.#floor === floor;
  }
}

// Set -> mảng số đã sắp xếp tăng dần
function sortNumbers(set) {
  return [...set].sort((a, b) => a - b);
}
