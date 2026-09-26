// Kích thước cảnh 3D (đơn vị three.js), gom một chỗ để các component khớp nhau
export const FLOOR_H = 1.4;
export const SHAFT_W = 1.6;
export const SHAFT_GAP = 0.35;
export const SHAFT_D = 1.5;

export const CAR_W = 1.2;
export const CAR_H = 1.1;
export const CAR_D = 1.1;

export const LANDING_W = 1.3; // cột bên trái: số tầng + đèn gọi thang

export function buildingWidth(elevatorCount) {
  return elevatorCount * SHAFT_W + (elevatorCount - 1) * SHAFT_GAP;
}

export function buildingHeight(floorCount) {
  return floorCount * FLOOR_H;
}

// Tâm trục thang thứ i, trục x
export function shaftX(index, elevatorCount) {
  return -buildingWidth(elevatorCount) / 2 + SHAFT_W / 2 + index * (SHAFT_W + SHAFT_GAP);
}

// Mặt sàn của tầng (tầng 1 ở y = 0)
export function floorY(floor) {
  return (floor - 1) * FLOOR_H;
}
