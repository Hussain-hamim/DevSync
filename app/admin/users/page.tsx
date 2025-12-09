import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../authOptions";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminLayout from "../components/AdminLayout";
import UsersTable from "../components/UsersTable";
import { Suspense } from "react";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("users")
    .select("id,name,email,role,created_at,avatar_url,github_username", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (searchParams.search) {
    query = query.or(
      `name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`
    );
  }

  if (searchParams.role && searchParams.role !== "all") {
    query = query.eq("role", searchParams.role);
  }

  const {
    data: users,
    count,
    error,
  } = await query.range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-400">
            Manage all users, roles, and permissions
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <UsersTable
            users={users || []}
            currentPage={page}
            totalPages={totalPages}
            search={searchParams.search || ""}
            roleFilter={searchParams.role || "all"}
          />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
