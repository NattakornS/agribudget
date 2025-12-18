import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import SettingsPage from "@/pages/SettingsPage";

export default function Settings() {
  return (
    <ProtectedRoute>
      <Layout>
        <SettingsPage />
      </Layout>
    </ProtectedRoute>
  );
}
