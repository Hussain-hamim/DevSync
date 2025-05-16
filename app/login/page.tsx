'use client';
import { useState } from 'react';
import {
  Terminal,
  Github,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Redirect to dashboard or handle login
        console.log('Login successful');
      }, 1500);
    }
  };

  if (session) {
    window.location.href = '/'; // or use router.push('/')
    return null;
  }

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Request additional GitHub permissions
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <Terminal className='w-10 h-10 text-emerald-400' />
          </div>
          <h1 className='text-2xl font-bold text-gray-100 mb-2'>
            Welcome back to <span className='text-emerald-400'>DevSync</span>
          </h1>
          <p className='text-gray-400'>Collaborate on your next big project</p>
        </div>

        {/* Login Form */}
        <div className='bg-gray-800/70 rounded-xl border border-gray-700 p-8 shadow-lg'>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className='mb-6'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Email Address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-500' />
                </div>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-gray-700 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } text-gray-100 rounded-lg block w-full pl-10 p-2.5 focus:ring-2 ${
                    errors.email
                      ? 'focus:ring-red-500'
                      : 'focus:ring-emerald-500'
                  } focus:outline-none transition`}
                  placeholder='your@email.com'
                />
              </div>
              {errors.email && (
                <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className='mb-6'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-500' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-gray-700 border ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  } text-gray-100 rounded-lg block w-full pl-10 pr-10 p-2.5 focus:ring-2 ${
                    errors.password
                      ? 'focus:ring-red-500'
                      : 'focus:ring-emerald-500'
                  } focus:outline-none transition`}
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-300' />
                  ) : (
                    <Eye className='h-5 w-5 text-gray-400 hover:text-gray-300' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-500'>{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center'>
                <input
                  id='remember'
                  type='checkbox'
                  className='w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2'
                />
                <label
                  htmlFor='remember'
                  className='ml-2 text-sm text-gray-300'
                >
                  Remember me
                </label>
              </div>
              <a href='#' className='text-sm text-emerald-400 hover:underline'>
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-medium rounded-lg py-2.5 px-5 hover:opacity-90 transition-opacity flex items-center justify-center ${
                isLoading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                'Logging in...'
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className='w-5 h-5 ml-2' />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className='flex items-center my-6'>
            <div className='flex-grow border-t border-gray-700'></div>
            <span className='flex-shrink mx-4 text-gray-400 text-sm'>OR</span>
            <div className='flex-grow border-t border-gray-700'></div>
          </div>

          {/* Social Login */}
          <div className='space-y-3'>
            <button
              type='button'
              // onClick={() => signIn('github')}
              onClick={handleSignIn}
              className='w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg py-2.5 px-5 transition-colors flex items-center justify-center'
            >
              <Github className='w-5 h-5 mr-2' />
              Continue with GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-400'>
              New to DevSync?{' '}
              <a
                href='#'
                className='text-emerald-400 hover:underline font-medium'
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
