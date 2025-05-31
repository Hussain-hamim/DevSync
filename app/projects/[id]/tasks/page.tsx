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

export default function ProjectTasksPage() {
  const params = useParams();
  const { data: session } = useSession();

  // — State for everything we need —
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);

  // 1) Define “status → priority” mapping
  const statusPriority: Record<string, number> = {
    'In Progress': 1,
    'In Review':   2,
    'Completed':   3,
  };

  // 2) Fetch project, tasks, and project members
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 2a) Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // 2b) Fetch all tasks for this project (no server-side ordering)
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

        if (tasksError) throw tasksError;

        // 2c) Client‐side sort by statusPriority then by created_at desc
        const sortedTasks = (tasksData || []).slice().sort((a, b) => {
          const pa = statusPriority[a.status] ?? Number.MAX_SAFE_INTEGER;
          const pb = statusPriority[b.status] ?? Number.MAX_SAFE_INTEGER;

          if (pa !== pb) {
            return pa - pb;
          }
          // If same status, newer created first:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        setTasks(sortedTasks);

        // 2d) Fetch project members (to pass into AddTaskModal, if needed)
        const { data: membersData, error: membersError } = await supabase
          .from('project_roles')
          .select(
            `
            users(id, name, avatar_url)
          `
          )
          .eq('project_id', params.id)
          .not('filled_by', 'is', null);

        if (membersError) throw membersError;

        // Flatten out the nested `users` field
        setProjectMembers(
          membersData?.map((m: any) => m.users).filter(Boolean) || []
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, showTaskModal]);

  // 3) If still loading, display a spinner placeholder
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <div className='container mx-auto px-6 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>Loading tasks...</div>
        </div>
      </div>
    );
  }

  // 4) Helper: render a status icon
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

  // 5) Helper: map priority → badge styling
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

  // 6) Render the page
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* — Header with “Back to Project” + “Add New Task” button — */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/projects/${params.id}`}
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Project
            </Link>

            {session && (
              <button
                onClick={() => setShowTaskModal(true)}
                className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center'
              >
                <Plus className='w-5 h-5 mr-1' />
                Add New Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* — Main Content — */}
      <div className='container mx-auto px-6 py-8'>
        {/* Project Title */}
        <div className='flex items-center space-x-3 mb-8'>
          <GitBranch className='w-6 h-6 text-emerald-400' />
          <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
            {project?.title} Tasks
          </h1>
        </div>

        {/* If no tasks, show a “no tasks” placeholder */}
        {tasks.length === 0 ? (
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center'>
            <p className='text-gray-400'>No tasks yet for this project</p>
            {session && (
              <button
                onClick={() => setShowTaskModal(true)}
                className='mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          /* Otherwise, map over sorted `tasks` */
          <div className='space-y-4'>
            {tasks.map((task: any) => (
              <Link
                href={`/projects/${params.id}/tasks/${task.id}`}
                key={task.id}
                className='block'
              >
                <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors'>
                  <div className='flex justify-between items-start'>
                    {/* Left: Status icon + Title */}
                    <div className='flex items-center gap-3'>
                      <div>{getStatusIcon(task.status)}</div>
                      <h3 className='text-gray-100 font-medium'>{task.title}</h3>
                    </div>

                    {/* Right: Priority Badge */}
                    <span
                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Optional: show truncated description */}
                  {task.description && (
                    <p className='text-gray-400 text-sm mt-2 ml-7'>
                      {task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                    </p>
                  )}

                  {/* Bottom row: Assignee + Due Date */}
                  <div className='mt-4 flex flex-wrap items-center gap-4 text-sm ml-7'>
                    {/* Assignee */}
                    <div className='flex items-center gap-2 text-gray-400'>
                      <div className='w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs'>
                        {task.assigned_to?.avatar_url ? (
                          <img
                            src={task.assigned_to.avatar_url}
                            alt={task.assigned_to.name}
                            className='w-full h-full rounded-full object-cover'
                          />
                        ) : (
                          task.assigned_to?.name?.charAt(0) || 'H'
                        )}
                      </div>
                      <span>{task.assigned_to?.name || 'Unassigned'}</span>
                    </div>

                    {/* Due Date */}
                    {task.due_date && (
                      <div className='flex items-center gap-2 text-gray-400'>
                        <span>
                          Due:{' '}
                          {new Date(task.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* — Add Task Modal — */}
      {showTaskModal && (
        <AddTaskModal
          projectName={project?.title}
          projectMembers={projectMembers}
          projectId={params.id}
          show={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={() => {
            /* When a new task is created, we rely on `showTaskModal` changing
               to re-trigger the useEffect above (because it’s in the dependency array).
               That will re-fetch & re-sort the tasks automatically. */
          }}
        />
      )}
    </div>
  );
}
