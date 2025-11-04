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
  Crown,
  Plus,
  Check,
  Calendar as CalendarIcon,
  User,
  Sparkle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { joinProjectRole } from "@/app/actions/joinProject";
import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { JoinProjectModal } from "./JoinProjectModal";
import Header from "@/components/Header";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import { AddTaskModal } from "./AddTaskModal";
import { AddIssueModal } from "./AddIssueModal";

// Form validation imports
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(calendar);

export default function ProjectDetails() {
  const { data: session } = useSession();
  const params = useParams();

  // Loading / project state
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  // Tasks state & sorting
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  //
  const [issues, setIssues] = useState<any[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const onIssueCreated = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    fetchIssues(); // Refresh issues list
  };

  const fetchIssues = async () => {
    setLoadingIssues(true);
    try {
      const { data, error } = await supabase
        .from("issues")
        .select(
          `
        *,
        created_by:created_by(id, name, avatar_url),
        assigned_to:assigned_to(id, name, avatar_url)
      `
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoadingIssues(false);
    }
  };

  // Fetch + sort tasks client-side, then slice the top 4
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      // 1) Fetch ALL tasks for this project
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select(
          `*,
          assigned_to:assigned_to(id, name, avatar_url),
          created_by:created_by(id, name, avatar_url)
        `
        )
        .eq("project_id", project.id);

      if (error) throw error;

      const taskList: any[] = tasksData || [];
      const sortedTasks = taskList.slice().sort((a, b) => {
        // Handle completed tasks last
        if (a.status === "Completed" && b.status !== "Completed") return 1;
        if (b.status === "Completed" && a.status !== "Completed") return -1;
        if (a.status === "Completed" && b.status === "Completed") {
          return (
            new Date(b.completed_at || b.updated_at).getTime() -
            new Date(a.completed_at || a.updated_at).getTime()
          );
        }

        // For non-completed tasks:
        // Only "In Progress" gets special priority (1), all others same priority (2)
        const pa = a.status === "In Progress" ? 1 : 2;
        const pb = b.status === "In Progress" ? 1 : 2;

        // Same priority? Sort by creation date (newest first)
        if (pa === pb) {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        // Different priorities
        return pa - pb;
      });

      // 3) Keep only the first 4 items
      const topFour = sortedTasks.slice(0, 4);
      setTasks(topFour);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Discussion form validation schema
  const discussionSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
  });

  // State for Discussions
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  // Activities state
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Project Members + Roles
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Modals
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // React Hook Form setup for Discussions
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discussionSchema),
  });

  // Helper function to format activity messages
  const formatActivity = (activity) => {
    const user = activity.user || { name: "Unknown User" };
    const type = activity.activity_type;
    const data = activity.activity_data || {};

    switch (type) {
      case "task_created":
        return `${user.name} created task "${data.task_title}"`;
      case "task_completed":
        return `${user.name} completed task "${data.task_title}"`;
      case "task_started":
        return `${user.name} start task "${data.task_title}"`;
      case "role_assigned":
        return `${user.name} joined as ${data.role}`;
      case "discussion_created":
        return `${user.name} started a discussion`;
      case "project_updated":
        return `${user.name} updated project details`;
      default:
        return `${user.name} performed an action`;
    }
  };

  // Helper function to get activity icon and color
  const getActivityStyle = (activity) => {
    const type = activity.activity_type;

    if (type === "task_completed") {
      return {
        bg: "bg-emerald-900/50",
        text: "text-emerald-400",
        icon: <Sparkles className="w-4 h-4" />,
      };
    } else if (type === "task_started") {
      return {
        bg: "bg-yellow-900/50",
        text: "text-yellow-400",
        icon: <Plus className="w-4 h-4" />,
      };
    } else if (type === "task_created") {
      return {
        bg: "bg-blue-900/50",
        text: "text-blue-400",
        icon: <span>{activity.user?.name?.charAt(0) || "U"}</span>,
      };
    } else if (type === "role_assigned") {
      return {
        bg: "bg-purple-900/50",
        text: "text-purple-400",
        icon: <span>{activity.user?.name?.charAt(0) || "U"}</span>,
      };
    } else {
      return {
        bg: "bg-gray-700",
        text: "text-gray-300",
        icon: <span>{activity.user?.name?.charAt(0) || "U"}</span>,
      };
    }
  };

  // Fetch activities when project loads
  useEffect(() => {
    if (project?.id) {
      fetchActivities();
    }
  }, [project?.id]);

  // Fetch project data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1) Get project row
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", params.id)
          .single();

        if (projectError || !projectData) {
          console.error("Project not found:", projectError);
          return;
        }
        setProject(projectData);

        // Prepare availableRoles based on roles_needed & roles already taken
        const allRoles = projectData.roles_needed || [];
        if (session?.user?.email) {
          // 2) Get current user's ID
          const { data: userData } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

          if (userData?.id) {
            // 3) Find which roles this user has already taken
            const { data: takenRoles } = await supabase
              .from("project_roles")
              .select("title")
              .eq("project_id", params.id)
              .eq("filled_by", userData.id);

            const userTakenRoles = takenRoles?.map((r) => r.title) || [];
            setAvailableRoles(
              allRoles.filter((role) => !userTakenRoles.includes(role))
            );
          } else {
            setAvailableRoles(allRoles);
          }
        } else {
          setAvailableRoles(allRoles);
        }
      } catch (e) {
        console.error("Error fetching project details:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [params.id, session?.user?.email]);

  // Fetch project members
  const fetchProjectMembers = async () => {
    if (!params.id) return;

    // 1) Get creator_id to mark "Owner"
    const { data: projectData } = await supabase
      .from("projects")
      .select("creator_id")
      .eq("id", params.id)
      .single();

    // 2) Fetch all taken roles + user info
    const { data: rolesData, error: rolesError } = await supabase
      .from("project_roles")
      .select(
        `
      title,
      filled_by:users!fk_project_roles_filled_by (
        id,
        name,
        avatar_url
      )
    `
      )
      .eq("project_id", params.id)
      .not("filled_by", "is", null);

    if (!rolesError && rolesData) {
      const membersMap = new Map<string, any>();

      // Add creator first (if not already in project_roles)
      if (projectData?.creator_id) {
        const { data: creator } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", projectData.creator_id)
          .single();

        if (creator) {
          membersMap.set(creator.id, {
            ...creator,
            roles: ["Owner"],
            isOwner: true,
          });
        }
      }

      // Add each role's user
      rolesData.forEach((roleRow) => {
        const u = (roleRow as any).filled_by;
        if (u) {
          if (!membersMap.has(u.id)) {
            membersMap.set(u.id, {
              ...u,
              roles: [roleRow.title],
              isOwner: u.id === projectData?.creator_id,
            });
          } else {
            const existing = membersMap.get(u.id);
            membersMap.set(u.id, {
              ...existing,
              roles: [...existing.roles, roleRow.title],
            });
          }
        }
      });

      setProjectMembers(Array.from(membersMap.values()));
    }
  };

  // Fetch activities
  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from("activities2")
        .select(
          `
          *,
          user:user_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch discussions
  const fetchDiscussions = async () => {
    setLoadingDiscussions(true);
    try {
      const { data, error } = await supabase
        .from("discussions")
        .select(
          `
          *,
          user:user_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoadingDiscussions(false);
    }
  };

  // Fetch user ID (NextAuth → Supabase)
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

  // After project.id is set, fire all fetches
  useEffect(() => {
    if (!project?.id) return;

    fetchTasks();
    fetchProjectMembers();
    fetchActivities();
    fetchDiscussions();
    fetchIssues();
  }, [project?.id]);

  // Post a new discussion
  const onSubmitDiscussion = async (formData: { content: string }) => {
    if (!userId || !project?.id) return;

    try {
      const { data, error } = await supabase
        .from("discussions")
        .insert([
          {
            project_id: project.id,
            user_id: userId,
            content: formData.content,
          },
        ])
        .select();

      if (error) throw error;

      // Add to top of local state
      setDiscussions((prev) => [
        {
          ...data[0],
          user: {
            id: userId,
            name: session?.user?.name,
            avatar_url: session?.user?.image,
          },
        },
        ...prev,
      ]);

      reset();
      setShowDiscussionForm(false);
    } catch (error) {
      console.error("Error creating discussion:", error);
    }
  };

  // Join project (assign role)
  const handleJoinSubmit = async (role: string, message: string) => {
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

      // 1) Refresh member list
      await fetchProjectMembers();

      // 2) Remove that role from availableRoles
      setAvailableRoles((prev) => prev.filter((r) => r !== role));

      setShowJoinModal(false);
    } catch (error) {
      console.error("Error joining project:", error);
      alert("Failed to join project");
    }
  };

  // After a new task is added, re-fetch task list
  const onAddTask = async () => {
    await fetchTasks();
    await fetchActivities();
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-pulse text-gray-400">
            Loading project details…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />

      {/* Project Header */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col pt-15 md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <GitBranch className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                {project.title}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-y-3 gap-x-4 text-sm text-gray-400 mb-4 sm:mb-6">
              <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{projectMembers.length} members</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {dayjs(project.created_at).fromNow()}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{project.views || 812} views</span>
                </div>
              </div>

              {/* Action Buttons - full width on mobile */}
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex flex-row xs:flex-row gap-2 w-full">
                  <Link
                    href={`/projects/${project.id}/tasks`}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 sm:py-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white text-sm rounded-md hover:opacity-90 transition-all duration-200 w-full sm:w-auto"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>View Tasks</span>
                  </Link>

                  <Link
                    href={`/teams/${project.id}`}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 sm:py-1 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white text-sm rounded-md hover:opacity-90 transition-all duration-200 w-full sm:w-auto"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Team</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Join Button - full width on mobile */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="group flex items-center justify-center cursor-pointer gap-1 bg-gradient-to-r from-cyan-900 to-emerald-500  text-gray-900 px-4 py-2 sm:py-1.5 text-sm sm:text-base rounded-md font-medium hover:opacity-90 transition-all duration-200 w-full md:w-auto"
          >
            <span className="relative">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="absolute inset-0 bg-amber-400 rounded-full opacity-0 group-hover:opacity-40 blur-sm group-hover:animate-ping duration-1000"></span>
            </span>
            <span>Join Project</span>
          </button>
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
            <div className="overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50">
              <pre className="text-gray-400 whitespace-pre-wrap font-sans p-2">
                {project.description}
              </pre>
            </div>
          </div>

          {/* Activity Feed & Discussions */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="space-y-8">
              {/* Activity Feed */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-emerald-400" />
                  Team Activity
                </h2>

                <div className="space-y-4">
                  {loadingActivities ? (
                    [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 animate-pulse mr-3"></div>
                        <div className="flex-grow">
                          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : activities.length > 0 ? (
                    activities.map((activity) => {
                      const style = getActivityStyle(activity);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                        >
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${style.bg} ${style.text}`}
                          >
                            {style.icon}
                          </div>
                          <div className="flex-grow">
                            <p className="text-gray-300">
                              {formatActivity(activity)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {dayjs(activity.created_at).fromNow()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No activity yet</p>
                  )}
                </div>
              </div>

              {/* Discussions Section */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Discussions
                  </h2>
                  <button
                    onClick={() => setShowDiscussionForm((prev) => !prev)}
                    className="text-emerald-400 hover:underline text-sm flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {showDiscussionForm ? "Cancel" : "New Discussion"}
                  </button>
                </div>

                {/* New Discussion Form */}
                {showDiscussionForm && (
                  <form
                    onSubmit={handleSubmit(onSubmitDiscussion)}
                    className="mb-6"
                  >
                    <div className="mb-3">
                      <textarea
                        {...register("content")}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Write your message here..."
                      />
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.content.message as string}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Post Message
                      </button>
                    </div>
                  </form>
                )}

                {/* Discussions List */}
                {loadingDiscussions ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse h-20"
                      />
                    ))}
                  </div>
                ) : discussions.length > 0 ? (
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                              {discussion.user?.avatar_url ? (
                                <img
                                  src={discussion.user.avatar_url}
                                  alt={discussion.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-300">
                                  {discussion.user?.name?.charAt(0) || "U"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-gray-100 font-medium">
                                {discussion.user?.name || "Unknown User"}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {dayjs(discussion.created_at).fromNow()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-300 whitespace-pre-wrap">
                              {discussion.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No discussions yet. Start the conversation!
                  </p>
                )}
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
              {project.tech_stack?.map((tech: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-gray-900/80 text-emerald-400 px-3 py-1.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Project Members
              </h2>
              <Link
                href={`/teams/${project.id}`}
                className="flex items-center hover:underline text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Team
              </Link>
            </div>

            <ul className="">
              {projectMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`../profile/${member.id}`}
                  className="block hover:bg-gray-700/50 rounded-lg transition-colors duration-200 p-2 -mx-2 active:bg-gray-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  <li className="flex items-start gap-2 group">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium overflow-hidden group-hover:bg-gray-600 transition-colors">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.name?.charAt(0) || "H"
                        )}
                      </div>
                      {member.isOwner && (
                        <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-0.5">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-gray-100 font-medium truncate group-hover:text-white transition-colors">
                          {member.name}
                        </h3>
                        <span className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                          @{member.name.toLowerCase().replace(/\s+/g, "")}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2">
                        {member.roles.map((role: string) => (
                          <span
                            key={role}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role === "Owner"
                                ? "bg-purple-900/70 text-purple-100"
                                : "bg-cyan-900/50 text-cyan-300"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          </div>

          {/* Project Tasks Card */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Project Tasks
              </h2>
              <Link
                href={`/projects/${project.id}/tasks`}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View All Tasks
              </Link>
            </div>

            {loadingTasks ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse h-16"
                  />
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Link
                    href={`/projects/${project.id}/tasks/${task.id}`}
                    key={task.id}
                    className={`block group rounded-lg transition-colors duration-200 p-2 -mx-2 hover:bg-gray-700/50 active:bg-gray-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                      task.status === "Completed" ? "opacity-80" : ""
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg border transition-colors ${
                        task.status === "Completed"
                          ? "bg-gray-800/20 border-gray-700/50 group-hover:border-gray-700"
                          : "bg-gray-800/30 border-gray-700 group-hover:border-gray-600"
                      }`}
                    >
                      {/* Task Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {/* Status Indicator */}
                          <div
                            className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              task.status === "Completed"
                                ? "bg-green-500"
                                : task.status === "In Progress"
                                ? "bg-amber-500 animate-pulse"
                                : task.status === "In Review"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                            }`}
                          >
                            {task.status === "Completed" && (
                              <Check className="w-2 h-2 text-gray-900" />
                            )}
                          </div>

                          {/* Task Title */}
                          <h3
                            className={`font-medium ${
                              task.status === "Completed"
                                ? "text-gray-400 line-through"
                                : "text-gray-100 group-hover:text-white"
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            task.priority === "High"
                              ? "bg-red-900/50 text-red-300"
                              : task.priority === "Medium"
                              ? "bg-amber-900/50 text-amber-300"
                              : "bg-gray-700 text-gray-300"
                          } ${task.status === "Completed" ? "opacity-70" : ""}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        {/* Assignee */}
                        <div
                          className={`flex items-center gap-2 ${
                            task.status === "Completed"
                              ? "text-gray-500"
                              : "text-gray-400 group-hover:text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                              task.status === "Completed"
                                ? "bg-gray-700/50"
                                : "bg-gray-700 group-hover:bg-gray-600"
                            }`}
                          >
                            {task.assigned_to?.name?.charAt(0) || "H"}
                          </div>
                          <span>{task.assigned_to?.name || "Unassigned"}</span>
                        </div>

                        {/* Due Date */}
                        {task.due_date && (
                          <div
                            className={`flex items-center gap-2 ${
                              task.status === "Completed"
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-300"
                            }`}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {new Date(task.due_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                              {task.status === "Completed" && (
                                <span className="ml-1 text-green-400">✓</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Completed Badge */}
                      {task.status === "Completed" && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No tasks created yet
              </div>
            )}

            {/* Add Task Button (Owners only) */}
            {projectMembers.some(
              (member) => member.isOwner && member.name === session?.user?.name
            ) && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  You can add tasks to this project.
                </span>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="text-emerald-400 hover:underline text-md inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add Task
                </button>
              </div>
            )}
          </div>

          {/* roles needed */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Roles Needed
            </h2>
            <ul className="space-y-3">
              {project.roles_needed?.map((role: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                  <span className="text-gray-300">{role}</span>
                </li>
              ))}
            </ul>
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

          {/* Issues Section */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Issues</h2>
              <button
                onClick={() => setShowIssueModal(true)}
                className="text-emerald-400 hover:underline text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Issue
              </button>
            </div>

            {loadingIssues ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse h-20"
                  />
                ))}
              </div>
            ) : issues.length > 0 ? (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            issue.status === "Open"
                              ? "bg-green-900/50 text-green-400"
                              : issue.status === "In Progress"
                              ? "bg-blue-900/50 text-blue-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {issue.status === "Open"
                            ? "!"
                            : issue.status === "In Progress"
                            ? "→"
                            : "✓"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-gray-100 font-medium hover:underline cursor-pointer">
                            {issue.title}
                          </h3>
                          {issue.priority === "High" && (
                            <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                              High Priority
                            </span>
                          )}
                          {issue.priority === "Critical" && (
                            <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-gray-400 text-sm line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-gray-500">
                            #{issue.id.split("-")[0]}
                          </span>
                          <span className="text-gray-500">
                            opened {dayjs(issue.created_at).fromNow()} by{" "}
                            {issue.created_by?.name || "Anonymous"}
                          </span>
                          {issue.assigned_to && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <User className="w-3 h-3" />
                              {issue.assigned_to.name}
                            </span>
                          )}
                          {issue.labels?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {issue.labels.map((label, i) => (
                                <span
                                  key={i}
                                  className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>No issues reported yet</p>
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="mt-3 text-emerald-400 hover:underline text-sm flex items-center justify-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create first issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddIssueModal
        projectId={project.id}
        show={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onIssueCreated={onIssueCreated}
      />

      {/* Join Project Modal */}
      <JoinProjectModal
        projectName={project.title}
        rolesNeeded={availableRoles}
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        projectName={project.title}
        projectMembers={projectMembers}
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={project.id}
        onTaskCreated={onAddTask}
      />
    </div>
  );
}
