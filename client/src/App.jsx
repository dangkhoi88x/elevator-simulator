import { lazy, Suspense, useCallback } from 'react';
import { useBuilding } from './hooks/useBuilding.js';
import { useToast } from './hooks/useToast.js';
import { ElevatorStatus } from './components/ElevatorStatus.jsx';
import { HallPanel } from './components/HallPanel.jsx';
import { SceneErrorBoundary } from './components/SceneErrorBoundary.jsx';
import { Toast } from './components/Toast.jsx';

// three.js khá nặng -> tải riêng, khung trang hiện trước
const BuildingScene = lazy(() =>
  import('./components/BuildingScene.jsx').then((m) => ({ default: m.BuildingScene })),
);

function App() {
  const { snapshot, connected, send } = useBuilding();
  const { toast, show: showToast } = useToast();

  // Không tự bật đèn ở client: đợi snapshot từ server để giao diện luôn khớp thực tế
  const callElevator = useCallback((floor, direction) => {
    send('pickup', { floor, direction }).catch((err) => showToast(err.message));
  }, [send, showToast]);

  return (
    <main>
      <header className="app-header">
        <h1>Elevators</h1>
        <span className={`conn ${connected ? 'conn-on' : 'conn-off'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        {snapshot && <span className="strategy">Strategy: {snapshot.strategyName}</span>}
      </header>

      {snapshot ? (
        <div className="layout">
          <section className="stage">
            <SceneErrorBoundary>
              <Suspense fallback={<p className="stage-loading">Loading 3D view…</p>}>
                <BuildingScene snapshot={snapshot} onCall={callElevator} disabled={!connected} />
              </Suspense>
            </SceneErrorBoundary>
            <p className="stage-hint">Click ▲▼ to call · drag to rotate · scroll to zoom</p>
          </section>
          <aside className="sidebar">
            <ElevatorStatus elevators={snapshot.elevators} />
            <HallPanel
              floorCount={snapshot.floorCount}
              pendingPickups={snapshot.pendingPickups}
              onCall={callElevator}
              disabled={!connected}
            />
          </aside>
        </div>
      ) : (
        <p className="waiting">Waiting for the server…</p>
      )}

      <Toast toast={toast} />
    </main>
  );
}

export default App;
