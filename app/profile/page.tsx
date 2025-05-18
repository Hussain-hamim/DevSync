'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Github,
  Calendar,
  Code2,
  Cpu,
  Star,
  GitFork,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';

// testing

interface GitHubData {
  profile: {
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  stats: {
    contributions: number;
    repositories: number;
    stars: number;
    forks: number;
  };
  skills: string[];
  recentRepos: {
    name: string;
    url: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
  }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Replace with your actual GitHub username or get it from auth/session
  const githubUsername = session?.user?.login || 'octocat';

  console.log('github username: ', githubUsername);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const response = await fetch(`/api/github?username=${githubUsername}`);
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub data, please try Login.');
        }
        const data = await response.json();
        setGithubData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [githubUsername, session?.user]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>
            Loading profile data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='text-rose-400'>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!githubData) {
    return null;
  }

  const joinDate = new Date(githubData.profile.created_at).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
    }
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
      <Header />

      <div className='container mx-auto px-4 py-8'>
        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -4 }}
          className='flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-8 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
          <span>Back</span>
        </motion.button>

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col md:flex-row gap-8 mb-12'
        >
          {/* Avatar */}
          <div className='relative'>
            <img
              src={githubData.profile.avatar_url}
              alt={githubData.profile.name}
              className='w-32 h-32 rounded-full object-cover border-2 border-emerald-400/50'
            />
            <div className='absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-gray-800'></div>
          </div>

          {/* User info */}
          <div className='flex-1'>
            <h1 className='text-3xl font-bold mb-2'>
              {githubData.profile.name}
            </h1>
            <p className='text-gray-400 mb-6 max-w-2xl'>
              {githubData.profile.bio || 'No bio available'}
            </p>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>Repositories</div>
                <div className='text-2xl font-bold text-emerald-400'>
                  {githubData.profile.public_repos}
                </div>
              </div>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>Contributions</div>
                <div className='text-2xl font-bold text-cyan-400'>
                  {githubData.stats.contributions}
                </div>
              </div>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>Stars</div>
                <div className='text-2xl font-bold text-purple-400'>
                  {githubData.stats.stars}
                </div>
              </div>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>Member since</div>
                <div className='text-xl font-medium text-yellow-400'>
                  {joinDate}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='grid md:grid-cols-3 gap-8 mb-12'
        >
          {/* GitHub info */}
          <div className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'>
            <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
              <Github className='w-5 h-5 text-emerald-400' />
              GitHub Stats
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-400'>Followers</span>
                <span className='font-medium'>
                  {githubData.profile.followers}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-400'>Following</span>
                <span className='font-medium'>
                  {githubData.profile.following}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-400'>Total Forks</span>
                <span className='font-medium'>{githubData.stats.forks}</span>
              </div>
              <div className='pt-4'>
                <a
                  href={`https://github.com/${githubUsername}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-cyan-400 hover:underline text-sm'
                >
                  View on GitHub
                  <ArrowRight className='w-4 h-4' />
                </a>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'>
            <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
              <Code2 className='w-5 h-5 text-emerald-400' />
              Top Languages
            </h2>
            <div className='flex flex-wrap gap-2'>
              {githubData.skills.length > 0 ? (
                githubData.skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className='px-3 py-1.5 bg-gray-700 rounded-full text-sm flex items-center gap-1'
                  >
                    <Cpu className='w-3 h-3 text-emerald-400' />
                    {skill}
                  </motion.span>
                ))
              ) : (
                <span className='text-gray-400 text-sm'>
                  No language data available
                </span>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'>
            <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
              <Zap className='w-5 h-5 text-emerald-400' />
              Recent Repositories
            </h2>
            <div className='space-y-4'>
              {githubData.recentRepos.length > 0 ? (
                githubData.recentRepos.map((repo, index) => (
                  <div key={index} className='group'>
                    <a
                      href={repo.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block hover:bg-gray-700/50 p-2 rounded transition-colors'
                    >
                      <div className='flex justify-between items-start'>
                        <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
                          {repo.name}
                        </h3>
                        <div className='flex items-center gap-2'>
                          <span className='flex items-center gap-1 text-xs text-gray-400'>
                            <Star className='w-3 h-3' />
                            {repo.stars}
                          </span>
                          <span className='flex items-center gap-1 text-xs text-gray-400'>
                            <GitFork className='w-3 h-3' />
                            {repo.forks}
                          </span>
                        </div>
                      </div>
                      {repo.description && (
                        <p className='text-sm text-gray-400 mt-1 line-clamp-2'>
                          {repo.description}
                        </p>
                      )}
                      {repo.language && (
                        <span className='inline-block mt-2 text-xs bg-gray-900 px-2 py-1 rounded'>
                          {repo.language}
                        </span>
                      )}
                    </a>
                  </div>
                ))
              ) : (
                <span className='text-gray-400 text-sm'>
                  No recent repositories
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
