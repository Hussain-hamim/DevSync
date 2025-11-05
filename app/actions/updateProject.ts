"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabase } from "../lib/supabase";
import { createNotification } from "./notifications";

interface UpdateProjectData {
  title: string;
  description?: string;
  github_url?: string;
  tech_stack: string[];
  roles_needed: string[];
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectData
) {
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

    // Verify user is the project owner
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("creator_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: "Project not found" };
    }

    if (project.creator_id !== currentUser.id) {
      return { success: false, error: "Only project owner can edit the project" };
    }

    // Prepare update data
    const updateData: any = {
      title: data.title,
      description: data.description || null,
      github_url: data.github_url || null,
      tech_stack: data.tech_stack || [],
      roles_needed: data.roles_needed || [],
      updated_at: new Date().toISOString(),
    };

    // Update project in database
    const { error: updateError } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    if (updateError) {
      console.error("Update project error:", updateError);
      return { success: false, error: "Failed to update project" };
    }

    // Log activity
    await supabase.from("activities2").insert({
      project_id: projectId,
      user_id: currentUser.id,
      activity_type: "project_updated",
      activity_data: {
        title: data.title,
      },
    });

    // Get project info
    const { data: projectInfo } = await supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single();

    // Get all project members (excluding the creator who made the update)
    const { data: projectRoles } = await supabase
      .from("project_roles")
      .select("filled_by")
      .eq("project_id", projectId)
      .not("filled_by", "is", null);

    // Get unique member IDs
    const memberIds = new Set<string>();
    if (projectRoles) {
      projectRoles.forEach((role) => {
        if (role.filled_by && role.filled_by !== currentUser.id) {
          memberIds.add(role.filled_by);
        }
      });
    }

    // Notify all team members about project update
    const { data: creatorData } = await supabase
      .from("users")
      .select("name")
      .eq("id", currentUser.id)
      .single();

    const notificationPromises = Array.from(memberIds).map((memberId) =>
      createNotification(memberId, {
        type: "project_update",
        title: "Project Updated",
        message: `${creatorData?.name || "Project owner"} updated "${projectInfo?.title || "the project"}"`,
        link: `/projects/${projectId}`,
        related_id: projectId,
      })
    );

    await Promise.all(notificationPromises);

    return { success: true };
  } catch (error) {
    console.error("Update project error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

