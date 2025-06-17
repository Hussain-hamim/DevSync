import { motion } from 'framer-motion';
import Image from 'next/image';
import { GithubProfile, SocialLink } from '@/types/profile';

const ProfileHeader = ({
  profile,
  socialLinks,
  commitsCount,
}: {
  profile: GithubProfile;
  socialLinks: SocialLink[];
  commitsCount: number;
}) => {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='flex flex-col md:flex-row gap-8 mb-12'
    >
      <div className='relative self-start'>
        <div className='relative w-32 h-32'>
          <Image
            src={profile.avatar_url}
            alt={profile.name}
            width={128}
            height={128}
            className='w-full h-full rounded-full object-cover border-2 border-emerald-400/30'
          />
          <motion.div
            className='absolute bottom-3 right-1 z-10'
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className='relative'>
              <div className='w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-800'></div>
              <motion.div
                className='absolute inset-0 rounded-full bg-emerald-500 opacity-30'
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className='flex-1'>
        <h1 className='text-3xl font-bold mb-2'>{profile.name}</h1>
        <p className='text-gray-400 mb-4 max-w-2xl'>
          {profile.bio || 'No bio available'}
        </p>

        <div className='flex flex-wrap gap-3 mb-6'>
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.url}
              target='_blank'
              rel='noopener noreferrer'
              whileHover={{ y: -2 }}
              className={`flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm ${social.color} transition-colors`}
            >
              <social.icon className='w-4 h-4' />
              <span>{social.username}</span>
            </motion.a>
          ))}
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <StatCard
            label='Repositories'
            value={profile.public_repos}
            color='text-emerald-400'
          />
          <StatCard
            label='Total Contributions'
            value={commitsCount}
            color='text-cyan-400'
          />
          <StatCard
            label='Stars'
            value={profile.public_repos} // This should be actual stars count
            color='text-purple-400'
          />
          <StatCard
            label='Member since'
            value={joinDate}
            color='text-yellow-400'
            isDate
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({
  label,
  value,
  color,
  isDate = false,
}: {
  label: string;
  value: string | number;
  color: string;
  isDate?: boolean;
}) => (
  <div className='bg-gray-800/50 p-4 rounded-lg border border-gray-700'>
    <div className='text-sm text-gray-400 mb-1'>{label}</div>
    <div className={`${isDate ? 'text-xl' : 'text-2xl'} font-bold ${color}`}>
      {value}
    </div>
  </div>
);

export default ProfileHeader;
