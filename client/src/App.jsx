import { useBuilding } from './hooks/useBuilding.js';

function App() {
  const { snapshot, connected } = useBuilding();

  return (
    <main>
      <h1>Elevators</h1>
      <p>{connected ? 'Connected' : 'Disconnected'}</p>
      {/* Tạm thời in thẳng snapshot để kiểm tra kết nối, sẽ thay bằng UI ở commit sau */}
      <pre>{snapshot ? JSON.stringify(snapshot, null, 2) : 'Waiting for state...'}</pre>
    </main>
  );
}

export default App;
