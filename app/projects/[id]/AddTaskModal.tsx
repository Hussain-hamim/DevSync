// components/AddTaskModal.tsx
'use client';

import {
  X,
  ChevronDown,
  Sparkles,
  Clock,
  AlertCircle,
  Check,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { saveTask } from '@/app/actions/saveTask';

interface AddTaskModalProps {
  projectName: string;
  projectMembers: { id: string; name: string }[];
  show: boolean;
  onClose: () => void;
  projectId: string;
  onTaskCreated: () => void;
}

export function AddTaskModal({
  projectName,
  projectMembers,
  show,
  onClose,
  projectId,
  onTaskCreated,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title) {
        throw new Error('Title is required');
      }

      await saveTask({
        ...formData,
        projectId,
      });

      toast.success('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        status: 'Not Started',
        priority: 'Medium',
        assignee: '',
        due_date: '',
      });
      onTaskCreated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create task'
      );
    } finally {
      setIsSubmitting(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Clock className='w-4 h-4 text-gray-400' />;
      case 'In Progress':
        return <AlertCircle className='w-4 h-4 text-amber-400' />;
      case 'Completed':
        return <Check className='w-4 h-4 text-green-400' />;
      case 'Blocked':
        return <X className='w-4 h-4 text-red-400' />;
      default:
        return <Clock className='w-4 h-4 text-gray-400' />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-amber-400';
      case 'High':
        return 'text-red-400';
      case 'Critical':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className='bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg relative'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-200'
            >
              <X className='w-6 h-6' />
            </button>

            <div className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Sparkles className='w-5 h-5 text-emerald-400' />
                <h2 className='text-2xl font-bold text-gray-100'>
                  Add New Task
                </h2>
              </div>
              <p className='text-gray-400 mb-6'>
                Add task to{' '}
                <span className='text-emerald-400'>{projectName}</span>
              </p>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Task Title */}
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
                    className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                    placeholder='Enter task title'
                  />
                </div>

                {/* Description */}
                <div>
                  <label className='block text-gray-300 text-sm font-medium mb-2'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors min-h-[100px]'
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
                        className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 transition-colors'
                      >
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(formData.status)}
                          {formData.status}
                        </div>
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
                              className={`w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center gap-2 ${
                                formData.status === option
                                  ? 'text-emerald-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              {getStatusIcon(option)}
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
                        className={`w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 ${getPriorityColor(
                          formData.priority
                        )} hover:border-emerald-400 transition-colors`}
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
                                  : getPriorityColor(option)
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
                        className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 hover:border-emerald-400 transition-colors'
                      >
                        {formData.assignee ? (
                          <div className='flex items-center gap-2'>
                            <User className='w-4 h-4 text-gray-400' />
                            {projectMembers.find(
                              (m) => m.id === formData.assignee
                            )?.name || 'Unassigned'}
                          </div>
                        ) : (
                          'Select member'
                        )}
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
                          <button
                            type='button'
                            onClick={() => handleSelect('assignee', '')}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                              !formData.assignee
                                ? 'text-emerald-400'
                                : 'text-gray-300'
                            }`}
                          >
                            Unassigned
                          </button>
                          {projectMembers.map((member) => (
                            <button
                              key={member.id}
                              type='button'
                              onClick={() =>
                                handleSelect('assignee', member.id)
                              }
                              className={`w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center gap-2 ${
                                formData.assignee === member.id
                                  ? 'text-emerald-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              <User className='w-4 h-4 text-gray-400' />
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
                      className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors'
                    />
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
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
