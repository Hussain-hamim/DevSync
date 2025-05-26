// app/actions/taskActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/app/lib/supabase';
import { authOptions } from '@/app/authOptions';
import { getServerSession } from 'next-auth';

interface TaskData {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  due_date: string;
  projectId: string;
}

export async function saveTask(formData: TaskData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  // Get user ID from Supabase
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('name', session.user.name)
    .single();

  if (userError || !userData) {
    throw new Error(userError?.message || 'User not found');
  }

  const creator_id = userData.id;

  // Prepare task data
  const taskData = {
    project_id: formData.projectId,
    title: formData.title,
    description: formData.description,
    status: formData.status || 'Not Started',
    priority: formData.priority || 'Medium',
    assigned_to: formData.assignee || null,
    due_date: formData.due_date || null,
    created_by: creator_id,
  };

  // Insert into Supabase
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select(
      `
      *
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Log activity
  await supabase.from('task_activities').insert({
    task_id: data.id,
    user_id: creator_id,
    activity_type: 'created',
    new_value: formData.title,
  });

  // After successfully creating a task:
  await logActivity(formData.projectId, creator_id, 'task_created', {
    task_title: taskData.title,
    task_id: data.id,
  });

  revalidatePath(`/projects/${formData.projectId}/tasks`);
  revalidatePath(`/projects/${formData.projectId}`);

  return data;
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
