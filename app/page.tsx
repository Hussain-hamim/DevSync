"use client";
import { useEffect, useRef, useState } from "react";
import {
  GitBranch,
  LayoutPanelLeft,
  MessageSquare,
  Sparkles,
  BarChart2,
  Github,
  ArrowRight,
  Terminal,
  Cpu,
  GitPullRequest,
  Code2,
  Search,
  User,
  Users,
  Trophy,
  Zap,
  Rocket,
  Shield,
  Globe,
  Layers,
  Play,
  ChevronRight,
  Star,
  TrendingUp,
  Heart,
  Building2,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { TypeAnimation } from "react-type-animation";
import Header from "@/components/Header";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import { toast } from "sonner";
import FloatingElements from "@/components/FloatingElements";
import { useRouter } from "next/navigation";

export default function Home() {
  const heroRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        const { data: allProjects } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
        setAllProjects(allProjects || []);

        const { data: allUsers } = await supabase.from("users").select("*");
        setAllUsers(allUsers || []);

        if (error) {
          console.error("Failed to fetch projects:", error.message);
          return;
        }

        setProjects(data || []);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load projects");
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#0a0a0a] relative font-sans text-gray-100 overflow-x-hidden"
    >
      {/* Cosmic Aurora Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%)
          `,
        }}
      />

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs font-semibold text-cyan-400">
                  v2.0 Now Live
                </span>
              </div>

              {/* Main Hero Content */}
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left: Text Content */}
                <div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                    <span className="block mb-2 text-gray-100">Code with</span>
                    <span className="block">
                      <TypeAnimation
                        sequence={[
                          "Intelligence",
                          2000,
                          "Purpose",
                          2000,
                          "Your Team",
                          2000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                        className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      />
                    </span>
                  </h1>

                  <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                    The only platform where developers connect through{" "}
                    <span className="text-cyan-400 font-semibold">code</span>,
                    not resumes. Build real projects with real teams.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 mb-12">
                    {!session ? (
                      <>
                        <button
                          onClick={() => router.push("/login")}
                          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <Rocket className="w-5 h-5" />
                            Start Building
                          </span>
                        </button>
                        <button
                          onClick={() => router.push("/projects")}
                          className="px-8 py-4 bg-gray-900/60 border border-gray-800/50 rounded-xl font-semibold text-lg hover:bg-gray-800/60 transition-all backdrop-blur-sm flex items-center gap-2"
                        >
                          <Code2 className="w-5 h-5" />
                          See Projects
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/rankings">
                          <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all">
                            <span className="flex items-center gap-2">
                              <Trophy className="w-5 h-5" />
                              View Rankings
                            </span>
                          </button>
                        </Link>
                        <button
                          onClick={() => router.push("/projects")}
                          className="px-8 py-4 bg-gray-900/60 border border-gray-800/50 rounded-xl font-semibold text-lg hover:bg-gray-800/60 transition-all backdrop-blur-sm flex items-center gap-2"
                        >
                          <Code2 className="w-5 h-5" />
                          See Projects
                        </button>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      {
                        value: allProjects?.length || "100+",
                        label: "Projects",
                        icon: <Code2 className="w-5 h-5 text-cyan-400" />,
                      },
                      {
                        value: allUsers?.length || "500+",
                        label: "Developers",
                        icon: <Users className="w-5 h-5 text-purple-400" />,
                      },
                      {
                        value: "24/7",
                        label: "Active",
                        icon: <Zap className="w-5 h-5 text-pink-400" />,
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-all"
                      >
                        <div className="flex justify-center mb-2">
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Code Preview */}
                <div className="relative">
                  <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-gray-500 ml-2 font-mono">
                        devsync-terminal
                      </span>
                    </div>

                    {/* Code Content */}
                    <div className="font-mono text-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">$</span>
                        <span className="text-gray-300">git clone</span>
                        <span className="text-purple-400">devsync-project</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">$</span>
                        <span className="text-gray-300">npm install</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">$</span>
                        <span className="text-gray-300">team.join(</span>
                        <span className="text-yellow-400">"project"</span>
                        <span className="text-gray-300">)</span>
                      </div>
                      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <span className="text-cyan-400">✓</span>
                        <span className="text-gray-300 ml-2">
                          Connected to DevSync
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Everything You Need
                </span>
                <br />
                <span className="text-gray-300">To Build Together</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Powerful features designed for modern development teams
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Projects Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-semibold">
                  Trending Now
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-gray-300">Projects Building</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Right Now
                </span>
              </h2>
            </div>

            {!loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {projects.map((project: any) => (
                  <div
                    key={project.id}
                    className="group bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack?.slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="text-xs bg-gray-800/50 px-3 py-1 rounded-full text-gray-300 border border-gray-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.tech_stack?.length || 0) > 3 && (
                        <span className="text-xs bg-gray-800/50 px-3 py-1 rounded-full text-gray-400">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>{project.roles_needed?.length || 0} roles</span>
                      </div>
                    </div>

                    <Link href={`/projects/${project.id}`}>
                      <button className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-semibold hover:from-cyan-500/30 hover:to-purple-500/30 transition-all">
                        View Project
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-900/40 rounded-2xl p-6 h-64 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Simple
                </span>
                <span className="text-gray-300"> as 1, 2, 3</span>
              </h2>
            </div>

            <div className="max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0"
                >
                  <div
                    className={`flex-shrink-0 ${
                      index % 2 === 0 ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <div
                    className={`flex-1 text-center md:text-left ${
                      index % 2 === 0 ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full mb-4">
                      <span className="text-cyan-400 font-bold">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-100">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <Terminal className="w-16 h-16 mx-auto text-cyan-400 mb-8" />
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-gray-300">Ready to</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ship Real Code?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of developers building the future, one commit at a
              time.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!session ? (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                  >
                    Join DevSync — It's free
                  </button>
                  <Link href="/projects">
                    <button className="px-10 py-5 bg-gray-900/60 border border-gray-800/50 rounded-xl font-semibold text-lg hover:bg-gray-800/60 transition-all backdrop-blur-sm">
                      Browse Projects
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <button className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all">
                    <User className="w-5 h-5 inline mr-2" />
                    Join DevSync — It's free
                  </button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full mb-6">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-purple-400 font-semibold">
                  Proudly Supported By
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                <span className="text-gray-300">Our Amazing</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Sponsors & Partners
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                These incredible organizations help make DevSync possible
              </p>
            </div>

            {/* Sponsor Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
              {sponsors.map((sponsor, index) => {
                const tierColors = {
                  Gold: {
                    gradient:
                      "from-yellow-500/20 via-amber-500/20 to-yellow-400/20",
                    border: "border-yellow-500/50",
                    hoverBorder: "border-yellow-400/80",
                    glow: "shadow-yellow-500/20",
                    hoverGlow: "shadow-yellow-400/40",
                    iconColor: "text-yellow-400",
                    badgeBg:
                      "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
                    badgeBorder: "border-yellow-500/50",
                    badgeText: "text-yellow-300",
                  },
                  Silver: {
                    gradient:
                      "from-gray-400/20 via-slate-400/20 to-gray-300/20",
                    border: "border-gray-400/50",
                    hoverBorder: "border-gray-300/80",
                    glow: "shadow-gray-400/20",
                    hoverGlow: "shadow-gray-300/40",
                    iconColor: "text-gray-300",
                    badgeBg:
                      "bg-gradient-to-r from-gray-400/20 to-slate-400/20",
                    badgeBorder: "border-gray-400/50",
                    badgeText: "text-gray-200",
                  },
                  Bronze: {
                    gradient:
                      "from-amber-600/20 via-orange-600/20 to-amber-500/20",
                    border: "border-amber-600/50",
                    hoverBorder: "border-amber-500/80",
                    glow: "shadow-amber-600/20",
                    hoverGlow: "shadow-amber-500/40",
                    iconColor: "text-amber-500",
                    badgeBg:
                      "bg-gradient-to-r from-amber-600/20 to-orange-600/20",
                    badgeBorder: "border-amber-600/50",
                    badgeText: "text-amber-400",
                  },
                };
                const colors = sponsor.tier
                  ? tierColors[sponsor.tier as keyof typeof tierColors]
                  : {
                      gradient:
                        "from-purple-500/20 via-pink-500/20 to-purple-400/20",
                      border: "border-purple-500/50",
                      hoverBorder: "border-purple-400/80",
                      glow: "shadow-purple-500/20",
                      hoverGlow: "shadow-purple-400/40",
                      iconColor: "text-purple-400",
                      badgeBg:
                        "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
                      badgeBorder: "border-purple-500/50",
                      badgeText: "text-purple-300",
                    };

                return (
                  <a
                    key={index}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-3xl p-8 hover:border-opacity-80 transition-all duration-500 flex flex-col items-center justify-center min-h-[180px] hover:scale-[1.05] hover:shadow-2xl ${colors.hoverGlow} ${colors.glow} overflow-hidden`}
                  >
                    {/* Animated background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                    />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 w-full flex flex-col items-center">
                      {sponsor.logo ? (
                        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="h-16 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-lg"
                          />
                        </div>
                      ) : (
                        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 flex items-center justify-center group-hover:border-purple-500/50 transition-all duration-300">
                            <Building2 className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                          </div>
                        </div>
                      )}

                      <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors duration-300 text-center mb-2">
                        {sponsor.name}
                      </h3>

                      {sponsor.tier && (
                        <div
                          className={`mt-2 px-3 py-1.5 rounded-full ${colors.badgeBg} border ${colors.badgeBorder} backdrop-blur-sm flex items-center gap-1.5 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {sponsor.tier === "Gold" && (
                            <Crown
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          {sponsor.tier === "Silver" && (
                            <Medal
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          {sponsor.tier === "Bronze" && (
                            <Award
                              className={`w-4 h-4 ${colors.iconColor} drop-shadow-lg`}
                            />
                          )}
                          <span
                            className={`text-xs font-bold ${colors.badgeText} tracking-wide`}
                          >
                            {sponsor.tier}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Corner accent */}
                    <div
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-30 rounded-bl-full transition-opacity duration-500`}
                    />
                  </a>
                );
              })}
            </div>

            {/* Become a Sponsor CTA */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl px-8 py-6 backdrop-blur-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-100 mb-2">
                    Want to support DevSync?
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Join our sponsors and help developers build amazing projects
                  </p>
                  <Link
                    href="/sponsors"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    Become a Sponsor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 py-12 px-6 relative z-10">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  DevSync
                </span>
              </div>
              <div className="flex gap-8">
                {["GitHub", "Twitter", "Discord", "LinkedIn"].map((item) => (
                  <a
                    key={item}
                    href="https://x.com/erencodes"
                    target="_blank"
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-800/50 mt-8 pt-8 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} DevSync — Built by developers, for
              developers
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const features = [
  {
    icon: <Cpu className="w-7 h-7 text-cyan-400" />,
    title: "Smart Matching",
    desc: "AI-powered role matching based on your actual code contributions and skills",
  },
  {
    icon: <Layers className="w-7 h-7 text-pink-400" />,
    title: "Project Scaffolding",
    desc: "One-click project setup with your preferred stack and deployment configs",
  },
  {
    icon: <MessageSquare className="w-7 h-7 text-cyan-400" />,
    title: "Code Discussions",
    desc: "Threaded conversations with syntax-highlighted code snippets and PR reviews",
  },
  {
    icon: <Sparkles className="w-7 h-7 text-purple-400" />,
    title: "AI Code Review",
    desc: "Get instant feedback on your code before teammates see it",
  },
  {
    icon: <Globe className="w-7 h-7 text-purple-400" />,
    title: "Global Network",
    desc: "Connect with developers worldwide and work across time zones seamlessly",
  },
  {
    icon: <Zap className="w-7 h-7 text-pink-400" />,
    title: "Instant Deployment",
    desc: "Deploy your projects with one click to Vercel, Netlify, or your own servers",
  },
];

const steps = [
  {
    icon: <User className="w-12 h-12 text-cyan-400" />,
    title: "Create Your Profile",
    desc: "Connect your GitHub, showcase your skills, and let your code speak for itself",
  },
  {
    icon: <Search className="w-12 h-12 text-purple-400" />,
    title: "Discover Projects",
    desc: "Browse projects that match your expertise or explore new technologies",
  },
  {
    icon: <Code2 className="w-12 h-12 text-pink-400" />,
    title: "Start Contributing",
    desc: "Join teams, tackle tasks, and build something amazing together",
  },
];

const sponsors = [
  {
    name: "Supabase",
    url: "https://supabase.com/",
    logo: null,
    tier: "Gold",
  },
  {
    name: "GitHub",
    url: "https://github.com/",
    logo: null,
    tier: "Silver",
  },
];
