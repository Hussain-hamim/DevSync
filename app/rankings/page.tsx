'use client';
import Header from '@/components/Header';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Calendar,
  ChevronDown,
  Crown,
  GitPullRequest,
  Medal,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RankingsPage() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [sortBy, setSortBy] = useState<MetricType>('score');
  const [rankings, setRankings] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Supabase and enrich with GitHub data
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
    const refreshInterval = setInterval(() => {
      fetchUsers();
    }, 10 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Sort rankings based on selected metric
  const sortedRankings = [...rankings].sort((a, b) => {
    const aValue = sortBy === 'score' ? a.score || 0 : a[sortBy] || 0;
    const bValue = sortBy === 'score' ? b.score || 0 : b[sortBy] || 0;
    return bValue - aValue;
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100'>
      <Header />

      <div className='container mx-auto px-4 pt-20 pb-8'>
        {/* Page Header */}
        <motion.header
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className='mb-8'
        >
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div className='flex items-center space-x-3'>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-100 flex items-center gap-3'>
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
                  <Trophy className='w-6 h-6 text-amber-400' />
                </motion.div>
                <span className='bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent'>
                  Developer Rankings
                </span>
              </h1>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              <motion.div whileHover={{ scale: 1.03 }}>
                <button
                  onClick={() =>
                    setTimeframe(timeframe === 'weekly' ? 'monthly' : 'weekly')
                  }
                  className='w-full sm:w-auto bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors'
                >
                  <Calendar className='w-4 h-4' />
                  <span>{timeframe === 'weekly' ? 'Weekly' : 'Monthly'}</span>
                  <ChevronDown className='w-4 h-4' />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Column Headers - Desktop */}
        <div className='hidden md:grid grid-cols-12 gap-4 mb-2 px-4'>
          <div className='col-span-1 text-gray-400 text-sm font-medium'>
            Rank
          </div>
          <div className='col-span-4 text-gray-400 text-sm font-medium'>
            Developer
          </div>
          <div className='col-span-1 text-gray-400 text-sm font-medium'>
            Points
          </div>
          <div className='col-span-6 grid grid-cols-5 gap-2 text-center'>
            <div className='text-gray-400 text-sm font-medium'>Commits</div>
            <div className='text-gray-400 text-sm font-medium'>Repos</div>
            <div className='text-gray-400 text-sm font-medium'>Stars</div>
            <div className='text-gray-400 text-sm font-medium'>Followers</div>
            <div className='text-gray-400 text-sm font-medium'>PRs</div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className='hidden md:block'>
                  <UserSkeleton />
                </div>
                <div className='md:hidden'>
                  <UserSkeleton isMobile />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {!isLoading && (
          <div className='space-y-3'>
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
                      className={`bg-gray-800/50 border rounded-lg p-3 md:p-4 relative overflow-hidden group ${
                        user.isLive
                          ? 'border-emerald-400/30'
                          : 'border-gray-700'
                      }`}
                    >
                      {/* Desktop Layout */}
                      <div className='hidden md:grid grid-cols-12 items-center gap-4'>
                        {/* Rank */}
                        <div className='col-span-1 flex justify-center'>
                          <RankBadge rank={index} />
                        </div>

                        {/* User Info */}
                        <div className='col-span-4 cursor-pointer'>
                          <motion.div
                            className='flex items-center gap-4'
                            whileHover={{ x: 5 }}
                          >
                            <div className='relative'>
                              <img
                                src={
                                  user.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name
                                  )}&background=random`
                                }
                                alt={`${user.name}'s avatar`}
                                className='w-10 h-10 rounded-full border-2 border-gray-700 object-cover'
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
                                  className='absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900'
                                />
                              )}
                            </div>
                            <div>
                              <h2 className='font-medium text-gray-100 group-hover:text-emerald-400 transition-colors'>
                                {user.name}
                              </h2>
                              {user.github_username && (
                                <a
                                  href={`https://github.com/${user.github_username}`}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-sm text-gray-400 hover:text-emerald-400 transition-colors'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  @{user.github_username}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        </div>

                        {/* Score */}
                        <div className='col-span-1 text-center'>
                          <AnimatePresence mode='wait'>
                            <GitPullRequest />
                            <ScoreChange value={user.score || 0} />
                          </AnimatePresence>
                        </div>

                        {/* Metrics */}
                        <div className='col-span-6 grid grid-cols-5 gap-2 text-center'>
                          <div className='font-medium'>{user.commits || 0}</div>
                          <div className='font-medium'>
                            {user.repositories || 0}
                          </div>
                          <div className='font-medium'>{user.stars || 0}</div>
                          <div className='font-medium'>
                            {user.followers || 0}
                          </div>
                          <div className='font-medium'>
                            {user.pull_requests || 0}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className='md:hidden flex items-center gap-3'>
                        <div className='flex-shrink-0'>
                          <RankBadge rank={index} />
                        </div>

                        <div className='flex-shrink-0'>
                          <img
                            src={
                              user.avatar_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=random`
                            }
                            alt={`${user.name}'s avatar`}
                            className='w-10 h-10 rounded-full border-2 border-gray-700 object-cover'
                            width={40}
                            height={40}
                          />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h2 className='font-medium text-gray-100 truncate'>
                            {user.name}
                          </h2>
                          {user.github_username && (
                            <div className='text-xs text-gray-400 truncate'>
                              @{user.github_username}
                            </div>
                          )}
                        </div>

                        <div className='flex-shrink-0 text-right'>
                          <div className='font-bold text-emerald-400'>
                            {user.score || 0}
                          </div>
                          <div className='text-xs text-gray-400'>pts</div>
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
              <div className='text-center py-16 text-gray-400'>
                No ranking data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

////////////////////////////

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
    console.error(`Error fetching data for user ${user.github_id}:`, error);
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

// Rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 0) {
    return (
      <div className='relative'>
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className='w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
        >
          {rank + 1}
        </motion.div>
        <Crown className='absolute -top-2 -right-2 w-4 h-4 text-amber-400 fill-amber-400' />
      </div>
    );
  } else if (rank === 1) {
    return (
      <div className='relative'>
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-gray-900 font-bold'>
          {rank + 1}
        </div>
        <Medal className='absolute -top-2 -right-2 z-222  w-4 h-4 text-gray-400' />
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className='relative'>
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold'>
          {rank + 1}
        </div>
        <Award className='absolute -top-2 -right-2 w-4 h-4 text-amber-500' />
      </div>
    );
  }
  return (
    <div className='w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-bold'>
      {rank + 1}
    </div>
  );
};

// Loading Skeleton Component
const UserSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'>
    {isMobile ? (
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-full bg-gray-700 animate-pulse' />
        <div className='w-10 h-10 rounded-full bg-gray-700 animate-pulse' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 bg-gray-700 rounded animate-pulse w-3/4' />
          <div className='h-3 bg-gray-700 rounded animate-pulse w-1/2' />
        </div>
        <div className='w-12 h-6 bg-gray-700 rounded animate-pulse' />
      </div>
    ) : (
      <div className='grid grid-cols-12 gap-4 items-center'>
        <div className='col-span-1 flex justify-center'>
          <div className='w-8 h-8 rounded-full bg-gray-700 animate-pulse' />
        </div>
        <div className='col-span-4 flex items-center gap-4'>
          <div className='w-10 h-10 rounded-full bg-gray-700 animate-pulse' />
          <div className='space-y-2'>
            <div className='h-4 bg-gray-700 rounded animate-pulse w-32' />
            <div className='h-3 bg-gray-700 rounded animate-pulse w-24' />
          </div>
        </div>
        <div className='col-span-1'>
          <div className='h-6 bg-gray-700 rounded animate-pulse w-12 mx-auto' />
        </div>
        <div className='col-span-6 grid grid-cols-5 gap-2 text-center'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-6 bg-gray-700 rounded animate-pulse' />
          ))}
        </div>
      </div>
    )}
  </div>
);
