'use client';
import {
  Terminal,
  Github,
} from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const { data: session } = useSession();

  if (session) {
    window.location.href = '/'; // or use router.push('/')
    return null;
  }

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

          {/* Social Login */}
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => signIn('github')}
              // onClick={handleSignIn}
              className='w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg py-2.5 px-5 transition-colors flex items-center justify-center'
            >
              <Github className='w-5 h-5 mr-2' />
              Continue with GitHub
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
