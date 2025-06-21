'use client';

import { X, GitBranch, Github, Plus, Cpu, Users, Text } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { saveProject } from '@/app/actions/saveProject';

interface NewProjectModalProps {
  show: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export function NewProjectModal({
  show,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    tech_stack: [] as string[],
    roles_needed: [] as string[],
  });
  const [techInput, setTechInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTech = () => {
    if (techInput && !formData.tech_stack.includes(techInput)) {
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, techInput],
      });
      setTechInput('');
    }
  };

  const handleAddRole = () => {
    if (roleInput && !formData.roles_needed.includes(roleInput)) {
      setFormData({
        ...formData,
        roles_needed: [...formData.roles_needed, roleInput],
      });
      setRoleInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((t) => t !== tech),
    });
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      roles_needed: formData.roles_needed.filter((r) => r !== role),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.tech_stack.length === 0) {
        throw new Error('Please add at least one technology');
      }

      // Use the server action instead of direct Supabase call
      await saveProject(formData);

      toast.success('Project created successfully!');
      setFormData({
        title: '',
        description: '',
        github_url: '',
        tech_stack: [],
        roles_needed: [],
      });
      onProjectCreated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Add this class to hide scrollbars */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto'
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className='bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl relative my-8 max-h-[90vh] overflow-y-auto'
            >
              <button
                onClick={onClose}
                className='absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10'
              >
                <X className='w-6 h-6' />
              </button>

              <div className='p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <GitBranch className='w-6 h-6 text-emerald-400' />
                  <h2 className='text-2xl font-bold text-gray-100'>
                    Create New Project
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Project Name */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      Project Name*
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <GitBranch className='h-5 w-5 text-gray-500' />
                      </div>
                      <input
                        type='text'
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder='My Awesome Project'
                        className='w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      Description*
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none'>
                        <Text className='h-5 w-5 text-gray-500' />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder='Describe your project...'
                        rows={4}
                        className='w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                      />
                    </div>
                  </div>

                  {/* GitHub Repo */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      GitHub Repository*
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Github className='h-5 w-5 text-gray-500' />
                      </div>
                      <input
                        type='url'
                        value={formData.github_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            github_url: e.target.value,
                          })
                        }
                        placeholder='https://github.com/username/repo'
                        className='w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                      />
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      Tech Stack*
                    </label>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {formData.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center bg-gray-700 text-emerald-400 text-xs px-2 py-1 rounded'
                        >
                          {tech}
                          <button
                            type='button'
                            onClick={() => removeTech(tech)}
                            className='ml-1 text-gray-300 hover:text-white'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className='flex'>
                      <div className='relative flex-grow'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Cpu className='h-5 w-5 text-gray-500' />
                        </div>
                        <input
                          type='text'
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), handleAddTech())
                          }
                          placeholder='Add technology (e.g. React, Node.js)'
                          className='w-full bg-gray-700 border border-gray-600 rounded-l-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={handleAddTech}
                        className='bg-gray-700 border border-l-0 border-gray-600 text-emerald-400 px-3 rounded-r-lg hover:bg-gray-600 transition-colors'
                      >
                        <Plus className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  {/* Roles Needed */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      Roles Needed*
                    </label>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {formData.roles_needed.map((role, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center bg-gray-700 text-cyan-400 text-xs px-2 py-1 rounded'
                        >
                          {role}
                          <button
                            type='button'
                            onClick={() => removeRole(role)}
                            className='ml-1 text-gray-300 hover:text-white'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className='flex'>
                      <div className='relative flex-grow'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Users className='h-5 w-5 text-gray-500' />
                        </div>
                        <input
                          type='text'
                          value={roleInput}
                          onChange={(e) => setRoleInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            (e.preventDefault(), handleAddRole())
                          }
                          placeholder='Add role (e.g. Frontend, Backend)'
                          className='w-full bg-gray-700 border border-gray-600 rounded-l-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={handleAddRole}
                        className='bg-gray-700 border border-l-0 border-gray-600 text-cyan-400 px-3 rounded-r-lg hover:bg-gray-600 transition-colors'
                      >
                        <Plus className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className='pt-4'>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                        isSubmitting
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90'
                      }`}
disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
