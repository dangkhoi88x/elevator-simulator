import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { io as connect } from 'socket.io-client';
import { Building } from '../src/models/Building.js';
import { createServer } from '../src/server.js';

let server;
let client;
let firstState;

before(async () => {
  server = createServer(new Building(), '*'); // không chạy nhịp tự động: test tự điều khiển
  server.httpServer.listen(0); // cổng 0 = để hệ điều hành chọn cổng trống
  await once(server.httpServer, 'listening');

  const { port } = server.httpServer.address();
  client = connect(`http://localhost:${port}`);
  firstState = once(client, 'state'); // nghe NGAY, kẻo server gửi trước khi test kịp nghe
});

after(() => {
  client.close();
  server.io.close();
});

test('vừa kết nối là nhận được trạng thái toà nhà', async () => {
  const [state] = await firstState;
  assert.equal(state.elevators.length, 3);
});

test('gửi lệnh gọi thang: server trả ok và gửi trạng thái mới có nút sáng', async () => {
  const nextState = once(client, 'state');
  const reply = await client.emitWithAck('callElevator', { floor: 5, direction: 'UP' });
  assert.deepEqual(reply, { ok: true });

  const [state] = await nextState;
  assert.deepEqual(state.upCalls, [5]);
});

test('lệnh sai thì server trả lỗi nhưng KHÔNG sập', async () => {
  const bad = await client.emitWithAck('callElevator', { floor: 99, direction: 'UP' });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /Invalid floor/);

  const empty = await client.emitWithAck('selectFloor', {});
  assert.equal(empty.ok, false);

  const good = await client.emitWithAck('selectFloor', { elevatorId: 'B', floor: 7 });
  assert.deepEqual(good, { ok: true });
});
