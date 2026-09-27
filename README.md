# Elevators — Mô phỏng hệ thống thang máy

Mô phỏng một toà nhà nhiều thang máy theo thời gian thực. Server (Node.js) giữ toàn bộ logic: thang chạy, dừng, mở/đóng cửa và điều phối thang nào đi đón. Client (React) hiển thị toà nhà và gửi lệnh bấm nút qua Socket.IO.

- Mặc định: **10 tầng, 3 thang (A, B, C)**, mỗi nhịp **1 giây** thang đi được 1 tầng.
- Nút gọi thang ▲▼ ở từng tầng, bảng nút trong cabin (chọn tầng, mở/đóng cửa).
- Thang dừng đón người **cùng hướng** trên đường đi, quay đầu khi hết việc phía trước.
- Điều phối theo **thời gian chờ ngắn nhất** (không chỉ "thang gần nhất").
- Nhiều trình duyệt mở cùng lúc đều thấy cùng một trạng thái.

---

## Chạy dự án

Yêu cầu: **Node.js 20.19+** (hoặc 22.12+).

```bash
# Terminal 1 — server (http://localhost:3000)
cd server
npm install
npm run dev

# Terminal 2 — client (http://localhost:5173)
cd client
npm install
npm run dev
```

Mở http://localhost:5173.

> Client cố định cổng 5173 (`strictPort`) vì server chỉ cho phép đúng địa chỉ này. Nếu cổng bận, Vite sẽ báo lỗi — muốn chạy cổng khác thì đổi luôn `CLIENT_ORIGIN` của server.

### Biến môi trường

Server (`server/.env`, xem `server/.env.example`):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng server |
| `STEP_INTERVAL_MS` | `1000` | Độ dài một nhịp (thang đi 1 tầng / nhịp) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Địa chỉ client được phép kết nối (CORS) |

Client (`client/.env`, xem `client/.env.example`):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VITE_SERVER_URL` | `http://localhost:3000` | Địa chỉ server |

> Nếu đổi `STEP_INTERVAL_MS`, sửa luôn biến CSS `--step` trong `client/src/index.css` để cabin trượt khớp nhịp.

### Lệnh khác

```bash
cd server && npm test      # chạy test server (node:test)
cd client && npm run lint  # kiểm tra code client
cd client && npm run build # build client ra client/dist
```

---

## Cấu trúc thư mục

```
elevators/
├── server/
│   ├── src/
│   │   ├── index.js                  # khởi động: tạo Building, mở server, chạy nhịp
│   │   ├── app.js                    # Express + Socket.IO, route /api/health, /api/state
│   │   ├── transport/
│   │   │   └── registerSocketHandlers.js  # nhận lệnh từ client, phát trạng thái
│   │   └── domain/                   # logic thuần, không phụ thuộc mạng
│   │       ├── Building.js           # toà nhà: danh sách thang, nhận lệnh, điều phối, nhịp
│   │       ├── Elevator.js           # một thang: tầng, hướng, danh sách cần ghé
│   │       ├── Direction.js          # UP / DOWN
│   │       ├── states/               # State pattern cho thang
│   │       │   ├── ElevatorState.js  #   lớp cha trừu tượng
│   │       │   ├── WaitingState.js   #   đứng yên, cửa đóng
│   │       │   ├── MovingState.js    #   đang chạy
│   │       │   └── DoorOpenState.js  #   cửa đang mở
│   │       └── strategies/           # Strategy pattern cho điều phối
│   │           ├── DispatchStrategy.js      # lớp cha trừu tượng
│   │           └── ShortestWaitStrategy.js  # chọn thang đến sớm nhất
│   └── test/                         # Elevator, Building, strategy, socket
└── client/
    └── src/
        ├── main.jsx                  # điểm khởi động React
        ├── App.jsx                   # ghép các phần, giữ hàm gửi lệnh
        ├── socket.js                 # một kết nối Socket.IO dùng chung
        ├── constants.js              # Direction, tên trạng thái (khớp server)
        ├── theme.js                  # màu từng thang
        ├── hooks/
        │   ├── useBuilding.js        # snapshot + trạng thái kết nối + send()
        │   └── useToast.js           # thông báo lỗi tự ẩn
        ├── components/
        │   ├── Building.jsx          # lưới toà nhà (hàng = tầng, cột = trục thang)
        │   ├── HallButtons.jsx       # nút ▲▼ ở sảnh mỗi tầng
        │   ├── Shaft.jsx             # trục thang + cabin trượt bằng CSS
        │   ├── ElevatorStatus.jsx    # thẻ trạng thái từng thang
        │   ├── CarPanel.jsx          # nút trong cabin: chọn tầng, mở/đóng cửa
        │   └── Toast.jsx
        └── index.css
```

