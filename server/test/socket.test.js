import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { io as connect } from 'socket.io-client';
import { Building } from '../src/domain/Building.js';
import { createApp } from '../src/app.js';

let building;
let server;
let client;
let firstState;

before(async () => {
  building = new Building(); // không start(): test tự gọi step()
  server = createApp({ building, clientOrigin: '*' });
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

test('vừa kết nối là nhận được trạng thái tòa nhà', async () => {
  const [snapshot] = await firstState;
  assert.equal(snapshot.elevators.length, 3);
});

test('gửi lệnh gọi thang: server trả ok và phát trạng thái mới có đèn sáng', async () => {
  const nextState = once(client, 'state');
  const reply = await client.emitWithAck('pickup', { floor: 5, direction: 'UP' });
  assert.deepEqual(reply, { ok: true });

  const [snapshot] = await nextState;
  assert.deepEqual(snapshot.pendingPickups.UP, [5]);
});

test('lệnh sai thì server trả lỗi nhưng KHÔNG sập', async () => {
  const bad = await client.emitWithAck('pickup', { floor: 99, direction: 'UP' });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /Invalid floor/);

  const noPayload = await client.emitWithAck('selectFloor');
  assert.equal(noPayload.ok, false);

  const good = await client.emitWithAck('selectFloor', { elevatorId: 'B', floor: 7 });
  assert.deepEqual(good, { ok: true });
});
