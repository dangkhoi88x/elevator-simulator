import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NearestElevatorStrategy } from '../src/domain/strategies/NearestElevatorStrategy.js';
import { ShortestWaitStrategy } from '../src/domain/strategies/ShortestWaitStrategy.js';
import { DispatchStrategy } from '../src/domain/strategies/DispatchStrategy.js';
import { Building } from '../src/domain/Building.js';

// Thang "giả" chỉ gồm dữ liệu, đủ để strategy đọc
function fakeElevator(id, currentFloor, { direction = 'UP', state = 'WAITING', stops = [], up = [], down = [] } = {}) {
  return { id, currentFloor, direction, state, stops, pickups: { UP: up, DOWN: down } };
}

// A ở tầng 4 đang đi lên tới 10, B rảnh ở tầng 1. Người ở tầng 3 bấm UP.
const scenario = () => [
  fakeElevator('A', 4, { state: 'MOVING', stops: [10] }),
  fakeElevator('B', 1),
];

test('Nearest chọn thang gần nhất dù thang đó đã đi qua', () => {
  const chosen = new NearestElevatorStrategy().selectElevator(scenario(), 3, 'UP');
  assert.equal(chosen.id, 'A');
});

test('ShortestWait chọn thang rảnh vì thang A phải lên 10 rồi vòng lại', () => {
  const chosen = new ShortestWaitStrategy().selectElevator(scenario(), 3, 'UP');
  assert.equal(chosen.id, 'B');
});

test('ShortestWait ưu tiên thang tiện đường hơn thang rảnh ở xa', () => {
  const elevators = [
    fakeElevator('A', 2, { state: 'MOVING', stops: [9] }),  // đang lên, đi ngang tầng 5
    fakeElevator('B', 9),                                    // rảnh nhưng xa hơn
  ];
  const chosen = new ShortestWaitStrategy().selectElevator(elevators, 5, 'UP');
  assert.equal(chosen.id, 'A');
});

test('Building dùng đúng strategy được truyền vào', () => {
  class AlwaysLastStrategy extends DispatchStrategy {
    get name() { return 'ALWAYS_LAST'; }
    selectElevator(elevators) { return elevators[elevators.length - 1]; }
  }

  const b = new Building({ strategy: new AlwaysLastStrategy() });
  b.requestPickup(5, 'UP');
  b.step();

  const moving = b.getSnapshot().elevators.filter((e) => e.state === 'MOVING').map((e) => e.id);
  assert.deepEqual(moving, ['C']);
  assert.throws(() => new Building({ strategy: {} }));
});
