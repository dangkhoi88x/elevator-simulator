import { useCallback } from 'react';
import { useBuilding } from './hooks/useBuilding.js';
import { useToast } from './hooks/useToast.js';
import { Building } from './components/Building.jsx';
import { ElevatorStatus } from './components/ElevatorStatus.jsx';
import { Toast } from './components/Toast.jsx';

function App() {
  const { snapshot, connected, send } = useBuilding();
  const { toast, show: showToast } = useToast();

  // Không tự bật đèn ở client: đợi snapshot từ server để giao diện luôn khớp thực tế
  const sendCommand = useCallback((event, payload) => {
    send(event, payload).catch((err) => showToast(err.message));
  }, [send, showToast]);

  const callElevator = useCallback(
    (floor, direction) => sendCommand('pickup', { floor, direction }),
    [sendCommand],
  );

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
          <section className="panel" aria-label="Building">
            <Building snapshot={snapshot} onCall={callElevator} disabled={!connected} />
          </section>
          <aside>
            <ElevatorStatus
              elevators={snapshot.elevators}
              floorCount={snapshot.floorCount}
              onCommand={sendCommand}
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
