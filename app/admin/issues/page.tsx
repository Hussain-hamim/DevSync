import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../authOptions";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminLayout from "../components/AdminLayout";
import IssuesTable from "../components/IssuesTable";
import { Suspense } from "react";

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("issues")
    .select(
      "id,title,description,status,priority,created_at,projects!issues_project_id_fkey(title),users!issues_created_by_fkey(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.priority && searchParams.priority !== "all") {
    query = query.eq("priority", searchParams.priority);
  }

  const {
    data: issues,
    count,
    error,
  } = await query.range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Issue Management</h1>
          <p className="text-gray-400">
            View and manage all issues across projects
          </p>
        </div>

        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <IssuesTable
            issues={issues || []}
            currentPage={page}
            totalPages={totalPages}
            statusFilter={searchParams.status || "all"}
            priorityFilter={searchParams.priority || "all"}
          />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
