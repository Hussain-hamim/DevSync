import { motion } from 'framer-motion';
import { Zap, Star, GitFork } from 'lucide-react';
import { GithubRepo } from '@/types/profile';

const RecentReposSection = ({ repos }: { repos: GithubRepo[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className='bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-8'
  >
    <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
      <Zap className='w-5 h-5 text-emerald-400' />
      Recent Github Repositories
    </h2>
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {repos.length > 0 ? (
        repos.map((repo, index) => <RepoCard key={index} repo={repo} />)
      ) : (
        <span className='text-gray-400 text-sm'>No recent repositories</span>
      )}
    </div>
  </motion.div>
);

const RepoCard = ({ repo }: { repo: GithubRepo }) => (
  <div className='group'>
    <a
      href={repo.html_url}
      target='_blank'
      rel='noopener noreferrer'
      className='block hover:bg-gray-700/50 p-3 rounded transition-colors'
    >
      <div className='flex justify-between items-start'>
        <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
          {repo.name}
        </h3>
        <div className='flex items-center gap-2'>
          <span className='flex items-center gap-1 text-xs text-gray-400'>
            <Star className='w-3 h-3' />
            {repo.stargazers_count}
          </span>
          <span className='flex items-center gap-1 text-xs text-gray-400'>
            <GitFork className='w-3 h-3' />
            {repo.forks_count}
          </span>
        </div>
      </div>
      {repo.description && (
        <p className='text-sm text-gray-400 mt-1 line-clamp-2'>
          {repo.description}
        </p>
      )}
      {repo.language && (
        <span className='inline-block mt-2 text-xs bg-gray-900 px-2 py-1 rounded'>
          {repo.language}
        </span>
      )}
    </a>
  </div>
);

export default RecentReposSection;
