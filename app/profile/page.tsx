"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
// import dynamic from 'next/dynamic';

// const ProfilePage = dynamic(() => import("@/pages/ProfilePage"), {
//   ssr: false,
//   loading: () => <div>Loading...</div>
// });

export default function Profile() {
  return (
    <ProtectedRoute>
      <Layout>
        asdbnjas
      </Layout>
    </ProtectedRoute>
  );
}
