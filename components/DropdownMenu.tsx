'use client';

import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/utils/dropDown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  User,
  CreditCard,
  Users,
  Zap,
  LogOut,
  Waves,
  HandHeart,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

const ProfileDropdown = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const truncateEmail = (email: string | null | undefined, maxLength = 24) => {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    return `${email.substring(0, maxLength - 3)}...`;
  };

  return (
    <RadixDropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'
        >
          {session ? (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <img
                  className='rounded-full w-8 h-8 object-cover border border-emerald-400/30'
                  src={session.user?.image || ''}
                  alt='Profile'
                />
              </motion.div>
              <div className='max-w-[120px] truncate'>
                {session?.user?.name}
              </div>
            </>
          ) : (
            <>
              <div className='w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-gray-900'>
                H
              </div>
              <div>Login</div>
            </>
          )}
          <motion.span
            animate={{ rotate: 180 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className='text-gray-400'
          >
            <ChevronDown className='w-4 h-4' />
          </motion.span>
        </motion.button>
      </DropdownMenuTrigger>

      <AnimatePresence>
        <DropdownMenuContent
          align='end'
          className='w-56 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden'
          asChild
          forceMount
        >
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
                scale: { duration: 0.25, ease: 'backOut' },
              },
            }}
            exit={{
              opacity: 0,
              y: -15,
              scale: 0.95,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            }}
          >
            <DropdownMenuLabel className='px-2 py-1.5 text-sm font-medium text-emerald-400 flex items-center gap-2'>
              <HandHeart className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>
                {/* {truncateEmail(session?.user?.email)} */}
                Hello {truncateEmail(session?.user?.name)}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-gray-700 h-[1px] my-1' />

            {[
              {
                icon: <User className='w-4 h-4 text-gray-400' />,
                label: 'Profile',
                path: '/profile',
              },
              {
                icon: <CreditCard className='w-4 h-4 text-gray-400' />,
                label: 'Projects',
                path: '/projects',
              },
              {
                icon: <Users className='w-4 h-4 text-gray-400' />,
                label: 'Teams',
                path: '/teams',
              },
              {
                icon: <Zap className='w-4 h-4 text-gray-400' />,
                label: 'Rankings',
                path: '/rankings',
              },
            ].map((item, index) => (
              <DropdownMenuItem
                key={index}
                className='px-2 py-1.5 text-sm rounded-md hover:bg-gray-700/50 hover:text-emerald-400 outline-none cursor-pointer transition-colors data-[highlighted]:bg-gray-700/50 data-[highlighted]:text-emerald-400'
                onClick={() => router.push(item.path)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className='flex items-center gap-2'
                >
                  {item.icon}
                  {item.label}
                </motion.div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className='bg-gray-700 h-[1px] my-1' />

            <DropdownMenuItem
              className='px-2 py-1.5 text-sm rounded-md hover:bg-rose-500/10 hover:text-rose-400 outline-none cursor-pointer transition-colors data-[highlighted]:bg-rose-500/10 data-[highlighted]:text-rose-400'
              onClick={() => signOut()}
            >
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className='flex items-center gap-2 text-rose-400'
              >
                <LogOut className='w-4 h-4' />
                <span>Log out</span>
              </motion.div>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </AnimatePresence>
    </RadixDropdownMenu>
  );
};

export default ProfileDropdown;
