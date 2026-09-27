// Nút ▲ ▼ gọi thang ở một tầng.
// Nút sáng khi đang có người chờ (theo dữ liệu server gửi xuống).
export function FloorButtons({ floor, floorCount, upCalls, downCalls, onCall, disabled }) {
  const isTopFloor = floor === floorCount;
  const isGroundFloor = floor === 1;

  return (
    <div className="floor-buttons">
      {/* Tầng trên cùng không có nút lên */}
      {!isTopFloor && (
        <button
          className={upCalls.includes(floor) ? 'call-button lit' : 'call-button'}
          onClick={() => onCall(floor, 'UP')}
          disabled={disabled}
          aria-label={`Floor ${floor} up`}
        >
          ▲
        </button>
      )}

      {/* Tầng 1 không có nút xuống */}
      {!isGroundFloor && (
        <button
          className={downCalls.includes(floor) ? 'call-button down lit' : 'call-button down'}
          onClick={() => onCall(floor, 'DOWN')}
          disabled={disabled}
          aria-label={`Floor ${floor} down`}
        >
          ▼
        </button>
      )}
    </div>
  );
}
