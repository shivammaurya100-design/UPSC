import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './hooks/useAdmin';
import Sidebar from './components/ui/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MCQs from './pages/MCQs';
import Flashcards from './pages/Flashcards';
import Articles from './pages/Articles';
import Community from './pages/Community';
import Users from './pages/Users';
import './index.css';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mcqs" element={<MCQs />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/community" element={<Community />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAdmin();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}
