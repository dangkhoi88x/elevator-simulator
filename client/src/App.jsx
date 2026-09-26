import { lazy, Suspense } from 'react';
import { useBuilding } from './hooks/useBuilding.js';
import { ElevatorStatus } from './components/ElevatorStatus.jsx';
import { SceneErrorBoundary } from './components/SceneErrorBoundary.jsx';

// three.js khá nặng -> tải riêng, khung trang hiện trước
const BuildingScene = lazy(() =>
  import('./components/BuildingScene.jsx').then((m) => ({ default: m.BuildingScene })),
);

function App() {
  const { snapshot, connected } = useBuilding();

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
                <BuildingScene snapshot={snapshot} />
              </Suspense>
            </SceneErrorBoundary>
            <p className="stage-hint">Drag to rotate · scroll to zoom</p>
          </section>
          <aside>
            <ElevatorStatus elevators={snapshot.elevators} />
          </aside>
        </div>
      ) : (
        <p className="waiting">Waiting for the server…</p>
      )}
    </main>
  );
}

export default App;
