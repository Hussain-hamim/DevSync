import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../authOptions";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminLayout from "../components/AdminLayout";
import ProjectsTable from "../components/ProjectsTable";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("projects")
    .select(
      "id,title,description,created_at,views,is_public,creator_id,users!projects_creator_id_fkey(name,email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (searchParams.search) {
    query = query.ilike("title", `%${searchParams.search}%`);
  }

  const {
    data: projects,
    count,
    error,
  } = await query.range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Management</h1>
          <p className="text-gray-400">
            Manage all projects and their settings
          </p>
        </div>

        <ProjectsTable
          projects={projects || []}
          currentPage={page}
          totalPages={totalPages}
          search={searchParams.search || ""}
        />
      </div>
    </AdminLayout>
  );
}
