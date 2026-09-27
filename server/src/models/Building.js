import { UP, DOWN } from './Direction.js';
import { Elevator } from './Elevator.js';

const ELEVATOR_NAMES = ['A', 'B', 'C', 'D', 'E'];

// Toà nhà: quản lý các thang máy và quyết định thang nào đi đón khách
export class Building {
  #floorCount;
  #elevators = [];

  constructor(floorCount = 10, elevatorCount = 3) {
    this.#floorCount = floorCount;
    for (let i = 0; i < elevatorCount; i++) {
      this.#elevators.push(new Elevator(ELEVATOR_NAMES[i], 1)); // mọi thang bắt đầu ở tầng 1
    }
  }

  // ===== Lệnh từ người dùng =====

  // Người ở sảnh tầng `floor` bấm nút gọi thang (UP hoặc DOWN)
  callElevator(floor, direction) {
    this.#checkFloor(floor);
    this.#checkDirection(floor, direction);

    // Nút này đã có thang nhận đón rồi -> không gọi thêm thang nữa
    const alreadyCalled = this.#elevators.some((e) => e.hasCall(floor, direction));
    if (alreadyCalled) return;

    const elevator = this.#findBestElevator(floor, direction);
    elevator.addCall(floor, direction);
  }

  // Khách trong thang `elevatorId` bấm nút tầng `floor`
  selectFloor(elevatorId, floor) {
    this.#checkFloor(floor);
    this.#getElevator(elevatorId).selectFloor(floor);
  }

  openDoor(elevatorId) {
    this.#getElevator(elevatorId).pressOpen();
  }

  closeDoor(elevatorId) {
    this.#getElevator(elevatorId).pressClose();
  }

  // Một nhịp thời gian: mọi thang cùng đi một bước
  step() {
    for (const elevator of this.#elevators) {
      elevator.step();
    }
  }

  // Trạng thái toàn bộ toà nhà, gửi cho giao diện
  getState() {
    const elevators = this.#elevators.map((e) => e.getInfo());
    return {
      floorCount: this.#floorCount,
      elevators,
      // Nút gọi đang sáng ở sảnh = các tầng mà các thang đang được giao đi đón
      upCalls: elevators.flatMap((e) => e.upCalls),
      downCalls: elevators.flatMap((e) => e.downCalls),
    };
  }

  // ===== Chọn thang =====

  // Chọn thang có "chi phí" thấp nhất = đến đón khách nhanh nhất
  #findBestElevator(floor, direction) {
    let best = this.#elevators[0];
    for (const elevator of this.#elevators) {
      if (this.#estimateCost(elevator, floor, direction) < this.#estimateCost(best, floor, direction)) {
        best = elevator;
      }
    }
    return best;
  }

  // Ước lượng thang phải đi bao nhiêu tầng nữa mới tới đón được khách
  #estimateCost(elevator, floor, direction) {
    const distance = Math.abs(elevator.floor - floor);

    // 1. Thang rảnh: đi thẳng tới
    if (!elevator.hasWork()) {
      return distance;
    }

    // 2. Thang đang đi cùng hướng khách muốn, và tầng khách nằm phía trước: tiện đường ghé đón
    const isAhead = elevator.direction === UP ? floor >= elevator.floor : floor <= elevator.floor;
    if (elevator.direction === direction && isAhead) {
      return distance;
    }

    // 3. Còn lại: thang phải chạy tới tầng xa nhất theo hướng đang đi, quay đầu, rồi mới về đón
    const turnFloor =
      elevator.direction === UP
        ? Math.max(elevator.floor, ...elevator.targets)
        : Math.min(elevator.floor, ...elevator.targets);
    return Math.abs(elevator.floor - turnFloor) + Math.abs(turnFloor - floor);
  }

  // ===== Kiểm tra dữ liệu đầu vào =====

  #getElevator(id) {
    const elevator = this.#elevators.find((e) => e.id === id);
    if (!elevator) {
      throw new Error(`Unknown elevator: ${id}`);
    }
    return elevator;
  }

  #checkFloor(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > this.#floorCount) {
      throw new Error(`Invalid floor: ${floor}`);
    }
  }

  #checkDirection(floor, direction) {
    if (direction !== UP && direction !== DOWN) {
      throw new Error(`Invalid direction: ${direction}`);
    }
    if (floor === this.#floorCount && direction === UP) {
      throw new Error('Cannot go UP from the top floor');
    }
    if (floor === 1 && direction === DOWN) {
      throw new Error('Cannot go DOWN from the ground floor');
    }
  }
}
