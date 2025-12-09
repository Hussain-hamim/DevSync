import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import {
  deleteProject,
  deleteUser,
  updateUserRole,
} from "../actions/adminActions";
import AdminLogoutButton from "./components/AdminLogoutButton";

const updateRoleAction = async (formData: FormData) => {
  "use server";
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "user" | "admin" | "moderator";
  await updateUserRole(userId, role);
  redirect("/admin");
};

const deleteUserAction = async (formData: FormData) => {
  "use server";
  const userId = formData.get("userId") as string;
  await deleteUser(userId);
  redirect("/admin");
};

const deleteProjectAction = async (formData: FormData) => {
  "use server";
  const projectId = formData.get("projectId") as string;
  await deleteProject(projectId);
  redirect("/admin");
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const { data: stats } = await supabaseAdmin
    .from("admin_stats")
    .select("*")
    .single();

  const { data: recentUsers } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: recentProjects } = await supabaseAdmin
    .from("projects")
    .select("id,title,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-sm uppercase tracking-wide">
              Admin
            </p>
            <h1 className="text-3xl font-bold">Control Center</h1>
            <p className="text-sm text-gray-400">
              Manage users, roles, and projects. Admin accounts are created
              directly in the database.
            </p>
          </div>
          <AdminLogoutButton />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Total Users",
              value: stats?.total_users ?? "—",
              color: "text-blue-400",
            },
            {
              label: "Admins",
              value: stats?.total_admins ?? "—",
              color: "text-emerald-400",
            },
            {
              label: "Moderators",
              value: stats?.total_moderators ?? "—",
              color: "text-cyan-400",
            },
            {
              label: "Projects",
              value: stats?.total_projects ?? "—",
              color: "text-purple-400",
            },
            {
              label: "Tasks",
              value: stats?.total_tasks ?? "—",
              color: "text-yellow-400",
            },
            {
              label: "Issues",
              value: stats?.total_issues ?? "—",
              color: "text-rose-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg hover:border-gray-600 transition"
            >
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {(stats?.new_users_7d || stats?.new_projects_7d) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-400">New Users (7 days)</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">
                {stats?.new_users_7d ?? 0}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-400">New Projects (7 days)</p>
              <p className="text-2xl font-bold mt-1 text-cyan-400">
                {stats?.new_projects_7d ?? 0}
              </p>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Users</h2>
              <span className="text-xs text-gray-400">
                Promote / demote / remove
              </span>
            </div>
            <div className="space-y-3">
              {(recentUsers || []).map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{user.name || "Unnamed"}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-emerald-400 uppercase tracking-wide">
                      {user.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={updateRoleAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value="admin" />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                      >
                        Promote
                      </button>
                    </form>
                    <form action={updateRoleAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value="user" />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1 rounded-md bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 transition"
                      >
                        Demote
                      </button>
                    </form>
                    <form action={deleteUserAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="text-xs px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {!recentUsers?.length && (
                <p className="text-sm text-gray-400">No users found.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <span className="text-xs text-gray-400">Delete projects</span>
            </div>
            <div className="space-y-3">
              {(recentProjects || []).map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{project.title}</p>
                    <p className="text-xs text-gray-400">
                      Created{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={deleteProjectAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
              {!recentProjects?.length && (
                <p className="text-sm text-gray-400">No projects found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
