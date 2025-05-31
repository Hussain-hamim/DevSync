// app/projects/[id]/tasks/[taskId]/page.tsx
'use client';
import {
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MessageSquare,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
}

interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  activity_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  created_at: string;
  due_date: string | null;
  created_by: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  comments: Comment[];
  activities: Activity[];
}

export default function TaskDetailsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusButtons, setShowStatusButtons] = useState(false);

  const isUserOwnerOrAssignee = async () => {
    if (!session?.user?.email) return false;

    // Get current user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) return false;

    // Check if user is owner or assignee
    return (
      task?.created_by.id === userData.id ||
      task?.assigned_to?.id === userData.id
    );
  };

  // Add this useEffect to check permissions when task or session changes
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await isUserOwnerOrAssignee();
      setShowStatusButtons(hasPermission);
    };

    if (task && session) {
      checkPermissions();
    } else {
      setShowStatusButtons(false);
    }
  }, [task, isUserOwnerOrAssignee]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task || !session?.user?.email) return;

    try {
      // Get current user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', session.user.email)
        .single();

      if (userError || !userData) {
        throw userError || new Error('User not found');
      }

      // Update task status in database
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Log activity in task_activities table
      const { error: taskActivityError } = await supabase
        .from('task_activities')
        .insert({
          task_id: task.id,
          user_id: userData.id,
          activity_type: 'status_changed',
          old_value: task.status,
          new_value: newStatus,
        });

      if (taskActivityError) throw taskActivityError;

      // Log activity in team activities table (activities2)
      const { error: teamActivityError } = await supabase
        .from('activities2')
        .insert({
          project_id: params.id,
          user_id: userData.id,
          activity_type:
            newStatus === 'Completed' ? 'task_completed' : 'task_started',
          activity_data: {
            task_id: task.id,
            task_title: task.title,
            old_status: task.status,
            new_status: newStatus,
          },
        });

      if (teamActivityError) throw teamActivityError;

      // Update local state
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              activities: [
                {
                  id: Date.now().toString(),
                  user: {
                    id: userData.id,
                    name: userData.name,
                    avatar_url: null,
                  },
                  activity_type: 'status_changed',
                  old_value: task.status,
                  new_value: newStatus,
                  created_at: new Date().toISOString(),
                },
                ...prev.activities,
              ],
            }
          : null
      );

      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error changing task status:', error);
      toast.error('Failed to update task status');
    }
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true);
      try {
        // Fetch task with assigned user and creator info
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select(
            `
            *,
            assigned_to:assigned_to(id, name, avatar_url),
            created_by:created_by(id, name, avatar_url)
          `
          )
          .eq('id', params.taskId)
          .single();

        if (taskError) throw taskError;

        // Fetch comments with user info
        const { data: comments, error: commentsError } = await supabase
          .from('task_comments')
          .select(
            `
            *,
            user:users(id, name, avatar_url)
          `
          )
          .eq('task_id', params.taskId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        // Fetch activity log with user info
        const { data: activities, error: activitiesError } = await supabase
          .from('task_activities')
          .select(
            `
            *,
            user:users(id, name, avatar_url)
          `
          )
          .eq('task_id', params.taskId)
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;

        setTask({
          ...taskData,
          comments: comments || [],
          activities: activities || [],
        });
      } catch (error) {
        console.error('Error fetching task details:', error);
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [params.taskId]);

  const handleAddComment = async () => {
    if (newComment.trim() === '' || !session?.user || !task) return;

    setIsSubmitting(true);
    try {
      // Get current user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('email', session.user.email)
        .single();

      // if (userError || !userData)
      //   throw userError || new Error('User not found');

      // Insert comment into database
      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: task.id,
          user_id: userData?.id,
          content: newComment,
        })
        .select(
          `
          *,
          user:users(id, name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('task_activities').insert({
        task_id: task.id,
        user_id: userData?.id,
        activity_type: 'commented',
        new_value:
          newComment.substring(0, 50) + (newComment.length > 50 ? '...' : ''),
      });

      // Update local state
      setTask((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, comment],
            }
          : null
      );

      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error.message);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Check className='w-4 h-4 text-green-500' />;
      case 'In Progress':
        return <AlertCircle className='w-4 h-4 text-amber-500' />;
      case 'Blocked':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
        <div className='container mx-auto px-6 py-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-10 w-1/3 bg-gray-700 rounded'></div>
            <div className='space-y-4'>
              <div className='h-6 w-1/4 bg-gray-700 rounded'></div>
              <div className='h-4 bg-gray-700 rounded'></div>
              <div className='h-4 w-3/4 bg-gray-700 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
        <div className='container mx-auto px-6 py-8 text-center'>
          <p className='text-gray-400'>Task not found</p>
          <Link
            href={`/projects/${params.id}/tasks`}
            className='text-emerald-400 hover:underline mt-2 inline-block'
          >
            Back to tasks
          </Link>
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
              href={`/projects/${params.id}/tasks`}
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Tasks
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Task Details */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6 mb-6'>
              <div className='flex justify-between items-start mb-4'>
                <h1 className='text-2xl font-bold text-gray-100'>
                  {task.title}
                </h1>
                <div className='flex gap-2'>
                  <button className='text-gray-400 hover:text-emerald-400 p-1'>
                    <Edit className='w-5 h-5' />
                  </button>
                  <button className='text-gray-400 hover:text-red-400 p-1'>
                    <Trash2 className='w-5 h-5' />
                  </button>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Completed'
                        ? 'bg-green-900/50 text-green-300'
                        : task.status === 'In Progress'
                        ? 'bg-amber-900/50 text-amber-300'
                        : task.status === 'In Review'
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className='flex items-center gap-1'>
                      {getStatusIcon(task.status)}
                      {task.status}
                    </div>
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Priority:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Assignee:</span>
                  <div className='flex items-center gap-2 text-gray-300'>
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
                </div>

                {task.due_date && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-400'>Due:</span>
                    <span className='text-gray-300 text-sm'>
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-100 mb-2'>
                  Description
                </h2>
                <p className='text-gray-400 whitespace-pre-line'>
                  {task.description}
                </p>
              </div>

              {/* Task Actions */}

              {showStatusButtons && (
                <div className='flex flex-wrap gap-2'>
                  {task.status !== 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className='px-4 py-2 bg-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors'
                    >
                      Start Task
                    </button>
                  )}
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleStatusChange('Completed')}
                      className='px-4 py-2 bg-green-600/30 text-green-400 rounded-lg hover:bg-green-600/40 transition-colors'
                    >
                      Complete Task
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4 flex items-center'>
                <MessageSquare className='w-5 h-5 mr-2 text-emerald-400' />
                Comments
              </h2>

              <div className='space-y-4 mb-6'>
                {task.comments.length === 0 ? (
                  <p className='text-gray-500 text-sm'>No comments yet</p>
                ) : (
                  task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className='border-b border-gray-700 pb-4 last:border-0'
                    >
                      <div className='flex items-start gap-3 mb-2'>
                        <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                          {comment.user.avatar_url ? (
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.name}
                              className='w-full h-full rounded-full object-cover'
                            />
                          ) : (
                            comment.user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-gray-100'>
                              {comment.user.name}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {new Date(comment.created_at).toLocaleString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                          <p className='text-gray-300 mt-1'>
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {session && (
                <div className='mt-4'>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder='Add a comment...'
                    className='w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500'
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmitting}
                    className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/40'
                    }`}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Task Activity */}
          <div className='space-y-6'>
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Task Activity
              </h2>
              <div className='space-y-4'>
                {task.activities.length === 0 ? (
                  <p className='text-gray-500 text-sm'>No activity yet</p>
                ) : (
                  task.activities.map((activity) => (
                    <div key={activity.id} className='flex items-start gap-3'>
                      <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                        {activity.user.avatar_url ? (
                          <img
                            src={activity.user.avatar_url}
                            alt={activity.user.name}
                            className='w-full h-full rounded-full object-cover'
                          />
                        ) : (
                          <User className='w-4 h-4' />
                        )}
                      </div>
                      <div>
                        <p className='text-gray-300'>
                          <span className='font-medium'>
                            {activity.user.name}
                          </span>{' '}
                          {getActivityMessage(activity)}
                        </p>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(activity.created_at).toLocaleString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Task Details
              </h2>
              <div className='space-y-3'>
                <div>
                  <span className='text-sm text-gray-400'>Created:</span>
                  <p className='text-gray-300'>
                    {new Date(task.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-400'>Created By:</span>
                  <div className='flex items-center gap-2 mt-1'>
                    <div className='w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs'>
                      {task.created_by.avatar_url ? (
                        <img
                          src={task.created_by.avatar_url}
                          alt={task.created_by.name}
                          className='w-full h-full rounded-full object-cover'
                        />
                      ) : (
                        task.created_by.name.charAt(0)
                      )}
                    </div>
                    <span className='text-gray-300'>
                      {task.created_by.name}
                    </span>
                  </div>
                </div>
                <div>
                  <span className='text-sm text-gray-400'>Task ID:</span>
                  <p className='text-gray-300'>{task.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate activity messages
function getActivityMessage(activity: Activity): string {
  switch (activity.activity_type) {
    case 'created':
      return 'created this task';
    case 'status_changed':
      return `changed status from ${activity.old_value} to ${activity.new_value}`;
    case 'assigned':
      return activity.new_value
        ? `assigned this task to ${activity.new_value}`
        : 'unassigned this task';
    case 'commented':
      return 'commented on this task';
    case 'due_date_changed':
      return `changed due date from ${activity.old_value} to ${activity.new_value}`;
    default:
      return 'performed an action on this task';
  }
}
