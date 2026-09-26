export const Direction = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
});

export function opposite(direction) {
  return direction === Direction.UP ? Direction.DOWN : Direction.UP;
}