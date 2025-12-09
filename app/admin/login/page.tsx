"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Terminal, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/admin");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("admin-credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/admin",
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials or account not found.");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative flex items-center justify-center p-4">
      {/* Cosmic Aurora Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(34, 197, 94, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse at 60% 20%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)
          `,
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Terminal className="w-12 h-12 text-emerald-400" />
              <Shield className="w-6 h-6 text-emerald-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-100 mb-3">
            Admin{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Portal
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-1">
            Secure access to DevSync administration
          </p>
          <p className="text-sm text-gray-500">
            Admin accounts are created directly in the database
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-800/50 p-8 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-300 mb-2 block font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-gray-800/60 border border-gray-700/50 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                placeholder="admin@devsync.codes"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-800/60 border border-gray-700/50 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 font-semibold py-3 px-5 hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
