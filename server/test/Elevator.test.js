import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Elevator } from '../src/models/Elevator.js';

// Chạy n nhịp
function run(elevator, n) {
  for (let i = 0; i < n; i++) elevator.step();
}

// Chạy n nhịp, ghi lại mỗi lần thang dừng mở cửa: "tầng-hướng"
function runAndRecordStops(elevator, n) {
  const stops = [];
  for (let i = 0; i < n; i++) {
    const wasOpen = elevator.getInfo().state === 'DOOR_OPEN';
    elevator.step();
    const info = elevator.getInfo();
    if (!wasOpen && info.state === 'DOOR_OPEN') {
      stops.push(`${info.floor}-${info.direction}`);
    }
  }
  return stops;
}

// ===== Di chuyển =====

test('đi lên tới tầng khách chọn rồi mở cửa', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(4);
  run(e, 3); // 1 -> 2 -> 3 -> 4

  const info = e.getInfo();
  assert.equal(info.floor, 4);
  assert.equal(info.state, 'DOOR_OPEN');
  assert.deepEqual(info.stops, []);
});

test('đi xuống tới tầng khách chọn', () => {
  const e = new Elevator('A', 8);
  e.selectFloor(5);
  run(e, 3); // 8 -> 7 -> 6 -> 5

  assert.equal(e.floor, 5);
});

test('nhiều tầng thì dừng theo thứ tự đi qua', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(4);
  e.selectFloor(2);

  assert.deepEqual(runAndRecordStops(e, 20), ['2-UP', '4-UP']);
});

// ===== Cửa =====

test('cửa tự đóng sau 3 nhịp', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(2);
  e.step(); // tới tầng 2, mở cửa

  run(e, 2);
  assert.equal(e.getInfo().state, 'DOOR_OPEN'); // mới qua 2 nhịp, vẫn mở

  e.step();
  assert.equal(e.getInfo().state, 'WAITING'); // nhịp thứ 3, đóng
});

test('[ĐỀ BÀI] bấm mở thì giữ cửa mở, bấm đóng thì đóng ngay', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(2);
  e.step(); // mở cửa
  run(e, 2); // sắp hết giờ

  e.pressOpen(); // giữ cửa: đếm lại từ đầu
  run(e, 2);
  assert.equal(e.getInfo().state, 'DOOR_OPEN');

  e.pressClose();
  assert.equal(e.getInfo().state, 'WAITING');
});

test('đang chạy thì bấm mở / đóng không có tác dụng', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(5);
  e.step(); // đang chạy, ở tầng 2

  e.pressOpen();
  assert.equal(e.getInfo().state, 'MOVING');
  e.pressClose();
  assert.equal(e.getInfo().state, 'MOVING');
});

// ===== Đón khách theo hướng =====

test('[ĐỀ BÀI] thang đang lên tầng 10, người ở tầng 5 bấm LÊN -> thang dừng đón ở 5', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(10);
  e.step(); // đang đi lên, ở tầng 2
  e.addCall(5, 'UP');

  assert.deepEqual(runAndRecordStops(e, 30), ['5-UP', '10-UP']);
});

test('[ĐỀ BÀI] thang đang lên tầng 10, người ở tầng 5 bấm XUỐNG -> không dừng, lên 10 rồi quay xuống đón', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(10);
  e.step();
  e.addCall(5, 'DOWN');

  assert.deepEqual(runAndRecordStops(e, 30), ['10-UP', '5-DOWN']);
});

test('chỉ có người ở tầng 7 bấm XUỐNG: thang lên 7 rồi đổi hướng thành XUỐNG', () => {
  const e = new Elevator('A', 1);
  e.addCall(7, 'DOWN');
  run(e, 6);

  const info = e.getInfo();
  assert.equal(info.floor, 7);
  assert.equal(info.state, 'DOOR_OPEN');
  assert.equal(info.direction, 'DOWN');
});

// ===== Bấm gọi khi thang đang mở cửa ngay tầng đó =====

test('cửa đang mở, người bấm cùng hướng -> chỉ giữ cửa, không thêm việc', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(3);
  run(e, 4); // tới tầng 3, cửa mở, sắp đóng

  e.addCall(3, 'UP');
  run(e, 2);
  assert.equal(e.getInfo().state, 'DOOR_OPEN');
  assert.deepEqual(e.getInfo().upCalls, []);
});

test('cửa đang mở, thang hết việc, người bấm ngược hướng -> thang đổi hướng và giữ cửa', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(3);
  run(e, 2); // tới tầng 3 (đang đi lên), cửa mở

  e.addCall(3, 'DOWN');
  assert.equal(e.direction, 'DOWN');
  assert.deepEqual(e.getInfo().downCalls, []);
  run(e, 2);
  assert.equal(e.getInfo().state, 'DOOR_OPEN'); // không đóng rồi mở lại
});

test('cửa đang mở nhưng thang còn việc phía trước -> người bấm ngược hướng phải chờ lượt quay về', () => {
  const e = new Elevator('A', 1);
  e.selectFloor(3);
  e.selectFloor(8);
  run(e, 2); // dừng ở 3, còn tầng 8 phía trên

  e.addCall(3, 'DOWN');
  assert.equal(e.direction, 'UP');
  assert.deepEqual(e.getInfo().downCalls, [3]);
});
