'use server';

import { authOptions } from '../authOptions';
import { supabase } from '../lib/supabase';
import { getServerSession } from 'next-auth';

interface ProjectData {
  title: string;
  description: string;
  github_url?: string;
  tech_stack: string[];
  roles_needed?: string[];
}

export async function saveProject(formData: ProjectData) {
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

  // Prepare project data
  const projectData = {
    creator_id,
    title: formData.title,
    description: formData.description,
    github_url: formData.github_url || null,
    tech_stack: formData.tech_stack,
    roles_needed: formData.roles_needed || [],
    is_public: true, // or make this configurable
  };

  // Insert into Supabase
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
