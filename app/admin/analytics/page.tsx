import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../authOptions";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminLayout from "../components/AdminLayout";
import VisitorAnalytics from "../components/VisitorAnalytics";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const { data: stats } = await supabaseAdmin
    .from("admin_stats")
    .select("*")
    .single();

  // Get user growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentUsers } = await supabaseAdmin
    .from("users")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Get project growth data
  const { data: recentProjects } = await supabaseAdmin
    .from("projects")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Get task completion stats
  const { count: completedTasks } = await supabaseAdmin
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "Completed");

  const { count: inProgressTasks } = await supabaseAdmin
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "In Progress");

  // Get analytics summary for public pages only (excluding admin)
  // We'll calculate this manually to exclude admin pages
  const { count: totalPageViews } = await supabaseAdmin
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .not("page_path", "like", "/admin%");

  const { count: uniqueSessionsCount } = await supabaseAdmin
    .from("page_views")
    .select("session_id", { count: "exact", head: true })
    .not("page_path", "like", "/admin%");

  const { count: uniqueUsersCount } = await supabaseAdmin
    .from("page_views")
    .select("user_id", { count: "exact", head: true })
    .not("page_path", "like", "/admin%")
    .not("user_id", "is", null);

  const { data: allPageViews } = await supabaseAdmin
    .from("page_views")
    .select("page_path, time_spent, created_at")
    .not("page_path", "like", "/admin%");

  const uniquePages = new Set(allPageViews?.map((v) => v.page_path) || []).size;
  const totalTimeSpent =
    allPageViews?.reduce((sum, v) => sum + (v.time_spent || 0), 0) || 0;
  const avgTimeSpent = totalPageViews ? totalTimeSpent / totalPageViews : 0;

  // Get views for different time periods (excluding admin)
  const now = new Date();
  const views24h =
    allPageViews?.filter(
      (v) =>
        new Date(v.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
    ).length || 0;
  const views7d =
    allPageViews?.filter(
      (v) =>
        new Date(v.created_at) >=
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0;
  const views30d =
    allPageViews?.filter(
      (v) =>
        new Date(v.created_at) >=
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

  const analyticsSummary = {
    total_sessions: uniqueSessionsCount || 0,
    total_page_views: totalPageViews || 0,
    unique_users: uniqueUsersCount || 0,
    unique_pages: uniquePages,
    avg_time_spent: avgTimeSpent,
    total_time_spent: totalTimeSpent,
    views_24h: views24h,
    views_7d: views7d,
    views_30d: views30d,
  };

  // Get top pages with aggregation - EXCLUDE admin pages
  const { data: topPagesData } = await supabaseAdmin
    .from("page_views")
    .select("page_path, page_title, time_spent")
    .not("page_path", "like", "/admin%") // Exclude admin pages
    .order("created_at", { ascending: false })
    .limit(1000);

  // Count page views per path (excluding admin)
  const pageViewsCount: Record<
    string,
    { count: number; title: string; totalTime: number }
  > = {};
  topPagesData?.forEach((view) => {
    // Skip admin pages
    if (view.page_path.startsWith("/admin")) {
      return;
    }
    if (!pageViewsCount[view.page_path]) {
      pageViewsCount[view.page_path] = {
        count: 0,
        title: view.page_title || view.page_path,
        totalTime: 0,
      };
    }
    pageViewsCount[view.page_path].count += 1;
    pageViewsCount[view.page_path].totalTime += view.time_spent || 0;
  });

  // Get recent visitors - EXCLUDE admin pages
  const { data: recentVisitors } = await supabaseAdmin
    .from("page_views")
    .select(
      "id, session_id, page_path, page_title, time_spent, created_at, device_type, browser, os, users(name, email)"
    )
    .not("page_path", "like", "/admin%") // Exclude admin pages
    .order("created_at", { ascending: false })
    .limit(50);

  // Get unique sessions count - EXCLUDE admin pages
  const { count: uniqueSessions } = await supabaseAdmin
    .from("page_views")
    .select("session_id", { count: "exact", head: true })
    .not("page_path", "like", "/admin%");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
          <p className="text-gray-400">
            Platform statistics and growth metrics
          </p>
        </div>

        {/* Visitor Analytics Section */}
        <VisitorAnalytics
          analyticsSummary={analyticsSummary}
          topPages={Object.entries(pageViewsCount)
            .map(([path, data]) => ({ path, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)}
          recentVisitors={recentVisitors || []}
          uniqueSessions={uniqueSessionsCount || 0}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Users</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.total_users ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              +{stats?.new_users_7d ?? 0} this week
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Total Projects</p>
            <p className="text-3xl font-bold text-purple-400">
              {stats?.total_projects ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              +{stats?.new_projects_7d ?? 0} this week
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Completed Tasks</p>
            <p className="text-3xl font-bold text-emerald-400">
              {completedTasks ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {inProgressTasks ?? 0} in progress
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-2">Open Issues</p>
            <p className="text-3xl font-bold text-rose-400">
              {stats?.total_issues ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total issues</p>
          </div>
        </div>

        {/* Growth Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              User Growth (30 days)
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart visualization coming soon</p>
              <p className="text-sm mt-2">
                {recentUsers?.length ?? 0} new users in the last 30 days
              </p>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Project Growth (30 days)
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart visualization coming soon</p>
              <p className="text-sm mt-2">
                {recentProjects?.length ?? 0} new projects in the last 30 days
              </p>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Task Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-200">
                {stats?.total_tasks ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">
                {completedTasks ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">
                {inProgressTasks ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-cyan-400">
                {stats?.total_tasks
                  ? Math.round(
                      ((completedTasks ?? 0) / stats.total_tasks) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Rate</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats?.total_tasks
                  ? Math.round(
                      ((inProgressTasks ?? 0) / stats.total_tasks) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
