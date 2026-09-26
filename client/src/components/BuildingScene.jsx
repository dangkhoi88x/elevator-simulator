import { useEffect } from 'react';
import { Canvas, events as defaultEvents, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MathUtils, Vector3 } from 'three';
import { Structure } from './scene/Structure.jsx';
import { ElevatorCar } from './scene/ElevatorCar.jsx';
import { buildingHeight, buildingWidth, shaftX, LANDING_W, SHAFT_D } from './scene/layout.js';
import { elevatorColor } from '../theme.js';

const FOV = 40;
const VIEW_DIR = new Vector3(0.3, 0.08, 1).normalize(); // nhìn chéo nhẹ từ bên phải để thấy chiều sâu
const FIT_MARGIN = 1.12;

export function BuildingScene({ snapshot, onCall, disabled }) {
  const { floorCount, elevators, pendingPickups } = snapshot;
  const height = buildingHeight(floorCount);
  const width = buildingWidth(elevators.length) + LANDING_W;
  const centerX = -LANDING_W / 2;
  const centerY = height / 2;
  const size = Math.max(height, width);

  return (
    <Canvas
      className="scene"
      dpr={[1, 2]}
      camera={{ fov: FOV }}
      events={clientRectEvents}
      aria-label={`3D view of a ${floorCount}-floor building with ${elevators.length} elevators`}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#dfe6ff', '#2a2d38', 1.2]} />
      <directionalLight position={[6, height + 4, 10]} intensity={2.2} />
      <directionalLight position={[-8, height / 2, 6]} intensity={0.8} color="#a9bcff" />

      <Structure
        floorCount={floorCount}
        elevatorCount={elevators.length}
        pendingPickups={pendingPickups}
        onCall={onCall}
        disabled={disabled}
      />

      {elevators.map((elevator, i) => (
        <ElevatorCar
          key={elevator.id}
          elevator={elevator}
          x={shaftX(i, elevators.length)}
          color={elevatorColor(i)}
        />
      ))}

      <FitCamera centerX={centerX} centerY={centerY} width={width} height={height} />
      <OrbitControls
        makeDefault
        target={[centerX, centerY, 0]}
        enablePan={false}
        minDistance={size * 0.4}
        maxDistance={size * 4}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.6}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
      />
    </Canvas>
  );
}

// r3f mặc định lấy toạ độ chuột từ offsetX/offsetY, vốn có thể sai khi trang bị zoom/scale
// (bấm nhầm tầng). Tính từ clientX/Y và khung thật của canvas thì luôn đúng.
function clientRectEvents(store) {
  return {
    ...defaultEvents(store),
    compute(event, state) {
      const rect = state.events.connected.getBoundingClientRect();
      state.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
  };
}

// Lùi camera vừa đủ để thấy cả toà nhà theo tỉ lệ khung hình hiện tại (màn dọc thì bề ngang mới là giới hạn)
function FitCamera({ centerX, centerY, width, height }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useEffect(() => {
    const tanHalf = Math.tan(MathUtils.degToRad(FOV / 2));
    const distance = Math.max(height / 2 / tanHalf, width / 2 / (tanHalf * aspect)) * FIT_MARGIN + SHAFT_D / 2;
    const center = new Vector3(centerX, centerY, 0);

    camera.position.copy(center).addScaledVector(VIEW_DIR, distance);
    camera.lookAt(center);
    controls?.update();
  }, [camera, controls, aspect, centerX, centerY, width, height]);

  return null;
}
