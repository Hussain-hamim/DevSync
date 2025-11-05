"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Filter,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/app/lib/supabase";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/app/actions/notifications";
import { toast } from "sonner";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();
        if (userData) {
          setUserId(userData.id);
        }
      }
    };
    fetchUserId();
  }, [session]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const result = await getNotifications(100);
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      toast.success("Marked as read");
    } else {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } else {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("Notification deleted");
    } else {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "task_completed":
        return "✅";
      case "comment":
      case "comment_reply":
        return "💬";
      case "follow":
        return "👤";
      case "join_request":
      case "join_approved":
        return "👥";
      case "project_invite":
      case "project_update":
        return "🚀";
      case "issue_created":
      case "issue_assigned":
      case "issue_resolved":
        return "🐛";
      case "discussion_mention":
        return "🔔";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
      case "task_completed":
        return "bg-blue-500/20 text-blue-400";
      case "comment":
      case "comment_reply":
        return "bg-purple-500/20 text-purple-400";
      case "follow":
        return "bg-emerald-500/20 text-emerald-400";
      case "join_request":
      case "join_approved":
        return "bg-cyan-500/20 text-cyan-400";
      case "project_invite":
      case "project_update":
        return "bg-yellow-500/20 text-yellow-400";
      case "issue_created":
      case "issue_assigned":
      case "issue_resolved":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-gray-400">Please login to view notifications</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-gray-100">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filter === "all"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    filter === "unread"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Unread
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-emerald-400 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-sm text-gray-500">
                You'll see notifications here when you receive updates
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-gray-800/50 border rounded-lg p-4 transition-all ${
                    !notification.read
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={`font-medium mb-1 ${
                              !notification.read
                                ? "text-gray-100"
                                : "text-gray-400"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() =>
                                handleMarkAsRead(notification.id)
                              }
                              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-gray-400 hover:text-emerald-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification.id);
                            }
                          }}
                          className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

