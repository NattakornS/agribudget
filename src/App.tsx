import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CropFilterProvider } from "./contexts/CropFilterContext";
import LanguageProvider from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { YearFilterProvider } from "./contexts/YearFilterContext";

import FirstTimeUserRedirect from "./components/FirstTimeUserRedirect";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ExpensePage from "./pages/ExpensePage";
import FertilizerPlannerPage from "./pages/FertilizerPlannerPage";
import IncomePage from "./pages/IncomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ThemeTestPage from "./pages/ThemeTestPage";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  element={
                    <CropFilterProvider>
                      <YearFilterProvider>
                        <FirstTimeUserRedirect>
                          <Layout />
                        </FirstTimeUserRedirect>
                      </YearFilterProvider>
                    </CropFilterProvider>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/income" element={<IncomePage />} />
                  <Route path="/expenses" element={<ExpensePage />} />
                  <Route path="/planner" element={<FertilizerPlannerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/theme" element={<ThemeTestPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
