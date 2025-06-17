// app/rankings/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
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
  Code,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types
type User = {
  id: string;
  github_id: string;
  github_token: string;
  name: string;
  email: string;
  avatar_url?: string;
  github_username?: string;
  commits?: number;
  repositories?: number;
  stars?: number;
  followers?: number;
  pull_requests?: number;
  isLive?: boolean;
  pulse?: boolean;
  score?: number;
  last_updated?: string;
};

type MetricType =
  | 'score'
  | 'commits'
  | 'repositories'
  | 'stars'
  | 'followers'
  | 'pull_requests';

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
    <span className='text-xs text-emerald-950 ml-1'>Online</span>
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
    pull_requests: <GitPullRequest className='w-4 h-4' />,
    score: <TrendingUp className='w-4 h-4' />,
  };
  return icons[metric] || <Activity className='w-4 h-4' />;
};

// Enhanced GitHub data fetcher using user's own token
async function fetchGitHubData(user: User): Promise<Partial<User>> {
  try {
    if (!user.github_token) {
      throw new Error('No GitHub token available for this user');
    }

    const headers = {
      Authorization: `Bearer ${user.github_token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Get authenticated user details
    const userResponse = await fetch('https://api.github.com/user', {
      headers,
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        throw new Error('GitHub token is invalid or expired');
      }
      const errorData = await userResponse.json();
      throw new Error(
        `GitHub API error: ${errorData.message || 'Unknown error'}`
      );
    }

    const userData = await userResponse.json();
    const username = userData.login;
    if (!username) throw new Error('GitHub username not found');

    // Get avatar URL if not already set
    const avatar_url =
      userData.avatar_url || `https://github.com/${username}.png`;

    // Get repositories (only need basic info for count and stars)
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?per_page=100&affiliation=owner`,
      { headers }
    );

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const reposData = await reposResponse.json();

    // Calculate stars from repositories
    const stars = reposData.reduce(
      (acc: number, repo: any) => acc + (repo.stargazers_count || 0),
      0
    );

    // Get commit count (approximate using the API)
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events?per_page=100`,
      { headers }
    );

    let commits = 0;
    let pullRequests = 0;

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      commits = eventsData.filter((e: any) => e.type === 'PushEvent').length;
      pullRequests = eventsData.filter(
        (e: any) =>
          e.type === 'PullRequestEvent' && e.payload.action === 'opened'
      ).length;
    }

    return {
      github_username: username,
      avatar_url,
      commits,
      repositories: reposData.length || 0,
      stars,
      followers: userData.followers || 0,
      pull_requests: pullRequests,
      isLive: Math.random() > 0.7,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Error fetching GitHub data for user ${user.github_id}:`,
      error
    );
    return {
      github_username: `user_${user.github_id}`,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=random`,
      commits: 0,
      repositories: 0,
      stars: 0,
      followers: 0,
      pull_requests: 0,
      isLive: false,
      last_updated: new Date().toISOString(),
    };
  }
}

// Improved score calculation
const calculateScore = (user: User): number => {
  return Math.round(
    (user.commits || 0) * 0.5 +
      (user.repositories || 0) * 3 +
      (user.stars || 0) * 0.2 +
      (user.followers || 0) * 0.3 +
      (user.pull_requests || 0) * 0.7
  );
};

