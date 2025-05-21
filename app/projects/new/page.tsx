'use client';
import React, { useState } from 'react';
import {
  Terminal,
  X,
  GitBranch,
  Text,
  Code,
  Cpu,
  Users,
  Plus,
} from 'lucide-react';
import { saveProject } from '@/app/actions/saveProject';
//////// ////// /// /// // /// /// /// /// ///  / ////// / /// /// // //// // /// /// /// // /////

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    tech_stack: [] as string[],
    roles_needed: [] as string[],
  });
  const [techInput, setTechInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  console.log('//////');

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await saveProject(formData);
      alert('Project saved successfully!');
      // Optionally redirect or reset form
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div className='flex items-center space-x-2'>
            <Terminal className='w-6 h-6 text-emerald-400' />
            <h1 className='text-2xl font-bold text-gray-100'>
              Create New Project
            </h1>
          </div>
          <a
            href='/projects'
            className='text-gray-400 hover:text-emerald-400 transition-colors'
          >
            <X className='w-6 h-6' />
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Project Name */}
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Project Name
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <GitBranch className='h-5 w-5 text-gray-500' />
              </div>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
                placeholder='My Awesome Project'
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Description
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none'>
                <Text className='h-5 w-5 text-gray-500' />
              </div>
              <textarea
                name='description'
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
                placeholder='Describe your project...'
                required
              />
            </div>
          </div>

          {/* GitHub Repo */}
          <div>
            <label
              htmlFor='github_url'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              GitHub Repository (Optional)
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Code className='h-5 w-5 text-gray-500' />
              </div>
              <input
                type='url'
                id='github_url'
                name='github_url'
                value={formData.github_url}
                onChange={(e) =>
                  setFormData({ ...formData, github_url: e.target.value })
                }
                className='bg-gray-800 border border-gray-700 text-gray-100 rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
                placeholder='https://github.com/username/repo'
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Tech Stack
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
                    e.key === 'Enter' && (e.preventDefault(), handleAddTech())
                  }
                  className='bg-gray-800 border border-gray-700 text-gray-100 rounded-l-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
                  placeholder='Add technology (e.g. React, Node.js)'
                />
              </div>
              <button
                type='button'
                onClick={handleAddTech}
                className='bg-gray-700 border border-l-0 border-gray-700 text-emerald-400 px-3 rounded-r-lg hover:bg-gray-600 transition-colors'
              >
                <Plus className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Roles Needed */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Roles Needed
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
                    e.key === 'Enter' && (e.preventDefault(), handleAddRole())
                  }
                  className='bg-gray-800 border border-gray-700 text-gray-100 rounded-l-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition'
                  placeholder='Add role (e.g. Frontend, Backend)'
                />
              </div>
              <button
                type='button'
                onClick={handleAddRole}
                className='bg-gray-700 border border-l-0 border-gray-700 text-cyan-400 px-3 rounded-r-lg hover:bg-gray-600 transition-colors'
              >
                <Plus className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-3 pt-6'>
            <a
              href='/projects'
              className='px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors'
            >
              Cancel
            </a>
            <button
              type='submit'
              className='bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity'
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