---

## OOP trong dự án

Toàn bộ logic thang máy ở `server/src/domain/` được viết bằng class, không phụ thuộc Express hay Socket.IO.

### Đóng gói (encapsulation)

Trạng thái bên trong dùng trường private `#` của JavaScript, bên ngoài không đọc/ghi trực tiếp được — chỉ đi qua phương thức public.

| Class | Dữ liệu private | Bên ngoài dùng qua |
|---|---|---|
| `Elevator` | `#currentFloor`, `#direction`, `#stops`, `#pickups`, `#state` | `addStop()`, `requestPickup()`, `pressOpen()`, `pressClose()`, `step()`; getter chỉ đọc `currentFloor`, `stops`... |
| `Building` | `#elevators`, `#assignments`, `#strategy`, `#timer` | `requestPickup()`, `selectFloor()`, `pressOpen()`, `pressClose()`, `getSnapshot()` |
| `DoorOpenState` | `#holdSteps`, `#stepsLeft` | `step()`, `pressOpen()`, `pressClose()` |
| `ShortestWaitStrategy` | `#stopPenalty` | `selectElevator()` |

Getter trả về **bản sao** (ví dụ `get stops()` trả mảng mới), nên code bên ngoài có sửa mảng nhận được cũng không làm hỏng trạng thái thang. Dữ liệu vào luôn được kiểm tra (`#validateFloor`, `#validateDirection`) trước khi đổi trạng thái.

### Kế thừa (inheritance)

```
ElevatorState (trừu tượng)          DispatchStrategy (trừu tượng)       EventEmitter (Node.js)
├── WaitingState                    └── ShortestWaitStrategy            ├── Elevator
├── MovingState                                                         └── Building
└── DoorOpenState
```

- `ElevatorState` và `DispatchStrategy` là **lớp trừu tượng**: gọi `new` trực tiếp sẽ báo lỗi (kiểm tra `new.target`), phương thức bắt buộc (`step()`, `selectElevator()`, `name`) báo lỗi nếu lớp con quên cài đặt.
- `ElevatorState` cài sẵn hành vi mặc định cho `pressOpen()` / `pressClose()` là **không làm gì**; lớp con nào cần thì ghi đè.
- `Elevator` và `Building` kế thừa `EventEmitter` để phát sự kiện (`arrived`, `doorOpened`, `update`...) mà không cần biết ai đang nghe.

### Đa hình (polymorphism)

Khi tới nhịp mới hoặc có người bấm mở/đóng cửa, `Elevator` không dùng `if`/`switch` theo trạng thái — nó giao cho đối tượng trạng thái hiện tại:

```js
step()       { this.#state.step(this); }
pressOpen()  { this.#state.pressOpen(this); }
pressClose() { this.#state.pressClose(this); }
```

Cùng một lời gọi, mỗi trạng thái xử lý khác nhau:

| Lời gọi | `WaitingState` | `MovingState` | `DoorOpenState` |
|---|---|---|---|
| `step()` | có yêu cầu thì bắt đầu chạy | đi 1 tầng, tới nơi thì dừng | đếm ngược, hết giờ thì đóng cửa |
| `pressOpen()` | mở cửa | không làm gì | giữ cửa mở thêm |
| `pressClose()` | không làm gì | không làm gì | đóng cửa ngay |

Tương tự, `Building` chỉ gọi `this.#strategy.selectElevator(...)` và chỉ kiểm tra strategy có phải là `DispatchStrategy` không. Thuật toán điều phối mới chỉ cần viết một lớp con, không phải sửa `Building` (test `Building dùng đúng strategy được truyền vào` chứng minh điều này).

---

## Kiến trúc

