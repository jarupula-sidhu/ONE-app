import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CreateGoal } from './pages/CreateGoal';
import { Focus } from './pages/Focus';
import { Complete } from './pages/Complete';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-950 text-neutral-100 flex flex-col justify-between">
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGoal />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}

export default App;
