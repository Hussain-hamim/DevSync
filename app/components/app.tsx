import {
  Code,
  GitBranch,
  Users,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  BarChart2,
  Github,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans'>
      {/* Modern Glass Navbar */}
      <header className='sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-blue-100'>
        <div className='container mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <Code className='w-6 h-6 text-blue-600' />
            <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'>
              DevSync
            </span>
          </div>

          <nav className='hidden md:flex items-center space-x-8'>
            <a
              href='#'
              className='text-blue-900 hover:text-blue-600 transition-colors font-medium'
            >
              Features
            </a>
            <a
              href='#'
              className='text-blue-900 hover:text-blue-600 transition-colors font-medium'
            >
              How It Works
            </a>
            <a
              href='#'
              className='text-blue-900 hover:text-blue-600 transition-colors font-medium'
            >
              Explore Projects
            </a>
            <a
              href='#'
              className='text-blue-900 hover:text-blue-600 transition-colors font-medium'
            >
              For Teams
            </a>
          </nav>

          <div className='flex items-center space-x-4'>
            <a href='#' className='text-blue-600 font-medium hover:underline'>
              Sign In
            </a>
            <a
              href='#'
              className='bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all hover:opacity-90'
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Floating Elements */}
      <section className='relative overflow-hidden pt-24 pb-32'>
        <div className='absolute top-0 left-0 w-full h-full opacity-10'>
          <div className='absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30'></div>
          <div className='absolute bottom-10 right-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20'></div>
        </div>

        <div className='container mx-auto px-6 relative z-10'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight'>
              <span className='bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'>
                Build Together,
              </span>
              <br />
              Ship Faster
            </h1>

            <p className='text-xl text-slate-600 mb-10 max-w-2xl mx-auto'>
              The developer platform where coders connect, collaborate, and
              create amazing projects as teams.
            </p>

            <div className='flex flex-col sm:flex-row justify-center gap-4'>
              <a
                href='#'
                className='bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 group'
              >
                <span>Find Your Team</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </a>

              <a
                href='#'
                className='bg-white text-blue-600 border border-blue-200 px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2'
              >
                <Github className='w-5 h-5' />
                <span>Continue with GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <div className='py-12 bg-white/50 backdrop-blur-sm border-y border-blue-100'>
        <div className='container mx-auto px-6'>
          <p className='text-center text-slate-500 mb-8'>
            Trusted by developers at
          </p>
          <div className='flex flex-wrap justify-center gap-x-12 gap-y-6 items-center opacity-70'>
            <span className='text-2xl font-bold text-slate-700'>Vercel</span>
            <span className='text-2xl font-bold text-slate-700'>Stripe</span>
            <span className='text-2xl font-bold text-slate-700'>Notion</span>
            <span className='text-2xl font-bold text-slate-700'>MongoDB</span>
            <span className='text-2xl font-bold text-slate-700'>Tailwind</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-6'>
          <div className='max-w-3xl mx-auto text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
              Developer Collaboration{' '}
              <span className='text-blue-600'>Reimagined</span>
            </h2>
            <p className='text-lg text-slate-600'>
              Everything you need to find the perfect team and build projects
              together
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: <Users className='w-8 h-8 text-blue-600' />,
                title: 'Smart Team Matching',
                desc: 'Our AI suggests ideal teammates based on your skills and project needs.',
                color: 'bg-blue-50',
              },
              {
                icon: <GitBranch className='w-8 h-8 text-blue-600' />,
                title: 'Project Roles',
                desc: 'Clearly defined roles so everyone knows their responsibilities.',
                color: 'bg-blue-50',
              },
              {
                icon: <LayoutDashboard className='w-8 h-8 text-blue-600' />,
                title: 'Progress Dashboard',
                desc: 'Track milestones, tasks, and team contributions in one place.',
                color: 'bg-blue-50',
              },
              {
                icon: <MessageSquare className='w-8 h-8 text-blue-600' />,
                title: 'Built-in Chat',
                desc: 'Discuss ideas and coordinate without leaving the platform.',
                color: 'bg-blue-50',
              },
              {
                icon: <Sparkles className='w-8 h-8 text-blue-600' />,
                title: 'AI Assistant',
                desc: 'Get project suggestions and code improvement recommendations.',
                color: 'bg-blue-50',
              },
              {
                icon: <BarChart2 className='w-8 h-8 text-blue-600' />,
                title: 'Activity Analytics',
                desc: "See your team's productivity metrics and growth over time.",
                color: 'bg-blue-50',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-6 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all hover:-translate-y-1`}
              >
                <div className='w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-semibold text-slate-800 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-slate-600'>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-20 bg-gradient-to-br from-blue-50 to-indigo-50'>
        <div className='container mx-auto px-6'>
          <div className='max-w-3xl mx-auto text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
              How <span className='text-blue-600'>DevSync</span> Works
            </h2>
            <p className='text-lg text-slate-600'>
              Get started in minutes and find your perfect developer team
            </p>
          </div>

          <div className='grid md:grid-cols-4 gap-8'>
            {[
              {
                step: '1',
                title: 'Create Profile',
                desc: 'Highlight your skills and preferred roles',
              },
              {
                step: '2',
                title: 'Browse Projects',
                desc: 'Find exciting projects needing your skills',
              },
              {
                step: '3',
                title: 'Join Team',
                desc: 'Claim an open role that matches your expertise',
              },
              {
                step: '4',
                title: 'Build & Ship',
                desc: 'Collaborate and create something amazing',
              },
            ].map((item, index) => (
              <div
                key={index}
                className='bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4'>
                  {item.step}
                </div>
                <h3 className='text-xl font-semibold text-slate-800 mb-2'>
                  {item.title}
                </h3>
                <p className='text-slate-600'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white'>
        <div className='container mx-auto px-6'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-6'>
              Ready to build something amazing?
            </h2>
            <p className='text-xl text-blue-100 mb-10'>
              Join thousands of developers collaborating on DevSync today.
            </p>
            <a
              href='#'
              className='inline-block bg-white text-blue-600 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium hover:bg-blue-50'
            >
              Get Started for Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 text-white py-12'>
        <div className='container mx-auto px-6'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <Code className='w-6 h-6 text-blue-400' />
                <span className='text-xl font-bold'>DevSync</span>
              </div>
              <p className='text-slate-400'>
                The developer collaboration platform for building projects
                together.
              </p>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-4'>Product</h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-4'>Resources</h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-4'>Company</h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-slate-400 hover:text-white transition-colors'
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center'>
            <p className='text-slate-500'>
              © 2023 DevSync. All rights reserved.
            </p>
            <div className='flex space-x-6 mt-4 md:mt-0'>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition-colors'
              >
                Twitter
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition-colors'
              >
                GitHub
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition-colors'
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
