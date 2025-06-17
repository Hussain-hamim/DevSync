import { motion } from 'framer-motion';
import { Folder, Users } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types/profile';

const ProjectsSection = ({
  createdProjects,
  joinedProjects,
}: {
  createdProjects: Project[];
  joinedProjects: Project[];
}) => (
  <div className='flex-1 grid md:grid-cols-2 gap-8'>
    <ProjectsCard
      title='Created Projects'
      icon={Folder}
      projects={createdProjects}
    />
    <ProjectsCard
      title='Joined Projects'
      icon={Users}
      projects={joinedProjects}
      showRole
    />
  </div>
);

const ProjectsCard = ({
  title,
  icon: Icon,
  projects,
  showRole = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  projects: Project[];
  showRole?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className='bg-gray-800/50 p-6 rounded-xl border border-gray-700'
  >
    <h2 className='text-xl font-semibold mb-6 flex items-center gap-2'>
      <Icon className='w-5 h-5 text-emerald-400' />
      {title}
    </h2>
    <div className='space-y-4'>
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} showRole={showRole} />
      ))}
    </div>
  </motion.div>
);

const ProjectItem = ({
  project,
  showRole,
}: {
  project: Project;
  showRole: boolean;
}) => (
  <Link href={`/projects/${project.id}`} className='group'>
    <div className='group hover:bg-gray-700/50 p-3 rounded-lg transition-colors'>
      <div className='flex items-center gap-2 justify-between'>
        <h3 className='font-medium group-hover:text-emerald-400 transition-colors'>
          {project.title}
        </h3>
        {showRole && project.roleTitle && (
          <span className='text-xs bg-gray-900 px-2 py-1 rounded'>
            {project.roleTitle}
          </span>
        )}
      </div>
      <p className='text-sm text-gray-400 mt-1 max-h-16 line-clamp-2'>
        {project.description}
      </p>
      <div className='flex justify-between items-center mt-2'>
        <span className='flex items-center gap-1 text-xs text-gray-400'>
          <Users className='w-3 h-3' />
          {project.members || 0} members
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${'bg-green-900/50 text-green-400'}`}
        >
          Active
        </span>
      </div>
    </div>
  </Link>
);

export default ProjectsSection;