```
 Trình duyệt (React)                          Server (Node.js)
┌───────────────────────┐   pickup / selectFloor   ┌──────────────────────────┐
│ HallButtons, CarPanel │ ───── openDoor ────────► │ registerSocketHandlers   │
│          │            │      closeDoor (+ack)    │          │               │
│          ▼            │                          │          ▼               │
│  App.sendCommand      │                          │ Building ──► Strategy    │
│          ▲            │                          │    │  (chọn thang)       │
│  useBuilding          │ ◄──── 'state' ────────── │    ▼                     │
│  (snapshot)           │   mỗi nhịp + khi có lệnh │ Elevator ──► State       │
└───────────────────────┘                          └──────────────────────────┘
```

**Server là nguồn sự thật duy nhất.** Client không tự tính trạng thái: bấm nút chỉ gửi lệnh, còn đèn sáng / thang chạy / cửa mở đều vẽ lại từ snapshot server gửi xuống.

### Nhịp thời gian

`Building.start(intervalMs)` gọi `step()` đều đặn. Mỗi `step()` cho từng thang tiến một bước theo trạng thái hiện tại, rồi phát snapshot mới cho mọi client. Logic hoàn toàn dựa trên nhịp nên test được bằng cách gọi `step()` thủ công, không cần chờ thời gian thật.

### State pattern — vòng đời một thang

Mỗi trạng thái là một class tự quyết định việc cần làm ở mỗi nhịp và khi bấm nút mở/đóng cửa:

```
            có yêu cầu                    tới tầng cần ghé
 WAITING ─────────────────► MOVING ─────────────────────────► DOOR_OPEN
    ▲                          │                                  │
    │      hết yêu cầu         │                                  │
    ├──────────────────────────┘                                  │
    │                                                             │
    └──────── hết doorHoldSteps nhịp (mặc định 3) / bấm đóng ─────┘

 WAITING + bấm mở  → DOOR_OPEN
 DOOR_OPEN + bấm mở → giữ cửa thêm doorHoldSteps nhịp
 MOVING + bấm mở/đóng → không có tác dụng
```

### Quy tắc dừng của thang

Mỗi thang giữ hai loại yêu cầu:

- **`stops`** — tầng khách trong cabin bấm: luôn dừng khi đi qua.
- **`pickups.UP` / `pickups.DOWN`** — tầng có người chờ ở sảnh, theo hướng họ muốn đi.

Khi đi qua một tầng, thang dừng nếu:

1. tầng đó có trong `stops`, hoặc
2. có người chờ **cùng hướng** thang đang đi, hoặc
3. có người chờ **ngược hướng** và phía trước không còn việc gì → dừng đón rồi đổi hướng.

Ví dụ: thang đang lên tầng 10, người ở tầng 5 bấm ▼ → thang **không** dừng ở 5 lúc đi lên, mà lên 10 rồi quay xuống mới đón.

Nếu thang **đang mở cửa ngay tầng đó** mà có người bấm gọi đúng hướng thang sắp đi (hoặc thang không còn việc gì), thang chỉ giữ cửa thêm cho khách vào — không đóng cửa rồi mở lại, không điều thang khác tới.

### Strategy pattern — điều phối

Khi có người bấm ▲▼, `Building` hỏi strategy chọn thang nào. `ShortestWaitStrategy` ước lượng số bước mỗi thang cần để tới nơi:

| Tình huống của thang | Cách ước lượng |
|---|---|
| Đang mở cửa ngay tầng gọi, đi được hướng khách muốn | 0 — khách bước vào luôn, thang giữ cửa |
| Đang rảnh | khoảng cách tới tầng gọi |
| Cùng hướng, tầng gọi ở phía trước | khoảng cách + số lần dừng dọc đường |
| Ngược hướng | đi hết chiều hiện tại, quay đầu, về tầng gọi |
| Cùng hướng nhưng đã đi qua | phải quay đầu hai lần |

Mỗi lần dừng dọc đường và cửa đang mở (ở tầng khác) đều cộng thêm thời gian phạt (`stopPenalty`, mặc định 2 nhịp). Thang có số bước nhỏ nhất được chọn.

Ví dụ: thang A ở tầng 4 đang lên tầng 10, thang B rảnh ở tầng 1, người ở tầng 5 bấm ▼. Chọn "thang gần nhất" sẽ ra A, nhưng A phải lên 10 rồi mới quay về (11 tầng); `ShortestWait` chọn B (4 tầng).

