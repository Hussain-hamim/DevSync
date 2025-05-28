"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  MapPin,
  Building,
  Link as LinkIcon,
  Twitter,
  Calendar,
  Activity,
  GitCommit,
  Star,
  Users,
  Code,
  GitPullRequest,
  ExternalLink,
  Circle,
} from "lucide-react";
import Link from "next/link";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
async function fetchGitHubData(githubId) {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        }
      : {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };

    // Get user details by GitHub ID
    const userResponse = await fetch(
      `https://api.github.com/user/${githubId}`,
      { headers }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user data");
    }

    const userData = await userResponse.json();
    const username = userData.login;
    if (!username) throw new Error("GitHub username not found");

    // Get detailed stats using the username
    const [reposResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers,
      }),
      fetch(`https://api.github.com/users/${username}/events`, { headers }),
    ]);

    if (!reposResponse.ok || !eventsResponse.ok) {
      throw new Error("Failed to fetch GitHub user details");
    }

    const reposData = await reposResponse.json();
    const eventsData = await eventsResponse.json();

    // Calculate metrics
    const commits = eventsData.filter((e) => e.type === "PushEvent").length;
    const stars = reposData.reduce(
      (acc, repo) => acc + (repo.stargazers_count || 0),
      0
    );
    const pullRequests = eventsData.filter(
      (e) => e.type === "PullRequestEvent"
    ).length;

    return {
      github_username: username,
      commits,
      repositories: reposData.length || 0,
      stars,
      followers: userData.followers || 0,
      pullRequests,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      twitter_username: userData.twitter_username,
      public_gists: userData.public_gists,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      html_url: userData.html_url,
      isLive: Math.random() > 0.7,
      pulse: false,
    };
  } catch (error) {
    console.error(`Error fetching GitHub data:`, error);
    return {
      github_username: `user_${githubId}`,
      commits: 0,
      repositories: 0,
      stars: 0,
      followers: 0,
      pullRequests: 0,
      isLive: false,
      pulse: false,
    };
  }
}

async function fetchRepositories(username) {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        }
      : {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repos = await response.json();
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
      visibility: repo.visibility,
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

async function fetchActivity(username) {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        }
      : {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        };

    const response = await fetch(
      `https://api.github.com/users/${username}/events?per_page=10`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activity");
    }

    const events = await response.json();
    return events.map((event) => ({
      id: event.id,
      type: event.type,
      repo: event.repo,
      actor: event.actor,
      created_at: event.created_at,
      payload: event.payload,
    }));
  } catch (error) {
    console.error("Error fetching activity:", error);
    return [];
  }
}

function calculateScore(user) {
  return Math.round(
    (user.commits || 0) * 0.3 +
      (user.repositories || 0) * 5 +
      (user.stars || 0) * 0.1 +
      (user.followers || 0) * 0.2 +
      (user.pullRequests || 0) * 0.5
  );
}

// Profile Components
function ProfileHeader({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={user.avatar_url}
            alt={`${user.name}'s avatar`}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-400/20"
            width={128}
            height={128}
          />
          {user.isLive && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"
            />
          )}
        </motion.div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{user.name}</h1>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 mt-1"
              >
                <Github className="w-4 h-4" />@{user.github_username}
              </a>
            </div>
          </div>

          {user.bio && <p className="text-gray-300 mb-4">{user.bio}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {user.location && (
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2 text-gray-400">
                <Building className="w-4 h-4" />
                <span>{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-2 text-gray-400">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={
                    user.blog.startsWith("http")
                      ? user.blog
                      : `https://${user.blog}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400"
                >
                  {user.blog}
                </a>
              </div>
            )}
            {user.twitter_username && (
              <div className="flex items-center gap-2 text-gray-400">
                <Twitter className="w-4 h-4" />
                <a
                  href={`https://twitter.com/${user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400"
                >
                  @{user.twitter_username}
                </a>
              </div>
            )}
            {user.created_at && (
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricsOverview({ user }) {
  const metrics = [
    { icon: GitCommit, label: "Commits", value: user.commits },
    { icon: Code, label: "Repositories", value: user.repositories },
    { icon: Star, label: "Stars", value: user.stars },
    { icon: Users, label: "Followers", value: user.followers },
    { icon: GitPullRequest, label: "Pull Requests", value: user.pullRequests },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        Activity Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900/50 rounded-lg p-4 text-center"
          >
            <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-100">{value || 0}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ActivityTimeline({ activities }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            whileHover={{ x: 5 }}
            className="flex items-start gap-4 p-4 bg-gray-900/30 rounded-lg"
          >
            <div className="bg-emerald-400/10 rounded-full p-2">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-300">
                  {activity.type.replace("Event", "")}
                </span>
                <span className="text-gray-500">•</span>
                <a
                  href={`https://github.com/${activity.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {activity.repo.name}
                </a>
              </div>
              <time className="text-sm text-gray-500">
                {new Date(activity.created_at).toLocaleDateString()}
              </time>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RepositoryList({ repositories, username }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          Top Repositories
        </h2>
        <a
          href={`https://github.com/${username}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
        >
          View all
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="space-y-4">
        {repositories.map((repo) => (
          <motion.div
            key={repo.id}
            whileHover={{ x: 5 }}
            className="p-4 bg-gray-900/30 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-medium"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="text-sm text-gray-400 mt-1">
                    {repo.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              {repo.language && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Circle className="w-3 h-3 fill-current" />
                  {repo.language}
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-400">
                <Star className="w-4 h-4" />
                {repo.stargazers_count}
              </div>
              <time className="text-gray-500">
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </time>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-gray-700 rounded w-64 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-full max-w-md mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-700 rounded w-32" />
                <div className="h-4 bg-gray-700 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (userError) throw new Error("Failed to fetch user data");
        if (!userData) throw new Error("User not found");

        const githubData = await fetchGitHubData(userData.github_id);
        const repos = await fetchRepositories(githubData.github_username);
        const activity = await fetchActivity(githubData.github_username);

        const score = calculateScore({
          ...userData,
          ...githubData,
        });

        setUser({ ...userData, ...githubData, score });
        setRepositories(repos);
        setActivities(activity);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }

    const refreshInterval = setInterval(() => {
      if (id) fetchUserData();
    }, 2 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      setUser((prev) => {
        if (!prev) return prev;

        const randomChange = Math.floor(Math.random() * 2);
        const shouldUpdate = Math.random() > 0.7;

        const updatedUser = {
          ...prev,
          commits: shouldUpdate ? prev.commits + randomChange : prev.commits,
          stars: shouldUpdate ? prev.stars + randomChange : prev.stars,
          isLive: Math.random() > 0.7,
          pulse: Math.random() > 0.8,
        };

        return {
          ...updatedUser,
          score: calculateScore(updatedUser),
        };
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-gray-800/50 border border-red-500/30 rounded-xl p-8 max-w-lg text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Return to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-lg text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">
            User Not Found
          </h2>
          <p className="text-gray-400">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Return to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader user={user} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MetricsOverview user={user} />
            <ActivityTimeline activities={activities} />
          </div>
          <div className="space-y-6">
            <RepositoryList
              repositories={repositories}
              username={user.github_username}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
