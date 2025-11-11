"use client";
import Header from "@/components/Header";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  ChevronDown,
  Crown,
  GitPullRequest,
  Medal,
  Trophy,
  RefreshCw,
  Search,
  Users,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RankingsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [sortBy, setSortBy] = useState<MetricType>("score");
  const [rankings, setRankings] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch users from Supabase and enrich with GitHub data
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: supabaseUsers, error: supabaseError } = await supabase
        .from("users")
        .select(
          "id, github_id, github_token, name, email, github_username, avatar_url, username, bio, portfolio_url, social_links"
        )
        .not("github_token", "is", null)
        .limit(50);

      if (supabaseError) throw supabaseError;
      if (!supabaseUsers || supabaseUsers.length === 0) {
        setRankings([]);
        setIsLoading(false);
        return;
      }

      const enrichedUsers = await Promise.all(
        supabaseUsers.map(async (user) => {
          try {
            const githubData = await fetchGitHubData(user);
            // Prioritize Supabase data over GitHub data
            return {
              ...user,
              ...githubData,
              // Use Supabase avatar_url if available, otherwise GitHub
              avatar_url: user.avatar_url || githubData.avatar_url,
              // Use Supabase name if available, otherwise GitHub
              name: user.name || githubData.name || "User",
              // Use Supabase username if available, otherwise GitHub username
              username: user.username || githubData.github_username,
              github_username:
                user.github_username || githubData.github_username,
              score: calculateScore({ ...user, ...githubData }),
            };
          } catch (userError) {
            console.error(`Error processing user ${user.id}:`, userError);
            return {
              ...user,
              github_username: user.github_username || `user_${user.github_id}`,
              avatar_url:
                user.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`,
              commits: 0,
              repositories: 0,
              stars: 0,
              followers: 0,
              pull_requests: 0,
              forks: 0,
              contributions: 0,
              score: 0,
            };
          }
        })
      );

      setRankings(enrichedUsers);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (mainError) {
      console.error("Failed to fetch users:", mainError);
      setError("Failed to load user data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const refreshInterval = setInterval(() => {
      fetchUsers();
    }, 10 * 60 * 1000); // Refresh every 10 minutes
    return () => clearInterval(refreshInterval);
  }, []);

  // Filter and sort rankings
  const filteredRankings = rankings.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.github_username?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    const aValue = sortBy === "score" ? a.score || 0 : a[sortBy] || 0;
    const bValue = sortBy === "score" ? b.score || 0 : b[sortBy] || 0;
    return bValue - aValue;
  });

  // Calculate stats
  const totalUsers = rankings.length;
  const totalScore = rankings.reduce((sum, user) => sum + (user.score || 0), 0);
  const avgScore = totalUsers > 0 ? Math.round(totalScore / totalUsers) : 0;
  const totalCommits = rankings.reduce(
    (sum, user) => sum + (user.commits || 0),
    0
  );
  const totalRepos = rankings.reduce(
    (sum, user) => sum + (user.repositories || 0),
    0
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Header />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Page Header */}
        <motion.header
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100 flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Trophy className="w-6 h-6 text-amber-400" />
                </motion.div>
                <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                  Developer Rankings
                </span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full sm:w-64"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300 placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                />
              </motion.div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </motion.button>

              {/* Metric filter dropdown */}
              <motion.div whileHover={{ scale: 1.03 }} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full sm:w-auto bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>
                    {sortBy === "score"
                      ? "Points"
                      : sortBy === "commits"
                        ? "Commits"
                        : sortBy === "repositories"
                          ? "Repos"
                          : sortBy === "stars"
                            ? "Stars"
                            : sortBy === "followers"
                              ? "Followers"
                              : "PRs"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0  mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-100"
                  >
                    <div className="py-1">
                      {(
                        [
                          "score",
                          "commits",
                          "repositories",
                          "stars",
                          "followers",
                          "pull_requests",
                        ] as MetricType[]
                      ).map((metric) => (
                        <button
                          key={metric}
                          onClick={() => {
                            setSortBy(metric);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${sortBy === metric
                            ? "text-emerald-400 bg-gray-700"
                            : "text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                          {metric === "score"
                            ? "Points"
                            : metric === "commits"
                              ? "Commits"
                              : metric === "repositories"
                                ? "Repositories"
                                : metric === "stars"
                                  ? "Stars"
                                  : metric === "followers"
                                    ? "Followers"
                                    : "Pull Requests"}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }}>
                <button
                  onClick={() =>
                    setTimeframe(timeframe === "weekly" ? "monthly" : "weekly")
                  }
                  className="w-full sm:w-auto bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{timeframe === "weekly" ? "Weekly" : "Monthly"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Stats Summary */}
        {!isLoading && rankings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                <span>Total Developers</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {totalUsers}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Trophy className="w-4 h-4" />
                <span>Average Score</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {avgScore}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <GitPullRequest className="w-4 h-4" />
                <span>Total Commits</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {totalCommits.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Total Repos</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {totalRepos.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Updated & Search Results Count */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <>
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs md:text-sm">Last updated: {lastUpdated}</span>
                  <div className="flex items-center text-xs text-amber-300 bg-gray-800/40 p-2 rounded">
                    <span>
                      Want to appear in the rankings?{" "}
                      <span className="font-semibold text-amber-200">
                        Connect your GitHub
                      </span>{" "}
                      to join the developer leaderboard!
                    </span>
                  </div>
                </>
              )}
            </div>
            {searchQuery && (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>
                  {sortedRankings.length} result
                  {sortedRankings.length !== 1 ? "s" : ""} found
                </span>
              </div>
            )}
          </div>
        )}

        {/* Column Headers - Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 mb-2 px-4">
          <div className="col-span-1 text-gray-400 text-sm font-medium">
            Rank
          </div>
          <div className="col-span-4 text-gray-400 text-sm font-medium">
            Developer
          </div>
          <div className="col-span-1 text-gray-400 text-sm font-medium">
            Points
          </div>
          <div className="col-span-6 grid grid-cols-5 gap-2 text-center">
            <button
              onClick={() => setSortBy("commits")}
              className={`text-gray-400 text-sm font-medium ${sortBy === "commits" ? "text-emerald-400" : ""
                }`}
            >
              Commits {sortBy === "commits" && "↓"}
            </button>
            <button
              onClick={() => setSortBy("repositories")}
              className={`text-gray-400 text-sm font-medium ${sortBy === "repositories" ? "text-emerald-400" : ""
                }`}
            >
              Repos {sortBy === "repositories" && "↓"}
            </button>
            <button
              onClick={() => setSortBy("stars")}
              className={`text-gray-400 text-sm font-medium ${sortBy === "stars" ? "text-emerald-400" : ""
                }`}
            >
              Stars {sortBy === "stars" && "↓"}
            </button>
            <button
              onClick={() => setSortBy("followers")}
              className={`text-gray-400 text-sm font-medium ${sortBy === "followers" ? "text-emerald-400" : ""
                }`}
            >
              Followers {sortBy === "followers" && "↓"}
            </button>
            <button
              onClick={() => setSortBy("pull_requests")}
              className={`text-gray-400 text-sm font-medium ${sortBy === "pull_requests" ? "text-emerald-400" : ""
                }`}
            >
              PRs {sortBy === "pull_requests" && "↓"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="hidden md:block">
                  <UserSkeleton />
                </div>
                <div className="md:hidden">
                  <UserSkeleton isMobile />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {!isLoading && (
          <div className="space-y-3">
            {sortedRankings.length > 0 ? (
              <AnimatePresence>
                {sortedRankings.map((user, index) => (
                  <motion.article
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      borderColor: user.pulse
                        ? "rgba(16, 185, 129, 0.5)"
                        : "rgba(55, 65, 81, 0.5)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={`bg-gray-800/50 border rounded-lg p-3 md:p-4 relative overflow-hidden group cursor-pointer transition-all hover:bg-gray-800/70 ${user.isLive ? "border-emerald-400/30" : "border-gray-700"
                      }`}
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 items-center gap-4">
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        <RankBadge rank={index} />
                      </div>

                      {/* User Info */}
                      <div className="col-span-4 cursor-pointer">
                        <motion.div
                          className="flex items-center gap-4"
                          whileHover={{ x: 5 }}
                        >
                          <div className="relative">
                            <img
                              src={
                                user.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=random`
                              }
                              alt={`${user.name}'s avatar`}
                              className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                              width={40}
                              height={40}
                            />
                            {user.isLive && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900"
                              />
                            )}
                          </div>
                          <div>
                            <h2 className="font-medium text-gray-100 group-hover:text-emerald-400 transition-colors">
                              {user.name}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              {(user.username || user.github_username) && (
                                <span
                                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (user.github_username) {
                                      window.open(
                                        `https://github.com/${user.github_username}`,
                                        "_blank"
                                      );
                                    }
                                  }}
                                >
                                  @{user.username || user.github_username}
                                </span>
                              )}
                              {user.bio && (
                                <span
                                  className="text-xs text-gray-500 truncate max-w-[200px]"
                                  title={user.bio}
                                >
                                  {user.bio}
                                </span>
                              )}
                              {user.portfolio_url && (
                                <span
                                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(user.portfolio_url, "_blank");
                                  }}
                                  title="Portfolio"
                                >
                                  🌐 Portfolio
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Score */}
                      <div className="col-span-1 ">
                        <AnimatePresence mode="wait">
                          <ScoreChange value={user.score || 0} />
                        </AnimatePresence>
                      </div>

                      {/* Metrics */}
                      <div className="col-span-6 grid grid-cols-5 gap-2 text-center">
                        <div className="font-medium group-hover:text-emerald-400 transition-colors">
                          {user.commits || 0}
                        </div>
                        <div className="font-medium group-hover:text-emerald-400 transition-colors">
                          {user.repositories || 0}
                        </div>
                        <div className="font-medium group-hover:text-amber-400 transition-colors">
                          {user.stars || 0}
                        </div>
                        <div className="font-medium group-hover:text-purple-400 transition-colors">
                          {user.followers || 0}
                        </div>
                        <div className="font-medium group-hover:text-cyan-400 transition-colors">
                          {user.pull_requests || 0}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <RankBadge rank={index} />
                      </div>

                      <div className="flex-shrink-0">
                        <img
                          src={
                            user.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}&background=random`
                          }
                          alt={`${user.name}'s avatar`}
                          className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                          width={40}
                          height={40}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="font-medium text-gray-100 truncate">
                          {user.name}
                        </h2>
                        <div className="text-xs text-gray-400 truncate">
                          @{user.username || user.github_username || "user"}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="font-bold text-emerald-400">
                          {user.score || 0}
                        </div>
                        <div className="text-xs text-gray-400">pts</div>
                      </div>
                    </div>

                    {/* Activity indicator */}
                    {user.isLive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute bottom-0 left-0 h-0.5 bg-emerald-400/50"
                      />
                    )}
                  </motion.article>
                ))}
              </AnimatePresence>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-rose-400 mb-4">{error}</div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No developers found matching &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No ranking data available</p>
                <p className="text-sm mt-2 text-gray-500">
                  Connect your GitHub account to appear in rankings
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Define types
type User = {
  id: string;
  github_id: string;
  github_token: string;
  name: string;
  email: string;
  github_username?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  portfolio_url?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  commits?: number;
  repositories?: number;
  stars?: number;
  followers?: number;
  pull_requests?: number;
  forks?: number;
  contributions?: number;
  isLive?: boolean;
  pulse?: boolean;
  score?: number;
  last_updated?: string;
};

