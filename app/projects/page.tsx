// app/projects/page.jsx
'use client';
import { useState, useEffect } from 'react';
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
  Code,
  Code2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const TechTag = ({ tech }) => (
  <motion.span
    whileHover={{
      y: -2,
      boxShadow: '0 4px 8px rgba(16, 185, 129, 0.2)',
    }}
    className='text-xs bg-gray-900/80 text-emerald-400 px-2 py-1 rounded-full cursor-default'
  >
    {tech}
  </motion.span>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'AI Code Review',
      description: 'Automated code quality analysis using machine learning',
      techStack: ['Python', 'TensorFlow', 'React'],
      teamSize: 4,
      views: 128,
      category: 'ai',
    },
    {
      id: 2,
      name: 'AI Code Review',
      description: 'Automated code quality analysis using machine learning',
      techStack: ['Python', 'TensorFlow', 'React'],
      teamSize: 4,
      views: 128,
      category: 'ai',
    },
    {
      id: 3,
      name: 'AI Code Review',
      description: 'Automated code quality analysis using machine learning',
      techStack: ['Python', 'TensorFlow', 'React'],
      teamSize: 4,
      views: 128,
      category: 'ai',
    },
    {
      id: 4,
      name: 'AI Code Review',
      description: 'Automated code quality analysis using machine learning',
      techStack: ['Python', 'TensorFlow', 'React'],
      teamSize: 4,
      views: 128,
      category: 'ai',
    },
    // ... other projects with categories
  ]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter projects
  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  // Simulate view increments
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          views: p.views + Math.floor(Math.random() * 3),
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='mb-8'
      >
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <Terminal className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100'>Projects</h1>
          </div>
          <Link
            href='/projects/new'
            // className='hidden md:flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors'
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              <span>New Project</span>
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex gap-4 mb-8'
      >
        <div className='relative flex-grow'>
          <motion.div
            animate={{
              x: [0, 2, -2, 0],
              transition: { duration: 3, repeat: Infinity },
            }}
            className='absolute left-3 top-1/2 transform -translate-y-1/2'
          >
            <Search className='w-5 h-5 text-gray-500' />
          </motion.div>
          <input
            type='text'
            placeholder='Search projects...'
            className='w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
          />
        </div>

        <div className='relative'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 flex items-center gap-2'
          >
            <Filter className='w-5 h-5' />
            <span>Filter</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </motion.button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10'
            >
              {['all', 'web', 'ai', 'devops', 'tools'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    activeFilter === filter
                      ? 'bg-gray-700 text-emerald-400'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'all'
                    ? 'All Projects'
                    : filter === 'web'
                    ? 'Web Development'
                    : filter === 'ai'
                    ? 'AI/ML'
                    : filter === 'devops'
                    ? 'DevOps'
                    : 'Developer Tools'}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      >
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className='block'
            >
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{
                  y: -1,
                  boxShadow: '0 2px 5px rgba(16, 185, 129, 0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className='bg-gray-800/60 border border-gray-700 rounded-xl p-5 overflow-hidden hover:border-emerald-400/30 transition-colors'
              >
                {/* Project Header */}
                <div className='flex justify-between items-start mb-4'>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className='flex items-center gap-2'
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <GitBranch className='w-5 h-5 text-emerald-400' />
                    </motion.div>
                    <h3 className='font-medium text-gray-100'>
                      {project.name}
                    </h3>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className='text-gray-400 hover:text-amber-400'
                  >
                    <Star className='w-4 h-4' />
                  </motion.button>
                </div>

                {/* Project Image Placeholder */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className='relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800'
                >
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Code className='w-12 h-12 text-gray-700' />
                  </div>
                </motion.div>

                {/* Description */}
                <motion.p
                  whileHover={{ x: 2 }}
                  className='text-gray-400 text-sm mb-4 line-clamp-2'
                >
                  {project.description}
                </motion.p>

                {/* Tech Stack */}
                <motion.div className='flex flex-wrap gap-2 mb-4' layout>
                  {project.techStack.map((tech) => (
                    <TechTag key={tech} tech={tech} />
                  ))}
                </motion.div>

                {/* Footer */}
                <div className='flex justify-between items-center text-sm'>
                  <motion.div
                    className='flex items-center gap-2 text-gray-400'
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className='w-4 h-4' />
                    <span>{project.teamSize} members</span>
                  </motion.div>

                  <motion.div className='flex items-center gap-2 text-gray-400'>
                    <Eye className='w-4 h-4' />
                    <span>{project.views}</span>
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Floating Create Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className='fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 p-3 rounded-full shadow-xl'
      >
        <Plus className='w-6 h-6' />
      </motion.div>
    </div>
  );
}
