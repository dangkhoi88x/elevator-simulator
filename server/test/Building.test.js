import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Building } from '../src/domain/Building.js';

function run(b, n) {
  for (let i = 0; i < n; i++) b.step();
}

test('tòa nhà mặc định có 10 tầng, 3 thang A B C đứng ở tầng 1', () => {
  const b = new Building();
  const snap = b.getSnapshot();

  assert.equal(snap.floorCount, 10);
  assert.deepEqual(snap.elevators.map((e) => e.id), ['A', 'B', 'C']);
  assert.ok(snap.elevators.every((e) => e.currentFloor === 1));
});

test('từ chối tầng và hướng không hợp lệ', () => {
  const b = new Building();
  assert.throws(() => b.requestPickup(0, 'UP'));
  assert.throws(() => b.requestPickup(11, 'DOWN'));
  assert.throws(() => b.requestPickup(10, 'UP'));   // tầng trên cùng không có nút lên
  assert.throws(() => b.requestPickup(1, 'DOWN'));  // tầng 1 không có nút xuống
  assert.throws(() => b.selectFloor('Z', 3));       // không có thang Z
});

test('bấm gọi thang: đèn nút sáng, thang tới nơi thì đèn tắt', () => {
  const b = new Building();
  b.requestPickup(5, 'UP');
  assert.deepEqual(b.getSnapshot().pendingPickups, { UP: [5], DOWN: [] });

  run(b, 4); // từ tầng 1 lên tầng 5
  const snap = b.getSnapshot();
  assert.deepEqual(snap.pendingPickups, { UP: [], DOWN: [] });
  assert.ok(snap.elevators.some((e) => e.currentFloor === 5 && e.state === 'DOOR_OPEN'));
});

test('bấm cùng một nút nhiều lần chỉ gọi một thang', () => {
  const b = new Building();
  b.requestPickup(5, 'UP');
  b.requestPickup(5, 'UP');
  run(b, 1);

  const moving = b.getSnapshot().elevators.filter((e) => e.state === 'MOVING');
  assert.equal(moving.length, 1);
});

test('start() tự gọi step() đều đặn, stop() thì dừng', (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const b = new Building();
  let updates = 0;
  b.on('update', () => updates++);

  b.start(1000);
  t.mock.timers.tick(3000);
  assert.equal(updates, 3);

  b.stop();
  t.mock.timers.tick(3000);
  assert.equal(updates, 3);
});

test('snapshot cho biết thuật toán điều phối và tầng mỗi thang đang đi đón', () => {
  const b = new Building();
  b.requestPickup(5, 'UP');
  const snap = b.getSnapshot();

  assert.equal(snap.strategyName, b.strategyName);
  const assigned = snap.elevators.filter((e) => e.pickups.UP.includes(5));
  assert.equal(assigned.length, 1);
});
