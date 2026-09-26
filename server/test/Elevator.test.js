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

  assert.deepEqual(heard, [{ elevatorId: 'A', floor: 3 }]);
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