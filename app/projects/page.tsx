'use client'

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'AI Code Review Tool',
    description: 'An automated code review system using machine learning.',
    tags: ['Python', 'TensorFlow', 'FastAPI'],
    members: 4,
    views: 128,
    roles: ['ML Engineer', 'Backend Developer'],
  },
  {
    id: 2,
    title: 'DevSync CLI',
    description: 'Command line interface for managing DevSync projects.',
    tags: ['Rust', 'CLI', 'WebAssembly'],
    members: 2,
    views: 86,
    roles: ['CLI Developer'],
  },
];

export default function ProjectsPage() {
  const [openRoleId, setOpenRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');

  const toggleRoleList = (id: number) => {
    setOpenRoleId(prev => (prev === id ? null : id));
  };

  const openApplication = (role: string) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const submitApplication = () => {
    if (!reason.trim() || !experience.trim()) return;
    setIsDialogOpen(false);
    setReason('');
    setExperience('');
    alert('Application submitted!');
  };

  return (
    <div className="bg-[#0f172a] min-h-screen px-6 py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">DevSync Projects</h1>
        <button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium">+ New Project</button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          className="w-full max-w-md bg-[#1e293b] text-sm text-white px-4 py-2 rounded-lg outline-none"
          placeholder="Search projects..."
        />
        <button className="bg-[#1e293b] px-3 py-2 rounded-lg text-sm border border-[#334155]">Filter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#1e293b] rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <button onClick={() => toggleRoleList(project.id)} className="flex items-center gap-1">
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${openRoleId === project.id ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            <p className="text-sm mb-2 text-gray-300">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#334155] border border-[#475569] text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400">👥 {project.members} members • 👁️ {project.views} views</div>

            {openRoleId === project.id && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Open Roles:</h3>
                {project.roles.map((role) => (
                  <div key={role} className="mb-2">
                    <button
                      onClick={() => openApplication(role)}
                      className="flex justify-between items-center w-full bg-[#0f172a] hover:bg-[#1f2937] border border-[#334155] px-4 py-2 text-left rounded-md"
                    >
                      {role} <PlusIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Transition show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDialogOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 text-white shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium">
                    Apply for {selectedRole}:
                  </Dialog.Title>
                  <p className="text-sm text-gray-400 mb-4">
                    * You receive an email notification if accepted
                  </p>

                  <div className="mb-3">
                    <label className="block text-sm mb-1">Why do you want to join this team?</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-[#0f172a] rounded-md border border-[#334155] p-2 text-sm outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm mb-1">What is your previous experience?</label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-[#0f172a] rounded-md border border-[#334155] p-2 text-sm outline-none"
                      rows={3}
                    />
                  </div>

                  <button
                    disabled={!reason.trim() || !experience.trim()}
                    onClick={submitApplication}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    Submit Application
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}