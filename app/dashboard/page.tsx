'use client';
import { useSession } from 'next-auth/react';
import {
  Terminal,
  Github,
  GitBranch,
  Code2,
  BarChart2,
  Settings,
  Bell,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className='min-h-screen bg-gray-900 text-gray-100 flex'>
      {/* Sidebar */}
      <div className='w-64 bg-gray-800 border-r border-gray-700 p-4 hidden md:block'>
        <div className='flex items-center space-x-2 mb-8'>
          <Terminal className='w-6 h-6 text-emerald-400' />
          <span className='text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
            DevSync
          </span>
        </div>

        <nav className='space-y-1'>
          {[
            {
              name: 'Dashboard',
              icon: <BarChart2 className='w-5 h-5' />,
              current: true,
            },
            { name: 'My Projects', icon: <Code2 className='w-5 h-5' /> },
            { name: 'Connections', icon: <GitBranch className='w-5 h-5' /> },
            { name: 'GitHub Repos', icon: <Github className='w-5 h-5' /> },
            { name: 'Notifications', icon: <Bell className='w-5 h-5' /> },
            { name: 'Settings', icon: <Settings className='w-5 h-5' /> },
          ].map((item) => (
            <a
              key={item.name}
              href='#'
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                item.current
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Navigation */}
        <header className='bg-gray-800 border-b border-gray-700 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center md:hidden'>
              <Terminal className='w-6 h-6 text-emerald-400' />
            </div>

            <div className='flex-1 max-w-md mx-4'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search className='h-4 w-4 text-gray-400' />
                </div>
                <input
                  type='text'
                  className='block w-full pl-10 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm'
                  placeholder='Search projects, teams...'
                />
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='p-1 rounded-full text-gray-400 hover:text-gray-200'>
                <Bell className='h-5 w-5' />
              </button>
              <div className='flex items-center'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-gray-900'>
                  {session?.user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className='flex-1 overflow-y-auto p-6 bg-gray-900'>
          <div className='max-w-7xl mx-auto'>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-8'
            >
              <h1 className='text-2xl font-bold mb-2'>
                Welcome back, {session?.user?.name}
              </h1>
              <p className='text-gray-400'>
                Here's what's happening with your projects today
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              {[
                {
                  title: 'Active Projects',
                  value: '4',
                  change: '+2 from last month',
                },
                {
                  title: 'Team Members',
                  value: '12',
                  change: '+3 from last month',
                },
                {
                  title: 'PRs This Week',
                  value: '8',
                  change: '+5 from last week',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-emerald-400/30 transition-colors'
                >
                  <h3 className='text-sm font-medium text-gray-400 mb-1'>
                    {stat.title}
                  </h3>
                  <p className='text-2xl font-bold mb-2'>{stat.value}</p>
                  <p className='text-xs text-emerald-400'>{stat.change}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className='bg-gray-800 rounded-lg border border-gray-700 overflow-hidden'
            >
              <div className='px-6 py-4 border-b border-gray-700'>
                <h2 className='text-lg font-semibold'>Recent Activity</h2>
              </div>
              <div className='divide-y divide-gray-700'>
                {[
                  {
                    project: 'OpenAI API Wrapper',
                    action: 'Merged PR #42',
                    time: '2 hours ago',
                    user: 'Alex Chen',
                  },
                  {
                    project: 'Rust CLI Tool',
                    action: 'Commented on issue #15',
                    time: '5 hours ago',
                    user: 'Sam Wilson',
                  },
                  {
                    project: '3D Web Game',
                    action: 'Pushed 3 new commits',
                    time: 'Yesterday',
                    user: 'Jordan Lee',
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className='p-6 hover:bg-gray-700/50 transition-colors'
                  >
                    <div className='flex items-start'>
                      <div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold mr-3'>
                        {activity.user.charAt(0)}
                      </div>
                      <div>
                        <p className='font-medium'>
                          <span className='text-emerald-400'>
                            {activity.user}
                          </span>{' '}
                          {activity.action}
                        </p>
                        <p className='text-sm text-gray-400'>
                          {activity.project} • {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