type MetricType =
  | "score"
  | "commits"
  | "repositories"
  | "stars"
  | "followers"
  | "pull_requests";

const ScoreChange = ({ value }: { value: number }) => (
  <motion.span
    key={value}
    initial={{ y: -10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 10, opacity: 0 }}
    transition={{ duration: 0.4 }}
    className=" text-amber-200 font-bold"
  >
    {value}
  </motion.span>
);

// Enhanced GitHub data fetcher using user's own token
async function fetchGitHubData(user: User): Promise<Partial<User>> {
  try {
    if (!user.github_token) {
      throw new Error("No GitHub token available for this user");
    }

    const headers = {
      Authorization: `Bearer ${user.github_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // Get authenticated user details
    const userResponse = await fetch("https://api.github.com/user", {
      headers,
    });

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        throw new Error("GitHub token is invalid or expired");
      }
      const errorData = await userResponse.json();
      throw new Error(
        `GitHub API error: ${errorData.message || "Unknown error"}`
      );
    }

    const userData = await userResponse.json();
    const username = userData.login;
    if (!username) throw new Error("GitHub username not found");

    // Get avatar URL if not already set
    const avatar_url =
      userData.avatar_url || `https://github.com/${username}.png`;

    // Get repositories (only need basic info for count and stars)
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers }
    );

    if (!reposResponse.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const reposData = await reposResponse.json();

    // Calculate stars and forks from repositories
    const stars = reposData.reduce(
      (acc: number, repo: any) => acc + (repo.stargazers_count || 0),
      0
    );
    const forks = reposData.reduce(
      (acc: number, repo: any) => acc + (repo.forks_count || 0),
      0
    );

    // Get commit count using search API (more accurate)
    const commitsResponse = await fetch(
      `https://api.github.com/search/commits?q=author:${username}`,
      { headers }
    );

    let commits = 0;
    if (commitsResponse.ok) {
      const commitsData = await commitsResponse.json();
      commits = commitsData.total_count || 0;
    }

    // Get pull requests count
    const prsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr`,
      { headers }
    );

    let pullRequests = 0;
    if (prsResponse.ok) {
      const prsData = await prsResponse.json();
      pullRequests = prsData.total_count || 0;
    }

    return {
      github_username: username,
      avatar_url,
      commits,
      repositories: reposData.length || 0,
      stars,
      forks,
      followers: userData.followers || 0,
      pull_requests: pullRequests,
      contributions: commits,
      isLive: Math.random() > 0.7,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching data for user ${user.github_id}:`, error);
    return {
      github_username: `user_${user.github_id}`,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=random`,
      commits: 0,
      repositories: 0,
      stars: 0,
      forks: 0,
      followers: 0,
      pull_requests: 0,
      contributions: 0,
      isLive: false,
      last_updated: new Date().toISOString(),
    };
  }
}

// Improved score calculation
const calculateScore = (user: User): number => {
  return Math.round(
    (user.commits || 0) * 0.5 +
    (user.repositories || 0) * 3 +
    (user.stars || 0) * 0.2 +
    (user.followers || 0) * 0.3 +
    (user.pull_requests || 0) * 0.7 +
    (user.forks || 0) * 0.1
  );
};

// Rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 0) {
    return (
      <div className="relative">
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          {rank + 1}
        </motion.div>
        <Crown className="absolute -top-2 -right-2 w-4 h-4 text-amber-400 fill-amber-400" />
      </div>
    );
  } else if (rank === 1) {
    return (
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-gray-900 font-bold">
          {rank + 1}
        </div>
        <Medal className="absolute -top-2 -right-2 z-222  w-4 h-4 text-gray-400" />
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold">
          {rank + 1}
        </div>
        <Award className="absolute -top-2 -right-2 w-4 h-4 text-amber-500" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 font-bold">
      {rank + 1}
    </div>
  );
};

// Loading Skeleton Component
const UserSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    {isMobile ? (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
        <div className="w-12 h-6 bg-gray-700 rounded animate-pulse" />
      </div>
    ) : (
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        </div>
        <div className="col-span-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse w-32" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
          </div>
        </div>
        <div className="col-span-1">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-12 mx-auto" />
        </div>
        <div className="col-span-6 grid grid-cols-5 gap-2 text-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )}
  </div>
);
