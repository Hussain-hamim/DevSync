// app/rankings/page.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Github,
  ChevronDown,
  Calendar,
  Activity,
  Circle,
  GitCommit,
  GitPullRequest,
  Star,
  Users,
  Clock,
  Code,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define types
type User = {
  id: number;
  username: string;
  name: string;
  avatar: string;
  commits: number;
  repositories: number;
  stars: number;
  followers: number;
  pullRequests: number;
  activeHours: number;
  isLive: boolean;
  pulse: boolean;
  score: number;
};

type MetricType =
  | 'score'
  | 'commits'
  | 'repositories'
  | 'stars'
  | 'followers'
  | 'pullRequests'
  | 'activeHours';

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

const ScoreChange = ({ value }: { value: number }) => (
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

const MetricIcon = ({ metric }: { metric: MetricType }) => {
  const icons = {
    commits: <GitCommit className='w-4 h-4' />,
    repositories: <Code className='w-4 h-4' />,
    stars: <Star className='w-4 h-4' />,
    followers: <Users className='w-4 h-4' />,
    pullRequests: <GitPullRequest className='w-4 h-4' />,
    activeHours: <Clock className='w-4 h-4' />,
    score: <TrendingUp className='w-4 h-4' />,
  };
  return icons[metric] || <Activity className='w-4 h-4' />;
};

export default function RankingsPage() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [sortBy, setSortBy] = useState<MetricType>('score');
  const [rankings, setRankings] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock data - in a real app, you'd fetch this from GitHub API
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'octocat',
      name: 'The Octocat',
      avatar: 'https://avatars.githubusercontent.com/u/583231?v=4',
      commits: 1428,
      repositories: 42,
      stars: 1560,
      followers: 8923,
      pullRequests: 327,
      activeHours: 85,
      isLive: true,
      pulse: false,
      score: 0, // Will be calculated
    },
    {
      id: 2,
      username: 'torvalds',
      name: 'Linus Torvalds',
      avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      commits: 56892,
      repositories: 7,
      stars: 142000,
      followers: 185000,
      pullRequests: 124,
      activeHours: 62,
      isLive: false,
      pulse: false,
      score: 0, // Will be calculated
    },
    {
      id: 3,
      username: 'gaearon',
      name: 'Dan Abramov',
      avatar: 'https://avatars.githubusercontent.com/u/810438?v=4',
      commits: 3245,
      repositories: 128,
      stars: 98700,
      followers: 112000,
      pullRequests: 542,
      activeHours: 78,
      isLive: true,
      pulse: false,
      score: 0, // Will be calculated
    },
    {
      id: 4,
      username: 'yyx990803',
      name: 'Evan You',
      avatar: 'https://avatars.githubusercontent.com/u/499550?v=4',
      commits: 2876,
      repositories: 56,
      stars: 203000,
      followers: 98000,
      pullRequests: 321,
      activeHours: 92,
      isLive: true,
      pulse: false,
      score: 0, // Will be calculated
    },
  ];

  // Calculate score based on all metrics
  const calculateScore = (
    user: Omit<User, 'score' | 'isLive' | 'pulse'>
  ): number => {
    return (
      user.commits * 0.3 +
      user.repositories * 5 +
      user.stars * 0.1 +
      user.followers * 0.2 +
      user.pullRequests * 0.5 +
      user.activeHours * 2
    );
  };

  // Initialize data with scores
  useEffect(() => {
    const usersWithScores = mockUsers.map((user) => ({
      ...user,
      score: Math.round(calculateScore(user)),
    }));

    setRankings(usersWithScores);

    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sort rankings based on selected metric
  const sortedRankings = [...rankings].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    return b[sortBy] - a[sortBy];
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRankings((prev) =>
        prev.map((user) => {
          const randomChange = Math.floor(Math.random() * 5);
          const shouldUpdate = Math.random() > 0.7;

          const updatedUser = {
            ...user,
            commits: shouldUpdate ? user.commits + randomChange : user.commits,
            stars: shouldUpdate ? user.stars + randomChange : user.stars,
            followers: shouldUpdate
              ? user.followers + randomChange
              : user.followers,
            isLive: Math.random() > 0.7,
            pulse: Math.random() > 0.8,
          };

          return {
            ...updatedUser,
            score: Math.round(calculateScore(updatedUser)),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter dropdown component
  const FilterDropdown = () => (
    <motion.div className='relative' whileHover={{ scale: 1.02 }}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center gap-2'
      >
        <MetricIcon metric={sortBy} />
        <span>
          {sortBy === 'score'
            ? 'Overall Score'
            : sortBy === 'commits'
            ? 'Commits'
            : sortBy === 'repositories'
            ? 'Repositories'
            : sortBy === 'stars'
            ? 'Stars'
            : sortBy === 'followers'
            ? 'Followers'
            : sortBy === 'pullRequests'
            ? 'Pull Requests'
            : sortBy === 'activeHours'
            ? 'Active Hours'
            : 'Sort By'}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10'
            onClick={(e) => e.stopPropagation()}
          >
            {[
              'score',
              'commits',
              'repositories',
              'stars',
              'followers',
              'pullRequests',
              'activeHours',
            ].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSortBy(option as MetricType);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                  sortBy === option
                    ? 'bg-gray-700 text-emerald-400'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <MetricIcon metric={option as MetricType} />
                {option === 'score'
                  ? 'Overall Score'
                  : option === 'commits'
                  ? 'Commits'
                  : option === 'repositories'
                  ? 'Repositories'
                  : option === 'stars'
                  ? 'Stars'
                  : option === 'followers'
                  ? 'Followers'
                  : option === 'pullRequests'
                  ? 'Pull Requests'
                  : option === 'activeHours'
                  ? 'Active Hours'
                  : option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      {/* Animated Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className='mb-8'
      >
        <div className='flex justify-between items-center flex-wrap gap-4'>
          <div className='flex items-center space-x-3'>
            <Github className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100 flex items-center gap-2'>
              GitHub Leaderboard
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

          <div className='flex gap-3'>
            <motion.div whileHover={{ scale: 1.05 }}>
              <button
                onClick={() =>
                  setTimeframe(timeframe === 'weekly' ? 'monthly' : 'weekly')
                }
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center gap-2'
              >
                <Calendar className='w-4 h-4' />
                <span>{timeframe === 'weekly' ? 'Weekly' : 'Monthly'}</span>
                <ChevronDown className='w-4 h-4' />
              </button>
            </motion.div>

            <FilterDropdown />
          </div>
        </div>
      </motion.header>

      {/* Loading state */}
      {isLoading && (
        <div className='flex justify-center items-center h-64'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full'
          />
        </div>
      )}

      {/* Leaderboard */}
      {!isLoading && (
        <div className='space-y-4'>
          <AnimatePresence>
            {sortedRankings.map((user, index) => (
              <motion.article
                key={user.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  borderColor: user.pulse
                    ? 'rgba(16, 185, 129, 0.5)'
                    : 'rgba(55, 65, 81, 0.5)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                className={`bg-gray-800/50 border rounded-xl p-4 relative overflow-hidden ${
                  user.isLive ? 'border-emerald-400/30' : 'border-gray-700'
                }`}
              >
                {/* Live indicator ribbon */}
                {user.isLive && (
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

                  {/* User Info */}
                  <div className='col-span-4'>
                    <motion.div
                      className='flex items-center gap-3'
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='relative'
                      >
                        <img
                          src={user.avatar}
                          alt={`${user.name}'s avatar`}
                          className='w-10 h-10 rounded-full border-2 border-gray-700'
                          width={40}
                          height={40}
                        />
                        {user.isLive && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className='absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-gray-900'
                          />
                        )}
                      </motion.div>
                      <div>
                        <h2 className='font-medium text-gray-100'>
                          {user.name}
                        </h2>
                        <a
                          href={`https://github.com/${user.username}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-gray-400 hover:text-emerald-400'
                        >
                          @{user.username}
                        </a>
                      </div>
                    </motion.div>
                  </div>

                  {/* Score */}
                  <div className='col-span-2'>
                    <div className='flex items-center gap-2'>
                      <TrendingUp className='w-5 h-5 text-emerald-400' />
                      <AnimatePresence mode='wait'>
                        <ScoreChange value={user.score} />
                      </AnimatePresence>
                      <span className='text-xs text-gray-500'>pts</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className='col-span-5'>
                    <div className='grid grid-cols-6 gap-2 text-center'>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Commits'
                      >
                        <GitCommit className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>{user.commits}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Repositories'
                      >
                        <Code className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>
                          {user.repositories}
                        </span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Stars'
                      >
                        <Star className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>{user.stars}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Followers'
                      >
                        <Users className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>{user.followers}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Pull Requests'
                      >
                        <GitPullRequest className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>
                          {user.pullRequests}
                        </span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className='flex flex-col items-center'
                        title='Active Hours'
                      >
                        <Clock className='w-4 h-4 text-gray-400' />
                        <span className='text-xs mt-1'>{user.activeHours}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Animated activity indicator */}
                {user.isLive && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className='absolute bottom-0 left-0 h-0.5 bg-emerald-400/50'
                  />
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating "Live Updates" indicator */}
      <motion.aside
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
      </motion.aside>
    </div>
  );
}
