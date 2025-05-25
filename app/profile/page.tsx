/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Github,
  Code2,
  Cpu,
  Star,
  GitFork,
  Zap,
  ArrowRight,
  Folder,
  Users,
  Twitter,
  Linkedin,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [githubData, setGithubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [user, setUser] = useState(null);
  const { data: session, status: sessionStatus } = useSession();
  const [allCommits, setAllCommits] = useState<any>(null);

  const githubUsername = session?.user?.login;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First check if session is loaded and has user data
        if (sessionStatus === 'loading') return;

        if (!session?.user) {
          throw new Error('User session not available, please login!');
        }

        // Try to get email from different possible locations
        const userEmail =
          session.user.email || session.user.user?.email || session.user.name;

        if (!userEmail) {
          throw new Error(
            'Could not identify user - no email or username available'
          );
        }

        // Fetch GitHub data (if needed)
        const githubUsername =
          session.user.login || session.user.name || 'octocat';

        const allCommits = await fetch(
          `https://api.github.com/search/commits?q=author:${githubUsername}`
        );
        const allCommitsData = await allCommits.json();
        setAllCommits(allCommitsData);

        if (githubUsername) {
          const githubResponse = await fetch(
            `/api/github?username=${githubUsername}`
          );
          if (!githubResponse.ok) {
            console.warn('Failed to fetch GitHub data');
          } else {
            const githubData = await githubResponse.json();
            setGithubData(githubData);
          }
        }

        // Fetch user from Supabase - try both email and name as fallback
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${userEmail},name.eq.${userEmail}`)
          .limit(1);

        if (userError) throw userError;
        if (!users || users.length === 0) {
          throw new Error('User not found in database');
        }

        const userData = users[0];
        setUser(userData);

        // Fetch created projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('creator_id', userData.id)
          .limit(4)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;
        setCreatedProjects(projects || []);

        // Inside your fetchData function in useEffect:.

        // Fetch joined projects through project_roles table
        const { data: projectRoles, error: rolesError } = await supabase
          .from('project_roles')
          .select('project_id, title') // Include title in the select
          .eq('filled_by', userData.id);

        if (rolesError) throw rolesError;

        if (projectRoles && projectRoles.length > 0) {
          const projectIds = projectRoles.map((role) => role.project_id);

          // Fetch the actual projects
          const { data: joinedProjects, error: joinedProjectsError } =
            await supabase
              .from('projects')
              .select('*')
              .in('id', projectIds)
              .limit(4)
              .order('created_at', { ascending: false });

          if (joinedProjectsError) throw joinedProjectsError;

          // Combine projects with their roles
          const projectsWithRoles = joinedProjects.map((project) => {
            const role = projectRoles.find(
              (role) => role.project_id === project.id
            );
            return {
              ...project,
              roleTitle: role?.title || 'Member', // Default to 'Member' if no title found
            };
          });

          setJoinedProjects(projectsWithRoles || []);
        } else {
          setJoinedProjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [githubUsername]);

  // Social media data
  const socialLinks = [
    {
      name: 'GitHub',
      url: `https://github.com/${githubUsername}`,
      icon: Github,
      username: githubUsername,
      color: 'text-gray-400 hover:text-purple-400',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: Twitter,
      username: '@username',
      color: 'text-gray-400 hover:text-blue-400',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: Linkedin,
      username: 'username',
      color: 'text-gray-400 hover:text-blue-500',
    },
    {
      name: 'Website',
      url: 'https://example.com',
      icon: Globe,
      username: 'portfolio.dev',
      color: 'text-gray-400 hover:text-emerald-400',
    },
  ];

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
          {/* Avatar with refined online status */}
          <div className='relative self-start'>
            <div className='relative w-32 h-32'>
              <img
                src={githubData.profile.avatar_url}
                alt={githubData.profile.name}
                className='w-full h-full rounded-full object-cover border-2 border-emerald-400/30'
              />
              {/* Smooth online status indicator */}
              <motion.div
                className='absolute bottom-3 right-1 z-10'
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className='relative'>
                  <div className='w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-800'></div>
                  <motion.div
                    className='absolute inset-0 rounded-full bg-emerald-500 opacity-30'
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* User info */}
          <div className='flex-1'>
            <h1 className='text-3xl font-bold mb-2'>
              {githubData.profile.name}
            </h1>
            <p className='text-gray-400 mb-4 max-w-2xl'>
              {githubData.profile.bio || 'No bio available'}
            </p>

            {/* Social links */}
            <div className='flex flex-wrap gap-3 mb-6'>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm ${social.color} transition-colors`}
                >
                  <social.icon className='w-4 h-4' />
                  <span>{social.username}</span>
                </motion.a>
              ))}
            </div>

            {/* Stats grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>Repositories</div>
                <div className='text-2xl font-bold text-emerald-400'>
                  {githubData.profile.public_repos}
                </div>
              </div>
              <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
                <div className='text-sm text-gray-400 mb-1'>
                  Total Contributions
                </div>
                <div className='text-2xl font-bold text-cyan-400'>
                  {/* {githubData.stats.contributions} */}
                  {allCommits.total_count}
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

        {/* Main content area */}
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Left side - 2 columns */}
          <div className='flex-1 grid md:grid-cols-2 gap-8'>
            {/* Created Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
            >
              <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
                <Folder className='w-5 h-5 text-emerald-400' />
                Created Projects
              </h2>
              <div className='space-y-4'>
                {createdProjects.map((project) => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className='group hover:bg-gray-700/50 p-3 rounded-lg transition-colors'>
                      <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
                        {project.title}
                      </h3>
                      <p className='text-sm text-gray-400 mt-1 max-h-16 line-clamp-2'>
                        {project.description}
                      </p>
                      <div className='flex justify-between items-center mt-2 '>
                        <span className='flex items-center gap-1 text-xs text-gray-400'>
                          <Users className='w-3 h-3' />
                          {+1} members
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${'bg-green-900/50 text-green-400'}`}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Joined Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
            >
              <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
                <Users className='w-5 h-5 text-emerald-400' />
                Joined Projects
              </h2>
              <div className='space-y-4'>
                {joinedProjects.map((project) => (
                  <Link
                    href={`/projects/${project.id}`}
                    key={project.id}
                    className='group'
                  >
                    <div className='group hover:bg-gray-700/50 p-3 rounded-lg transition-colors'>
                      <div className='flex items-center gap-2 justify-between'>
                        <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
                          {project.title}
                        </h3>
                        <span className='text-xs bg-gray-900 px-2 py-1 rounded'>
                          {project.roleTitle}
                        </span>
                      </div>
                      <p className='text-sm text-gray-400 mt-1 max-h-16 line-clamp-2'>
                        {project.description}
                      </p>
                      <div className='flex justify-between items-center mt-2'>
                        <span className='flex items-center gap-1 text-xs text-gray-400'>
                          <Users className='w-3 h-3' />
                          {project.members} members
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right side - GitHub stats column */}
          <div className='w-full md:w-80 space-y-8'>
            {/* GitHub info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
            >
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
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
            >
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
            </motion.div>
          </div>
        </div>

        {/* Recent Repos (full width below) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-8'
        >
          <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
            <Zap className='w-5 h-5 text-emerald-400' />
            Recent Github Repositories
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {githubData.recentRepos.length > 0 ? (
              githubData.recentRepos.map((repo, index) => (
                <div key={index} className='group'>
                  <a
                    href={repo.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block hover:bg-gray-700/50 p-3 rounded transition-colors'
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
        </motion.div>
      </div>
    </div>
  );
}
