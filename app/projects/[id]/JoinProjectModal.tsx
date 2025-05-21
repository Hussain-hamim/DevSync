// components/JoinProjectModal.tsx
'use client';

import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface JoinProjectModalProps {
  projectName: string;
  rolesNeeded: string[];
  show: boolean;
  onClose: () => void;
  onSubmit: (role: string, message: string) => void;
}

export function JoinProjectModal({
  projectName,
  rolesNeeded,
  show,
  onClose,
  onSubmit,
}: JoinProjectModalProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(selectedRole, message);
    // Reset form after submission if needed
    setIsSubmitting(false);
    setSelectedRole('');
    setMessage('');
    onClose();
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className='bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md relative'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-200'
            >
              <X className='w-6 h-6' />
            </button>

            <div className='p-6'>
              <h2 className='text-2xl font-bold text-gray-100 mb-2'>
                Join Project
              </h2>
              <p className='text-gray-400 mb-6'>
                Request to join
                <span className='text-pink-300'> {projectName}</span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                  <label className='block text-gray-300 text-sm font-medium mb-2'>
                    Select Role
                  </label>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                      className='w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 transition-colors'
                    >
                      {selectedRole || 'Choose a role'}
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showRoleDropdown ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showRoleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg'
                      >
                        {rolesNeeded.map((role) => (
                          <button
                            key={role}
                            type='button'
                            onClick={() => {
                              setSelectedRole(role);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-600 ${
                              selectedRole === role
                                ? 'text-emerald-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className='mb-6'>
                  <label className='block text-gray-300 text-sm font-medium mb-2'>
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Tell the team why you want to join and your relevant experience...'
                    className='w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 hover:border-emerald-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors min-h-[120px]'
                  />
                </div>

                <button
                  type='submit'
                  disabled={!selectedRole || isSubmitting}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedRole
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Sending Request...' : 'Send Join Request'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
