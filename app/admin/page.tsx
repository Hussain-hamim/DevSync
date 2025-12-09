import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import AdminLayout from "./components/AdminLayout";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Users,
  FolderKanban,
  CheckSquare,
  AlertCircle,
} from "lucide-react";

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
    .select("id,name,email,role,created_at,avatar_url")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentProjects } = await supabaseAdmin
    .from("projects")
    .select("id,title,created_at,views")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentTasks } = await supabaseAdmin
    .from("tasks")
    .select("id,title,status,priority,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentIssues } = await supabaseAdmin
    .from("issues")
    .select("id,title,status,priority,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get user activity stats
  const { count: activeUsersCount } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte(
      "updated_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats?.total_users ?? 0,
              change: stats?.new_users_7d ?? 0,
              color: "from-blue-500 to-blue-600",
              icon: Users,
              href: "/admin/users",
            },
            {
              label: "Total Projects",
              value: stats?.total_projects ?? 0,
              change: stats?.new_projects_7d ?? 0,
              color: "from-purple-500 to-purple-600",
              icon: FolderKanban,
              href: "/admin/projects",
            },
            {
              label: "Total Tasks",
              value: stats?.total_tasks ?? 0,
              change: null,
              color: "from-yellow-500 to-yellow-600",
              icon: CheckSquare,
              href: "/admin/tasks",
            },
            {
              label: "Total Issues",
              value: stats?.total_issues ?? 0,
              change: null,
              color: "from-rose-500 to-rose-600",
              icon: AlertCircle,
              href: "/admin/issues",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${card.color} opacity-80 group-hover:opacity-100 transition`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {card.change !== null && (
                    <div className="flex items-center gap-1 text-emerald-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+{card.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </Link>
            );
          })}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Active Users (7 days)</p>
            <p className="text-3xl font-bold text-emerald-400">
              {activeUsersCount ?? 0}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Admins</p>
            <p className="text-3xl font-bold text-cyan-400">
              {stats?.total_admins ?? 0}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Moderators</p>
            <p className="text-3xl font-bold text-purple-400">
              {stats?.total_moderators ?? 0}
            </p>
          </div>
        </section>

        {/* Recent Activity Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Users</h2>
              <Link
                href="/admin/users"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {(recentUsers || []).map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-700 rounded-lg p-3 flex items-center gap-3"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
                      {(user.name || "U")[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{user.name || "Unnamed"}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-emerald-400 uppercase tracking-wide mt-1">
                      {user.role}
                    </p>
                  </div>
                </div>
              ))}
              {!recentUsers?.length && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No users found.
                </p>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              <Link
                href="/admin/projects"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {(recentProjects || []).map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-700 rounded-lg p-3"
                >
                  <p className="font-semibold mb-1">{project.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span>{project.views ?? 0} views</span>
                  </div>
                </div>
              ))}
              {!recentProjects?.length && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No projects found.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recent Tasks & Issues */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
              <Link
                href="/admin/tasks"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {(recentTasks || []).map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-700 rounded-lg p-3"
                >
                  <p className="font-semibold mb-2">{task.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        task.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : task.status === "In Progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        task.priority === "High"
                          ? "bg-rose-500/20 text-rose-400"
                          : task.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
              {!recentTasks?.length && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No tasks found.
                </p>
              )}
            </div>
          </div>

          {/* Recent Issues */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Issues</h2>
              <Link
                href="/admin/issues"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {(recentIssues || []).map((issue) => (
                <div
                  key={issue.id}
                  className="border border-gray-700 rounded-lg p-3"
                >
                  <p className="font-semibold mb-2">{issue.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        issue.status === "Resolved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : issue.status === "Closed"
                          ? "bg-gray-700 text-gray-400"
                          : issue.status === "In Progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {issue.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        issue.priority === "Critical"
                          ? "bg-rose-500/20 text-rose-400"
                          : issue.priority === "High"
                          ? "bg-orange-500/20 text-orange-400"
                          : issue.priority === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </div>
                </div>
              ))}
              {!recentIssues?.length && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No issues found.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
