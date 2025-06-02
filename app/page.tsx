'use client';
import { useEffect, useRef, useState } from 'react';
import {
  GitBranch,
  LayoutPanelLeft,
  MessageSquare,
  Sparkles,
  BarChart2,
  Github,
  ArrowRight,
  Terminal,
  Cpu,
  GitPullRequest,
  Code2,
  Search,
  User,
  Users,
  Code,
  GitMerge,
  Server,
  CpuIcon,
  Zap,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import Header from '@/components/Header';
import { supabase } from './lib/supabase';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Home() {
  const heroRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        const { data: allProjects } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        setAllProjects(allProjects);

        const { data: allUsers } = await supabase.from('users').select('*');
        setAllUsers(allUsers);

        console.log(error?.message);
        if (error) {
          console.error('Failed to fetch projects:', error.message);
          return;
        }

        setProjects(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load projects');
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const floatingElements = [
    {
      icon: <Code className='w-6 h-6 text-emerald-400' />,
      top: '15%',
      left: '10%',
      delay: 0.1,
    },
    {
      icon: <GitMerge className='w-6 h-6 text-cyan-400' />,
      top: '25%',
      left: '85%',
      delay: 0.3,
    },
    {
      icon: <Server className='w-6 h-6 text-purple-400' />,
      top: '75%',
      left: '15%',
      delay: 0.5,
    },
    {
      icon: <CpuIcon className='w-6 h-6 text-yellow-400' />,
      top: '65%',
      left: '80%',
      delay: 0.7,
    },
    {
      icon: <Zap className='w-6 h-6 text-pink-400' />,
      top: '40%',
      left: '25%',
      delay: 0.2,
    },
    {
      icon: <Terminal className='w-6 h-6 text-blue-400' />,
      top: '50%',
      left: '70%',
      delay: 0.4,
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100 overflow-x-hidden'>
      {/* Smart Header */}
      {/* <Header /> */}
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className='relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center justify-center'
      >
        {/* Animated background elements */}
        <motion.div
          style={{ y: yBg, opacity: opacityBg }}
          className='absolute inset-0 overflow-hidden pointer-events-none'
        >
          {floatingElements.map((element, index) => (
            <motion.div
              key={index}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, -20, 0, 20, 0],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: 8 + index,
                delay: element.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className='absolute'
              style={{ top: element.top, left: element.left }}
            >
              {element.icon}
            </motion.div>
          ))}
        </motion.div>

        {/* Grid pattern */}
        <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-20'></div>

        <div className='container mx-auto relative z-10'>
          <div className='max-w-3xl mx-auto text-center'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className='inline-flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full mb-4 border border-gray-700'
            >
              <GitPullRequest className='w-4 h-4 text-emerald-400' />
              <span className='text-xs font-medium text-emerald-400'>
                v2.0 Now Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='text-4xl md:text-6xl font-bold mb-6 leading-tight'
            >
              <span className='bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
                <TypeAnimation
                  sequence={[
                    'Code Together,',
                    1000,
                    'Build Together,',
                    1000,
                    'Ship Together,',
                    1000,
                  ]}
                  wrapper='span'
                  speed={30}
                  repeat={Infinity}
                />
              </span>
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Without the Chaos
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className='text-xl text-gray-400 mb-10 max-w-2xl mx-auto'
            >
              The developer platform where coders connect, collaborate, and
              create amazing projects as teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className='flex flex-col sm:flex-row justify-center gap-3'
            >
              <Link
                href='/projects'
                className='relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-2'
              >
                <span className='relative z-10 flex items-center'>
                  <span>Find Projects</span>
                  <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity'></span>
              </Link>

              <button
                onClick={() => signIn('github')}
                className='relative overflow-hidden group bg-gray-800 border border-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all flex items-center justify-center space-x-2'
              >
                <span className='relative z-10 flex items-center'>
                  <Github className='w-4 h-4 mr-2' />
                  <Link href={'/'}>GitHub Connect</Link>
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity'></span>
              </button>
            </motion.div>

            {/* Animated stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className='mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto'
            >
              {[
                {
                  value: allProjects ? allProjects.length + '+' : '100+',
                  label: 'Active Projects',
                },
                { value: allUsers.length + '+', label: 'Developers' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'
                >
                  <div className='text-2xl font-bold text-emerald-400'>
                    {stat.value}
                  </div>
                  <div className='text-xs text-gray-400'>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className='absolute bottom-8 left-1/2 transform -translate-x-1/2'
        >
          <div className='flex flex-col items-center'>
            <motion.div
              animate={{
                y: [0, 10, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className='w-6 h-6 text-gray-400'
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M7 10L12 15L17 10'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </motion.div>
            <span className='text-xs text-gray-500 mt-1'>
              Scroll to explore
            </span>
          </div>
        </motion.div>
      </section>

      {/* Rest of your sections (Features Grid, Project Showcase, etc.) */}
      {/* ... keep your existing sections but consider adding motion to them as well ... */}

      {/* Features Grid */}
      <section className='py-20 px-6 bg-gray-800/50 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10'></div>
        <div className='container mx-auto relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='max-w-3xl mx-auto text-center mb-16'
          >
            <h2 className='text-3xl font-bold mb-4'>
              <span className='text-emerald-400'>Developer-First</span>{' '}
              Collaboration
            </h2>
            <p className='text-gray-400'>
              Tools built for how technical teams actually work
            </p>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-6'>
            {[
              {
                icon: <Cpu className='w-5 h-5 text-emerald-400' />,
                title: 'Role-Based Matching',
                desc: 'Find teammates based on needed skills (Rust, React, ML, etc.)',
              },
              {
                icon: <GitBranch className='w-5 h-5 text-emerald-400' />,
                title: 'Project Scaffolding',
                desc: 'Pre-configured environments with your stack',
              },
              {
                icon: <LayoutPanelLeft className='w-5 h-5 text-emerald-400' />,
                title: 'Progress Dashboard',
                desc: 'Track commits, tasks, and burndown',
              },
              {
                icon: <MessageSquare className='w-5 h-5 text-emerald-400' />,
                title: 'Technical Discussions',
                desc: 'Threaded conversations with code snippets',
              },
              {
                icon: <Sparkles className='w-5 h-5 text-emerald-400' />,
                title: 'AI Code Review',
                desc: 'Get PR suggestions before teammates see them',
              },
              {
                icon: <BarChart2 className='w-5 h-5 text-emerald-400' />,
                title: 'Skill Analytics',
                desc: 'See your growth across languages/frameworks',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-all hover:shadow-lg hover:-translate-y-1'
              >
                <div className='w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mb-4 border border-gray-700'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-semibold mb-2'>{feature.title}</h3>
                <p className='text-gray-400 text-sm'>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className='py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10'></div>
        <div className='container mx-auto relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='max-w-4xl mx-auto text-center mb-16'
          >
            <h2 className='text-3xl font-bold mb-4'>
              <span className='text-cyan-400'>Active Projects</span> Looking for
              Devs
            </h2>
            <p className='text-gray-400'>Real work happening right now</p>
          </motion.div>

          {!loading ? (
            <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className='bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-cyan-400/30 transition-all'
                >
                  <h3 className='text-lg font-semibold mb-3'>
                    {project.title}
                  </h3>
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {project.tech_stack.map((tech) => (
                      <motion.span
                        key={tech}
                        whileHover={{ scale: 1.05 }}
                        className='text-xs bg-gray-900 px-2 py-1 rounded'
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  <div className='text-sm text-gray-400 mb-3'>
                    <span className='text-cyan-400'>
                      {/* {project.members} */}
                      {1} members
                    </span>{' '}
                    • Needs:
                    {project.roles_needed.map((role) => (
                      <span key={role}>{' ' + role + ', '}</span>
                    ))}
                  </div>
                  <Link href={`projects/${project.id}`}>
                    <button className='text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors'>
                      View Details
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
              {[1, 2, 3, 4].map((_, index) => (
                <div
                  key={index}
                  className='bg-gray-800/70 p-6 rounded-xl border border-gray-700'
                >
                  {/* Title Skeleton */}
                  <div className='h-6 bg-gray-700 rounded mb-3 w-3/4 animate-pulse'></div>

                  {/* Tech Stack Skeleton */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {[1, 2, 3].map((tech) => (
                      <div
                        key={tech}
                        className='h-6 bg-gray-700 rounded w-16 animate-pulse'
                      ></div>
                    ))}
                  </div>

                  {/* Members & Roles Skeleton */}
                  <div className='space-y-2 mb-3'>
                    <div className='h-4 bg-gray-700 rounded w-5/6 animate-pulse'></div>
                    <div className='h-4 bg-gray-700 rounded w-4/6 animate-pulse'></div>
                  </div>

                  {/* Button Skeleton */}
                  <div className='h-8 bg-gray-700 rounded w-24 animate-pulse'></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10'></div>
        <div className='container mx-auto px-6 relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='max-w-3xl mx-auto text-center mb-16'
          >
            <h2 className='text-3xl md:text-4xl font-bold text-gray-100 mb-4'>
              How <span className='text-emerald-400'>DevSync</span> Works
            </h2>
            <p className='text-lg text-gray-400'>
              Get started in minutes and find your perfect developer team
            </p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto'>
            {[
              {
                icon: <User className='w-6 h-6 text-emerald-400' />,
                title: 'Create Profile',
                desc: 'Highlight your skills and preferred roles',
              },
              {
                icon: <Search className='w-6 h-6 text-emerald-400' />,
                title: 'Browse Projects',
                desc: 'Find exciting projects needing your skills',
              },
              {
                icon: <Users className='w-6 h-6 text-emerald-400' />,
                title: 'Join Team',
                desc: 'Claim an open role matching your expertise',
              },
              {
                icon: <Code2 className='w-6 h-6 text-emerald-400' />,
                title: 'Build & Ship',
                desc: 'Collaborate and create something amazing',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className='bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-all group hover:shadow-lg'
              >
                <div className='w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-4 border border-gray-700 group-hover:border-emerald-400/30 transition-colors'>
                  {item.icon}
                </div>
                <h3 className='text-lg font-semibold text-gray-100 mb-2'>
                  {item.title}
                </h3>
                <p className='text-gray-400 text-sm'>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 px-6 bg-gray-900 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10'></div>
        <div className='container mx-auto max-w-2xl text-center relative z-10'>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Terminal className='w-10 h-10 mx-auto text-emerald-400 mb-4' />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-2xl md:text-3xl font-bold mb-6'
          >
            Ready to <span className='text-cyan-400'>ship real code</span> with
            a technical team?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className='text-gray-400 mb-8'
          >
            No recruiters. No job descriptions. Just building.
          </motion.p>
          <motion.a
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            href='/login'
            className='inline-block relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all'
          >
            <span className='relative z-10'>Join DevSync — It&apos;s free</span>
            <span className='absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity'></span>
          </motion.a>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 border-t border-gray-800 py-12 px-6'>
        <div className='container mx-auto'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='flex items-center space-x-2 mb-6 md:mb-0'
            >
              <Terminal className='w-5 h-5 text-emerald-400' />
              <span className='font-medium'>DevSync</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='flex space-x-6'
            >
              {['GitHub', 'Twitter', 'Discord', 'LinkedIn'].map((item) => (
                <a
                  key={item}
                  href='https://x.com/erencodes'
                  target='_blank'
                  className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'
                >
                  {item}
                </a>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-xs'
          >
            © {new Date().getFullYear()} DevSync — Built by developers, for
            developers
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
