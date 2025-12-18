import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FirstTimeUserRedirect from "@/components/FirstTimeUserRedirect";
import IncomePage from "@/pages/IncomePage";
import { CropFilterProvider } from "@/contexts/CropFilterContext";
import { YearFilterProvider } from "@/contexts/YearFilterContext";

export default function Income() {
  return (
    <ProtectedRoute>
      <CropFilterProvider>
        <YearFilterProvider>
          <Layout>
            <FirstTimeUserRedirect>
              <IncomePage />
            </FirstTimeUserRedirect>
          </Layout>
        </YearFilterProvider>
      </CropFilterProvider>
    </ProtectedRoute>
  );
}