Thuật toán khác có thể thêm bằng cách kế thừa `DispatchStrategy` và truyền vào `new Building({ strategy })`.

Mỗi nút gọi chỉ được giao cho **một** thang: bấm lại nút đang sáng không gọi thêm thang nữa. Đèn tắt khi thang được giao tới nơi.

---

## Giao tiếp client ↔ server

### Server → client: sự kiện `state`

Gửi ngay khi client kết nối, sau mỗi nhịp và sau mỗi lệnh:

```js
{
  floorCount: 10,
  strategyName: 'SHORTEST_WAIT',
  elevators: [
    {
      id: 'A',
      currentFloor: 3,
      direction: 'UP',             // 'UP' | 'DOWN'
      state: 'MOVING',             // 'WAITING' | 'MOVING' | 'DOOR_OPEN'
      stops: [7],                  // tầng khách trong cabin đã bấm
      pickups: { UP: [5], DOWN: [] } // tầng thang này được giao đi đón
    },
    // ...
  ],
  pendingPickups: { UP: [5], DOWN: [8] } // nút ▲▼ đang sáng ở sảnh
}
```

Cũng lấy được qua HTTP: `GET /api/state`. Kiểm tra server sống: `GET /api/health`.

### Client → server: lệnh

| Sự kiện | Payload | Ý nghĩa |
|---|---|---|
| `pickup` | `{ floor, direction }` | Bấm ▲▼ ở sảnh |
| `selectFloor` | `{ elevatorId, floor }` | Bấm nút tầng trong cabin |
| `openDoor` | `{ elevatorId }` | Bấm mở cửa |
| `closeDoor` | `{ elevatorId }` | Bấm đóng cửa |

Mỗi lệnh có thể kèm callback **ack**, server trả `{ ok: true }` hoặc `{ ok: false, error: '...' }`. Lệnh sai (tầng không tồn tại, bấm ▼ ở tầng 1, thang không tồn tại...) chỉ trả lỗi, **không** làm server dừng.

```js
socket.emit('pickup', { floor: 5, direction: 'UP' }, (res) => console.log(res));
```

---

## Frontend

- **`useBuilding`** đọc dữ liệu từ socket bằng `useSyncExternalStore`. Snapshot được lưu ở cấp module ngay khi import, nên không bỏ lỡ gói `state` đầu tiên server gửi lúc vừa kết nối.
- **`App`** là nơi duy nhất gọi hook dữ liệu; component con chỉ nhận props. Mọi lệnh đi qua một hàm `sendCommand` — lỗi từ server hiện thành toast.
- **Không cập nhật trước ở client**: đèn nút chỉ sáng khi snapshot từ server báo, nên giao diện luôn khớp thực tế.
- **Toà nhà là CSS Grid**; số tầng / số thang truyền vào CSS qua biến (`--floors`, `--shafts`).
- **Cabin trượt bằng CSS**: React chỉ đặt `--car-offset` theo tầng hiện tại, `transition: transform 1s linear` lo phần chuyển động.
- Mất kết nối → mọi nút bị khoá, giữ nguyên snapshot cuối.
- Trợ năng: nút thật (`<button>`) có `aria-label`, `aria-pressed`; thông báo lỗi dùng `aria-live`; hỗ trợ dark mode và `prefers-reduced-motion`.

---

## Test

```bash
cd server
npm test
```

28 test với `node:test`, không cần thư viện ngoài:

| File | Kiểm tra |
|---|---|
| `Elevator.test.js` | đi lên/xuống, thứ tự dừng, mở/đóng/giữ cửa, dừng đón cùng hướng, quay đầu, bấm gọi khi cửa đang mở |
| `Building.test.js` | cấu hình mặc định, từ chối lệnh sai, đèn nút sáng/tắt, không gọi trùng, nhịp tự chạy, giữ cửa thay vì điều thang khác |
| `DispatchStrategy.test.js` | `ShortestWait` chọn đúng thang (kể cả thang đang mở cửa tại chỗ), `Building` dùng đúng strategy được truyền vào |
| `socket.test.js` | nhận trạng thái khi kết nối, gửi lệnh nhận ack, lệnh sai không làm sập server |

Client hiện chưa có test tự động.
