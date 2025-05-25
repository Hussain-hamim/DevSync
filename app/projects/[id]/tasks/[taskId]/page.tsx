// app/projects/[id]/tasks/[taskId]/page.jsx
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
import { useState } from 'react';

export default function TaskDetailsPage() {
  const params = useParams();
  const [task, setTask] = useState({
    id: params.taskId,
    title: 'Implement user authentication',
    description:
      'Set up JWT authentication with refresh tokens. Implement login, logout, and token refresh endpoints. Secure all API routes with proper authorization checks.',
    status: 'In Progress',
    priority: 'High',
    assignee: { id: 1, name: 'Alex Johnson', avatar_url: '' },
    created_at: '2023-05-10T14:30:00',
    due_date: '2023-06-15T23:59:59',
    // In a real app, you'd fetch this from your database
    comments: [
      {
        id: 1,
        user: { id: 1, name: 'Alex Johnson', avatar_url: '' },
        content:
          "I've started working on the login endpoint. Should have it ready for review by tomorrow.",
        created_at: '2023-05-12T09:15:00',
      },
      {
        id: 2,
        user: { id: 2, name: 'Sam Wilson', avatar_url: '' },
        content:
          'Make sure to include rate limiting on the authentication endpoints.',
        created_at: '2023-05-12T11:30:00',
      },
    ],
  });

  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() === '') return;

    // In a real app, you would submit this to your backend
    const comment = {
      id: task.comments.length + 1,
      user: { id: 3, name: 'You', avatar_url: '' },
      content: newComment,
      created_at: new Date().toISOString(),
    };

    setTask((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
    setNewComment('');
  };

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
                    {task.status}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Priority:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-400'>Assignee:</span>
                  <div className='flex items-center gap-2 text-gray-300'>
                    <div className='w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs'>
                      {task.assignee?.name?.charAt(0) || 'A'}
                    </div>
                    <span>{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>

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
              <div className='flex flex-wrap gap-2'>
                <button className='px-4 py-2 bg-emerald-600/30 text-emerald-400 rounded-lg hover:bg-emerald-600/40 transition-colors'>
                  Start Task
                </button>
                <button className='px-4 py-2 bg-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors'>
                  Mark for Review
                </button>
                <button className='px-4 py-2 bg-green-600/30 text-green-400 rounded-lg hover:bg-green-600/40 transition-colors'>
                  Complete Task
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4 flex items-center'>
                <MessageSquare className='w-5 h-5 mr-2 text-emerald-400' />
                Comments
              </h2>

              <div className='space-y-4 mb-6'>
                {task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className='border-b border-gray-700 pb-4 last:border-0'
                  >
                    <div className='flex items-start gap-3 mb-2'>
                      <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                        {comment.user.name.charAt(0)}
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
                        <p className='text-gray-300 mt-1'>{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
                  className='mt-2 bg-emerald-600/30 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-600/40 transition-colors'
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Task Activity */}
          <div className='space-y-6'>
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Task Activity
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                    <User className='w-4 h-4' />
                  </div>
                  <div>
                    <p className='text-gray-300'>
                      <span className='font-medium'>Alex Johnson</span> created
                      this task
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {new Date(task.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                    <User className='w-4 h-4' />
                  </div>
                  <div>
                    <p className='text-gray-300'>
                      <span className='font-medium'>Alex Johnson</span> started
                      working on this task
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>2 days ago</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm mt-1'>
                    <User className='w-4 h-4' />
                  </div>
                  <div>
                    <p className='text-gray-300'>
                      <span className='font-medium'>Sam Wilson</span> commented
                      on this task
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>1 day ago</p>
                  </div>
                </div>
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
                  <span className='text-sm text-gray-400'>Last Updated:</span>
                  <p className='text-gray-300'>2 hours ago</p>
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
