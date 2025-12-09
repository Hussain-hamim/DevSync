"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteProject } from "../../actions/adminActions";
import { Search, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  views: number;
  is_public: boolean;
  creator_id: string;
  users: {
    name: string | null;
    email: string;
  } | null;
}

export default function ProjectsTable({
  projects,
  currentPage,
  totalPages,
  search,
}: {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  search: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(search);
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
    router.push(`/admin/projects?${params.toString()}`);
  };

  const handleDelete = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await deleteProject(projectId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-700/50 transition">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{project.title}</div>
                    {project.description && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {project.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {project.users?.name || project.users?.email || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {project.views || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {project.is_public ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                      <Eye className="w-3 h-3" />
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                      <EyeOff className="w-3 h-3" />
                      Private
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(project.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-emerald-400 transition"
                      title="View Project"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={loading}
                      className="p-2 text-rose-400 hover:text-rose-300 transition disabled:opacity-50"
                      title="Delete Project"
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
                router.push(`/admin/projects?${params.toString()}`);
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
                router.push(`/admin/projects?${params.toString()}`);
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
