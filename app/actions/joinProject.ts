'use server';

import { supabase } from '../lib/supabase';
import { createNotification } from './notifications';

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

  // Get project creator and member info for notification
  const { data: projectData } = await supabase
    .from('projects')
    .select('creator_id, title')
    .eq('id', project_id)
    .single();

  const { data: memberData } = await supabase
    .from('users')
    .select('name')
    .eq('id', filled_by)
    .single();

  // Notify project creator when someone joins
  if (projectData?.creator_id && projectData.creator_id !== filled_by) {
    await createNotification(projectData.creator_id, {
      type: 'join_approved',
      title: 'New Team Member',
      message: `${memberData?.name || 'Someone'} joined your project "${projectData.title}" as ${title}`,
      link: `/projects/${project_id}`,
      related_id: project_id,
    });
  }

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
