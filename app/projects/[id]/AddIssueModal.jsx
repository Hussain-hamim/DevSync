'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  labels: z.string().optional(),
});

export function AddIssueModal({ projectId, show, onClose, onIssueCreated }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: 'Medium',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const labels = data.labels
        ? data.labels.split(',').map((l) => l.trim())
        : [];

      const { data: issue, error } = await supabase
        .from('issues')
        .insert([
          {
            project_id: projectId,
            title: data.title,
            description: data.description,
            priority: data.priority,
            labels,
            status: 'Open',
          },
        ])
        .select();

      if (error) throw error;

      onIssueCreated(issue[0]);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm  flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-800 rounded-xl max-w-lg w-full p-6 border border-gray-700'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-gray-100'>
            Report New Issue
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-200'
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Title*
            </label>
            <input
              {...register('title')}
              type='text'
              className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500'
              placeholder='Brief description of the issue'
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-1'>
              Description*
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500'
              placeholder='Detailed explanation of the issue...'
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-400'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Priority*
              </label>
              <select
                {...register('priority')}
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500'
              >
                <option value='Low'>Low</option>
                <option value='Medium'>Medium</option>
                <option value='High'>High</option>
                <option value='Critical'>Critical</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-1'>
                Labels
              </label>
              <input
                {...register('labels')}
                type='text'
                className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500'
                placeholder='bug,feature,ui (comma separated)'
              />
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-300 hover:text-gray-100 rounded-lg'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50'
            >
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
