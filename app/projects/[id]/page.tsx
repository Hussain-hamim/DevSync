// app/projects/[id]/page.jsx
"use client";
import {
  GitBranch,
  Users,
  Calendar,
  Github,
  MessageSquare,
  ArrowLeft,
  Star,
  Eye,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { notFound, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { joinProjectRole } from "@/app/actions/joinProject";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { JoinProjectModal } from "./JoinProjectModal";

interface Project {
  id: string;
  title: string;
  description: string;
  github_url: string | null;
  tech_stack: string[];
  roles_needed: string[];
  created_at: string;
}

export default function ProjectDetails() {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState({});
  const [userId, setUserId] = useState<string | null>(null);

  const [showJoinModal, setShowJoinModal] = useState(false);

  const [availableRoles, setAvailableRoles] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  // Fetch project data and roles
  useEffect(() => {
    const fetchProjectAndRoles = async () => {
      // 1. Fetch project data
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      setLoading(false);
      if (!projectError && projectData) {
        setProject(projectData);

        // 2. Fetch project roles (already taken roles)
        const { data: rolesData, error: rolesError } = await supabase
          .from("project_roles")
          .select("title")
          .eq("project_id", params.id);

        if (!rolesError) {
          // 3. Filter out taken roles
          const takenRoles = rolesData.map((role) => role.title);
          const filteredRoles = projectData.roles_needed.filter(
            (role) => !takenRoles.includes(role)
          );

          setAvailableRoles(filteredRoles);
        } else {
          console.error("Error fetching roles:", rolesError);
          // If error, show all roles as available
          setAvailableRoles(projectData.roles_needed || []);
        }
      } else {
        console.error("Project not found:", projectError);
      }
    };

    fetchProjectAndRoles();
  }, [params.id]);

  // Add this function near your other utility functions
  const fetchProjectMembers = async () => {
    if (!params.id) return;

    const { data, error } = await supabase
      .from("project_roles")
      .select(
        `
        title,
        users (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("project_id", params.id)
      .not("filled_by", "is", null);

    if (!error) {
      const membersMap = new Map();

      data.forEach((role) => {
        if (role.users) {
          if (!membersMap.has(role.users.id)) {
            membersMap.set(role.users.id, {
              ...role.users,
              roles: [role.title],
            });
          } else {
            const existingMember = membersMap.get(role.users.id);
            membersMap.set(role.users.id, {
              ...existingMember,
              roles: [...existingMember.roles, role.title],
            });
          }
        }
      });

      setProjectMembers(Array.from(membersMap.values()));
    }
  };

  // Then update your useEffect to use this function
  useEffect(() => {
    fetchProjectMembers();
  }, [params.id]);

  // And update handleJoinSubmit to use it
  const handleJoinSubmit = async (role: string, message: string) => {
    console.log("Join request submitted:", { role, message });

    if (!project || !userId) {
      alert("Missing project or user info");
      return;
    }

    try {
      await joinProjectRole({
        filled_by: userId,
        project_id: project.id,
        title: role,
      });

      // Refresh members and available roles
      await fetchProjectMembers();
      setAvailableRoles((prev) => prev.filter((r) => r !== role));
      setShowJoinModal(false);
    } catch (error) {
      console.error("Error joining project:", error);
      alert("Failed to join project");
    }
  };

  // And update handleJoinSubmit to use it

  // 2. Fetch user ID from your Supabase users table using NextAuth session email
  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (!error && data) {
        setUserId(data.id);
      } else {
        console.error("User not found in Supabase:", error);
      }
    };

    fetchUserId();
  }, [session]);

  // const handleJoinSubmit = async (role: string, message: string) => {
  //   console.log("Join request submitted:", { role, message });
  //   // Here you would typically make an API call

  //   // 3. Join handler
  //   if (!project || !userId) {
  //     alert("Missing project or user info");
  //     return;
  //   }
  //   await joinProjectRole({
  //     filled_by: userId,
  //     project_id: project.id,
  //     title: role,
  //   });

  //   setShowJoinModal(false);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="flex items-center text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </Link>
            <button className="text-gray-400 hover:text-emerald-400 transition-colors">
              <Star
                className={`w-5 h-5 ${
                  project.starred ? "fill-emerald-400 text-emerald-400" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Project Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <GitBranch className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                {project.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>
                  {project.roles_needed?.length - availableRoles.length + 1}{" "}
                  members
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created {project.created_at}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{project.views} views</span>
              </div>
            </div>
          </div>

          {/* <Link href={/projects/${project.id}/team}> */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Join Project
          </button>
          {/* </Link> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Description
            </h2>
            <p className="text-gray-400">{project.description}</p>
          </div>

          {/* Discussions */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            {/* Activity Feed & Discussions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Activity Feed */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Team Activity
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      user: "Hamim",
                      action: "added login page",
                      time: "2 hours ago",
                      type: "development",
                    },
                    {
                      id: 2,
                      user: "Sara",
                      action: "fixed API bug in authentication",
                      time: "4 hours ago",
                      type: "bugfix",
                    },
                    {
                      id: 3,
                      user: "AI Summary",
                      action:
                        "Team completed 3 tasks today. 2 PRs merged. 1 new feature added.",
                      time: "1 day ago",
                      type: "summary",
                    },
                    {
                      id: 4,
                      user: "Alex",
                      action: "joined the project as Frontend Developer",
                      time: "2 days ago",
                      type: "team",
                    },
                  ].map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                    >
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                          activity.type === "summary"
                            ? "bg-emerald-900/50 text-emerald-400"
                            : activity.type === "bugfix"
                            ? "bg-amber-900/50 text-amber-400"
                            : "bg-blue-900/50 text-blue-400"
                        }`}
                      >
                        {activity.type === "summary" ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <span>{activity.user.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-300">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussions Section (keep your existing code) */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                {/* ... existing discussions code ... */}

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Discussions
                  </h2>
                  <button className="text-emerald-400 hover:underline text-sm flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    New Discussion
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  No discussions yet. Start the conversation!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Tech Stack */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack?.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-900/80 text-emerald-400 px-3 py-1.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Team Members with Assigned Roles */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Project Members
              </h2>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                View Team
              </button>
            </div>

            {projectMembers.length > 0 ? (
              <ul className="space-y-4">
                {projectMembers.map((member) => (
                  <li key={member.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          member.name?.charAt(0) || "U"
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-gray-100 font-medium truncate">
                          {member.name}
                        </h3>
                        {member.name && (
                          <span className="text-xs text-gray-400">
                            @{member.name.toLowerCase().replace(/\s+/g, "")}
                          </span>
                        )}
                      </div>

                      {/* Assigned Roles */}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {member.roles?.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-900/50 text-cyan-300 border border-cyan-800/50"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                No members have joined this project yet.
              </p>
            )}
          </div>

          {/* Project Tasks Card */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Project Tasks
              </h2>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                View All Tasks
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: "Implement user authentication",
                  status: "In Progress",
                  priority: "High",
                  assignee: "Alex Johnson",
                  due_date: "2023-06-15",
                },
                {
                  id: 2,
                  title: "Design dashboard UI",
                  status: "Completed",
                  priority: "Medium",
                  assignee: "Sam Wilson",
                  due_date: "2023-05-28",
                },
                {
                  id: 3,
                  title: "Database schema design",
                  status: "Not Started",
                  priority: "High",
                  assignee: "Jordan Chen",
                  due_date: "2023-06-01",
                },
                {
                  id: 4,
                  title: "API documentation",
                  status: "In Review",
                  priority: "Low",
                  assignee: "Taylor Smith",
                  due_date: "2023-06-10",
                },
              ].map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.status === "Completed"
                            ? "bg-green-500"
                            : task.status === "In Progress"
                            ? "bg-amber-500"
                            : task.status === "In Review"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <h3 className="text-gray-100 font-medium">
                        {task.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        task.priority === "High"
                          ? "bg-red-900/50 text-red-300"
                          : task.priority === "Medium"
                          ? "bg-amber-900/50 text-amber-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{task.assignee}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(task.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors">
              + Create New Task
            </button>
          </div>

          {/* GitHub Repo */}
          {project.github_url && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Repository
              </h2>
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-400 hover:underline"
              >
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </a>
            </div>
          )}
        </div>
      </div>
      {/* Join Project Modal */}
      <JoinProjectModal
        projectName={project.title}
        rolesNeeded={availableRoles}
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
      />
    </div>
  );
}
