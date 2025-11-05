"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabase } from "../lib/supabase";
import { createNotification } from "./notifications";

export async function followUser(followingId: string) {
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

    const followerId = currentUser.id;

    // Prevent self-follow
    if (followerId === followingId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (existingFollow) {
      return { success: false, error: "Already following this user" };
    }

    // Create follow relationship
    const { error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (followError) {
      console.error("Follow error:", followError);
      return { success: false, error: "Failed to follow user" };
    }

    // Get follower's name for notification
    const { data: followerData } = await supabase
      .from("users")
      .select("name")
      .eq("id", followerId)
      .single();

    // Create notification for the user being followed
    await createNotification(followingId, {
      type: "follow",
      title: "New Follower",
      message: `${followerData?.name || "Someone"} started following you`,
      link: `/profile/${followerId}`,
      related_id: followerId,
    });

    return { success: true };
  } catch (error) {
    console.error("Follow user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function unfollowUser(followingId: string) {
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

    const followerId = currentUser.id;

    // Remove follow relationship
    const { error: unfollowError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (unfollowError) {
      console.error("Unfollow error:", unfollowError);
      return { success: false, error: "Failed to unfollow user" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unfollow user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function checkFollowStatus(followingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { isFollowing: false };
    }

    // Get current user ID
    const { data: currentUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!currentUser) {
      return { isFollowing: false };
    }

    const followerId = currentUser.id;

    // Check if following
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    return { isFollowing: !!follow };
  } catch (error) {
    console.error("Check follow status error:", error);
    return { isFollowing: false };
  }
}

export async function getFollowCounts(userId: string) {
  try {
    // Get followers count
    const { count: followersCount } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId);

    // Get following count
    const { count: followingCount } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userId);

    return {
      followers: followersCount || 0,
      following: followingCount || 0,
    };
  } catch (error) {
    console.error("Get follow counts error:", error);
    return {
      followers: 0,
      following: 0,
    };
  }
}

