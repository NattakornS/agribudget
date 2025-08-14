import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import FertilizerPlannerPage from './pages/FertilizerPlannerPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/expenses" element={<ExpensePage />} />
              <Route path="/planner" element={<FertilizerPlannerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
