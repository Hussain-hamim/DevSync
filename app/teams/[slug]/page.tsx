// app/teams/[id]/page.tsx
'use client';
import {
  Users,
  Calendar,
  Github,
  ArrowLeft,
  Star,
  Plus,
  GitBranch,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(calendar);

// Type definitions
interface Team {
  id: string;
  name: string;
  description?: string;
  github_url?: string;
  created_at: string;
  starred?: boolean;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  views?: number;
  team_id: string;
}

interface TeamMember {
  id: string;
  role: string;
  name: string;
  avatar_url?: string;
}

interface TeamPosition {
  id: string;
  title: string;
  description?: string;
  skills_required?: string[];
}

// Dummy data
const dummyTeam: Team = {
  id: '1',
  name: 'Tech Innovators',
  description: 'We build cutting-edge solutions for modern problems. Our team specializes in React, Node.js, and cloud technologies. Join us to work on exciting projects that make a difference!',
  github_url: 'https://github.com/tech-innovators',
  created_at: '2023-01-15T10:00:00Z',
  starred: true
};

const dummyProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'A full-featured online shopping platform with AI recommendations',
    created_at: '2023-03-10T09:00:00Z',
    views: 1245,
    team_id: '1'
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Productivity app with team collaboration features',
    created_at: '2023-05-22T14:30:00Z',
    views: 876,
    team_id: '1'
  },
  {
    id: '3',
    title: 'Health Tracker',
    description: 'Mobile app for tracking fitness and nutrition goals',
    created_at: '2023-07-15T11:20:00Z',
    views: 532,
    team_id: '1'
  },
  {
    id: '4',
    title: 'AI Content Generator',
    description: 'Tool for generating marketing content using GPT models',
    created_at: '2023-09-01T16:45:00Z',
    views: 2103,
    team_id: '1'
  }
];

const dummyTeamMembers: TeamMember[] = [
  {
    id: '1',
    role: 'Team Lead',
    name: 'Alex Johnson',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    role: 'Frontend Developer',
    name: 'Sarah Williams',
    avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    role: 'Backend Developer',
    name: 'Michael Chen',
    avatar_url: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    id: '4',
    role: 'UI/UX Designer',
    name: 'Emily Rodriguez',
    avatar_url: 'https://randomuser.me/api/portraits/women/63.jpg'
  }
];

const dummyOpenPositions: TeamPosition[] = [
  {
    id: '1',
    title: 'DevOps Engineer',
    description: 'Looking for someone to help us with CI/CD pipelines and cloud infrastructure',
    skills_required: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
  },
  {
    id: '2',
    title: 'Mobile Developer',
    description: 'Help us build cross-platform mobile applications',
    skills_required: ['React Native', 'TypeScript', 'Firebase']
  }
];

export default function TeamDetails() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [openPositions, setOpenPositions] = useState<TeamPosition[]>([]);

  // Simulate data loading
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setTeam(dummyTeam);
      setTeamProjects(dummyProjects);
      setTeamMembers(dummyTeamMembers);
      setOpenPositions(dummyOpenPositions);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [params.id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>
            Loading team details...
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='text-gray-400'>Team not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
      {/* Header */}
      <div className='border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              href='/teams'
              className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back to Teams
            </Link>
            <button className='text-gray-400 hover:text-emerald-400 transition-colors'>
              <Star
                className={`w-5 h-5 ${
                  team.starred ? 'fill-emerald-400 text-emerald-400' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Team Header */}
      <div className='container mx-auto px-6 py-8'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center space-x-3 mb-4'>
              <Users className='w-6 h-6 text-emerald-400' />
              <h1 className='text-2xl md:text-3xl font-bold text-gray-100'>
                {team.name}
              </h1>
            </div>

            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6'>
              <div className='flex items-center space-x-1'>
                <Users className='w-4 h-4' />
                <span>{teamMembers.length} members</span>
              </div>

              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>Created {dayjs(team.created_at).fromNow()}</span>
              </div>

              <div className='flex items-center space-x-1'>
                <GitBranch className='w-4 h-4' />
                <span>{teamProjects.length} projects</span>
              </div>
            </div>
          </div>

          {openPositions.length > 0 && (
            <button className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'>
              Join Team
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              About This Team
            </h2>
            <div className='overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50'>
              <pre className='text-gray-400 whitespace-pre-wrap font-sans p-2'>
                {team.description}
              </pre>
            </div>
          </div>

          {/* Team Projects */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Team Projects
              </h2>
              <button className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'>
                View All
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {teamProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className='block group'
                >
                  <div className='bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-emerald-500/30 transition-colors'>
                    <div className='flex items-center gap-3 mb-3'>
                      <GitBranch className='w-5 h-5 text-emerald-400' />
                      <h3 className='font-medium text-gray-100 group-hover:text-emerald-400 transition-colors'>
                        {project.title}
                      </h3>
                    </div>
                    <p className='text-sm text-gray-400 line-clamp-2'>
                      {project.description}
                    </p>
                    <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                      <span>
                        {dayjs(project.created_at).format('MMM D, YYYY')}
                      </span>
                      <span>{project.views || 0} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Team Members */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Team Members
              </h2>
              <button className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'>
                View All
              </button>
            </div>

            <ul className='space-y-4'>
              {teamMembers.map((member) => (
                <li key={member.id} className='flex items-center gap-3'>
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden'>
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <span className='text-gray-300'>
                          {member.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-gray-100 font-medium truncate'>
                      {member.name}
                    </h3>
                    <p className='text-sm text-gray-400 truncate'>
                      {member.role}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Positions */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-100'>
                Open Positions
              </h2>
              {openPositions.length > 0 && (
                <button className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'>
                  Apply
                </button>
              )}
            </div>

            <ul className='space-y-3'>
              {openPositions.map((position) => (
                <li
                  key={position.id}
                  className='p-3 bg-gray-800/30 border border-gray-700 rounded-lg'
                >
                  <div className='flex items-start gap-3'>
                    <Briefcase className='w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0' />
                    <div>
                      <h3 className='text-gray-100 font-medium'>
                        {position.title}
                      </h3>
                      <p className='text-sm text-gray-400 mt-1'>
                        {position.description}
                      </p>
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {position.skills_required?.map((skill, i) => (
                          <span
                            key={i}
                            className='text-xs bg-gray-900/80 text-cyan-400 px-2 py-1 rounded-full'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Team Stats */}
          <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>
              Team Stats
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-emerald-400'>
                  {teamProjects.length}
                </div>
                <div className='text-sm text-gray-400'>Projects</div>
              </div>
              <div className='bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-amber-400'>
                  {openPositions.length}
                </div>
                <div className='text-sm text-gray-400'>Open Positions</div>
              </div>
              <div className='bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-purple-400'>
                  {teamMembers.length}
                </div>
                <div className='text-sm text-gray-400'>Members</div>
              </div>
              <div className='bg-gray-800/30 border border-gray-700 rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-blue-400'>
                  {dayjs(team.created_at).fromNow(true)}
                </div>
                <div className='text-sm text-gray-400'>Active</div>
              </div>
            </div>
          </div>

          {/* Team Links */}
          {team.github_url && (
            <div className='bg-gray-800/60 border border-gray-700 rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                Team Links
              </h2>
              <a
                href={team.github_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center text-emerald-400 hover:underline mb-3'
              >
                <Github className='w-5 h-5 mr-2' />
                GitHub Organization
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}