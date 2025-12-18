import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FirstTimeUserRedirect from "@/components/FirstTimeUserRedirect";
import ExpensePage from "@/pages/ExpensePage";
import { CropFilterProvider } from "@/contexts/CropFilterContext";
import { YearFilterProvider } from "@/contexts/YearFilterContext";

export default function Expenses() {
  return (
    <ProtectedRoute>
      <CropFilterProvider>
        <YearFilterProvider>
          <Layout>
            <FirstTimeUserRedirect>
              <ExpensePage />
            </FirstTimeUserRedirect>
          </Layout>
        </YearFilterProvider>
      </CropFilterProvider>
    </ProtectedRoute>
  );
}
