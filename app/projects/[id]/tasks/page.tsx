// app/projects/[id]/tasks/page.jsx
'use client';
import {
  ArrowLeft,
  Plus,
  Check,
  Clock,
  AlertCircle,
  GitBranch,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Header from '@/components/Header';

export default function ProjectTasksPage() {
  const params = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        // Fetch project details
        const { data: projectData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        setProject(projectData);

        // Fetch tasks (in a real app, you'd query your tasks table)
        // This is mock data - replace with your actual Supabase query
        const mockTasks = [
          {
            id: 1,
            title: 'Implement user authentication',
            description: 'Set up JWT authentication with refresh tokens',
            status: 'In Progress',
            priority: 'High',
            assignee: { id: 1, name: 'Alex Johnson', avatar_url: '' },
            due_date: '2023-06-15',
            created_at: '2023-05-10',
          },
          {
            id: 2,
            title: 'Design dashboard UI',
            description: 'Create Figma mockups for the main dashboard',
            status: 'Completed',
            priority: 'Medium',
            assignee: { id: 2, name: 'Sam Wilson', avatar_url: '' },
            due_date: '2023-05-28',
            created_at: '2023-05-05',
          },
          {
            id: 3,
            title: 'Database schema design',
            description: 'Design PostgreSQL schema for core features',
            status: 'Not Started',
            priority: 'High',
            assignee: { id: 3, name: 'Jordan Chen', avatar_url: '' },
            due_date: '2023-06-01',
            created_at: '2023-05-15',
          },
          {
            id: 4,
            title: 'API documentation',
            description: 'Write Swagger docs for all endpoints',
            status: 'In Review',
            priority: 'Low',
            assignee: { id: 4, name: 'Taylor Smith', avatar_url: '' },
            due_date: '2023-06-10',
            created_at: '2023-05-12',
          },
        ];

        setTasks(mockTasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [params.id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>Loading tasks...</div>
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
              href={`/projects/${params.id}`}
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Project
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-3'>
            <GitBranch className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
              {project.title} Tasks
            </h1>
          </div>
          <Link
            href={`/projects/${params.id}/tasks/new`}
            className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center'
          >
            <Plus className='w-5 h-5 mr-1' />
            New Task
          </Link>
        </div>

        {/* Tasks Filters */}
        <div className='mb-6 flex flex-wrap items-center gap-4'>
          <button className='px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors'>
            All Tasks
          </button>
          <button className='px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors'>
            In Progress
          </button>
          <button className='px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors'>
            Completed
          </button>
          <button className='px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors'>
            High Priority
          </button>
        </div>

        {/* Tasks List */}
        <div className='grid gap-4'>
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/projects/${params.id}/tasks/${task.id}`}
              className='block'
            >
              <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors'>
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='flex items-center gap-3 mb-2'>
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
                      <h2 className='text-lg font-semibold text-gray-100'>
                        {task.title}
                      </h2>
                    </div>
                    <p className='text-gray-400 text-sm ml-6'>
                      {task.description}
                    </p>
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

                <div className='mt-4 flex flex-wrap items-center gap-4 text-sm'>
                  <div className='flex items-center gap-2 text-gray-400'>
                    <div className='w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs'>
                      {task.assignee?.name?.charAt(0) || 'A'}
                    </div>
                    <span>{task.assignee?.name || 'Unassigned'}</span>
                  </div>

                  <div className='flex items-center gap-2 text-gray-400'>
                    {task.status === 'Completed' ? (
                      <Check className='w-4 h-4 text-green-500' />
                    ) : task.status === 'In Progress' ? (
                      <Clock className='w-4 h-4 text-amber-500' />
                    ) : task.status === 'In Review' ? (
                      <AlertCircle className='w-4 h-4 text-blue-500' />
                    ) : (
                      <Clock className='w-4 h-4 text-gray-500' />
                    )}
                    <span className='capitalize'>{task.status}</span>
                  </div>

                  <div className='flex items-center gap-2 text-gray-400'>
                    <span>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
