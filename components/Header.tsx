'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import MyDropdownMenu from './DropdownMenu';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

const Header = () => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      console.log(data);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: 'spring', damping: 20 }}
          className={`fixed top-0 left-1\/2 transform -translate-x-1\/2 w-full  rounded-3xl z-50 bg-gray-800/90 backdrop-blur-md border-b border-gray-700`}
        >
          <div className='container mx-auto px-6 py-3 flex justify-between items-center'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='flex items-center space-x-2'
            >
              <Terminal className='w-5 h-5 text-emerald-400' />
              <span className='text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
                <Link href='/'>DevSync</Link>
              </span>
            </motion.div>

            <nav className='hidden md:flex items-center space-x-6'>
              {['Projects', 'Teams', 'Rankings'].map((item, index) => (
                <motion.a
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  href={'/' + item.toLowerCase()}
                  className='text-gray-300 hover:text-emerald-400 transition-colors text-sm'
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className='flex items-center space-x-3'
            >
              <MyDropdownMenu />
            </motion.div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
