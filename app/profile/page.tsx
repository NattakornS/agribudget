import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ProfilePage from "@/pages/ProfilePage";

export default function Profile() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProfilePage />
      </Layout>
    </ProtectedRoute>
  );
}
