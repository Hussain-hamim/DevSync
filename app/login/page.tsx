"use client";
import { Terminal, Github } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  if (session) {
    window.location.href = "/"; // or use router.push('/')
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative flex items-center justify-center p-4">
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
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Terminal className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-100 mb-3">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DevSync
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-1">
            Connect with developers, join teams, and build amazing projects
            together
          </p>
          <p className="text-sm text-gray-500">
            Sign in to experience the best of DevSync
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800/50 p-8 shadow-2xl">
          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("github")}
              className="w-full bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 font-semibold rounded-xl py-3 px-5 transition-all flex items-center justify-center backdrop-blur-sm hover:border-cyan-500/50"
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
