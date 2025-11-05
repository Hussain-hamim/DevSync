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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Terminal className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Welcome back to <span className="text-emerald-400">DevSync</span>
          </h1>
          <p className="text-gray-400">Collaborate on your next big project</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/70 rounded-xl border border-gray-700 p-8 shadow-lg">
          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("google")}
              // onClick={handleSignIn}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg py-2.5 px-5 transition-colors flex items-center justify-center"
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
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg py-2.5 px-5 transition-colors flex items-center justify-center"
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
