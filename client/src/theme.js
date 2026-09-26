// Màu riêng cho từng thang, dùng chung cho trục thang và thẻ trạng thái
const ELEVATOR_COLORS = ['#4f8cff', '#ff8a3d', '#2ec4a6', '#e05ad6', '#f2c14e'];

export function elevatorColor(index) {
  return ELEVATOR_COLORS[index % ELEVATOR_COLORS.length];
}
