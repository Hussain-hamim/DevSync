'use client';

import { X, User, Globe, Linkedin, Twitter, FileText, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/updateProfile';

interface EditProfileModalProps {
  show: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
  initialData?: {
    name?: string;
    bio?: string;
    username?: string;
    avatar_url?: string;
    portfolio_url?: string;
    social_links?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

export function EditProfileModal({
  show,
  onClose,
  onProfileUpdated,
  initialData,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    username: '',
    avatar_url: '',
    portfolio_url: '',
    twitter: '',
    linkedin: '',
    website: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (show && initialData) {
      setFormData({
        name: initialData.name || '',
        bio: initialData.bio || '',
        username: initialData.username || '',
        avatar_url: initialData.avatar_url || '',
        portfolio_url: initialData.portfolio_url || '',
        twitter: initialData.social_links?.twitter || '',
        linkedin: initialData.social_links?.linkedin || '',
        website: initialData.social_links?.website || '',
      });
    }
  }, [show, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate name
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      // Prepare social links
      const social_links: {
        twitter?: string;
        linkedin?: string;
        website?: string;
      } = {};

      if (formData.twitter.trim()) {
        social_links.twitter = formData.twitter.trim();
      }
      if (formData.linkedin.trim()) {
        social_links.linkedin = formData.linkedin.trim();
      }
      if (formData.website.trim()) {
        social_links.website = formData.website.trim();
      }

      // Update profile
      await updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim() || null,
        username: formData.username.trim() || null,
        avatar_url: formData.avatar_url.trim() || null,
        portfolio_url: formData.portfolio_url.trim() || null,
        social_links: Object.keys(social_links).length > 0 ? social_links : null,
      });

      toast.success('Profile updated successfully!');
      onProfileUpdated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl relative my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Edit className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-gray-100">
                    Edit Profile
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Name*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Bio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Avatar URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="url"
                        name="avatar_url"
                        value={formData.avatar_url}
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                        placeholder="https://yourportfolio.com"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Social Links Section */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">
                      Social Links
                    </h3>

                    {/* Twitter */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Twitter
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Twitter className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/username"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="mb-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Linkedin className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Personal Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://yourwebsite.com"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                        isSubmitting
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 hover:opacity-90'
                      }`}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
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

