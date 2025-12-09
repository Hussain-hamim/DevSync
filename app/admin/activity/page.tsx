import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../authOptions";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminLayout from "../components/AdminLayout";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const { data: activities, count } = await supabaseAdmin
    .from("activities2")
    .select(
      "id,activity_type,activity_data,created_at,users!activities2_user_id_fkey(name,email),projects!activities2_project_id_fkey(title)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
          <p className="text-gray-400">
            View all platform activity and audit trail
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {activities?.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium capitalize">
                        {activity.activity_type.replace(/_/g, " ")}
                      </div>
                      {activity.activity_data &&
                        typeof activity.activity_data === "object" && (
                          <div className="text-sm text-gray-400 mt-1">
                            {JSON.stringify(activity.activity_data)}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activity.users?.name ||
                        activity.users?.email ||
                        "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activity.projects?.title || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
