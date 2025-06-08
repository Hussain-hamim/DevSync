'use client';

import {
  ArrowLeft,
  Plus,
  Check,
  Clock,
  AlertCircle,
  GitBranch,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useSession } from 'next-auth/react';
import { AddTaskModal } from '../AddTaskModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectTasksPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchSupabaseUserId = async () => {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (error) {
          console.error('Error fetching Supabase user ID:', error);
        } else if (data) {
          setSupabaseUserId(data.id);
        }
      }
    };
    fetchSupabaseUserId();
  }, [session?.user?.email]);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      // ────── Fetch project details ──────
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*, creator_id')
        .eq('id', params.id)
        .single();

      if (projectError) {
        console.error('Failed to load project:', projectError);
        return;
      }
      if (!projectData) {
        console.error('No project found with id', params.id);
        return;
      }

      setProject(projectData);

      // ────── Check ownership ──────
      if (supabaseUserId && projectData.creator_id === supabaseUserId) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }

      // ────── Fetch tasks ──────
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(
          `
          *,
          assigned_to:assigned_to(id, name, avatar_url),
          created_by:created_by(id, name, avatar_url)
          `
        )
        .eq('project_id', params.id);

      if (tasksError) {
        console.error('Failed to load tasks:', tasksError);
      }

      const taskList: any[] = tasksData || [];
      const sortedTasks = taskList.slice().sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (b.status === 'Completed' && a.status !== 'Completed') return -1;
        if (a.status === 'Completed' && b.status === 'Completed') {
          return (
            new Date(b.completed_at || b.updated_at).getTime() -
            new Date(a.completed_at || a.updated_at).getTime()
          );
        }

        const pa = a.status === 'In Progress' ? 1 : 2;
        const pb = b.status === 'In Progress' ? 1 : 2;

        if (pa === pb) {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        return pa - pb;
      });
      setTasks(sortedTasks);

      // ────── Fetch project members ──────
      const { data: membersData, error: membersError } = await supabase
        .from('project_roles')
        .select(
          `
          users(id, name, avatar_url)
        `
        )
        .eq('project_id', params.id)
        .not('filled_by', 'is', null);

      if (membersError) {
        console.error('Failed to load project members:', membersError);
      }

      // Filter unique members
      const uniqueMembers =
        Array.from(
          new Map(
            membersData
              ?.map((m: any) => m.users)
              .filter(Boolean)
              .map((user: any) => [user.id, user])
          ).values()
        ) || [];

      setProjectMembers(uniqueMembers);
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (supabaseUserId || !session?.user?.email) {
      fetchData();
    }
  }, [params.id, session?.user?.email, supabaseUserId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <div className='container mx-auto px-6 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className='text-gray-400'
          >
            Loading tasks...
          </motion.div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Check className='w-4 h-4 text-green-500' />;
      case 'In Progress':
        return <AlertCircle className='w-4 h-4 text-amber-500' />;
      case 'Blocked':
        return <X className='w-4 h-4 text-red-500' />;
      default:
        return <Clock className='w-4 h-4 text-gray-500' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-900/50 text-red-300';
      case 'Medium':
        return 'bg-amber-900/50 text-amber-300';
      case 'Low':
        return 'bg-green-900/50 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Animation variants
  const taskItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/projects/${params.id}`}
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <motion.div
                whileHover={{ x: -4 }}
                transition={{ duration: 0.2 }}
                className='flex items-center'
              >
                <ArrowLeft className='w-5 h-5 mr-2' />
                Back to Project
              </motion.div>
            </Link>
            {isOwner && (
              <motion.button
                onClick={() => setShowTaskModal(true)}
                className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center'
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                <Plus className='w-5 h-5 mr-1' />
                Add New Task
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-3'>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <GitBranch className='w-6 h-6 text-emerald-400' />
            </motion.div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
              {project?.title || 'Untitled Project'} Tasks
            </h1>
          </div>
        </div>

        {/* Tasks List */}
        <div className='space-y-4'>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center'
            >
              <p className='text-gray-400'>No tasks yet for this project</p>
              {isOwner && (
                <motion.button
                  onClick={() => setShowTaskModal(true)}
                  className='mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  Create First Task
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={taskItemVariants}
                  initial='hidden'
                  animate='visible'
                  whileHover='hover'
                  layout
                >
                  <Link
                    href={`/projects/${params.id}/tasks/${task.id}`}
                    className={`block ${
                      task.status === 'Completed' ? 'opacity-80' : ''
                    }`}
                  >
                    <motion.div
                      className={`bg-gray-800/60 border rounded-xl p-6 transition-colors ${
                        task.status === 'Completed'
                          ? 'border-gray-700/50 hover:border-gray-700'
                          : 'border-gray-700 hover:border-emerald-500/30'
                      } shadow-lg hover:shadow-emerald-500/10`}
                      whileHover={{
                        borderColor:
                          task.status === 'Completed'
                            ? ''
                            : 'rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex items-center gap-3'>
                          <motion.div
                            className='flex-shrink-0'
                            whileHover={{ scale: 1.2 }}
                          >
                            {getStatusIcon(task.status)}
                          </motion.div>
                          <h3
                            className={`font-medium ${
                              task.status === 'Completed'
                                ? 'text-gray-400 line-through'
                                : 'text-gray-100'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        <motion.span
                          className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                            task.priority
                          )} ${
                            task.status === 'Completed' ? 'opacity-70' : ''
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {task.priority}
                        </motion.span>
                      </div>

                      {task.description && (
                        <p
                          className={`text-sm mt-2 ml-7 ${
                            task.status === 'Completed'
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {task.description.length > 100
                            ? `${task.description.substring(0, 100)}…`
                            : task.description}
                        </p>
                      )}

                      <div className='mt-4 flex flex-wrap items-center gap-4 text-sm ml-7'>
                        <div
                          className={`flex items-center gap-2 ${
                            task.status === 'Completed'
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          }`}
                        >
                          <motion.div
                            role='img'
                            aria-label={task.assigned_to?.name || 'Unassigned'}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              task.status === 'Completed'
                                ? 'bg-gray-700/50'
                                : 'bg-gray-700'
                            }`}
                            whileHover={{ scale: 1.1 }}
                          >
                            {task.assigned_to?.avatar_url ? (
                              <img
                                src={task.assigned_to.avatar_url}
                                alt={task.assigned_to.name}
                                className='w-full h-full rounded-full object-cover'
                              />
                            ) : (
                              task.assigned_to?.name?.charAt(0) || 'H'
                            )}
                          </motion.div>
                          <span>{task.assigned_to?.name ?? 'Unassigned'}</span>
                        </div>

                        {task.due_date && (
                          <div
                            className={`flex items-center gap-2 ${
                              task.status === 'Completed'
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}
                          >
                            <span>
                              Due:{' '}
                              {new Date(task.due_date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                              {task.status === 'Completed' && (
                                <motion.span
                                  className='ml-1 text-green-400'
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {task.status === 'Completed' && (
                        <div className='mt-2 flex items-center gap-1 text-xs text-green-400 ml-7'>
                          <Check className='w-3 h-3' />
                          <span>Completed</span>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <AddTaskModal
            projectName={project?.title || ''}
            projectMembers={projectMembers}
            projectId={params.id}
            show={showTaskModal}
            onClose={() => {
              setShowTaskModal(false);
              fetchData(); // Explicitly refresh data when modal closes
            }}
            onTaskCreated={() => {
              fetchData(); // Refresh data when a task is created
            }}
          />
        )}
      </AnimatePresence>

      {/* Refreshing indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed bottom-6 right-6 bg-gray-800/90 text-gray-200 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg border border-gray-700'
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className='w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full'
            />
            Updating tasks...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
