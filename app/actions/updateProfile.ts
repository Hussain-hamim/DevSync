'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../authOptions';
import { supabase } from '../lib/supabase';

interface UpdateProfileData {
  name?: string;
  bio?: string;
  username?: string;
  avatar_url?: string;
  portfolio_url?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error('Unauthorized: Please log in to update your profile');
    }

    // Get the current user
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (fetchError || !userData) {
      throw new Error('User not found');
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    if (data.username !== undefined) updateData.username = data.username || null;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url || null;
    if (data.portfolio_url !== undefined) updateData.portfolio_url = data.portfolio_url || null;
    if (data.social_links !== undefined) {
      updateData.social_links = data.social_links || {};
    }

    // Update the user
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userData.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw new Error('Failed to update profile');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

