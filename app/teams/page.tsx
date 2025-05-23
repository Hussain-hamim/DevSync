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
import { motion } from "framer-motion";

const teamData = [
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "BlueStar",
    desc: "Find teammates based on needed skills",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "Hackers",
    desc: "Pre-configured environments with your stack",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "Progress",
    desc: "Track commits, tasks, and burndown",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "IndieDevs",
    desc: "Threaded conversations with code snippets",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "VibeCoders",
    desc: "Get PR suggestions before teammates see them",
  },
  {
    icon: "https://picsum.photos/500/500?random=1",
    title: "NightCoders",
    desc: "See your growth across languages/frameworks",
  },
];

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100">
      <Header />

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
              <span className="text-emerald-400">Teams</span> For Collaboration
            </h2>
            <p className="text-gray-400">
              All the teams you can collaborate with
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {teamData.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-emerald-400/30 transition-all hover:shadow-lg hover:-translate-y-1 flex gap-x-5"
              >
                <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center mb-4 border border-gray-700">
                  <img src={feature.icon} alt="" className="rounded-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
