import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Queue } from './pages/Queue';
import { useMediaSession } from './hooks/useMediaSession';

function App() {
  // Initialize MediaSession for lock screen controls
  useMediaSession();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlists/:id" element={<PlaylistDetail />} />
        <Route path="queue" element={<Queue />} />
      </Route>
    </Routes>
  );
}

export default App;
