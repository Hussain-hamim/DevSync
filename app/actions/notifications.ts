"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabase } from "../lib/supabase";

export interface NotificationData {
  type:
    | "project_invite"
    | "task_assigned"
    | "task_completed"
    | "comment"
    | "comment_reply"
    | "follow"
    | "join_request"
    | "join_approved"
    | "project_update"
    | "issue_created"
    | "issue_assigned"
    | "issue_resolved"
    | "discussion_mention";
  title: string;
  message: string;
  link?: string;
  related_id?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  data: NotificationData
) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      related_id: data.related_id || null,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Create notification error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(limit: number = 50) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated", notifications: [] };
    }

    // Get current user ID
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !currentUser) {
      return { success: false, error: "User not found", notifications: [] };
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message, notifications: [] };
    }

    return { success: true, notifications: notifications || [] };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { success: false, error: "An unexpected error occurred", notifications: [] };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, count: 0 };
    }

    // Get current user ID
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !currentUser) {
      return { success: false, count: 0 };
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", currentUser.id)
      .eq("read", false);

    if (error) {
      console.error("Error fetching notification count:", error);
      return { success: false, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Get notification count error:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user ID
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !currentUser) {
      return { success: false, error: "User not found" };
    }

    // Verify notification belongs to user
    const { data: notification, error: checkError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", notificationId)
      .single();

    if (checkError || !notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.user_id !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Mark as read
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user ID
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !currentUser) {
      return { success: false, error: "User not found" };
    }

    // Mark all as read
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", currentUser.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user ID
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !currentUser) {
      return { success: false, error: "User not found" };
    }

    // Verify notification belongs to user
    const { data: notification, error: checkError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", notificationId)
      .single();

    if (checkError || !notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.user_id !== currentUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete notification
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

