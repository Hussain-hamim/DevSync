"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  Code2,
  Cpu,
  Star,
  GitFork,
  Zap,
  Users,
  Globe,
  Circle,
  GitCommit,
  GitPullRequest,
  Clock,
  Activity,
  Folder,
  UserPlus,
  UserCheck,
  Twitter,
  Linkedin,
} from "lucide-react";
import Header from "@/components/Header";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GitHubData = {
  profile: any;
  stats: {
    commits: number;
    stars: number;
    pullRequests: number;
    forks: number;
    followers: number;
    following: number;
    repositories: number;
    contributions: number;
  };
  skills: string[];
  recentRepos: {
    name: string;
    url: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    updated_at: string;
  }[];
  isFollowing: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [allCommits, setAllCommits] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchGitHubData = async (username: string, token?: string) => {
    try {
      if (!token) {
        throw new Error("GitHub token is required to fetch user data");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      // Fetch all data in parallel
      const [commitsRes, profileRes, reposRes, prsRes, followingRes] =
        await Promise.all([
          fetch(`https://api.github.com/search/commits?q=author:${username}`, {
            headers,
          }),
          fetch(`https://api.github.com/users/${username}`, { headers }),
          fetch(
            `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
            { headers }
          ),
          fetch(
            `https://api.github.com/search/issues?q=author:${username}+type:pr`,
            { headers }
          ),
          fetch(`https://api.github.com/user/following/${username}`, {
            headers,
            method: "GET",
          }),
        ]);

      if (!commitsRes.ok) throw new Error("Failed to fetch commits");
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      if (!reposRes.ok) throw new Error("Failed to fetch repositories");

      const [commitsData, profileData, reposData, prsData] = await Promise.all([
        commitsRes.json(),
        profileRes.json(),
        reposRes.json(),
        prsRes.ok ? prsRes.json() : { total_count: 0 },
      ]);

      // Check if current user is following this profile
      let followingStatus = false;
      if (followingRes.ok) {
        followingStatus = followingRes.status === 204; // 204 means following
      }

      // Calculate statistics
      const stats = {
        commits: commitsData.total_count || 0,
        stars: reposData.reduce(
          (acc, repo) => acc + (repo.stargazers_count || 0),
          0
        ),
        pullRequests: prsData.total_count || 0,
        forks: reposData.reduce(
          (acc, repo) => acc + (repo.forks_count || 0),
          0
        ),
        followers: profileData.followers,
        following: profileData.following,
        repositories: reposData.length,
        contributions: commitsData.total_count || 0,
      };

      // Get recent repositories
      const recentRepos = reposData
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 6)
        .map((repo) => ({
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updated_at: repo.updated_at,
        }));

      // Get unique languages
      const skills = Array.from(
        new Set(reposData.map((repo) => repo.language).filter(Boolean))
      ) as string[];

      return {
        profile: profileData,
        stats,
        skills,
        recentRepos,
        isFollowing: followingStatus,
      };
    } catch (error) {
      console.error("GitHub API error:", error);
      throw error;
    }
  };

  const toggleFollow = async () => {
    if (!githubData?.profile?.login || !userData.github_token) return;

    setFollowLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${userData.github_token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const method = isFollowing ? "DELETE" : "PUT";
      const url = `https://api.github.com/user/following/${githubData.profile.login}`;

      const response = await fetch(url, {
        method,
        headers,
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update followers count locally
        if (githubData) {
          setGithubData({
            ...githubData,
            stats: {
              ...githubData.stats,
              followers: isFollowing
                ? githubData.stats.followers - 1
                : githubData.stats.followers + 1,
            },
            isFollowing: !isFollowing,
          });
        }
      } else {
        throw new Error(
          `Failed to ${isFollowing ? "unfollow" : "follow"} user`
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setError("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get user from Supabase
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (userError || !user) throw new Error("User not found");
        setUserData(user);

        // 2. Fetch projects data
        await fetchProjectsData(user);

        // 3. Fetch GitHub data if user has a GitHub token
        if (user.github_token) {
          try {
            // Use the same approach as rankings page - get user's own data with their token
            const headers = {
              Authorization: `Bearer ${user.github_token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            };

            // Get authenticated user details (this returns the profile user's own data)
            const userResponse = await fetch("https://api.github.com/user", {
              headers,
            });

            if (!userResponse.ok) {
              if (userResponse.status === 401) {
                console.warn("GitHub token is invalid or expired");
                throw new Error("GitHub token is invalid or expired");
              }
              throw new Error("Failed to fetch GitHub user data");
            }

            const githubUserData = await userResponse.json();
            const githubUsername = githubUserData.login;

            if (!githubUsername) {
              throw new Error("GitHub username not found");
            }

            // Now fetch full GitHub data using the username and token
            const data = await fetchGitHubData(
              githubUsername,
              user.github_token
            );
            setGithubData(data);
            setAllCommits({ total_count: data.stats.contributions });
            setIsFollowing(data.isFollowing);
          } catch (err) {
            console.warn("Failed to fetch GitHub data:", err);
            // Set partial data if available
            setGithubData({
              profile: {
                login:
                  user.github_username || user.email?.split("@")[0] || "user",
                avatar_url: user.avatar_url || "/default-avatar.png",
                name: user.name || "GitHub User",
              },
              stats: {
                commits: 0,
                stars: 0,
                pullRequests: 0,
                forks: 0,
                followers: 0,
                following: 0,
                repositories: 0,
                contributions: 0,
              },
              skills: [],
              recentRepos: [],
              isFollowing: false,
            });
            setAllCommits({ total_count: 0 });
            setIsFollowing(false);
          }
        } else {
          // No GitHub token available
          console.warn("No GitHub token available for this user");
          setGithubData({
            profile: {
              login:
                user.github_username || user.email?.split("@")[0] || "user",
              avatar_url: user.avatar_url || "/default-avatar.png",
              name: user.name || "User",
            },
            stats: {
              commits: 0,
              stars: 0,
              pullRequests: 0,
              forks: 0,
              followers: 0,
              following: 0,
              repositories: 0,
              contributions: 0,
            },
            skills: [],
            recentRepos: [],
            isFollowing: false,
          });
          setAllCommits({ total_count: 0 });
          setIsFollowing(false);
        }

        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectsData = async (user: any) => {
      try {
        // Fetch created projects
        const { data: createdProjects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("creator_id", user.id)
          .limit(4)
          .order("created_at", { ascending: false });

        if (projectsError) throw projectsError;
        setCreatedProjects(createdProjects || []);

        // Fetch joined projects
        const { data: projectRoles, error: rolesError } = await supabase
          .from("project_roles")
          .select("project_id, title")
          .eq("filled_by", user.id);

        if (rolesError) throw rolesError;

        if (projectRoles && projectRoles.length > 0) {
          const projectIds = projectRoles.map((role) => role.project_id);
          const { data: joinedProjects, error: joinedProjectsError } =
            await supabase
              .from("projects")
              .select("*")
              .in("id", projectIds)
              .limit(4)
              .order("created_at", { ascending: false });

          if (joinedProjectsError) throw joinedProjectsError;

          const projectsWithRoles = joinedProjects.map((project) => {
            const role = projectRoles.find((r) => r.project_id === project.id);
            return { ...project, roleTitle: role?.title || "Member" };
          });

          setJoinedProjects(projectsWithRoles || []);
        } else {
          setJoinedProjects([]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setCreatedProjects([]);
        setJoinedProjects([]);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <Header />
        <div className="animate-pulse text-gray-400">
          Loading {userData?.name || "user"} data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-rose-500 mb-4">Error</h1>
        <p className="text-gray-300 mb-6 max-w-md text-center">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Leaderboard
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-rose-500">User not found</div>
      </div>
    );
  }

  const joinDate = githubData?.profile?.created_at
    ? new Date(githubData.profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const StatsCard = ({
    icon,
    title,
    value,
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-4 rounded-lg border bg-gray-800/50 border-gray-700"
    >
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
        {icon}
        <span>{title}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value || "N/A"}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col pt-15 md:flex-row gap-8 mb-12"
        >
          <div className="relative self-start">
            <div className="relative w-32 h-32">
              <img
                src={
                  userData?.avatar_url ||
                  githubData?.profile?.avatar_url ||
                  "/default-avatar.png"
                }
                alt={userData?.name || "User"}
                className="w-full h-full rounded-full object-cover border-2 border-emerald-400/30"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {userData?.name || githubData?.profile?.name || "User"}
                </h1>
                {(userData?.username || githubData?.profile?.login) && (
                  <p className="text-gray-400 mb-4">
                    @{userData?.username || githubData?.profile?.login}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Updated: {lastUpdated}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-6 max-w-2xl">
              {userData?.bio || githubData?.profile?.bio || "No bio available"}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard
                icon={<GitCommit className="w-4 h-4" />}
                title="Commits"
                value={githubData?.stats.commits || 0}
                color="text-emerald-400"
              />
              <StatsCard
                icon={<Star className="w-4 h-4" />}
                title="Stars"
                value={githubData?.stats.stars || 0}
                color="text-purple-400"
              />

              <StatsCard
                icon={<Code2 className="w-4 h-4" />}
                title="Repos"
                value={githubData?.stats.repositories || 0}
                color="text-yellow-400"
              />
              <StatsCard
                icon={<GitCommit className="w-4 h-4" />}
                title="Contributions"
                value={allCommits?.total_count || 0}
                color="text-cyan-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Portfolio URL from Supabase */}
              {userData?.portfolio_url && (
                <motion.a
                  href={userData.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>
                    {
                      userData.portfolio_url
                        .replace(/^https?:\/\//, "")
                        .replace(/^www\./, "")
                        .split("/")[0]
                    }
                  </span>
                </motion.a>
              )}

              {/* Social Links from Supabase */}
              {userData?.social_links && (
                <>
                  {userData.social_links.twitter && (
                    <motion.a
                      href={userData.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-blue-400 hover:border-blue-400/30 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      <span>
                        {userData.social_links.twitter.includes("twitter.com/")
                          ? "@" +
                              userData.social_links.twitter
                                .split("twitter.com/")[1]
                                ?.split("/")[0] || "Twitter"
                          : "Twitter"}
                      </span>
                    </motion.a>
                  )}
                  {userData.social_links.linkedin && (
                    <motion.a
                      href={userData.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-blue-500 hover:border-blue-500/30 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>
                        {userData.social_links.linkedin.includes(
                          "linkedin.com/in/"
                        )
                          ? userData.social_links.linkedin
                              .split("linkedin.com/in/")[1]
                              ?.split("/")[0] || "LinkedIn"
                          : "LinkedIn"}
                      </span>
                    </motion.a>
                  )}
                  {userData.social_links.website && (
                    <motion.a
                      href={userData.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>
                        {
                          userData.social_links.website
                            .replace(/^https?:\/\//, "")
                            .replace(/^www\./, "")
                            .split("/")[0]
                        }
                      </span>
                    </motion.a>
                  )}
                </>
              )}

              {/* GitHub Profile Link */}
              {githubData?.profile?.html_url && (
                <motion.a
                  href={githubData.profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-purple-400 hover:border-purple-400/30 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </motion.a>
              )}

              {/* GitHub Blog (fallback if no portfolio_url) */}
              {!userData?.portfolio_url && githubData?.profile?.blog && (
                <motion.a
                  href={
                    githubData?.profile.blog.startsWith("http")
                      ? githubData.profile.blog
                      : `https://${githubData?.profile.blog}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>
                    {
                      githubData?.profile.blog
                        .replace(/^https?:\/\//, "")
                        .replace(/^www\./, "")
                        .split("/")[0]
                    }
                  </span>
                </motion.a>
              )}

              {/* Follow Button - Only show if current user has GitHub token */}
              {userData?.github_token && githubData?.profile?.login && (
                <motion.button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm transition-colors ${
                    isFollowing
                      ? "bg-gray-800/50 border-gray-700 text-gray-300 hover:text-rose-400 hover:border-rose-400/30"
                      : "bg-purple-900/50 border-purple-700 text-purple-300 hover:text-purple-400 hover:border-purple-400/30"
                  }`}
                >
                  {followLoading ? (
                    <span>...</span>
                  ) : (
                    <>
                      {isFollowing ? (
                        <UserCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>{isFollowing ? "Following" : "Follow"}</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Created Projects Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Folder className="w-5 h-5 text-emerald-400" />
              Created Projects
            </h2>
            <div className="space-y-4">
              {createdProjects.length > 0 ? (
                createdProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group hover:bg-gray-700/50 p-3 rounded-lg transition-colors"
                  >
                    <h3 className="font-medium group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 max-h-16 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        {project.members || 1} members
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900/50 text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No projects created</p>
              )}
            </div>
          </motion.div>

          {/* Joined Projects Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Joined Projects
            </h2>
            <div className="space-y-4">
              {joinedProjects.length > 0 ? (
                joinedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group hover:bg-gray-700/50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <h3 className="font-medium group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs bg-gray-900 px-2 py-1 rounded">
                        {project.roleTitle}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 max-h-16 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        {project.members || 1} members
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No joined projects</p>
              )}
            </div>
          </motion.div>

          {/* Stats & Languages Column */}
          <div className="space-y-8">
            {githubData?.stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  GitHub Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Followers</span>
                    <span className="font-medium">
                      {githubData.stats.followers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Following</span>
                    <span className="font-medium">
                      {githubData.stats.following}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Forks</span>
                    <span className="font-medium">
                      {githubData.stats.forks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Contributions</span>
                    <span className="font-medium">
                      {allCommits?.total_count || 0}
                    </span>
                  </div>
                  {userData.role_preferences && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Role Preferences</span>
                      <span className="font-medium">
                        {userData.role_preferences}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {githubData?.skills && githubData.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  Top Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {githubData.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3 text-emerald-400" />
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Recent Repositories Section - Full Width Below */}
        {githubData?.recentRepos && githubData.recentRepos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Recent Repositories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {githubData.recentRepos.map((repo, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-700/50 p-4 rounded-lg transition-colors border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium group-hover:text-emerald-400 transition-colors">
                        {repo.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <GitFork className="w-3 h-3" />
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      {repo.language && (
                        <span className="text-xs bg-gray-900 px-2 py-1 rounded">
                          {repo.language}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
