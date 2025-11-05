"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateProject } from "@/app/actions/updateProject";

interface EditProjectModalProps {
  show: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  initialData?: {
    title: string;
    description?: string;
    github_url?: string;
    tech_stack: string[];
    roles_needed: string[];
  };
  projectId: string;
}

export function EditProjectModal({
  show,
  onClose,
  onProjectUpdated,
  initialData,
  projectId,
}: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    github_url: "",
    tech_stack: "",
    roles_needed: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        github_url: initialData.github_url || "",
        tech_stack: initialData.tech_stack?.join(", ") || "",
        roles_needed: initialData.roles_needed?.join(", ") || "",
      });
    }
  }, [show, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate title
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      // Parse tech_stack and roles_needed from comma-separated strings
      const tech_stack = formData.tech_stack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean);
      const roles_needed = formData.roles_needed
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);

      // Update project
      const result = await updateProject(projectId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        github_url: formData.github_url.trim() || undefined,
        tech_stack,
        roles_needed,
      });

      if (result.success) {
        toast.success("Project updated successfully!");
        onProjectUpdated();
        onClose();
      } else {
        toast.error(result.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                Edit Project
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    placeholder="Enter project title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors resize-none"
                    placeholder="Describe your project..."
                  />
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    name="tech_stack"
                    value={formData.tech_stack}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    placeholder="React, Node.js, TypeScript (comma-separated)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate technologies with commas
                  </p>
                </div>

                {/* Roles Needed */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Roles Needed
                  </label>
                  <input
                    type="text"
                    name="roles_needed"
                    value={formData.roles_needed}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    placeholder="Frontend Developer, Backend Developer (comma-separated)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate roles with commas
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim()}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      formData.title.trim() && !isSubmitting
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Updating..." : "Update Project"}
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

