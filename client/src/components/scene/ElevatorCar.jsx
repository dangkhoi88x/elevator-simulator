import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { Direction, ElevatorStateName } from '../../constants.js';
import { Label } from './Label.jsx';
import { CAR_W, CAR_H, CAR_D, FLOOR_H, SHAFT_D, floorY } from './layout.js';

// Server nhích 1 tầng mỗi nhịp; nếu bị tụt lại xa (vd. vừa kết nối) thì chạy nhanh hơn để bắt kịp
const FLOORS_PER_SECOND = 1;
const DOOR_SPEED = 8;
const DOOR_W = CAR_W / 2;
const DOOR_OPEN_SCALE = 0.12; // mở hết: cánh cửa co lại thành dải hẹp sát vách
const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ElevatorCar({ elevator, x, color }) {
  const carRef = useRef();
  const doorOpenness = useRef(0); // 0 = đóng, 1 = mở hết
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();

  const targetY = floorY(elevator.currentFloor);
  const doorOpen = elevator.state === ElevatorStateName.DOOR_OPEN;

  useFrame((_, dt) => {
    const car = carRef.current;
    const gap = targetY - car.position.y;
    if (REDUCED_MOTION) {
      car.position.y = targetY;
    } else {
      const speed = FLOORS_PER_SECOND * FLOOR_H * Math.max(1, Math.abs(gap) / FLOOR_H);
      car.position.y += Math.sign(gap) * Math.min(Math.abs(gap), speed * dt);
    }

    doorOpenness.current = REDUCED_MOTION
      ? Number(doorOpen)
      : MathUtils.damp(doorOpenness.current, Number(doorOpen), DOOR_SPEED, dt);
    const scale = MathUtils.lerp(1, DOOR_OPEN_SCALE, doorOpenness.current);
    const centerX = CAR_W / 2 - (DOOR_W * scale) / 2;
    leftDoorRef.current.scale.x = scale;
    leftDoorRef.current.position.x = -centerX;
    rightDoorRef.current.scale.x = scale;
    rightDoorRef.current.position.x = centerX;
  });

  const arrow = elevator.state === ElevatorStateName.MOVING
    ? (elevator.direction === Direction.UP ? '▲' : '▼')
    : '';

  return (
    <group position={[x, 0, 0]}>
      {/* Chỉ cabin di chuyển; nhóm ngoài giữ vị trí trục */}
      <group ref={carRef} position={[0, targetY, 0]}>
        {/* Sàn, trần, hai vách bên, vách sau */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[CAR_W, 0.06, CAR_D]} />
          <meshStandardMaterial color="#3a3f4b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, CAR_H, 0]}>
          <boxGeometry args={[CAR_W, 0.06, CAR_D]} />
          <meshStandardMaterial color="#3a3f4b" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[(side * CAR_W) / 2, CAR_H / 2, 0]}>
            <boxGeometry args={[0.04, CAR_H, CAR_D]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, CAR_H / 2, -CAR_D / 2]}>
          <boxGeometry args={[CAR_W, CAR_H, 0.04]} />
          <meshStandardMaterial color="#d9dde6" metalness={0.2} roughness={0.7} />
        </mesh>

        {/* Đèn trong cabin: sáng hơn khi cửa mở */}
        <mesh position={[0, CAR_H - 0.05, 0]}>
          <boxGeometry args={[CAR_W * 0.6, 0.02, CAR_D * 0.4]} />
          <meshStandardMaterial color="#fff6e0" emissive="#fff1c9" emissiveIntensity={doorOpen ? 3 : 1.2} />
        </mesh>
        <pointLight position={[0, CAR_H * 0.7, 0]} intensity={doorOpen ? 1.6 : 0.6} distance={2.2} color="#ffe7b3" />

        {/* Hai cánh cửa trượt ra hai bên */}
        <Door ref={leftDoorRef} x={-CAR_W / 4} />
        <Door ref={rightDoorRef} x={CAR_W / 4} />

        {/* Dải màu nhận diện thang phía trên cửa */}
        <mesh position={[0, CAR_H + 0.08, CAR_D / 2]}>
          <boxGeometry args={[CAR_W, 0.1, 0.03]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>

        <Label
          text={`${elevator.id} · ${elevator.currentFloor}${arrow && ` ${arrow}`}`}
          position={[0, CAR_H + 0.36, CAR_D / 2]}
          border={color}
          background="rgba(12, 14, 20, 0.85)"
        />

        {/* Cáp kéo lên mái */}
        <mesh position={[0, CAR_H + 20, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 40, 6]} />
          <meshStandardMaterial color="#555b66" />
        </mesh>
      </group>

      {/* Tầng đã được bấm trong thang: chấm sáng màu của thang trên vách sau */}
      {elevator.stops.map((floor) => (
        <mesh key={floor} position={[CAR_W / 2 + 0.12, floorY(floor) + FLOOR_H / 2, -SHAFT_D / 2 + 0.06]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

function Door({ ref, x }) {
  return (
    <mesh ref={ref} position={[x, CAR_H / 2, CAR_D / 2]}>
      <boxGeometry args={[DOOR_W - 0.01, CAR_H - 0.08, 0.03]} />
      <meshStandardMaterial color="#aeb6c4" metalness={0.85} roughness={0.25} />
    </mesh>
  );
}
