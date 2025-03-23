import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthPages from './pages/AuthPages';
import AllHackathonPages from './pages/AllHackathon'
import MyHackathonPage from './pages/MyHackathon';
import ViewHackathonPage from './pages/ViewHackthon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPages />} />
        <Route path="/all-hackathons" element={<AllHackathonPages />} />
        <Route path="/my-hackathons" element={<MyHackathonPage />} />
        <Route path="/view-hackathon/:id" element={<ViewHackathonPage />} />
      </Routes>
    </Router>
  );
}

export default App;