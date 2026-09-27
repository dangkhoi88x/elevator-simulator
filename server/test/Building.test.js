import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Building } from '../src/models/Building.js';

function run(building, n) {
  for (let i = 0; i < n; i++) building.step();
}

// Thang nào đang được giao đón người ở tầng `floor` đi hướng `direction`?
function assignedTo(building, floor, direction) {
  const key = direction === 'UP' ? 'upCalls' : 'downCalls';
  return building.getState().elevators.find((e) => e[key].includes(floor))?.id;
}

test('[ĐỀ BÀI] toà nhà 10 tầng, 3 thang A B C, bắt đầu ở tầng 1', () => {
  const state = new Building(10, 3).getState();

  assert.equal(state.floorCount, 10);
  assert.deepEqual(state.elevators.map((e) => e.id), ['A', 'B', 'C']);
  assert.ok(state.elevators.every((e) => e.floor === 1));
});

test('từ chối lệnh sai', () => {
  const b = new Building();
  assert.throws(() => b.callElevator(0, 'UP'), /Invalid floor/);
  assert.throws(() => b.callElevator(11, 'DOWN'), /Invalid floor/);
  assert.throws(() => b.callElevator(10, 'UP'), /top floor/);    // tầng trên cùng không có nút lên
  assert.throws(() => b.callElevator(1, 'DOWN'), /ground floor/); // tầng 1 không có nút xuống
  assert.throws(() => b.callElevator(5, 'LEFT'), /Invalid direction/);
  assert.throws(() => b.selectFloor('Z', 3), /Unknown elevator/);
});

test('bấm gọi thang: nút sáng, thang tới nơi thì nút tắt', () => {
  const b = new Building();
  b.callElevator(5, 'UP');
  assert.deepEqual(b.getState().upCalls, [5]);

  run(b, 4); // từ tầng 1 lên tầng 5
  const state = b.getState();
  assert.deepEqual(state.upCalls, []);
  assert.ok(state.elevators.some((e) => e.floor === 5 && e.state === 'DOOR_OPEN'));
});

test('bấm một nút nhiều lần chỉ gọi một thang', () => {
  const b = new Building();
  b.callElevator(5, 'UP');
  b.callElevator(5, 'UP');
  run(b, 1);

  const moving = b.getState().elevators.filter((e) => e.state === 'MOVING');
  assert.equal(moving.length, 1);
});

// ===== Chọn thang =====

test('chọn thang rảnh thay vì thang đang đi ngược đường', () => {
  const b = new Building();
  b.selectFloor('A', 10);
  run(b, 3); // A đang lên, ở tầng 4. B và C rảnh ở tầng 1

  b.callElevator(3, 'UP'); // A đã đi qua tầng 3 -> phải lên 10 rồi vòng lại
  assert.equal(assignedTo(b, 3, 'UP'), 'B');
});

test('chọn thang tiện đường (cùng hướng, sắp đi qua) thay vì thang rảnh ở xa hơn', () => {
  const b = new Building();
  b.selectFloor('A', 9);
  run(b, 1); // A đang lên, ở tầng 2. B và C rảnh ở tầng 1

  b.callElevator(5, 'UP'); // A cách 3 tầng và tiện đường, B cách 4 tầng
  assert.equal(assignedTo(b, 5, 'UP'), 'A');
});

test('[ĐỀ BÀI] A đang lên tầng 10, người ở tầng 5 bấm XUỐNG -> A không dừng, thang khác tới đón', () => {
  const b = new Building();
  b.selectFloor('A', 10);
  run(b, 2); // A đang lên, ở tầng 3

  b.callElevator(5, 'DOWN');
  assert.notEqual(assignedTo(b, 5, 'DOWN'), 'A');

  let aStoppedAt5 = false;
  for (let i = 0; i < 7; i++) {
    b.step();
    const a = b.getState().elevators[0];
    if (a.floor === 5 && a.state === 'DOOR_OPEN') aStoppedAt5 = true;
  }
  assert.equal(aStoppedAt5, false);
});

test('thang đang mở cửa ở tầng gọi -> giữ cửa cho khách, không điều thang khác tới', () => {
  const b = new Building();
  b.selectFloor('A', 5);
  b.selectFloor('B', 4);
  run(b, 6); // A đang mở cửa ở 5 (sắp đóng), B đã đóng cửa, rảnh ở tầng 4

  b.callElevator(5, 'UP');
  b.step();

  const state = b.getState();
  assert.equal(state.elevators[0].state, 'DOOR_OPEN'); // A giữ cửa
  assert.deepEqual(state.elevators[1].upCalls, []);    // B không bị điều tới
  assert.deepEqual(state.upCalls, []);
});
