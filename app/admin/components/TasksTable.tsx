"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  due_date: string | null;
  projects: { title: string } | null;
  users: { name: string | null } | null;
}

export default function TasksTable({
  tasks,
  currentPage,
  totalPages,
  statusFilter,
  priorityFilter,
}: {
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  statusFilter: string;
  priorityFilter: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    params.set("page", "1");
    router.push(`/admin/tasks?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/20 text-emerald-400";
      case "In Progress":
        return "bg-blue-500/20 text-blue-400";
      case "Blocked":
        return "bg-rose-500/20 text-rose-400";
      default:
        return "bg-gray-700 text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/20 text-rose-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-700 text-gray-400";
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-700 flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilter("status", e.target.value)}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => handleFilter("priority", e.target.value)}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-700/50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                      {task.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {task.projects?.title || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {task.users?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(Math.max(1, currentPage - 1)));
                router.push(`/admin/tasks?${params.toString()}`);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set(
                  "page",
                  String(Math.min(totalPages, currentPage + 1))
                );
                router.push(`/admin/tasks?${params.toString()}`);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
