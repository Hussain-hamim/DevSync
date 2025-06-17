import { motion } from 'framer-motion';
import { Github, Code2, Cpu, ArrowRight } from 'lucide-react';
import { GithubData } from '@/types/profile';

const GithubStatsSection = ({ githubData }: { githubData: GithubData }) => (
  <div className='w-full md:w-80 space-y-8'>
    <GithubStatsCard githubData={githubData} />
    <SkillsCard skills={githubData.skills} />
  </div>
);

const GithubStatsCard = ({ githubData }: { githubData: GithubData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
  >
    <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
      <Github className='w-5 h-5 text-emerald-400' />
      GitHub Stats
    </h2>
    <div className='space-y-4'>
      <StatRow label='Followers' value={githubData.profile.followers} />
      <StatRow label='Following' value={githubData.profile.following} />
      <StatRow label='Total Forks' value={githubData.stats.forks} />
      <div className='pt-4'>
        <a
          href={`https://github.com/${githubData.profile.login}`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 text-cyan-400 hover:underline text-sm'
        >
          View on GitHub
          <ArrowRight className='w-4 h-4' />
        </a>
      </div>
    </div>
  </motion.div>
);

const SkillsCard = ({ skills }: { skills: string[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
  >
    <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
      <Code2 className='w-5 h-5 text-emerald-400' />
      Top Languages
    </h2>
    <div className='flex flex-wrap gap-2'>
      {skills.length > 0 ? (
        skills.map((skill, index) => (
          <motion.span
            key={index}
            whileHover={{ scale: 1.05 }}
            className='px-3 py-1.5 bg-gray-700 rounded-full text-sm flex items-center gap-1'
          >
            <Cpu className='w-3 h-3 text-emerald-400' />
            {skill}
          </motion.span>
        ))
      ) : (
        <span className='text-gray-400 text-sm'>
          No language data available
        </span>
      )}
    </div>
  </motion.div>
);

const StatRow = ({ label, value }: { label: string; value: number }) => (
  <div className='flex items-center justify-between'>
    <span className='text-gray-400'>{label}</span>
    <span className='font-medium'>{value}</span>
  </div>
);

export default GithubStatsSection;
