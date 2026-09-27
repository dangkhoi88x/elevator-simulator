// Nối trình duyệt với toà nhà qua Socket.IO.
// Trả về hàm sendStateToAll để index.js gọi sau mỗi nhịp thời gian.
export function setupSocket(io, building) {
  // Gửi trạng thái mới nhất cho TẤT CẢ trình duyệt đang mở
  function sendStateToAll() {
    io.emit('state', building.getState());
  }

  // Nghe một lệnh từ trình duyệt:
  // chạy lệnh -> gửi trạng thái mới cho mọi người -> trả lời { ok } cho trình duyệt đã bấm
  function listen(socket, eventName, action) {
    socket.on(eventName, (data, reply) => {
      let result;
      try {
        action(data || {});
        sendStateToAll();
        result = { ok: true };
      } catch (error) {
        // Lệnh sai (tầng không tồn tại...) -> chỉ báo lỗi, server vẫn chạy tiếp
        result = { ok: false, error: error.message };
      }
      if (typeof reply === 'function') {
        reply(result);
      }
    });
  }

  io.on('connection', (socket) => {
    // Trình duyệt vừa mở -> gửi trạng thái ngay, không bắt chờ nhịp sau
    socket.emit('state', building.getState());

    listen(socket, 'callElevator', (data) => building.callElevator(data.floor, data.direction));
    listen(socket, 'selectFloor', (data) => building.selectFloor(data.elevatorId, data.floor));
    listen(socket, 'openDoor', (data) => building.openDoor(data.elevatorId));
    listen(socket, 'closeDoor', (data) => building.closeDoor(data.elevatorId));
  });

  return sendStateToAll;
}
