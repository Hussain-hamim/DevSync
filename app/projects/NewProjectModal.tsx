"use client";

import {
  X,
  GitBranch,
  Github,
  Lock,
  Globe,
  UserPlus,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface NewProjectModalProps {
  show: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export function NewProjectModal({
  show,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    techStack: "",
    isPublic: true,
    githubUrl: "",
    rolesNeeded: [] as string[],
  });
  const [newRole, setNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create a project");
      }

      const techStackArray = projectData.techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      if (techStackArray.length === 0) {
        throw new Error("Please add at least one technology");
      }

      if (!projectData.githubUrl) {
        throw new Error("GitHub URL is required");
      }

      const { error } = await supabase
        .from("projects")
        .insert({
          title: projectData.title,
          description: projectData.description || null,
          tech_stack: techStackArray,
          is_public: projectData.isPublic,
          github_url: projectData.githubUrl,
          created_by: user.id,
          roles_needed: projectData.rolesNeeded,
        })
        .select();

      if (error) throw error;

      toast.success("Project created successfully!", {
        description: `${projectData.title} is now available for collaboration`,
      });
      setProjectData({
        title: "",
        description: "",
        techStack: "",
        isPublic: true,
        githubUrl: "",
        rolesNeeded: [],
      });
      onProjectCreated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project",
        {
          description: "Please check your inputs and try again",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRole = () => {
    if (newRole.trim() && !projectData.rolesNeeded.includes(newRole.trim())) {
      setProjectData({
        ...projectData,
        rolesNeeded: [...projectData.rolesNeeded, newRole.trim()],
      });
      setNewRole("");
    }
  };

  const removeRole = (roleToRemove: string) => {
    setProjectData({
      ...projectData,
      rolesNeeded: projectData.rolesNeeded.filter(
        (role) => role !== roleToRemove
      ),
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl relative my-8 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <GitBranch className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-gray-100">
                  Create New Project
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Project Name*
                    </label>
                    <input
                      type="text"
                      value={projectData.title}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          title: e.target.value,
                        })
                      }
                      placeholder="My Awesome Project"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={projectData.description}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          description: e.target.value,
                        })
                      }
                      placeholder="What's this project about? (optional)"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors min-h-[100px]"
                    />
                  </div>

                  {/* GitHub URL */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      GitHub URL*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={projectData.githubUrl}
                        onChange={(e) =>
                          setProjectData({
                            ...projectData,
                            githubUrl: e.target.value,
                          })
                        }
                        placeholder="https://github.com/username/repo"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Tech Stack */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Tech Stack (comma separated)*
                    </label>
                    <input
                      type="text"
                      value={projectData.techStack}
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          techStack: e.target.value,
                        })
                      }
                      placeholder="React, Node.js, PostgreSQL"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate technologies with commas
                    </p>
                  </div>

                  {/* Roles Needed */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Roles Needed
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Frontend Developer"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addRole())
                        }
                      />
                      <button
                        type="button"
                        onClick={addRole}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {projectData.rolesNeeded.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projectData.rolesNeeded.map((role) => (
                          <div
                            key={role}
                            className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            <span className="text-gray-300">{role}</span>
                            <button
                              type="button"
                              onClick={() => removeRole(role)}
                              className="ml-2 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setProjectData({
                          ...projectData,
                          isPublic: !projectData.isPublic,
                        })
                      }
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                        projectData.isPublic ? "bg-emerald-600" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`${
                          projectData.isPublic
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                      />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      {projectData.isPublic ? (
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Lock className="w-4 h-4 mr-1" /> Private
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Full Width Submit Button */}
                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Project...
                      </span>
                    ) : (
                      "Create Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
