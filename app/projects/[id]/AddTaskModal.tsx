// components/AddTaskModal.tsx
'use client';

import { X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AddTaskModalProps {
  projectName: string;
  projectMembers: { id: string; name: string }[];
  show: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: string;
    due_date: string;
  }) => void;
}

export function AddTaskModal({
  projectName,
  projectMembers,
  show,
  onClose,
  onSubmit,
}: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    assignee: '',
    due_date: '',
  });
  const [showDropdown, setShowDropdown] = useState({
    status: false,
    priority: false,
    assignee: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(formData);
    setIsSubmitting(false);
    setFormData({
      title: '',
      description: '',
      status: 'Not Started',
      priority: 'Medium',
      assignee: '',
      due_date: '',
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (
    type: 'status' | 'priority' | 'assignee',
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [type]: value }));
    setShowDropdown((prev) => ({ ...prev, [type]: false }));
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0  bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className='bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg relative'
          >
            <button
              onClick={onClose}
              className='absolute top-8 right-4 text-gray-400 hover:text-gray-200'
            >
              <X className='w-6 h-6' />
            </button>

            <div className='p-6'>
              <div className='flex items-center gap-2 mb-1'>
                <Sparkles className='w-5 h-5 text-emerald-400' />
                <h2 className='text-2xl font-bold text-gray-100'>
                  Add New Task
                </h2>
              </div>
              <p className='text-gray-400 mb-2'>
                Create a task for{' '}
                <span className='text-emerald-400'>{projectName}</span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className='space-y-4'>
                  {/* Title */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-2'>
                      Task Title*
                    </label>
                    <input
                      type='text'
                      name='title'
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 transition-colors'
                      placeholder='Enter task title'
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className='block text-gray-300 text-sm font-medium mb-1'>
                      Description
                    </label>
                    <textarea
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 transition-colors min-h-[100px]'
                      placeholder='Describe the task details...'
                    />
                  </div>

                  {/* Status & Priority Row */}
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Status */}
                    <div>
                      <label className='block text-gray-300 text-sm font-medium mb-2'>
                        Status
                      </label>
                      <div className='relative'>
                        <button
                          type='button'
                          onClick={() =>
                            setShowDropdown((prev) => ({
                              ...prev,
                              status: !prev.status,
                            }))
                          }
                          className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 transition-colors'
                        >
                          {formData.status}
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showDropdown.status ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {showDropdown.status && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg'
                          >
                            {statusOptions.map((option) => (
                              <button
                                key={option}
                                type='button'
                                onClick={() => handleSelect('status', option)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                                  formData.status === option
                                    ? 'text-emerald-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className='block text-gray-300 text-sm font-medium mb-2'>
                        Priority
                      </label>
                      <div className='relative'>
                        <button
                          type='button'
                          onClick={() =>
                            setShowDropdown((prev) => ({
                              ...prev,
                              priority: !prev.priority,
                            }))
                          }
                          className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 transition-colors'
                        >
                          {formData.priority}
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showDropdown.priority ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {showDropdown.priority && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg'
                          >
                            {priorityOptions.map((option) => (
                              <button
                                key={option}
                                type='button'
                                onClick={() => handleSelect('priority', option)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                                  formData.priority === option
                                    ? 'text-emerald-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assignee & Due Date Row */}
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Assignee */}
                    <div>
                      <label className='block text-gray-300 text-sm font-medium mb-2'>
                        Assign To
                      </label>
                      <div className='relative'>
                        <button
                          type='button'
                          onClick={() =>
                            setShowDropdown((prev) => ({
                              ...prev,
                              assignee: !prev.assignee,
                            }))
                          }
                          className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 transition-colors'
                        >
                          {formData.assignee || 'Select member'}
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showDropdown.assignee ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {showDropdown.assignee && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'
                          >
                            {projectMembers.map((member) => (
                              <button
                                key={member.id}
                                type='button'
                                onClick={() =>
                                  handleSelect('assignee', member.name)
                                }
                                className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                                  formData.assignee === member.name
                                    ? 'text-emerald-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                {member.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className='block text-gray-300 text-sm font-medium mb-2'>
                        Due Date
                      </label>
                      <input
                        type='date'
                        name='due_date'
                        value={formData.due_date}
                        onChange={handleChange}
                        className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 transition-colors'
                      />
                    </div>
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={!formData.title || isSubmitting}
                  className={`mt-3 w-full py-3 rounded-lg font-medium transition-colors ${
                    formData.title
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Creating Task...' : 'Create Task'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
