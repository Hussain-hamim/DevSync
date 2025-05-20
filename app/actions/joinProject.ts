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

  if (error || !data.length)
    return { error: error?.message || 'Role not available' };

  return { success: true, role: data[0] };
}
