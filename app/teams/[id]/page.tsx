// app/teams/[id]/page.tsx
'use client';
import { Users, Calendar, Github, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { supabase } from '@/app/lib/supabase';

// Extend dayjs with plugins
dayjs.extend(relativeTime);

interface Project {
  id: string;
  title: string;
  description?: string;
  github_url?: string;
  created_at: string;
  creator_id: string;
  tech_stack?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  avatar_url?: string;
  roles: string[];
  isOwner: boolean;
}

export default function TeamDetails() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        // 1. Fetch the project that serves as our "team"
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (projectError || !projectData) {
          throw projectError || new Error('Project not found');
        }
        setProject(projectData);

        // 2. Fetch all members of this project (creator + role fillers)
        const membersMap = new Map<string, TeamMember>();

        // Add creator as owner
        if (projectData.creator_id) {
          const { data: creator } = await supabase
            .from('users')
            .select('id, name, avatar_url')
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
          .select('title, users(id, name, avatar_url)')
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

  if (!project) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='text-gray-400'>Project/Team not found</div>
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
                {project.title} Team
              </h1>
            </div>

            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6'>
              <div className='flex items-center space-x-1'>
                <Users className='w-4 h-4' />
                <span>{teamMembers.length} members</span>
              </div>

              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>Created {dayjs(project.created_at).fromNow()}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'
          >
            View Project
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              About This Team
            </h2>
            <div className='overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50'>
              <pre className='text-gray-400 whitespace-pre-wrap font-sans p-2'>
                {project.description ||
                  'No description provided for this project team.'}
              </pre>
            </div>
          </div>

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Tech Stack
              </h2>
              <div className='flex flex-wrap gap-2'>
                {project.tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    className='text-xs bg-gray-900/80 text-emerald-400 px-3 py-1.5 rounded-full'
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Team Members */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Team Members
              </h2>
            </div>

            <ul className='space-y-4'>
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className='block hover:bg-gray-700/50 rounded-lg transition-colors duration-200 p-2 -mx-2 active:bg-gray-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
                  >
                    <li className='flex items-center gap-3 group'>
                      <div className='relative flex-shrink-0'>
                        <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium overflow-hidden group-hover:bg-gray-600 transition-colors'>
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
                          <div className='absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-0.5'>
                            <Crown className='w-3 h-3 text-white' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-gray-100 font-medium truncate group-hover:text-white transition-colors'>
                          {member.name}
                        </h3>
                        <div className='mt-1 flex flex-wrap gap-2'>
                          {member.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                role === 'Owner'
                                  ? 'bg-purple-900/70 text-purple-100'
                                  : 'bg-cyan-900/50 text-cyan-300'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  </Link>
                ))
              ) : (
                <div className='text-center py-4 text-gray-400'>
                  No team members yet
                </div>
              )}
            </ul>
          </div>

          {/* Project Links */}
          {project.github_url && (
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Project Links
              </h2>
              <a
                href={project.github_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center text-emerald-400 hover:underline mb-3'
              >
                <Github className='w-5 h-5 mr-2' />
                GitHub Repository
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
