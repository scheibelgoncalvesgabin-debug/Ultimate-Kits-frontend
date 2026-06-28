import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './lib/api.js';
import Dashboard from './pages/Dashboard.jsx';
import Server from './pages/Server.jsx';
import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('pk_token');
  if (!token) return <Navigate to="/welcome" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/server/:serverId" element={<PrivateRoute><Server /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
