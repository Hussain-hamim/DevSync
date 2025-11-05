"use client";
import { Terminal, Github, User } from "lucide-react";
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
              onClick={() => signIn("google")}
              // onClick={handleSignIn}
              className="w-full bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 font-semibold rounded-xl py-3 px-5 transition-all flex items-center justify-center backdrop-blur-sm hover:border-cyan-500/50"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 48 48"
                aria-hidden="true"
                focusable="false"
              >
                <g>
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.41 1.48 8.37 3.51l6.24-6.24C34.68 2.53 29.79 0 24 0 14.81 0 6.85 5.4 2.71 13.28l7.62 5.92C12.11 13.05 17.55 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.99 24.55c0-1.69-.16-3.31-.47-4.84H24v9.18h12.95c-.56 2.89-2.25 5.34-4.79 6.99v5.76h7.75C44.98 36.81 46.99 31.13 46.99 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.33 28.82A14.5 14.5 0 0 1 8.39 24c0-1.67.31-3.29.86-4.82l-7.62-5.92A23.93 23.93 0 0 0 0 24c0 3.88.92 7.54 2.59 10.74l7.74-5.92z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 48c6.42 0 11.81-2.13 15.74-5.79l-7.75-5.76c-2.19 1.46-5.01 2.33-7.99 2.33-6.44 0-11.91-4.16-13.86-9.76l-7.73 5.92C6.85 42.6 14.81 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </g>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => signIn("github")}
              // onClick={handleSignIn}
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
