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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Header from '@/components/Header';
import { NewProjectModal } from './NewProjectModal';
import { toast } from 'sonner';
import { div } from 'framer-motion/client';

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      setLoading(false);

      if (error) {
        console.error('Failed to fetch projects:', error.message);
        return;
      }

      // Map Supabase data to your frontend format
      const mapped = data.map((proj) => ({
        id: proj.id,
        name: proj.title,
        description: proj.description,
        techStack: proj.tech_stack || [],
        teamSize: 4, // Optional: default or calculated
        views: 0, // Optional: if you don’t track views yet
        category: 'general', // You can infer or set this
      }));

      setProjects(mapped);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Error:', error);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
    // Optionally, you can show a success message
    toast.success('Project created successfully!');
    setShowNewProjectModal(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects
  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100'>
        <Header />
        <div className='container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]'>
          <div className='animate-pulse text-gray-400'>
            Loading projects data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen  bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      {/* <Header /> */}
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='mb-8 '
      >
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <Terminal className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100'>Projects</h1>
          </div>

          <motion.button
            onClick={() => setShowNewProjectModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            <span>Add New Project</span>
          </motion.button>
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
      {/* Featured Projects Section */}
      {projects.length > 0 && (
        <>
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mb-16'
          >
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-100 flex items-center gap-2'>
                <Star className='w-5 h-5 text-amber-400 fill-amber-400/20' />
                Featured Projects
              </h2>
              <div className='text-sm text-gray-400'>Latest &amp; Greatest</div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {projects.slice(0, 3).map((project, index) => {
                return project.id === '1ccf98f1-dacc-48d4-83c1-db56d7f57801' ? (
                  <motion.div
                    key={`featured-${project.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                    className='relative group'
                  >
                    {/* Glow effect */}
                    <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300 opacity-0 group-hover:opacity-70' />

                    <Link href={`/projects/${project.id}`}>
                      <div className='relative h-full bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-emerald-400/50'>
                        {/* Featured badge */}
                        <div className='absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 text-xs font-bold px-2 py-1 rounded-full z-10'>
                          Featured
                        </div>

                        {/* Project image */}
                        <div className='relative h-40 overflow-hidden'>
                          <img
                            src={techImages[index % techImages.length]}
                            alt={project.name}
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                            loading='lazy'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent' />
                        </div>

                        {/* Project content */}
                        <div className='p-6'>
                          <div className='mb-4'>
                            <GitBranch className='w-6 h-6 text-emerald-400 mb-2' />
                            <h3 className='text-lg font-bold text-gray-100 mb-1'>
                              {project.name}
                            </h3>
                            <p className='text-gray-400 text-sm line-clamp-2'>
                              {project.description}
                            </p>
                          </div>

                          <div className='mt-auto'>
                            <div className='flex flex-wrap gap-2 mb-4'>
                              {project.techStack.slice(0, 3).map((tech) => (
                                <TechTag key={tech} tech={tech} />
                              ))}
                            </div>

                            <div className='flex justify-between items-center text-sm text-gray-400'>
                              <div className='flex items-center gap-1'>
                                <Users className='w-4 h-4' />
                                <span>{project.teamSize}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Eye className='w-4 h-4' />
                                <span>{project.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : null;
              })}
            </div>

            {/* Sleek separator */}
            <div className='relative mb-16'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-700'></div>
              </div>
              <div className='relative flex justify-center'>
                <span className='bg-gray-800 px-4 text-sm text-gray-400 flex items-center gap-2'>
                  <Code className='w-4 h-4 text-emerald-400' />
                  All Projects
                </span>
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/*  */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex  flex-col items-center justify-center py-12 text-center'
        >
          <Code className='w-12 h-12 text-gray-600 mb-4' />
          <h3 className='text-xl font-medium text-gray-300 mb-2'>
            No projects found
          </h3>
          <p className='text-gray-500 max-w-md'>
            There are currently no public projects available
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProjectModal(true)}
            className='mt-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-6 py-2 rounded-lg font-medium flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            <span>Create First Project</span>
          </motion.button>
        </motion.div>
      )}
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

                {/* Project Image */}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className='relative w-full h-40 mb-4 rounded-lg overflow-hidden'
                >
                  <img
                    src={
                      techImages[project.id.charCodeAt(0) % techImages.length]
                    }
                    alt={project.title}
                    className='w-full h-full object-cover'
                    loading='lazy'
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/${project.id}/400/300?grayscale`;
                    }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent' />
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
      {/* New Project Modal */}
      <NewProjectModal
        show={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
      {/* Floating Create Button */}
      <Link href='/projects/new'>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 p-3 rounded-full shadow-xl'
        >
          <Plus className='w-6 h-6' />
        </motion.div>
      </Link>
    </div>
  );
}

const techImages = [
  // Original working images
  'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // Coding
  'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // React
  'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // Developer

  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // JavaScript
  'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // Macbook Code

  // 10 New reliable additions
  // 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // Developer Workspace
  // 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // Terminal Commands
  // 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&w=600&h=400&fit=crop', // React Components
];
