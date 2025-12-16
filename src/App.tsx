import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CropFilterProvider } from './contexts/CropFilterContext';
import { YearFilterProvider } from './contexts/YearFilterContext';
import LanguageProvider from './contexts/LanguageContext';

import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensePage from './pages/ExpensePage';
import FertilizerPlannerPage from './pages/FertilizerPlannerPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';
import FirstTimeUserRedirect from './components/FirstTimeUserRedirect';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={
                <CropFilterProvider>
                  <YearFilterProvider>
                    <FirstTimeUserRedirect>
                      <Layout />
                    </FirstTimeUserRedirect>
                  </YearFilterProvider>
                </CropFilterProvider>
              }>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/income" element={<IncomePage />} />
                <Route path="/expenses" element={<ExpensePage />} />
                <Route path="/planner" element={<FertilizerPlannerPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
