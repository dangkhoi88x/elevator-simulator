// Lớp cha của mọi trạng thái thang máy (State pattern).
// Mỗi lớp con tự quyết định thang làm gì ở mỗi nhịp và khi bấm nút cửa.
export class ElevatorState {
  name = 'UNKNOWN';

  // Mỗi nhịp thời gian. Lớp con BẮT BUỘC phải viết lại hàm này.
  step(elevator) {
    throw new Error(`${this.name}: chưa viết hàm step()`);
  }

  // Bấm nút mở / đóng cửa. Mặc định: không làm gì.
  // Lớp con nào cần xử lý thì viết lại.
  pressOpen(elevator) {}

  pressClose(elevator) {}
}
