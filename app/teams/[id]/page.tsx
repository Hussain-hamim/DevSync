'use client';
import { Users, Calendar, ArrowLeft, Crown, Github } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { supabase } from '@/app/lib/supabase';

// Extend dayjs with plugins
dayjs.extend(relativeTime);

interface TeamMember {
  id: string;
  name: string;
  avatar_url?: string;
  roles: string[];
  isOwner: boolean;
  github_username?: string;
  created_at?: string;
}

export default function TeamDetails() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        // 1. Fetch the project/team name
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('title, creator_id')
          .eq('id', params.id)
          .single();

        if (projectError || !projectData) {
          throw projectError || new Error('Team not found');
        }
        setTeamName(projectData.title);

        // 2. Fetch all members of this team
        const membersMap = new Map<string, TeamMember>();

        // Add creator as owner
        if (projectData.creator_id) {
          const { data: creator } = await supabase
            .from('users')
            .select('id, name, avatar_url, github_username, created_at')
            .eq('id', projectData.creator_id)
            .single();

          if (creator) {
            membersMap.set(creator.id, {
              ...creator,
              roles: ['Owner'],
              isOwner: true,
            });
          }
        }

        // Add project role fillers
        const { data: rolesData } = await supabase
          .from('project_roles')
          .select(
            'title, users(id, name, avatar_url, github_username, created_at)'
          )
          .eq('project_id', params.id)
          .not('filled_by', 'is', null);

        rolesData?.forEach((role) => {
          const user = (role as any).users;
          if (user) {
            if (!membersMap.has(user.id)) {
              membersMap.set(user.id, {
                ...user,
                roles: [role.title],
                isOwner: user.id === projectData.creator_id,
              });
            } else {
              const existing = membersMap.get(user.id);
              if (existing) {
                membersMap.set(user.id, {
                  ...existing,
                  roles: [...existing.roles, role.title],
                });
              }
            }
          }
        });

        setTeamMembers(Array.from(membersMap.values()));
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [params.id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>
            Loading team details...
          </div>
        </div>
      </div>
    );
  }

  if (!teamName) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='text-gray-400'>Team not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href='/teams'
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Teams
            </Link>
          </div>
        </div>
      </div>

      {/* Team Header */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center space-x-3 mb-4'>
              <Users className='w-6 h-6 text-emerald-400' />
              <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
                {teamName} Team
              </h1>
            </div>

            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6'>
              <div className='flex items-center space-x-1'>
                <Users className='w-4 h-4' />
                <span>{teamMembers.length} members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className='container mx-auto px-6 pb-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.id}`}
                className='group'
              >
                <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-emerald-400/30 transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col'>
                  <div className='flex items-center gap-4 mb-4'>
                    <div className='relative'>
                      <div className='w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium overflow-hidden group-hover:bg-gray-600 transition-colors'>
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          member.name?.charAt(0) || 'U'
                        )}
                      </div>
                      {member.isOwner && (
                        <div className='absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1'>
                          <Crown className='w-3 h-3 text-white' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors truncate'>
                        {member.name}
                      </h3>
                      {member.github_username && (
                        <p className='text-sm text-gray-400 truncate'>
                          @{member.github_username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='mt-2 flex flex-wrap gap-2'>
                    {member.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          role === 'Owner'
                            ? 'bg-purple-900/70 text-purple-100'
                            : 'bg-cyan-900/50 text-cyan-300'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  {member.created_at && (
                    <div className='mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-500'>
                      Member since {dayjs(member.created_at).format('MMM YYYY')}
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className='col-span-full text-center py-12 text-gray-400'>
              No team members yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
