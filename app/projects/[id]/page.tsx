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
  Crown,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { joinProjectRole } from '@/app/actions/joinProject';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { JoinProjectModal } from './JoinProjectModal';
import Header from '@/components/Header';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import { AddTaskModal } from './AddTaskModal';

// Add these imports at the top
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(calendar);

export default function ProjectDetails() {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState({});
  const [userId, setUserId] = useState<string | null>(null);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [availableRoles, setAvailableRoles] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  // At the top of your component
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Define a schema for discussion form validation
  const discussionSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty'),
  });

  // Add these state variables to your component
  const [discussions, setDiscussions] = useState([]);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  // Add these state variables
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from('activities2')
        .select(
          `
          *,
          user:user_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch activities when project loads
  useEffect(() => {
    if (project?.id) {
      fetchActivities();
    }
  }, [project?.id]);

  // Helper function to format activity messages
  const formatActivity = (activity) => {
    const user = activity.user || { name: 'Unknown User' };
    const type = activity.activity_type;
    const data = activity.activity_data || {};

    switch (type) {
      case 'task_created':
        return `${user.name} created task "${data.task_title}"`;
      case 'task_completed':
        return `${user.name} completed task "${data.task_title}"`;
      case 'role_assigned':
        return `${user.name} joined as ${data.role}`;
      case 'discussion_created':
        return `${user.name} started a discussion`;
      case 'project_updated':
        return `${user.name} updated project details`;
      default:
        return `${user.name} performed an action`;
    }
  };

  // Helper function to get activity icon and color
  const getActivityStyle = (activity) => {
    const type = activity.activity_type;

    if (type === 'task_completed') {
      return {
        bg: 'bg-emerald-900/50',
        text: 'text-emerald-400',
        icon: <Sparkles className='w-4 h-4' />,
      };
    } else if (type === 'task_created') {
      return {
        bg: 'bg-blue-900/50',
        text: 'text-blue-400',
        icon: <span>{activity.user?.name?.charAt(0) || 'U'}</span>,
      };
    } else if (type === 'role_assigned') {
      return {
        bg: 'bg-purple-900/50',
        text: 'text-purple-400',
        icon: <span>{activity.user?.name?.charAt(0) || 'U'}</span>,
      };
    } else {
      return {
        bg: 'bg-gray-700',
        text: 'text-gray-300',
        icon: <span>{activity.user?.name?.charAt(0) || 'U'}</span>,
      };
    }
  };

  //////////////////////////////

  // Initialize the form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discussionSchema),
  });

  // Fetch discussions when project loads
  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoadingDiscussions(true);
      try {
        const { data, error } = await supabase
          .from('discussions')
          .select(
            `
          *,
          user:user_id (
            id,
            name,
            avatar_url
          )
        `
          )
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDiscussions(data || []);
      } catch (error) {
        console.error('Error fetching discussions:', error);
      } finally {
        setLoadingDiscussions(false);
      }
    };

    if (project?.id) {
      fetchDiscussions();
    }
  }, [project?.id]);

  // Handle new discussion submission
  const onSubmitDiscussion = async (formData) => {
    if (!userId || !project?.id) return;

    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert([
          {
            project_id: project.id,
            user_id: userId,
            content: formData.content,
          },
        ])
        .select();

      if (error) throw error;

      // Add the new discussion to the state
      setDiscussions((prev) => [
        {
          ...data[0],
          user: {
            id: userId,
            name: session?.user?.name,
            avatar_url: session?.user?.image,
          },
        },
        ...prev,
      ]);

      // Reset form and hide it
      reset();
      setShowDiscussionForm(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
           assigned_to:assigned_to(id, name, avatar_url),
            created_by:created_by(id, name, avatar_url)
        `
        )
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch tasks when project loads
  useEffect(() => {
    if (project?.id) {
      fetchTasks();
    }
  }, [project?.id]);

  // And update handleJoinSubmit to use it
  const handleJoinSubmit = async (role: string, message: string) => {
    console.log('Join request submitted:', { role, message });

    if (!project || !userId) {
      alert('Missing project or user info');
      return;
    }

    try {
      await joinProjectRole({
        filled_by: userId,
        project_id: project.id,
        title: role,
      });

      // Refresh members and available roles
      await fetchProjectMembers();
      setAvailableRoles((prev) => prev.filter((r) => r !== role));
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Failed to join project');
    }
  };

  const onAddTask = async () => {
    // refresh page to get new tasks
    fetchTasks();
    fetchActivities();
  };

  // Fetch project data and roles
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // 1. Get project data first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (projectError || !projectData) {
        console.error('Project not found:', projectError);
        setLoading(false);
        return;
      }

      setProject(projectData);
      const allRoles = projectData.roles_needed || [];

      // 2. If user is logged in, check their taken roles
      if (session?.user?.email) {
        // Get user ID first
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData?.id) {
          // Get roles this user already took
          const { data: takenRoles } = await supabase
            .from('project_roles')
            .select('title')
            .eq('project_id', params.id)
            .eq('filled_by', userData.id);

          // Filter out only roles THIS USER took
          const userTakenRoles = takenRoles?.map((r) => r.title) || [];
          setAvailableRoles(
            allRoles.filter((role) => !userTakenRoles.includes(role))
          );
        } else {
          // User not found in DB - show all roles
          setAvailableRoles(allRoles);
        }
      } else {
        // No user logged in - show all roles
        setAvailableRoles(allRoles);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [params.id, session]); // Re-run when project ID or session changes;

  // Add this function near your other utility functions
  const fetchProjectMembers = async () => {
    if (!params.id) return;

    // First get the project to access creator_id
    const { data: projectData } = await supabase
      .from('projects')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    // Then get all members including their roles
    const { data: rolesData, error } = await supabase
      .from('project_roles')
      .select(
        `
      title,
      users (
        id,
        name,
        avatar_url
      )
    `
      )
      .eq('project_id', params.id)
      .not('filled_by', 'is', null);

    if (!error) {
      const membersMap = new Map();

      // Add the creator first if they haven't taken a role yet
      if (projectData?.creator_id) {
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

      // Add other members with their roles
      rolesData.forEach((role) => {
        if (role.users) {
          if (!membersMap.has(role.users.id)) {
            membersMap.set(role.users.id, {
              ...role.users,
              roles: [role.title],
              isOwner: role.users.id === projectData?.creator_id,
            });
          } else {
            const existingMember = membersMap.get(role.users.id);
            membersMap.set(role.users.id, {
              ...existingMember,
              roles: [...existingMember.roles, role.title],
            });
          }
        }
      });

      setProjectMembers(Array.from(membersMap.values()));
    }
  };

  // Then update your useEffect to use this function
  useEffect(() => {
    fetchProjectMembers();
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>
            Loading project details data...
          </div>
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
                <span>
                  {project.roles_needed?.length - availableRoles.length + 1 ||
                    ''}{' '}
                  members
                </span>
              </div>

              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>Created {dayjs(project.created_at).fromNow()}</span>
              </div>

              <div className='flex items-center space-x-1'>
                <Eye className='w-4 h-4' />
                <span>{project.views || 100} views</span>
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
            <div className='overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50'>
              <pre className='text-gray-400 whitespace-pre-wrap font-sans p-2'>
                {project.description}
              </pre>
            </div>
          </div>

          {/* Activity Feed & Discussions */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='lg:col-span-2 space-y-8'>
              {/* /// */}
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
                  {loadingActivities ? (
                    [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className='flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0'
                      >
                        <div className='flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 animate-pulse mr-3'></div>
                        <div className='flex-grow'>
                          <div className='h-4 bg-gray-700 rounded w-3/4 animate-pulse'></div>
                          <div className='h-3 bg-gray-700 rounded w-1/2 mt-2 animate-pulse'></div>
                        </div>
                      </div>
                    ))
                  ) : activities.length > 0 ? (
                    activities.map((activity) => {
                      const style = getActivityStyle(activity);
                      return (
                        <div
                          key={activity.id}
                          className='flex items-start pb-4 border-b border-gray-700 last:border-0 last:pb-0'
                        >
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${style.bg} ${style.text}`}
                          >
                            {style.icon}
                          </div>
                          <div className='flex-grow'>
                            <p className='text-gray-300'>
                              {formatActivity(activity)}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {dayjs(activity.created_at).fromNow()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className='text-gray-500 text-sm'>No activity yet</p>
                  )}
                </div>
              </div>

              {/* Discussions Section */}
              <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-100'>
                    Discussions
                  </h2>
                  <button
                    onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                    className='text-emerald-400 hover:underline text-sm flex items-center'
                  >
                    <MessageSquare className='w-4 h-4 mr-1' />
                    {showDiscussionForm ? 'Cancel' : 'New Discussion'}
                  </button>
                </div>

                {/* New Discussion Form */}
                {showDiscussionForm && (
                  <form
                    onSubmit={handleSubmit(onSubmitDiscussion)}
                    className='mb-6'
                  >
                    <div className='mb-3'>
                      <textarea
                        {...register('content')}
                        rows={3}
                        className='w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500'
                        placeholder='Write your message here...'
                      />
                      {errors.content && (
                        <p className='mt-1 text-sm text-red-400'>
                          {errors.content.message}
                        </p>
                      )}
                    </div>
                    <div className='flex justify-end'>
                      <button
                        type='submit'
                        className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                      >
                        Post Message
                      </button>
                    </div>
                  </form>
                )}

                {/* Discussions List */}
                {loadingDiscussions ? (
                  <div className='space-y-4'>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className='p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse h-20'
                      />
                    ))}
                  </div>
                ) : discussions.length > 0 ? (
                  <div className='space-y-4'>
                    {discussions.map((discussion) => (
                      <div
                        key={discussion.id}
                        className='p-4 bg-gray-800/30 rounded-lg border border-gray-700'
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden'>
                              {discussion.user?.avatar_url ? (
                                <img
                                  src={discussion.user.avatar_url}
                                  alt={discussion.user.name}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <span className='text-gray-300'>
                                  {discussion.user?.name?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-baseline gap-2'>
                              <h3 className='text-gray-100 font-medium'>
                                {discussion.user?.name || 'Unknown User'}
                              </h3>
                              <span className='text-xs text-gray-500'>
                                {dayjs(discussion.created_at).fromNow()}
                              </span>
                            </div>
                            <p className='mt-1 text-gray-300 whitespace-pre-wrap'>
                              {discussion.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500 text-sm'>
                    No discussions yet. Start the conversation!
                  </p>
                )}
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

          {/* Team Members with Assigned Roles */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Project Members
              </h2>
              <button className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'>
                View Team
              </button>
            </div>

            {projectMembers.map((member) => (
              <li key={member.id} className='flex items-start gap-4 group'>
                <div className='relative flex-shrink-0'>
                  <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-medium'>
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      member.name?.charAt(0) || 'H'
                    )}
                  </div>
                  {member.isOwner && (
                    <div className='absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-0.5'>
                      <Crown className='w-3 h-3 text-white' />
                    </div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-baseline gap-2'>
                    <h3 className='text-gray-100 font-medium truncate'>
                      {member.name}
                    </h3>

                    <span className='text-xs text-gray-400'>
                      @{member.name.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  </div>

                  <div className='mt-1 flex flex-wrap gap-2'>
                    {member.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
            ))}
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

          {/* Project Tasks Card */}

          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Project Tasks
              </h2>
              <Link
                href={`/projects/${project.id}/tasks`}
                className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'
              >
                View All Tasks
              </Link>
            </div>

            {loadingTasks ? (
              <div className='space-y-4'>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className='p-4 bg-gray-800/30 rounded-lg border border-gray-700 animate-pulse h-16'
                  />
                ))}
              </div>
            ) : (
              // Your tasks list here

              <div className='space-y-4'>
                {tasks?.slice(0, 4).map((task) => (
                  <Link
                    href={`/projects/${project.id}/tasks/${task.id}`}
                    key={task.id}
                  >
                    <div className='p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors'>
                      <div className='flex justify-between items-start'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              task.status === 'Completed'
                                ? 'bg-green-500'
                                : task.status === 'In Progress'
                                ? 'bg-amber-500'
                                : task.status === 'In Review'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                            }`}
                          ></div>
                          <h3 className='text-gray-100 font-medium'>
                            {task.title}
                          </h3>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            task.priority === 'High'
                              ? 'bg-red-900/50 text-red-300'
                              : task.priority === 'Medium'
                              ? 'bg-amber-900/50 text-amber-300'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className='mt-3 flex flex-wrap items-center gap-4 text-sm'>
                        <div className='flex items-center gap-2 text-gray-400'>
                          <div className='w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-xs'>
                            {task.assigned_to?.name?.charAt(0) || 'H'}
                          </div>
                          <span>{task.assigned_to?.name || 'Unassigned'}</span>
                        </div>

                        {task.due_date && (
                          <div className='flex items-center gap-2 text-gray-400'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                            <span>
                              {new Date(task.due_date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

                {tasks?.length === 0 && (
                  <div className='text-center py-4 text-gray-400'>
                    No tasks created yet
                  </div>
                )}
              </div>
            )}

            {/* Add Task Button */}
            {projectMembers.some(
              (member) => member.isOwner && member.name === session?.user?.name
            ) && (
              <div className='flex items-center justify-between mt-4'>
                <span className='text-sm text-gray-400'>
                  You can add tasks to this project.
                </span>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className='text-emerald-400 hover:underline text-md inline-flex items-center'
                >
                  <Plus className='w-5 h-5 mr-1' />
                  Add Task
                </button>
              </div>
            )}
          </div>

          {/* GitHub Repo */}
          {project.github_url && (
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Repository
              </h2>
              <a
                href={project.github_url}
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

      <AddTaskModal
        projectName={project.title}
        projectMembers={projectMembers}
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={project.id}
        onTaskCreated={onAddTask}
      />
    </div>
  );
}
