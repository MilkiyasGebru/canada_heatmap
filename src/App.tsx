import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import VspPage from './pages/VspPage';
import PGAPage from './pages/PGAPage';
import PressurePage from './pages/PressurePage';
import MarkersPage from './pages/MarkersPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navigation />
        <Routes>
          <Route path="/" element={<VspPage />} />
          <Route path="/pga" element={<PGAPage />} />
          <Route path="/pressure" element={<PressurePage />} />
          <Route path="/markers" element={<MarkersPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