export default function RankingsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [sortBy, setSortBy] = useState<MetricType>('score');
  const [rankings, setRankings] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users from Supabase and enrich with GitHub data
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch users from Supabase with github_token
      const { data: supabaseUsers, error: supabaseError } = await supabase
        .from('users')
        .select('id, github_id, github_token, name, email')
        .not('github_token', 'is', null)
        .limit(20);

      if (supabaseError) throw supabaseError;
      if (!supabaseUsers || supabaseUsers.length === 0) {
        setRankings([]);
        setIsLoading(false);
        return;
      }

      // Process users with their own GitHub tokens
      const enrichedUsers = await Promise.all(
        supabaseUsers.map(async (user) => {
          try {
            const githubData = await fetchGitHubData(user);
            return {
              ...user,
              ...githubData,
              score: calculateScore({ ...user, ...githubData }),
            };
          } catch (userError) {
            console.error(`Error processing user ${user.id}:`, userError);
            return {
              ...user,
              github_username: `user_${user.github_id}`,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`,
              commits: 0,
              repositories: 0,
              stars: 0,
              followers: 0,
              pull_requests: 0,
              score: 0,
            };
          }
        })
      );

      setRankings(enrichedUsers);
    } catch (mainError) {
      console.error('Failed to fetch users:', mainError);
      setError('Failed to load user data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up refresh interval (10 minutes to avoid rate limiting)
    const refreshInterval = setInterval(() => {
      fetchUsers();
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Set up live updates interval
  useEffect(() => {
    const interval = setInterval(() => {
      setRankings((prev) =>
        prev.map((user) => {
          // Only update some users randomly (30% chance)
          if (Math.random() > 0.3) return user;

          const randomChange = Math.floor(Math.random() * 3);
          const updatedUser = {
            ...user,
            commits: user.commits ? user.commits + randomChange : randomChange,
            stars: user.stars ? user.stars + (randomChange > 1 ? 1 : 0) : 0,
            followers: user.followers
              ? user.followers + (randomChange > 2 ? 1 : 0)
              : 0,
            pull_requests: user.pull_requests
              ? user.pull_requests + (randomChange > 1 ? 1 : 0)
              : 0,
            isLive: Math.random() > 0.8,
            pulse: Math.random() > 0.9,
          };

          return {
            ...updatedUser,
            score: calculateScore(updatedUser),
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Sort rankings based on selected metric
  const sortedRankings = [...rankings].sort((a, b) => {
    const aValue = sortBy === 'score' ? a.score || 0 : a[sortBy] || 0;
    const bValue = sortBy === 'score' ? b.score || 0 : b[sortBy] || 0;
    return bValue - aValue;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter dropdown component
  const FilterDropdown = () => (
    <div className='relative' ref={dropdownRef}>
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
            : sortBy === 'pull_requests'
            ? 'Pull Requests'
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
          >
            {[
              'score',
              'commits',
              'repositories',
              'stars',
              'followers',
              'pull_requests',
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
                  : option === 'pull_requests'
                  ? 'Pull Requests'
                  : option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className='min-h-screen  bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      {/* Header */}
      <Header />

      <div className='container mx-auto px-4 pt-15'>
        <motion.header
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className='mb-8'
        >
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <div className='flex items-center space-x-3'>
              <h1 className='text-2xl font-bold text-gray-100 flex items-center gap-2'>
                Developers Ranking
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

        {/* Error message */}
        {error && (
          <div className='bg-red-900/50 border border-red-700 text-red-100 p-4 rounded-lg mb-4'>
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className='flex flex-col items-center justify-center h-64 gap-4'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className='w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full'
            />
            <p className='text-gray-400'>Fetching ranking data...</p>
          </div>
        )}

        {/* Leaderboard */}
        {!isLoading && (
          <div className='space-y-4'>
            {sortedRankings.length > 0 ? (
              <AnimatePresence>
                {sortedRankings.map((user, index) => (
                  <Link href={`/profile/${user.id}`} key={user.id} passHref>
                    <motion.article
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
                        user.isLive
                          ? 'border-emerald-400/30'
                          : 'border-gray-700'
                      }`}
                    >
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
                        <div className='col-span-4 cursor-pointer'>
                          <motion.div
                            className='flex items-center gap-3'
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='relative'
                            >
                              <img
                                src={
                                  user.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name
                                  )}&background=random`
                                }
                                alt={`${user.name}'s avatar`}
                                className='w-10 h-10 rounded-full border-2 border-gray-700'
                                width={40}
                                height={40}
                              />
                              {user.isLive && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                  className='absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-gray-900'
                                />
                              )}
                            </motion.div>
                            <div>
                              <h2 className='font-medium text-gray-100 hover:text-emerald-400'>
                                {user.name}
                              </h2>
                              {user.github_username && (
                                <a
                                  href={`https://github.com/${user.github_username}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-xs text-gray-400 hover:text-emerald-400'
                                >
                                  @{user.github_username}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        </div>

                        {/* Score */}
                        <div className='col-span-2'>
                          <div className='flex items-center gap-2'>
                            <TrendingUp className='w-5 h-5 text-emerald-400' />
                            <AnimatePresence mode='wait'>
                              <ScoreChange value={user.score || 0} />
                            </AnimatePresence>
                            <span className='text-xs text-gray-500'>pts</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className='col-span-5'>
                          <div className='grid grid-cols-5 gap-2 text-center'>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='flex flex-col items-center'
                              title='Commits'
                            >
                              <GitCommit className='w-4 h-4 text-gray-400' />
                              <span className='text-xs mt-1'>
                                {user.commits || 0}
                              </span>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='flex flex-col items-center'
                              title='Repositories'
                            >
                              <Code className='w-4 h-4 text-gray-400' />
                              <span className='text-xs mt-1'>
                                {user.repositories || 0}
                              </span>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='flex flex-col items-center'
                              title='Stars'
                            >
                              <Star className='w-4 h-4 text-gray-400' />
                              <span className='text-xs mt-1'>
                                {user.stars || 0}
                              </span>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='flex flex-col items-center'
                              title='Followers'
                            >
                              <Users className='w-4 h-4 text-gray-400' />
                              <span className='text-xs mt-1'>
                                {user.followers || 0}
                              </span>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className='flex flex-col items-center'
                              title='Pull Requests'
                            >
                              <GitPullRequest className='w-4 h-4 text-gray-400' />
                              <span className='text-xs mt-1'>
                                {user.pull_requests || 0}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Activity indicator */}
                      {user.isLive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className='absolute bottom-0 left-0 h-0.5 bg-emerald-400/50'
                        />
                      )}
                    </motion.article>
                  </Link>
                ))}
              </AnimatePresence>
            ) : (
              <div className='text-center py-10 text-gray-400'>
                No users found with GitHub data
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
