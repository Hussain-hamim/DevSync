import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminLogoutButton from "./AdminLogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Control Center</h1>
          <AdminLogoutButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
