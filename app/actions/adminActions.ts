"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { supabaseAdmin } from "../lib/supabaseAdmin";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw new Error("Admin access required");
  }
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin" | "moderator"
) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProject(projectId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", projectId);
  if (error) {
    throw new Error(error.message);
  }
}
