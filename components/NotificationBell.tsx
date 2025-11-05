"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "@/app/actions/notifications";
import Link from "next/link";

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!session?.user) return;
    const result = await getUnreadNotificationCount();
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();
    }
  }, [session]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && userId) {
      fetchRecentNotifications();
    }
  }, [showDropdown, userId]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // New notification received
          fetchUnreadCount();
          if (showDropdown) {
            fetchRecentNotifications();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount();
          if (showDropdown) {
            fetchRecentNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showDropdown]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      fetchUnreadCount();
      fetchRecentNotifications();
    }
    setShowDropdown(false);
    if (notification.link) {
      router.push(notification.link);
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

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-100">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-emerald-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="overflow-y-auto max-h-80">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading...
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {recentNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-3 hover:bg-gray-700/50 transition-colors ${
                          !notification.read ? "bg-gray-700/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read
                                  ? "text-gray-100"
                                  : "text-gray-400"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-700">
                <Link
                  href="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

