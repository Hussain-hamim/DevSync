'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  ArrowLeft,
  Crown,
  Github,
  ClipboardList,
  FileText,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Activity,
  PieChart,
  Plus,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { JoinProjectModal } from '@/app/projects/[id]/JoinProjectModal';

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

interface TeamTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
}

interface TeamActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user_id: {
    name: string;
    avatar_url?: string;
  };
}

export default function TeamDetails() {
  const { data: session } = useSession();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 },
  };

  const buttonTap = {
    scale: 0.98,
    transition: { duration: 0.1 },
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          setCurrentUser(userData);
          setUserId(userData.id);
        }
      }
    };
    fetchCurrentUser();
  }, [session]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('title, creator_id, roles_needed')
        .eq('id', params.id)
        .single();

      if (projectError || !projectData)
        throw projectError || new Error('Team not found');

      setTeamName(projectData.title);

      // Prepare available roles
      const allRoles = projectData.roles_needed || [];
      if (userId) {
        const { data: takenRoles } = await supabase
          .from('project_roles')
          .select('title')
          .eq('project_id', params.id)
          .eq('filled_by', userId);

        const userTakenRoles = takenRoles?.map((r) => r.title) || [];
        setAvailableRoles(
          allRoles.filter((role) => !userTakenRoles.includes(role))
        );
      } else {
        setAvailableRoles(allRoles);
      }

      // Fetch team members
      const membersMap = new Map<string, TeamMember>();
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

      // Fetch project roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('project_roles')
        .select(
          'title, users(id, name, avatar_url, github_username, created_at)'
        )
        .eq('project_id', params.id)
        .not('filled_by', 'is', null);

      if (rolesError) throw rolesError;

      rolesData?.forEach((role: any) => {
        const user = role.users;
        if (user) {
          const existing = membersMap.get(user.id) || {
            ...user,
            roles: [],
            isOwner: user.id === projectData.creator_id,
          };
          membersMap.set(user.id, {
            ...existing,
            roles: [...existing.roles, role.title],
          });
        }
      });

      setTeamMembers(Array.from(membersMap.values()));

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date, assigned_to')
        .eq('project_id', params.id)
        .order('due_date', { ascending: true });

      if (tasksError) throw tasksError;
      setTeamTasks(tasksData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities2')
        .select(
          `
          id, 
          activity_type,
          activity_data,
          created_at, 
          user_id (
            name,
            avatar_url
          )
        `
        )
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      const formattedActivities =
        activitiesData?.map((activity) => ({
          ...activity,
          user: activity.user_id,
        })) || [];

      setTeamActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();

    const subscription = supabase
      .channel(`team:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${params.id}`,
        },
        fetchTeamData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [params.id, userId]);

  const getMemberWorkload = () => {
    return teamMembers.map((member) => ({
      id: member.id,
      name: member.name,
      taskCount: teamTasks.filter((t) => t.assigned_to === member.id).length,
    }));
  };

  const getUpcomingTasks = () => {
    return teamTasks
      .filter(
        (t) =>
          t.due_date &&
          ['In Progress', 'Not Started', 'Pending'].includes(t.status)
      )
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 3);
  };

  const renderActivityText = (activity: TeamActivity) => {
    const data = activity.activity_data || {};
    const user = activity.user_id || { name: 'Unknown User' };

    switch (activity.activity_type) {
      case 'task_created':
        return `${user.name} created task "${data.task_title || 'a task'}"`;
      case 'task_completed':
        return `${user.name} completed task "${data.task_title || 'a task'}"`;
      case 'task_started':
        return `${user.name} started working on "${
          data.task_title || 'a task'
        }"`;
      case 'role_assigned':
        return `${user.name} joined as ${data.role || 'a member'}`;
      case 'discussion_created':
        return `${user.name} started a discussion`;
      case 'project_updated':
        return `${user.name} updated project details`;
      case 'commit':
        return `${user.name} pushed new code to ${data.branch || 'main'}`;
      case 'comment':
        return `${user.name} commented on ${data.entity || 'the project'}`;
      default:
        return `${user.name} performed an action`;
    }
  };

  const isCurrentUserOwner = teamMembers.some(
    (m) => m.isOwner && m.id === userId
  );

  const isCurrentUserMember = teamMembers.some((m) => m.id === userId);

  const stats = {
    totalTasks: teamTasks.length,
    completedTasks: teamTasks.filter((t) => t.status === 'Completed').length,
    inProgressTasks: teamTasks.filter((t) => t.status === 'In Progress').length,
    overdueTasks: teamTasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== 'Completed'
    ).length,
  };

  const handleJoinSubmit = async (role: string, message: string) => {
    if (!userId) {
      alert('Please sign in to join the team');
      return;
    }

    try {
      const { error } = await supabase.from('project_roles').insert({
        project_id: params.id,
        title: role,
        filled_by: userId,
      });

      if (error) throw error;

      // Refresh team data
      await fetchTeamData();
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full'
          />
        </div>
      </div>
    );
  }

  if (!teamName) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='text-rose-400'>Team not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      <div className='container mx-auto px-6 py-8'>
        {/* Back button */}
        <motion.button
          onClick={() => window.history.back()}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.98 }}
          className='flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-8 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
          <span>Back</span>
        </motion.button>

        {/* Team Header */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerVariants}
          className='flex items-start justify-between mb-8'
        >
          <motion.div variants={itemVariants}>
            <div className='flex items-center space-x-3 mb-4'>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Users className='w-6 h-6 text-emerald-400' />
              </motion.div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
                {teamName} Team
              </h1>
            </div>
            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-400'>
              <div className='flex items-center space-x-1'>
                <Users className='w-4 h-4' />
                <span>{teamMembers.length} members</span>
              </div>
              <div className='flex items-center space-x-1'>
                <ClipboardList className='w-4 h-4' />
                <span>{stats.totalTasks} tasks</span>
              </div>
              <div className='flex items-center space-x-1'>
                <CheckCircle className='w-4 h-4' />
                <span>{stats.completedTasks} completed</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className='flex gap-2'>
            {!isCurrentUserMember && (
              <motion.button
                onClick={() => setShowJoinModal(true)}
                whileHover={buttonHover}
                whileTap={buttonTap}
                className='flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity'
              >
                <Plus className='w-4 h-4' />
                Join Team
              </motion.button>
            )}
            {isCurrentUserOwner && (
              <>
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className='flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm'
                >
                  <Plus className='w-4 h-4' />
                  Invite Member
                </motion.button>
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className='flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm'
                >
                  <Settings className='w-4 h-4' />
                  Settings
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerVariants}
          className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'
        >
          {/* Team Members */}
          <motion.div
            variants={itemVariants}
            className='lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700'
          >
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Users className='w-5 h-5 text-emerald-400' />
              Team Members
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {teamMembers.map((member) => (
                <Link
                  href={`/profile/${member.id}`}
                  key={member.id}
                  className='group'
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    className='bg-gray-700/30 border border-gray-700 rounded-lg p-4 group-hover:border-emerald-400/30 transition-all'
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      {member.avatar_url ? (
                        <motion.img
                          src={member.avatar_url}
                          alt={member.name}
                          className='w-10 h-10 rounded-full'
                          whileHover={{ scale: 1.05 }}
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300'
                        >
                          {member.name.charAt(0)}
                        </motion.div>
                      )}
                      <div>
                        <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
                          {member.name}
                        </h3>
                        {member.github_username && (
                          <p className='text-xs text-gray-400'>
                            @{member.github_username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {member.roles.map((role) => (
                        <motion.span
                          key={role}
                          whileHover={{ scale: 1.05 }}
                          className={`text-xs px-2 py-1 rounded-full ${
                            role === 'Owner'
                              ? 'bg-purple-900/50 text-purple-400'
                              : 'bg-cyan-900/50 text-cyan-400'
                          }`}
                        >
                          {role}
                        </motion.span>
                      ))}
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      {getMemberWorkload().find((m) => m.id === member.id)
                        ?.taskCount || 0}{' '}
                      tasks
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
          >
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Activity className='w-5 h-5 text-emerald-400' />
              Recent Activity
            </h2>
            <div className='space-y-4'>
              {teamActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  className='flex gap-3'
                  whileHover={{ x: 5 }}
                >
                  {activity.user_id?.avatar_url ? (
                    <motion.img
                      src={activity.user_id.avatar_url}
                      alt={activity.user_id.name}
                      className='w-8 h-8 rounded-full'
                      whileHover={{ scale: 1.1 }}
                    />
                  ) : (
                    <motion.div
                      className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300'
                      whileHover={{ scale: 1.1 }}
                    >
                      {activity.user_id?.name?.charAt(0) || 'U'}
                    </motion.div>
                  )}
                  <div>
                    <p className='text-sm text-gray-100'>
                      {renderActivityText(activity)}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {dayjs(activity.created_at).fromNow()}
                    </p>
                  </div>
                </motion.div>
              ))}
              {teamActivities.length === 0 && (
                <p className='text-gray-400 text-sm'>No recent activity</p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats and Overview */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerVariants}
          className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'
        >
          {/* Task Statistics */}
          <motion.div
            variants={itemVariants}
            className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
          >
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <ClipboardList className='w-5 h-5 text-emerald-400' />
              Task Overview
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <motion.div
                whileHover={{ y: -3 }}
                className='bg-gray-700/30 p-4 rounded-lg'
              >
                <div className='flex items-center gap-2 text-gray-400'>
                  <FileText className='w-4 h-4' />
                  <span className='text-sm'>Total</span>
                </div>
                <p className='text-2xl font-bold mt-2 text-gray-100'>
                  {stats.totalTasks}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className='bg-gray-700/30 p-4 rounded-lg'
              >
                <div className='flex items-center gap-2 text-gray-400'>
                  <CheckCircle className='w-4 h-4 text-green-400' />
                  <span className='text-sm'>Completed</span>
                </div>
                <p className='text-2xl font-bold mt-2 text-green-400'>
                  {stats.completedTasks}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className='bg-gray-700/30 p-4 rounded-lg'
              >
                <div className='flex items-center gap-2 text-gray-400'>
                  <Loader2 className='w-4 h-4 text-yellow-400 animate-spin' />
                  <span className='text-sm'>In Progress</span>
                </div>
                <p className='text-2xl font-bold mt-2 text-yellow-400'>
                  {stats.inProgressTasks}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3 }}
                className='bg-gray-700/30 p-4 rounded-lg'
              >
                <div className='flex items-center gap-2 text-gray-400'>
                  <AlertTriangle className='w-4 h-4 text-red-400' />
                  <span className='text-sm'>Overdue</span>
                </div>
                <p className='text-2xl font-bold mt-2 text-red-400'>
                  {stats.overdueTasks}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            variants={itemVariants}
            className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
          >
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-emerald-400' />
              Upcoming Deadlines
            </h2>
            <div className='space-y-3'>
              {getUpcomingTasks().map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ x: 5 }}
                  className='flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg'
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      new Date(task.due_date) < new Date()
                        ? 'bg-red-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-100'>{task.title}</h3>
                    <p className='text-sm text-gray-400'>
                      Due {dayjs(task.due_date).fromNow()}
                    </p>
                  </div>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {task.priority}
                  </motion.span>
                </motion.div>
              ))}
              {getUpcomingTasks().length === 0 && (
                <p className='text-gray-400 text-sm'>No upcoming deadlines</p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Workload Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8'
        >
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <PieChart className='w-5 h-5 text-emerald-400' />
            Workload Distribution
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {getMemberWorkload().map((member) => (
              <motion.div
                key={member.id}
                className='flex items-center gap-3'
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300'
                  whileHover={{ scale: 1.1 }}
                >
                  {member.name.charAt(0)}
                </motion.div>
                <div className='flex-1'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-100'>{member.name}</span>
                    <span className='text-gray-400'>
                      {member.taskCount} tasks
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (member.taskCount /
                            (Math.max(
                              ...getMemberWorkload().map((w) => w.taskCount)
                            ) +
                              1)) *
                            100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 0.8, type: 'spring' }}
                      className='bg-emerald-400 h-2 rounded-full'
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <JoinProjectModal
            projectName={teamName}
            rolesNeeded={availableRoles}
            show={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onSubmit={handleJoinSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
