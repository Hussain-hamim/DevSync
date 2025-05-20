"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Search,
  Filter,
  GitBranch,
  Star,
  Eye,
  Users,
  ChevronDown,
  Plus,
  Code,
  GithubIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Github from "next-auth/providers/github";
import { supabase } from "../lib/supabase";
import { NewProjectModal } from "./NewProjectModal";

const TechTag = ({ tech }) => (
  <motion.span
    whileHover={{
      y: -2,
      boxShadow: "0 4px 8px rgba(16, 185, 129, 0.2)",
    }}
    className="text-xs bg-gray-900/80 text-emerald-400 px-2 py-1 rounded-full cursor-default"
  >
    {tech}
  </motion.span>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Error:", error);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    toast.success("Project created successfully!");
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech_stack?.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      activeFilter === "all" || project.project_type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProjectModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-grow">
          <motion.div
            animate={{
              x: [0, 2, -2, 0],
              transition: { duration: 3, repeat: Infinity },
            }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          >
            <Search className="w-5 h-5 text-gray-500" />
          </motion.div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 flex items-center gap-2 w-full sm:w-auto"
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
              >
                {["all", "web", "ai", "devops", "tools"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeFilter === filter
                        ? "bg-gray-700 text-emerald-400"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {filter === "all"
                      ? "All Projects"
                      : filter === "web"
                      ? "Web Development"
                      : filter === "ai"
                      ? "AI/ML"
                      : filter === "devops"
                      ? "DevOps"
                      : "Developer Tools"}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.1)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 overflow-hidden hover:border-emerald-400/30 transition-all cursor-pointer"
              onClick={() => (window.location.href = `/projects/${project.id}`)}
            >
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <GitBranch className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                  <h3 className="font-medium text-gray-100">{project.title}</h3>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-amber-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle star/favorite functionality
                  }}
                >
                  <Star className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Project Image Placeholder */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code className="w-12 h-12 text-gray-700" />
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                whileHover={{ x: 2 }}
                className="text-gray-400 text-sm mb-4 line-clamp-2"
              >
                {project.description}
              </motion.p>

              {/* Tech Stack */}
              <motion.div className="flex flex-wrap gap-2 mb-4" layout>
                {project.tech_stack?.map((tech) => (
                  <TechTag key={tech} tech={tech} />
                ))}
              </motion.div>

              {/* Footer */}
              <div className="flex justify-between items-center text-sm">
                <motion.div
                  className="flex items-center gap-2 text-gray-400"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="w-4 h-4" />
                  <span>1 member</span>
                </motion.div>

                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Code className="w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 max-w-md">
            {searchQuery
              ? "Try adjusting your search or filter to find what you're looking for."
              : "There are currently no public projects available."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProjectModal(true)}
            className="mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </motion.button>
        </motion.div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        show={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Floating Create Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNewProjectModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 p-3 rounded-full shadow-xl cursor-pointer md:hidden"
      >
        <Plus className="w-6 h-6" />
      </motion.div>
    </div>
  );
}
