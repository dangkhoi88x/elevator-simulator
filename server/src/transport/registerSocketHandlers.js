export function registerSocketHandlers(io, building) {
  // Mỗi lần Building đổi trạng thái -> gửi cho TẤT CẢ trình duyệt đang mở
  building.on('update', (snapshot) => io.emit('state', snapshot));

  io.on('connection', (socket) => {
    // Trình duyệt vừa mở -> gửi ngay trạng thái hiện tại, không bắt chờ nhịp sau
    socket.emit('state', building.getSnapshot());

    onCommand(socket, 'pickup', ({ floor, direction }) => building.requestPickup(floor, direction));
    onCommand(socket, 'selectFloor', ({ elevatorId, floor }) => building.selectFloor(elevatorId, floor));
    onCommand(socket, 'openDoor', ({ elevatorId }) => building.pressOpen(elevatorId));
    onCommand(socket, 'closeDoor', ({ elevatorId }) => building.pressClose(elevatorId));
  });
}

// Nghe một lệnh từ trình duyệt: chạy lệnh, bắt lỗi để server không sập, rồi báo kết quả
function onCommand(socket, event, action) {
  socket.on(event, (...args) => {
    const ack = typeof args.at(-1) === 'function' ? args.pop() : null;
    const payload = args[0] ?? {};

    try {
      action(payload);
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });
}
