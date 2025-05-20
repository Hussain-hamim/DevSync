// app/projects/[id]/page.jsx
'use client';
import {
  GitBranch,
  Users,
  Calendar,
  Github,
  MessageSquare,
  ArrowLeft,
  Star,
  Eye,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { notFound, useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { joinProjectRole } from '@/app/actions/joinProject';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { JoinProjectModal } from './JoinProjectModal';

interface Project {
  id: string;
  title: string;
  description: string;
  github_url: string | null;
  tech_stack: string[];
  roles_needed: string[];
  created_at: string;
}

export default function ProjectDetails() {
  const { data: session } = useSession();
  const params = useParams();

  const [project, setProject] = useState({});
  const [userId, setUserId] = useState<string | null>(null);

  const [showJoinModal, setShowJoinModal] = useState(false);

  // Inside your ProjectDetails component

  const [availableRoles, setAvailableRoles] = useState([]);

  // Fetch project data and roles
  useEffect(() => {
    const fetchProjectAndRoles = async () => {
      // 1. Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!projectError && projectData) {
        setProject(projectData);

        // 2. Fetch project roles (already taken roles)
        const { data: rolesData, error: rolesError } = await supabase
          .from('project_roles')
          .select('title')
          .eq('project_id', params.id);

        if (!rolesError) {
          // 3. Filter out taken roles
          const takenRoles = rolesData.map((role) => role.title);
          const filteredRoles = projectData.roles_needed.filter(
            (role) => !takenRoles.includes(role)
          );

          setAvailableRoles(filteredRoles);
        } else {
          console.error('Error fetching roles:', rolesError);
          // If error, show all roles as available
          setAvailableRoles(projectData.roles_needed || []);
        }
      } else {
        console.error('Project not found:', projectError);
      }
    };

    fetchProjectAndRoles();
  }, [params.id]);

  // 2. Fetch user ID from your Supabase `users` table using NextAuth session email
  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (!error && data) {
        setUserId(data.id);
      } else {
        console.error('User not found in Supabase:', error);
      }
    };

    fetchUserId();
  }, [session]);

  const handleJoinSubmit = async (role: string, message: string) => {
    console.log('Join request submitted:', { role, message });
    // Here you would typically make an API call

    // 3. Join handler
    if (!project || !userId) {
      alert('Missing project or user info');
      return;
    }
    await joinProjectRole({
      filled_by: userId,
      project_id: project.id,
      title: role,
    });

    setShowJoinModal(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href='/projects'
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Projects
            </Link>
            <button className='text-gray-400 hover:text-emerald-400 transition-colors'>
              <Star
                className={`w-5 h-5 ${
                  project.starred ? 'fill-emerald-400 text-emerald-400' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Project Header */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center space-x-3 mb-4'>
              <GitBranch className='w-6 h-6 text-emerald-400' />
              <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
                {project.title}
              </h1>
            </div>

            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6'>
              <div className='flex items-center space-x-1'>
                <Users className='w-4 h-4' />
                <span>{project.teamSize} members</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>Created {project.createdAt}</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Eye className='w-4 h-4' />
                <span>{project.views} views</span>
              </div>
            </div>
          </div>

          {/* <Link href={`/projects/${project.id}/team`}> */}
          <button
            onClick={() => setShowJoinModal(true)}
            className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'
          >
            Join Project
          </button>
          {/* </Link> */}
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              Description
            </h2>
            <p className='text-gray-400'>{project.description}</p>
          </div>

          {/* Discussions */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            {/* Activity Feed & Discussions */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Activity Feed */}
              <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
                <h2 className='text-xl font-semibold text-gray-100 mb-4 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-emerald-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    />
                  </svg>
                  Team Activity
                </h2>

                <div className='space-y-4'>
                  {[
                    {
                      id: 1,
                      user: 'Hamim',
                      action: 'added login page',
                      time: '2 hours ago',
                      type: 'development',
                    },
                    {
                      id: 2,
                      user: 'Sara',
                      action: 'fixed API bug in authentication',
                      time: '4 hours ago',
                      type: 'bugfix',
                    },
                    {
                      id: 3,
                      user: 'AI Summary',
                      action:
                        'Team completed 3 tasks today. 2 PRs merged. 1 new feature added.',
                      time: '1 day ago',
                      type: 'summary',
                    },
                    {
                      id: 4,
                      user: 'Alex',
                      action: 'joined the project as Frontend Developer',
                      time: '2 days ago',
                      type: 'team',
                    },
                  ].map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0'
                    >
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                          activity.type === 'summary'
                            ? 'bg-emerald-900/50 text-emerald-400'
                            : activity.type === 'bugfix'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-blue-900/50 text-blue-400'
                        }`}
                      >
                        {activity.type === 'summary' ? (
                          <Sparkles className='w-4 h-4' />
                        ) : (
                          <span>{activity.user.charAt(0)}</span>
                        )}
                      </div>
                      <div className='flex-grow'>
                        <p className='text-gray-300'>
                          <span className='font-medium'>{activity.user}</span>{' '}
                          {activity.action}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussions Section (keep your existing code) */}
              <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
                {/* ... existing discussions code ... */}

                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-100'>
                    Discussions
                  </h2>
                  <button className='text-emerald-400 hover:underline text-sm flex items-center'>
                    <MessageSquare className='w-4 h-4 mr-1' />
                    New Discussion
                  </button>
                </div>
                <p className='text-gray-500 text-sm'>
                  No discussions yet. Start the conversation!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Tech Stack */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              Tech Stack
            </h2>
            <div className='flex flex-wrap gap-2'>
              {project.tech_stack?.map((tech, index) => (
                <span
                  key={index}
                  className='text-xs bg-gray-900/80 text-emerald-400 px-3 py-1.5 rounded-full'
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Roles Needed */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              Roles Needed
            </h2>
            <ul className='space-y-3'>
              {project.roles_needed?.map((role, index) => (
                <li key={index} className='flex items-center'>
                  <span className='w-2 h-2 bg-cyan-400 rounded-full mr-3'></span>
                  <span className='text-gray-300'>{role}</span>
                </li>
              ))}
            </ul>
            <button className='mt-4 text-emerald-400 hover:underline text-sm'>
              View all roles
            </button>
          </div>

          {/* GitHub Repo */}
          {project.githubUrl && (
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Repository
              </h2>
              <a
                href={project.githubUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center text-emerald-400 hover:underline'
              >
                <Github className='w-5 h-5 mr-2' />
                View on GitHub
              </a>
            </div>
          )}
        </div>
      </div>
      {/* Join Project Modal */}
      <JoinProjectModal
        projectName={project.title}
        rolesNeeded={availableRoles}
        show={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
      />
    </div>
  );
}
