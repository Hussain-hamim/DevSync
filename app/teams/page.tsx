'use client';
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, GitBranch, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  tech_stack?: string[];
  created_at: string;
  slug?: string;
}

interface Team {
  id: string;
  title: string;
  slug: string;
  description?: string;
  members: number;
  icon: string;
  techStack: string[];
  createdAt: string;
}

const TeamPage = () => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProjectsWithMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectsError) {
          throw new Error(projectsError.message);
        }

        if (!projectsData || projectsData.length === 0) {
          setTeams([]);
          return;
        }

        // Process each project to get member count
        const projectsWithMembers = await Promise.all(
          projectsData.map(async (project: Project) => {
            // Get creator as owner
            const { data: creator } = await supabase
              .from('users')
              .select('id')
              .eq('id', project.creator_id)
              .single();

            // Get all filled roles
            const { data: rolesData } = await supabase
              .from('project_roles')
              .select('user_id')
              .eq('project_id', project.id)
              .not('filled_by', 'is', null);

            // Combine creator and role fillers (remove duplicates)
            const memberIds = new Set<string>();
            if (creator?.id) memberIds.add(creator.id);
            rolesData?.forEach((role: { user_id: string }) => {
              if (role.user_id) memberIds.add(role.user_id);
            });

            // Get tech stack icon
            const techStack = project.tech_stack?.[0]?.toLowerCase() || 'react';
            const techImages: Record<string, string> = {
              react:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
              node: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
              python:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
              javascript:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
              typescript:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
              django:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
              flask:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
              nextjs:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
              vue: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
              angular:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
              default:
                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
            };

            const techImage = techImages[techStack] || techImages.default;

            return {
              id: project.id,
              title: project.title,
              slug: project.slug || project.id,
              description: project.description,
              members: memberIds.size,
              icon: techImage,
              techStack: project.tech_stack || [],
              createdAt: project.created_at,
            };
          })
        );

        setTeams(projectsWithMembers);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsWithMembers();
  }, [session]);

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

        <section className='py-12 relative overflow-hidden'>
          <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10'></div>
          <div className='container mx-auto relative z-10'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='max-w-3xl mx-auto text-center mb-16'
            >
              <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                <span className='text-emerald-400'>Project Teams</span> for
                Collaboration
              </h2>
              <p className='text-gray-400 text-lg'>
                Join teams working on exciting projects with your skills
              </p>
            </motion.div>

            {error ? (
              <div className='text-center py-12'>
                <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-8 max-w-md mx-auto'>
                  <h3 className='text-xl font-semibold mb-2 text-red-400'>
                    Error Loading Teams
                  </h3>
                  <p className='text-gray-400 mb-4'>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className='bg-gray-800/60 p-6 rounded-xl border border-gray-700 h-48 animate-pulse'
                  />
                ))}
              </div>
            ) : teams.length > 0 ? (
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {teams.map((team, index) => (
                  <Link href={`/teams/${team.id}`} key={team.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className='bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col h-full group'
                    >
                      <div className='flex items-start gap-4 mb-4'>
                        <div className='w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700 group-hover:border-emerald-400/30 transition-colors flex-shrink-0'>
                          <img
                            src={team.icon}
                            alt={team.title}
                            className='rounded-lg w-8 h-8 object-contain'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-lg font-semibold mb-1 text-white group-hover:text-emerald-400 transition-colors truncate'>
                            {team.title} Team
                          </h3>
                          <div className='flex items-center gap-2'>
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-400/20'>
                              <Users className='w-3 h-3 mr-1' />
                              {team.members}{' '}
                              {team.members === 1 ? 'member' : 'members'}
                            </span>
                            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300'>
                              <GitBranch className='w-3 h-3 mr-1' />
                              Project
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className='text-gray-400 text-sm mb-4 line-clamp-2'>
                        {team.description ||
                          'Join this project team to collaborate with other developers'}
                      </p>

                      {team.techStack.length > 0 && (
                        <div className='mt-auto pt-4 border-t border-gray-700/50'>
                          <div className='flex flex-wrap gap-2'>
                            {team.techStack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className='text-xs bg-gray-900/80 text-emerald-400 px-2 py-1 rounded-full'
                              >
                                {tech}
                              </span>
                            ))}
                            {team.techStack.length > 3 && (
                              <span className='text-xs bg-gray-900/80 text-gray-400 px-2 py-1 rounded-full'>
                                +{team.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-8 max-w-md mx-auto'>
                  <h3 className='text-xl font-semibold mb-2'>
                    No Project Teams Found
                  </h3>
                  <p className='text-gray-400 mb-4'>
                    There are currently no active project teams to join.
                  </p>
                  <button
                    onClick={() => router.push('/projects')}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center'
                  >
                    Browse Projects
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;
