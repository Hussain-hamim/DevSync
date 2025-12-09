"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateUserRole, deleteUser } from "../../actions/adminActions";
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
  avatar_url: string | null;
  github_username: string | null;
}

export default function UsersTable({
  users,
  currentPage,
  totalPages,
  search,
  roleFilter,
}: {
  users: User[];
  currentPage: number;
  totalPages: number;
  search: string;
  roleFilter: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedRole, setSelectedRole] = useState(roleFilter);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (role !== "all") {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleRoleUpdate = async (userId: string, role: string) => {
    setLoading(true);
    try {
      await updateUserRole(userId, role as "user" | "admin" | "moderator");
      router.refresh();
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await deleteUser(userId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-700 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by role:</span>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              handleRoleFilter(e.target.value);
            }}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <div className="font-medium">
                        {user.name || "Unnamed"}
                      </div>
                      {user.github_username && (
                        <div className="text-sm text-gray-400">
                          @{user.github_username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      user.role === "admin"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : user.role === "moderator"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleRoleUpdate(user.id, "admin")}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition disabled:opacity-50"
                        title="Promote to Admin"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    {user.role !== "user" && (
                      <button
                        onClick={() => handleRoleUpdate(user.id, "user")}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded hover:bg-gray-600 transition disabled:opacity-50"
                        title="Demote to User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded hover:bg-rose-500/30 transition disabled:opacity-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                router.push(`/admin/users?${params.toString()}`);
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
                router.push(`/admin/users?${params.toString()}`);
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
