import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FirstTimeUserRedirect from "@/components/FirstTimeUserRedirect";
import DashboardPage from "@/pages/DashboardPage";
import { CropFilterProvider } from "@/contexts/CropFilterContext";
import { YearFilterProvider } from "@/contexts/YearFilterContext";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <CropFilterProvider>
        <YearFilterProvider>
          <Layout>
            <FirstTimeUserRedirect>
              <DashboardPage />
            </FirstTimeUserRedirect>
          </Layout>
        </YearFilterProvider>
      </CropFilterProvider>
    </ProtectedRoute>
  );
}
