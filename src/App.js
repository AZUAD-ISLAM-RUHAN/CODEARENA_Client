import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/Auth/AdminLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import Problems from './pages/Problems/Problems';
import ProblemSolve from './pages/Problems/ProblemSolve';
import Battle from './pages/Battle/Battle';
import LiveBattle from './pages/Battle/LiveBattle';
import Profile from './pages/Profile/Profile';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Admin from './pages/Admin/Admin';
import Contest from './pages/Contest/Contest';
import ContestLive from './pages/Contest/ContestLive';
import TermsPage from './pages/Legal/TermsPage';
import PrivacyPage from './pages/Legal/PrivacyPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problem/:id" element={<ProblemSolve />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/battle/:battleId" element={<LiveBattle />} />
          <Route path="/contest" element={<Contest />} />
          <Route path="/contest/:contestId" element={<ContestLive />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;