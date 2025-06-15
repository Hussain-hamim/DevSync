import { useScroll, useTransform, motion } from 'framer-motion';
import { Code, GitMerge, CpuIcon, Zap, Terminal, Server } from 'lucide-react';
import React, { useRef } from 'react';

const FloatingElements = () => {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div>
      <motion.div
        style={{ y: yBg, opacity: opacityBg }}
        className='absolute inset-0 overflow-hidden pointer-events-none'
      >
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [0, -20, 0, 20, 0],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 8 + index,
              delay: element.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className='absolute'
            style={{ top: element.top, left: element.left }}
          >
            {element.icon}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const floatingElements = [
  {
    icon: <Code className='w-6 h-6 text-emerald-400' />,
    top: '15%',
    left: '10%',
    delay: 0.1,
  },
  {
    icon: <GitMerge className='w-6 h-6 text-cyan-400' />,
    top: '25%',
    left: '85%',
    delay: 0.3,
  },
  {
    icon: <Server className='w-6 h-6 text-purple-400' />,
    top: '75%',
    left: '15%',
    delay: 0.5,
  },
  {
    icon: <CpuIcon className='w-6 h-6 text-yellow-400' />,
    top: '65%',
    left: '80%',
    delay: 0.7,
  },
  {
    icon: <Zap className='w-6 h-6 text-pink-400' />,
    top: '40%',
    left: '25%',
    delay: 0.2,
  },
  {
    icon: <Terminal className='w-6 h-6 text-blue-400' />,
    top: '50%',
    left: '70%',
    delay: 0.4,
  },
];

export default FloatingElements;
