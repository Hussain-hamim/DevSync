"use client";
import Header from "@/components/Header";
import React from "react";
// import {
//   GitBranch,
//   LayoutPanelLeft,
//   MessageSquare,
//   Sparkles,
//   BarChart2,
//   Cpu,
// } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const teamData = [
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "BlueStar",
    desc: "Find teammates based on needed skills",
    members: 50,
    slug: "bluestar",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "Hackers",
    desc: "Pre-configured environments with your stack",
    members: 50,
    slug: "hackers",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "Progress",
    desc: "Track commits, tasks, and burndown",
    members: 23,
    slug: "progress",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "IndieDevs",
    desc: "Threaded conversations with code snippets",
    members: 10,
    slug: "indiedevs",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "VibeCoders",
    desc: "Get PR suggestions before teammates see them",
    members: 33,
    slug: "vibecoders",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "NightCoders",
    desc: "See your growth across languages/frameworks",
    members: 23,
    slug: "nightcoders",
  },
];

const TeamPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100">
      <Header />

      <div className="container mx-auto px-3 py-8">
        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <section className="pt-30 py-20 px-6 bg-gray-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#2e2e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-emerald-400">Teams</span> For
                Collaboration
              </h2>
              <p className="text-gray-400">
                All the teams you can collaborate with
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {teamData.map((team, index) => (
                <Link href={`/teams/${team.slug}`}>
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-all hover:shadow-lg hover:-translate-y-1 flex gap-x-5 group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center mb-4 border border-gray-700 group-hover:border-emerald-400/30 transition-colors">
                      <img
                        src={team.icon}
                        alt=""
                        className="rounded-lg w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                        {team.title}
                      </h3>
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-400/20">
                          {team.members}{" "}
                          {team.members === 1 ? "member" : "members"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{team.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;
