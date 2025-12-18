import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FirstTimeUserRedirect from "@/components/FirstTimeUserRedirect";
import FertilizerPlannerPage from "@/pages/FertilizerPlannerPage";
import { CropFilterProvider } from "@/contexts/CropFilterContext";
import { YearFilterProvider } from "@/contexts/YearFilterContext";

export default function Planner() {
  return (
    <ProtectedRoute>
      <CropFilterProvider>
        <YearFilterProvider>
          <Layout>
            <FirstTimeUserRedirect>
              <FertilizerPlannerPage />
            </FirstTimeUserRedirect>
          </Layout>
        </YearFilterProvider>
      </CropFilterProvider>
    </ProtectedRoute>
  );
}
