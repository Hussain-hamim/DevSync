// app/rankings/page.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  Terminal,
  Trophy,
  TrendingUp,
  Github,
  Users,
  MessageSquare,
  Heart,
  ChevronDown,
  Calendar,
  Star,
  Zap,
  Activity,
  Circle,
  GitBranch,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animated components
const LivePulse = () => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className='flex items-center'
  >
    <Circle className='w-2 h-2 text-emerald-400 fill-emerald-400' />
    <span className='text-xs text-emerald-400 ml-1'>LIVE</span>
  </motion.div>
);

const ScoreChange = ({ value }) => (
  <motion.span
    key={value}
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 10, opacity: 0 }}
    transition={{ duration: 0.4 }}
    className='text-gray-100 font-bold'
  >
    {value}
  </motion.span>
);

export default function RankingsPage() {
  const [timeframe, setTimeframe] = useState('weekly');
  const [rankings, setRankings] = useState([
    // Initial data with isLive and animation states
    {
      id: 1,
      name: 'CodeMatch',
      score: 85,
      commits: 5,
      newMembers: 3,
      posts: 12,
      likes: 65,
      isLive: true,
      techStack: ['React', 'Node.js'],
      pulse: false,
    },
    {
      id: 2,
      name: 'CodeMatch',
      score: 85,
      commits: 5,
      newMembers: 3,
      posts: 12,
      likes: 65,
      isLive: true,
      techStack: ['React', 'Node.js'],
      pulse: false,
    },
    {
      id: 3,
      name: 'CodeMatch',
      score: 85,
      commits: 5,
      newMembers: 3,
      posts: 12,
      likes: 65,
      isLive: true,
      techStack: ['React', 'Node.js'],
      pulse: false,
    },
    {
      id: 4,
      name: 'CodeMatch',
      score: 85,
      commits: 5,
      newMembers: 3,
      posts: 12,
      likes: 65,
      isLive: true,
      techStack: ['React', 'Node.js'],
      pulse: false,
    },
    // ... other projects
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRankings((prev) =>
        prev.map((project) => ({
          ...project,
          score: project.score + (Math.random() > 0.5 ? 1 : 0),
          isLive: Math.random() > 0.7,
          pulse: Math.random() > 0.8,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen  bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      {/* Animated Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className='mb-8'
      >
        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-3'>
            <Terminal className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100 flex items-center gap-2'>
              Project Rankings
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Trophy className='w-5 h-5 text-amber-400' />
              </motion.div>
            </h1>
          </div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <button className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              <span>{timeframe === 'weekly' ? 'Weekly' : 'Monthly'}</span>
              <ChevronDown className='w-4 h-4' />
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Animated Leaderboard */}
      <div className='space-y-4 px-15'>
        <AnimatePresence>
          {rankings.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                borderColor: project.pulse
                  ? 'rgba(16, 185, 129, 0.5)'
                  : 'rgba(55, 65, 81, 0.5)',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className={`bg-gray-800/50 border rounded-xl p-4 relative overflow-hidden ${
                project.isLive ? 'border-emerald-400/30' : 'border-gray-700'
              }`}
            >
              {/* Live indicator ribbon */}
              {project.isLive && (
                <motion.div
                  initial={{ x: -40 }}
                  animate={{ x: 0 }}
                  className='absolute top-0 left-0 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-br-lg'
                >
                  <LivePulse />
                </motion.div>
              )}

              <div className='grid grid-cols-12 items-center gap-4'>
                {/* Rank */}
                <div className='col-span-1'>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0
                        ? 'bg-amber-900/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        : index === 1
                        ? 'bg-gray-700/50 text-gray-300'
                        : index === 2
                        ? 'bg-amber-800/50 text-amber-500'
                        : 'bg-gray-900/30 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </motion.div>
                </div>

                {/* Project Info */}
                <div className='col-span-5'>
                  <motion.div
                    className='flex items-center gap-3'
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      animate={{
                        rotate: project.isLive ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <GitBranch className='w-5 h-5 text-emerald-400' />
                    </motion.div>
                    <div>
                      <h3 className='font-medium text-gray-100'>
                        {project.name}
                      </h3>
                      <div className='flex gap-1 mt-1'>
                        {project.techStack.map((tech, i) => (
                          <motion.span
                            key={i}
                            whileHover={{ y: -2 }}
                            className='text-xs bg-gray-900/80 text-gray-400 px-2 py-0.5 rounded'
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Score */}
                <div className='col-span-3'>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='w-5 h-5 text-emerald-400' />
                    <AnimatePresence mode='wait'>
                      <ScoreChange value={project.score} />
                    </AnimatePresence>
                    <span className='text-xs text-gray-500'>pts</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className='col-span-3'>
                  <div className='grid grid-cols-4 gap-2 text-center'>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className='flex flex-col items-center'
                    >
                      <Github className='w-4 h-4 text-gray-400' />
                      <span className='text-xs'>{project.commits}</span>
                    </motion.div>
                    {/* Repeat for other metrics */}
                  </div>
                </div>
              </div>

              {/* Animated activity indicator */}
              {project.isLive && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className='absolute bottom-0 left-0 h-0.5 bg-emerald-400/50'
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating "Live Updates" indicator */}
      <motion.div
        animate={{
          y: [0, -5, 0],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className='fixed bottom-6 right-6 bg-gray-800 border border-emerald-400/30 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg'
      >
        <Activity className='w-4 h-4 text-emerald-400 animate-pulse' />
        <span className='text-sm text-gray-100'>Live Updates</span>
      </motion.div>
    </div>
  );
}
