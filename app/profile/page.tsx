'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Globe, Linkedin, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '@/components/Header';
import {
  ProfileHeader,
  ProjectsSection,
  GithubStatsSection,
  RecentReposSection,
} from '@/components/profile';
import { GithubData, Project, SocialLink, CommitsData } from '@/types/profile';
import { Session } from 'next-auth';

export default function ProfilePage() {
  const router = useRouter();
  const { data, status: sessionStatus } = useSession();
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [allCommits, setAllCommits] = useState<CommitsData | null>(null);

  const session = data as Session & {
    user: {
      login?: string;
    };
  };
  const githubUsername = session?.user?.login;

  // Fetch data in parallel where possible
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      setError('User session not available, please login!');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const userEmail = session.user.email;
        if (!userEmail) {
          throw new Error(
            'Could not identify user - no email or username available'
          );
        }

        const githubUsername =
          session.user.login || session.user.name || 'octocat';

        // Fetch data in parallel
        const [commitsResponse, githubResponse, userData] = await Promise.all([
          fetch(
            `https://api.github.com/search/commits?q=author:${githubUsername}`
          ),
          fetch(`/api/github?username=${githubUsername}`),
          fetchUserData(userEmail),
        ]);

        if (!commitsResponse.ok) throw new Error('Failed to fetch commits');
        const commitsData = await commitsResponse.json();
        setAllCommits(commitsData);

        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          setGithubData(githubData);
        }

        if (userData) {
          await Promise.all([
            fetchCreatedProjects(userData.id),
            fetchJoinedProjects(userData.id),
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, githubUsername]);

  const fetchUserData = async (userEmail: string) => {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${userEmail},name.eq.${userEmail}`)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0) return null;

    return users[0];
  };

  const fetchCreatedProjects = async (userId: string) => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('creator_id', userId)
      .limit(4)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setCreatedProjects(projects || []);
  };

  const fetchJoinedProjects = async (userId: string) => {
    const { data: projectRoles, error: rolesError } = await supabase
      .from('project_roles')
      .select('project_id, title')
      .eq('filled_by', userId);

    if (rolesError) throw rolesError;

    if (projectRoles && projectRoles.length > 0) {
      const projectIds = projectRoles.map((role) => role.project_id);

      const { data: joinedProjects, error } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithRoles = joinedProjects?.map((project) => ({
        ...project,
        roleTitle:
          projectRoles.find((role) => role.project_id === project.id)?.title ||
          'Member',
      }));

      setJoinedProjects(projectsWithRoles || []);
    }
  };

  const socialLinks: SocialLink[] = [
    {
      name: 'GitHub',
      url: `https://github.com/${githubUsername}`,
      icon: Github,
      username: githubUsername || '',
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!githubData) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
      <Header />

      <div className='container mx-auto px-4 py-8'>
        <BackButton router={router} />

        {githubData && (
          <>
            <ProfileHeader
              profile={githubData.profile}
              socialLinks={socialLinks}
              commitsCount={allCommits?.total_count || 0}
            />

            <div className='flex flex-col md:flex-row gap-8'>
              <ProjectsSection
                createdProjects={createdProjects}
                joinedProjects={joinedProjects}
              />
              <GithubStatsSection githubData={githubData} />
            </div>

            <RecentReposSection repos={githubData.recentRepos} />
          </>
        )}
      </div>
    </div>
  );
}

const BackButton = ({ router }) => (
  <motion.button
    onClick={() => router.back()}
    whileHover={{ x: -4 }}
    className='flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-8 transition-colors'
  >
    <ArrowLeft className='w-5 h-5' />
    <span>Back</span>
  </motion.button>
);

const LoadingState = () => (
  <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
    <Header />
    <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
      <div className='animate-pulse text-gray-400'>Loading profile data...</div>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
    <Header />
    <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
      <div className='text-rose-400'>Error: {error}</div>
    </div>
  </div>
);
