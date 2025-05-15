'use client';
import { useState } from 'react';
import {
  Terminal,
  Search,
  Filter,
  GitBranch,
  Star,
  Eye,
  Users,
  ChevronDown,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ProjectCard = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} passHref>
      <div className='bg-gray-800/60  hover:bg-gray-800/80 border border-gray-700 hover:border-emerald-400/30 rounded-xl p-5 transition-all cursor-pointer group h-full '>
        <div className='flex justify-between items-start mb-3'>
          <div className='flex items-center space-x-2'>
            <GitBranch className='w-5 h-5 text-emerald-400' />
            <h3 className='font-medium text-gray-100 group-hover:text-emerald-400 transition-colors'>
              {project.name}
            </h3>
          </div>
          <button className='text-gray-400 hover:text-emerald-400 p-1'>
            <Star className='w-4 h-4' />
          </button>
        </div>

        {/* Project Image */}
        <div className='relative w-full h-40 mb-4 rounded-lg overflow-hidden'>
          <Image
            src={project.imageUrl}
            alt={project.name}
            fill
            className='object-cover'
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          />
        </div>

        <p className='text-gray-400 text-sm mb-4 line-clamp-2'>
          {project.description}
        </p>

        <div className='flex flex-wrap gap-2 mb-4'>
          {project.techStack.map((tech, index) => (
            <span
              key={index}
              className='text-xs bg-gray-900/80 text-gray-300 px-2 py-1 rounded'
            >
              {tech}
            </span>
          ))}
        </div>

        <div className='flex justify-between items-center text-sm'>
          <div className='flex items-center space-x-2 text-gray-400'>
            <Users className='w-4 h-4' />
            <span>{project.teamSize} members</span>
          </div>
          <div className='flex items-center space-x-2 text-gray-400'>
            <Eye className='w-4 h-4' />
            <span>{project.views} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Updated projects with placeholder images
  const projects = [
    {
      id: 1,
      name: 'AI Code Review Tool',
      description:
        'An automated code review system using machine learning to detect bugs and suggest improvements.',
      techStack: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      teamSize: 4,
      views: 128,
      category: 'ai',
      imageUrl:
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 2,
      name: 'DevSync CLI',
      description:
        'Command line interface for managing DevSync projects and teams from terminal.',
      techStack: ['Rust', 'CLI', 'WebAssembly'],
      teamSize: 2,
      views: 86,
      category: 'tools',
      imageUrl:
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 3,
      name: '3D Code Visualizer',
      description:
        'Interactive 3D visualization of codebase architecture and dependencies.',
      techStack: ['Three.js', 'TypeScript', 'WebGL'],
      teamSize: 3,
      views: 154,
      category: 'web',
      imageUrl:
        'https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 4,
      name: 'Privacy-First Analytics',
      description: 'Open source analytics platform with zero data collection.',
      techStack: ['Go', 'PostgreSQL', 'Docker'],
      teamSize: 5,
      views: 92,
      category: 'devops',
      imageUrl:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' || project.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'web', name: 'Web Development' },
    { id: 'ai', name: 'AI/ML' },
    { id: 'devops', name: 'DevOps' },
    { id: 'tools', name: 'Developer Tools' },
  ];

  return (
    <div className='min-h-screen  bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 '>
      <div className='max-w-7xl mx-auto px-10'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div className='flex items-center space-x-2'>
            <Terminal className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100'>
              DevSync Projects
            </h1>
          </div>
          <Link
            href={'/projects/new'}
            className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2'
          >
            <Plus className='w-4 h-4' />
            <span>New Project</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-grow'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-5 w-5 text-gray-500' />
              </div>
              <input
                type='text'
                placeholder='Search projects...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
              />
            </div>

            <div className='relative'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 flex items-center space-x-2 hover:bg-gray-700 transition-colors'
              >
                <Filter className='w-5 h-5' />
                <span>Filter</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showFilters && (
                <div className='absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10'>
                  <div className='p-2'>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveFilter(category.id);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                          activeFilter === category.id
                            ? 'bg-gray-700 text-emerald-400'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active filter tag */}
          {activeFilter !== 'all' && (
            <div className='mt-3 flex items-center space-x-2'>
              <span className='text-sm text-gray-400'>Filtering by:</span>
              <span className='text-sm bg-gray-700 text-emerald-400 px-2 py-1 rounded'>
                {categories.find((c) => c.id === activeFilter)?.name}
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className='text-sm text-gray-400 hover:text-emerald-400'
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Projects Grid - Now 2 columns on desktop, 1 on mobile */}
        {filteredProjects.length > 0 ? (
          <div className=' grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className='bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 mb-4'>
              <Search className='h-6 w-6 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-300 mb-1'>
              No projects found
            </h3>
            <p className='text-gray-500'>
              {searchQuery
                ? 'Try a different search term'
                : 'No projects in this category'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className='mt-8 flex justify-center'>
            <nav className='flex items-center space-x-2'>
              <button className='px-3 py-1 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800'>
                Previous
              </button>
              <button className='px-3 py-1 rounded-md bg-gray-700 text-emerald-400'>
                1
              </button>
              <button className='px-3 py-1 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800'>
                2
              </button>
              <button className='px-3 py-1 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800'>
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
