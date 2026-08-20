import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#dedfe1] font-['Plus_Jakarta_Sans',sans-serif] text-[#101114]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
      `}</style>

      {/* LEFT SIDEBAR */}
      <AdminSidebar />

      {/* RIGHT SIDE */}
      <div className="min-h-screen lg:pl-64">

        {/* TOP HEADER */}
        <AdminHeader />

        {/* PAGE CONTENT */}
        <main className="px-5 py-6 sm:px-8 lg:px-10">
          <Outlet />
        </main>

      </div>
    </div>
  );
}