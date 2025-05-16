// app/projects/[id]/team/page.jsx
'use client';
import {
  Terminal,
  Users,
  GitBranch,
  CheckCircle,
  Mail,
  Github,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function TeamPage({ params }) {
  // Mock data - replace with actual data fetching
  const team = {
    projectId: params.id,
    projectName: 'AI Code Review Tool',
    members: [
      {
        id: 'user1',
        name: 'Alex Johnson',
        role: 'Frontend Developer',
        skills: ['React', 'TypeScript'],
        joined: '2 weeks ago',
        email: 'alex@example.com',
        github: 'alexjohnson',
      },
      // Add more team members...
    ],
    currentUser: {
      id: 'current-user',
      name: 'You',
      role: 'ML Engineer',
      skills: ['Python', 'TensorFlow'],
      joined: 'Just now',
      email: 'your@email.com',
      github: 'yourusername',
    },
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href={`/projects/${params.id}`}
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Project
            </Link>
          </div>
        </div>
      </div>

      {/* Team Header */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-center space-x-3 mb-6'>
          <Users className='w-8 h-8 text-emerald-400' />
          <h1 className='text-2xl font-bold text-gray-100'>
            {team.projectName} Team
          </h1>
        </div>

        {/* Team Members */}
        <div className='space-y-4'>
          {/* Current User (New Member) */}
          <div className='bg-emerald-900/20 border border-emerald-400/30 rounded-xl p-5'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='flex items-center space-x-3 mb-2'>
                  <h2 className='text-lg font-semibold text-emerald-400'>
                    {team.currentUser.name}
                  </h2>
                  <span className='text-xs bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full'>
                    New Member
                  </span>
                </div>
                <p className='text-gray-400 mb-3'>{team.currentUser.role}</p>
                <div className='flex flex-wrap gap-2 mb-3'>
                  {team.currentUser.skills.map((skill) => (
                    <span
                      key={skill}
                      className='text-xs bg-gray-900 text-emerald-400 px-2 py-1 rounded'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className='text-sm text-gray-500'>
                  Joined {team.currentUser.joined}
                </p>
              </div>
              <div className='flex space-x-3'>
                <a
                  href={`mailto:${team.currentUser.email}`}
                  className='text-gray-400 hover:text-emerald-400 transition-colors'
                >
                  <Mail className='w-5 h-5' />
                </a>
                <a
                  href={`https://github.com/${team.currentUser.github}`}
                  target='_blank'
                  className='text-gray-400 hover:text-emerald-400 transition-colors'
                >
                  <Github className='w-5 h-5' />
                </a>
              </div>
            </div>
          </div>

          {/* Existing Team Members */}
          {team.members.map((member) => (
            <div
              key={member.id}
              className='bg-gray-800/50 border border-gray-700 rounded-xl p-5'
            >
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-100 mb-2'>
                    {member.name}
                  </h2>
                  <p className='text-gray-400 mb-3'>{member.role}</p>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className='text-xs bg-gray-900 text-emerald-400 px-2 py-1 rounded'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className='text-sm text-gray-500'>
                    Joined {member.joined}
                  </p>
                </div>
                <div className='flex space-x-3'>
                  <a
                    href={`mailto:${member.email}`}
                    className='text-gray-400 hover:text-emerald-400 transition-colors'
                  >
                    <Mail className='w-5 h-5' />
                  </a>
                  <a
                    href={`https://github.com/${member.github}`}
                    target='_blank'
                    className='text-gray-400 hover:text-emerald-400 transition-colors'
                  >
                    <Github className='w-5 h-5' />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
