'use client';
import { useEffect, useState } from 'react';
import {
  Code,
  GitBranch,
  Users,
  LayoutPanelLeft,
  MessageSquare,
  Sparkles,
  BarChart2,
  Github,
  ArrowRight,
  CheckCircle,
  Terminal,
  Cpu,
  GitPullRequest,
} from 'lucide-react';

export default function Home() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setVisible(false);
      } else {
        // Scrolling up or at top
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
      {/* Smart Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        } bg-gray-800/90 backdrop-blur-md border-b border-gray-700`}
      >
        <div className='container mx-auto px-6 py-3 flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <Terminal className='w-5 h-5 text-emerald-400' />
            <span className='text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
              DevSync
            </span>
          </div>

          <nav className='hidden md:flex items-center space-x-6'>
            <a
              href='#'
              className='text-gray-300 hover:text-emerald-400 transition-colors text-sm'
            >
              Features
            </a>
            <a
              href='projects'
              className='text-gray-300 hover:text-emerald-400 transition-colors text-sm'
            >
              Projects
            </a>
            <a
              href='#'
              className='text-gray-300 hover:text-emerald-400 transition-colors text-sm'
            >
              Teams
            </a>
            <a
              href='#'
              className='text-gray-300 hover:text-emerald-400 transition-colors text-sm'
            >
              Docs
            </a>
          </nav>

          <div className='flex items-center space-x-3'>
            <a
              href='#'
              className='text-gray-300 hover:text-emerald-400 text-sm'
            >
              Login
            </a>
            <a
              href='#'
              className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity'
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='pt-32 pb-24 px-6'>
        <div className='container mx-auto'>
          <div className='max-w-3xl mx-auto text-center'>
            <div className='inline-flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full mb-4 border border-gray-700'>
              <GitPullRequest className='w-4 h-4 text-emerald-400' />
              <span className='text-xs font-medium text-emerald-400'>
                v2.0 Now Live
              </span>
            </div>

            <h1 className='text-4xl md:text-5xl font-bold mb-6 leading-tight'>
              <span className='bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
                Code Together,
              </span>
              <br />
              Without the Chaos
            </h1>

            <p className='text-lg text-gray-400 mb-10 max-w-2xl mx-auto'>
              The developer platform where technical teams form around projects,
              not job postings.
            </p>

            <div className='flex flex-col sm:flex-row justify-center gap-3'>
              <a
                href='#'
                className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2'
              >
                <span>Find Projects</span>
                <ArrowRight className='w-4 h-4' />
              </a>

              <a
                href='#'
                className='bg-gray-800 border border-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2'
              >
                <Github className='w-4 h-4' />
                <span>GitHub Connect</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className='py-20 px-6 bg-gray-800/50'>
        <div className='container mx-auto'>
          <div className='max-w-3xl mx-auto text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>
              <span className='text-emerald-400'>Developer-First</span>{' '}
              Collaboration
            </h2>
            <p className='text-gray-400'>
              Tools built for how technical teams actually work
            </p>
          </div>

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
              <div
                key={index}
                className='bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-colors hover:shadow-lg'
              >
                <div className='w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mb-4 border border-gray-700'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-semibold mb-2'>{feature.title}</h3>
                <p className='text-gray-400 text-sm'>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className='py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800'>
        <div className='container mx-auto'>
          <div className='max-w-4xl mx-auto text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>
              <span className='text-cyan-400'>Active Projects</span> Looking for
              Devs
            </h2>
            <p className='text-gray-400'>Real work happening right now</p>
          </div>

          <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
            {[
              {
                title: 'OpenAI API Wrapper',
                tech: ['TypeScript', 'Next.js', 'Python'],
                needs: ['Frontend', 'API Design'],
                members: 3,
              },
              {
                title: 'Rust CLI Tool',
                tech: ['Rust', 'WASM'],
                needs: ['Systems Programming', 'Performance'],
                members: 2,
              },
              {
                title: '3D Web Game',
                tech: ['Three.js', 'React', 'WebGL'],
                needs: ['3D Modeling', 'Shader Programming'],
                members: 4,
              },
              {
                title: 'Privacy-First Analytics',
                tech: ['Go', 'PostgreSQL', 'Docker'],
                needs: ['DevOps', 'Security'],
                members: 5,
              },
            ].map((project, index) => (
              <div
                key={index}
                className='bg-gray-800/70 p-6 rounded-xl border border-gray-700 hover:border-cyan-400/30 transition-colors'
              >
                <h3 className='text-lg font-semibold mb-3'>{project.title}</h3>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className='text-xs bg-gray-900 px-2 py-1 rounded'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className='text-sm text-gray-400 mb-3'>
                  <span className='text-cyan-400'>
                    {project.members} members
                  </span>{' '}
                  • Needs: {project.needs.join(', ')}
                </div>
                <button className='text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors'>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 px-6 bg-gray-900'>
        <div className='container mx-auto max-w-2xl text-center'>
          <Terminal className='w-10 h-10 mx-auto text-emerald-400 mb-4' />
          <h2 className='text-2xl md:text-3xl font-bold mb-6'>
            Ready to <span className='text-cyan-400'>ship real code</span> with
            a technical team?
          </h2>
          <p className='text-gray-400 mb-8'>
            No recruiters. No job descriptions. Just building.
          </p>
          <a
            href='#'
            className='inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity'
          >
            Join DevSync — It's Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 border-t border-gray-800 py-12 px-6'>
        <div className='container mx-auto'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center space-x-2 mb-6 md:mb-0'>
              <Terminal className='w-5 h-5 text-emerald-400' />
              <span className='font-medium'>DevSync</span>
            </div>
            <div className='flex space-x-6'>
              <a
                href='#'
                className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'
              >
                GitHub
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'
              >
                Twitter
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'
              >
                Discord
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-emerald-400 transition-colors text-sm'
              >
                Blog
              </a>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-xs'>
            © {new Date().getFullYear()} DevSync — Built by developers, for
            developers
          </div>
        </div>
      </footer>
    </div>
  );
}
