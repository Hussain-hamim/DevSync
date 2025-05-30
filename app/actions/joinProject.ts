'use server';

import { supabase } from '../lib/supabase';

export async function joinProjectRole({
  filled_by,
  project_id,
  title,
}: {
  filled_by: string;
  project_id: string;
  title: string;
}) {
  if (!filled_by || !project_id || !title) return { error: 'Missing data' };

  const { data, error } = await supabase
    .from('project_roles')
    .insert([{ project_id, title, filled_by }])
    .select();

  // In your handleJoinSubmit function:
  await logActivity(project_id, filled_by, 'role_assigned', {
    role: title,
  });

  if (error || !data.length)
    return { error: error?.message || 'Role not available' };

  return { success: true, role: data[0] };
}

const logActivity = async (projectId, userId, type, data) => {
  try {
    await supabase.from('activities2').insert([
      {
        project_id: projectId,
        user_id: userId,
        activity_type: type,
        activity_data: data,
      },
    ]);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
