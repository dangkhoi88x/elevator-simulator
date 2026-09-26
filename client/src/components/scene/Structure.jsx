import { Direction } from '../../constants.js';
import { LANTERN_ON } from '../../theme.js';
import { Label } from './Label.jsx';
import {
  FLOOR_H, SHAFT_W, SHAFT_D, LANDING_W,
  buildingWidth, buildingHeight, shaftX, floorY,
} from './layout.js';

const FRAME = '#56607a';
const WALL = '#2b3242';

// Khung toà nhà: tường sau, cột, dầm mỗi tầng, cột sảnh bên trái
export function Structure({ floorCount, elevatorCount, pendingPickups }) {
  const width = buildingWidth(elevatorCount);
  const height = buildingHeight(floorCount);
  const left = -width / 2 - LANDING_W;
  const floors = Array.from({ length: floorCount }, (_, i) => i + 1);

  return (
    <group>
      {/* Tường sau */}
      <mesh position={[(left + width / 2) / 2, height / 2, -SHAFT_D / 2 - 0.05]}>
        <boxGeometry args={[width + LANDING_W + 0.4, height + 0.4, 0.1]} />
        <meshStandardMaterial color={WALL} />
      </mesh>

      {/* Mái và nền */}
      {[-0.1, height + 0.1].map((y) => (
        <mesh key={y} position={[(left + width / 2) / 2, y, 0]}>
          <boxGeometry args={[width + LANDING_W + 0.4, 0.2, SHAFT_D + 0.3]} />
          <meshStandardMaterial color={FRAME} metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      {/* Cột hai bên mỗi trục thang */}
      {Array.from({ length: elevatorCount + 1 }, (_, i) => {
        const x = i < elevatorCount
          ? shaftX(i, elevatorCount) - SHAFT_W / 2
          : shaftX(elevatorCount - 1, elevatorCount) + SHAFT_W / 2;
        return (
          <mesh key={i} position={[x, height / 2, SHAFT_D / 2]}>
            <boxGeometry args={[0.08, height, 0.08]} />
            <meshStandardMaterial color={FRAME} metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}

      {/* Ray dẫn hướng ở giữa lưng mỗi trục */}
      {Array.from({ length: elevatorCount }, (_, i) => (
        <mesh key={i} position={[shaftX(i, elevatorCount), height / 2, -SHAFT_D / 2 + 0.02]}>
          <boxGeometry args={[0.05, height, 0.03]} />
          <meshStandardMaterial color="#3a404d" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {floors.map((floor) => (
        <group key={floor} position={[0, floorY(floor), 0]}>
          {/* Dầm sàn phía trước */}
          <mesh position={[(left + width / 2) / 2, 0, SHAFT_D / 2]}>
            <boxGeometry args={[width + LANDING_W, 0.05, 0.1]} />
            <meshStandardMaterial color={FRAME} metalness={0.3} roughness={0.6} />
          </mesh>

          {/* Sàn sảnh bên trái */}
          <mesh position={[left + LANDING_W / 2, 0, 0]}>
            <boxGeometry args={[LANDING_W, 0.05, SHAFT_D]} />
            <meshStandardMaterial color="#3a4254" />
          </mesh>

          <Label text={String(floor)} position={[left + 0.35, FLOOR_H / 2, SHAFT_D / 2]} height={0.34} color="#c9d1e3" />

          <HallLantern
            position={[left + LANDING_W - 0.3, FLOOR_H / 2, SHAFT_D / 2]}
            hasUp={floor < floorCount}
            hasDown={floor > 1}
            upOn={pendingPickups[Direction.UP].includes(floor)}
            downOn={pendingPickups[Direction.DOWN].includes(floor)}
          />
        </group>
      ))}
    </group>
  );
}

// Cặp đèn ▲▼ ở sảnh mỗi tầng, sáng khi có người đang chờ
function HallLantern({ position, hasUp, hasDown, upOn, downOn }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[0.22, 0.46, 0.04]} />
        <meshStandardMaterial color="#10131a" metalness={0.5} roughness={0.4} />
      </mesh>
      {hasUp && <Arrow y={0.1} rotation={0} on={upOn} />}
      {hasDown && <Arrow y={-0.1} rotation={Math.PI} on={downOn} />}
    </group>
  );
}

function Arrow({ y, rotation, on }) {
  return (
    <mesh position={[0, y, 0]} rotation={[0, 0, rotation]}>
      <coneGeometry args={[0.07, 0.12, 3]} />
      <meshStandardMaterial
        color={on ? LANTERN_ON : '#5a6070'}
        emissive={on ? LANTERN_ON : '#000000'}
        emissiveIntensity={on ? 2 : 0}
      />
    </mesh>
  );
}
