import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Elevator } from '../src/domain/Elevator.js';
test('đi lên tới tầng cần ghé', () => {
  const e = new Elevator('A', 1);
  e.addStop(4);

  e.step();
  e.step();
  e.step();

  assert.equal(e.currentFloor, 4);
  assert.deepEqual(e.stops, []);
});
test('đi xuống tới tầng cần ghé', () => {
  const e = new Elevator('A', 8);
  e.addStop(5);

  e.step();
  e.step();
  e.step();

  assert.equal(e.currentFloor, 5);
});
test('tới nơi thì hô arrived đúng một lần', () => {
  const e = new Elevator('A', 1);
  const heard = [];
  e.on('arrived', (data) => heard.push(data));

  e.addStop(3);
  for (let i = 0; i < 5; i++) e.step();

  assert.deepEqual(heard, [{ elevatorId: 'A', floor: 3, direction: 'UP' }]);
});
test('nhiều tầng cần ghé thì dừng theo thứ tự đi qua', () => {
  const e = new Elevator('A', 1);
  const floors = [];
  e.on('arrived', (data) => floors.push(data.floor));

  e.addStop(4);
  e.addStop(2);
  for (let i = 0; i < 20; i++) e.step(); // dư nhịp vì phải chờ cửa ở tầng 2

  assert.deepEqual(floors, [2, 4]);
});

test('tới nơi thì mở cửa và hô doorOpened', () => {
  const e = new Elevator('A', 1);
  const events = [];
  e.on('doorOpened', (d) => events.push(d.floor));

  e.addStop(2);
  e.step();

  assert.equal(e.state, 'DOOR_OPEN');
  assert.deepEqual(events, [2]);
});

test('cửa tự đóng sau doorHoldSteps bước', () => {
  const e = new Elevator('A', 1, { doorHoldSteps: 3 });
  e.addStop(2);
  e.step(); // tới tầng 2, mở cửa

  e.step();
  e.step();
  assert.equal(e.state, 'DOOR_OPEN'); // mới qua 2 bước, vẫn mở

  e.step();
  assert.equal(e.state, 'WAITING'); // bước thứ 3, đóng
});

test('nút mở giữ cửa lâu thêm, nút đóng thì đóng ngay', () => {
  const e = new Elevator('A', 1, { doorHoldSteps: 3 });
  e.addStop(2);
  e.step(); // mở cửa

  e.step();
  e.step(); // sắp hết giờ
  e.pressOpen(); // đếm lại từ đầu
  e.step();
  e.step();
  assert.equal(e.state, 'DOOR_OPEN');

  e.pressClose();
  assert.equal(e.state, 'WAITING');
});

test('đang chạy thì bấm mở/đóng không có tác dụng', () => {
  const e = new Elevator('A', 1);
  e.addStop(5);
  e.step(); // đang ở tầng 2, đang chạy

  e.pressOpen();
  assert.equal(e.state, 'MOVING');
  e.pressClose();
  assert.equal(e.state, 'MOVING');
});
function run(e, n) {
  for (let i = 0; i < n; i++) e.step();
}

test('đang đi lên, người ở tầng 5 bấm UP thì thang dừng đón', () => {
  const e = new Elevator('A', 1);
  const floors = [];
  e.on('arrived', (d) => floors.push(d.floor));

  e.addStop(10);
  e.step();                    // đang ở tầng 2, đi lên
  e.requestPickup(5, 'UP');
  run(e, 30);

  assert.deepEqual(floors, [5, 10]);
});

test('đang đi lên, người ở tầng 5 bấm DOWN thì thang KHÔNG dừng, lên 10 rồi quay xuống đón', () => {
  const e = new Elevator('A', 1);
  const heard = [];
  e.on('arrived', (d) => heard.push(`${d.floor}-${d.direction}`));

  e.addStop(10);
  e.step();
  e.requestPickup(5, 'DOWN');
  run(e, 30);

  assert.deepEqual(heard, ['10-UP', '5-DOWN']);
});

test('chỉ có người bấm DOWN ở tầng 7: thang lên tới 7 rồi đổi hướng thành DOWN', () => {
  const e = new Elevator('A', 1);
  e.requestPickup(7, 'DOWN');
  run(e, 6);

  assert.equal(e.currentFloor, 7);
  assert.equal(e.state, 'DOOR_OPEN');
  assert.equal(e.direction, 'DOWN');
});

test('cửa đang mở mà có người bấm cùng tầng cùng hướng thì chỉ giữ cửa, không thêm việc', () => {
  const e = new Elevator('A', 1, { doorHoldSteps: 3 });
  e.addStop(3);
  run(e, 2);                   // tới tầng 3, cửa mở
  run(e, 2);                   // sắp đóng

  e.requestPickup(3, 'UP');
  run(e, 2);
  assert.equal(e.state, 'DOOR_OPEN');
  assert.deepEqual(e.pickups, { UP: [], DOWN: [] });
});
