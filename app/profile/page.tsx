"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Globe, Linkedin, Twitter, Github } from "lucide-react";
import { supabase } from "../lib/supabase";
import Header from "@/components/Header";
import {
  ProfileHeader,
  ProjectsSection,
  GithubStatsSection,
  RecentReposSection,
  EditProfileModal,
} from "@/components/profile";
import { Project, SocialLink, GithubData } from "@/types/profile";
import { Session } from "next-auth";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [allCommits, setAllCommits] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const session = data as Session & {
    user: {
      username?: string;
    };
  };

  // Fetch data
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      setError("User session not available, please login!");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const userEmail = session.user.email;
        if (!userEmail) {
          throw new Error("Could not identify user - no email available");
        }

        // Fetch user data
        const fetchedUserData = await fetchUserData(userEmail);
        setUserData(fetchedUserData);

        if (fetchedUserData) {
          await Promise.all([
            fetchCreatedProjects(fetchedUserData.id),
            fetchJoinedProjects(fetchedUserData.id),
            fetchGitHubDataForUser(fetchedUserData),
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionStatus, session?.user]);

  const fetchUserData = async (userEmail: string) => {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0) return null;

    return users[0];
  };

  const fetchCreatedProjects = async (userId: string) => {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("creator_id", userId)
      .limit(4)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setCreatedProjects(projects || []);
  };

  const fetchJoinedProjects = async (userId: string) => {
    const { data: projectRoles, error: rolesError } = await supabase
      .from("project_roles")
      .select("project_id, title")
      .eq("filled_by", userId);

    if (rolesError) throw rolesError;

    if (projectRoles && projectRoles.length > 0) {
      const projectIds = projectRoles.map((role) => role.project_id);

      const { data: joinedProjects, error } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .limit(4)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const projectsWithRoles = joinedProjects?.map((project) => ({
        ...project,
        roleTitle:
          projectRoles.find((role) => role.project_id === project.id)?.title ||
          "Member",
      }));

      setJoinedProjects(projectsWithRoles || []);
    }
  };

  const fetchGitHubDataForUser = async (user: any) => {
    // Fetch GitHub data if user has a GitHub token
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
            return;
          }
          throw new Error("Failed to fetch GitHub user data");
        }

        const githubUserData = await userResponse.json();
        const githubUsername = githubUserData.login;

        if (!githubUsername) {
          throw new Error("GitHub username not found");
        }

        // Now fetch full GitHub data using the username and token
        const { githubData: fetchedData, commitsCount } = await fetchGitHubData(
          githubUsername,
          user.github_token
        );
        setGithubData(fetchedData);
        setAllCommits({ total_count: commitsCount });
      } catch (err) {
        console.warn("Failed to fetch GitHub data:", err);
        // Set partial data if available
        setGithubData({
          profile: {
            login: user.github_username || user.email?.split("@")[0] || "user",
            avatar_url: user.avatar_url || "/default-avatar.png",
            name: user.name || "GitHub User",
            bio: "",
            followers: 0,
            following: 0,
            public_repos: 0,
            created_at: new Date().toISOString(),
          },
          stats: {
            stars: 0,
            forks: 0,
          },
          skills: [],
          recentRepos: [],
        });
        setAllCommits({ total_count: 0 });
      }
    } else {
      // No GitHub token available
      console.warn("No GitHub token available for this user");
      setGithubData({
        profile: {
          login: user.github_username || user.email?.split("@")[0] || "user",
          avatar_url: user.avatar_url || "/default-avatar.png",
          name: user.name || "User",
          bio: "",
          followers: 0,
          following: 0,
          public_repos: 0,
          created_at: new Date().toISOString(),
        },
        stats: {
          stars: 0,
          forks: 0,
        },
        skills: [],
        recentRepos: [],
      });
      setAllCommits({ total_count: 0 });
    }
  };

  const fetchGitHubData = async (username: string, token: string) => {
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
      const [commitsRes, profileRes, reposRes, prsRes] = await Promise.all([
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

      // Calculate commits count
      const commitsCount = commitsData.total_count || 0;

      // Calculate statistics
      const stats = {
        stars: reposData.reduce(
          (acc, repo) => acc + (repo.stargazers_count || 0),
          0
        ),
        forks: reposData.reduce(
          (acc, repo) => acc + (repo.forks_count || 0),
          0
        ),
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
          html_url: repo.html_url,
          description: repo.description,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          language: repo.language,
        }));

      // Get unique languages
      const skills = Array.from(
        new Set(reposData.map((repo) => repo.language).filter(Boolean))
      ) as string[];

      return {
        githubData: {
          profile: {
            avatar_url: profileData.avatar_url,
            name: profileData.name || profileData.login,
            bio: profileData.bio,
            public_repos: profileData.public_repos || reposData.length,
            followers: profileData.followers,
            following: profileData.following,
            created_at: profileData.created_at,
            login: profileData.login,
          },
          stats: {
            stars: stats.stars,
            forks: stats.forks,
          },
          skills,
          recentRepos,
        },
        commitsCount,
      };
    } catch (error) {
      console.error("GitHub API error:", error);
      throw error;
    }
  };

  // Build social links from user data
  const socialLinks: SocialLink[] = [];

  // Add portfolio URL if it exists
  if (userData?.portfolio_url) {
    socialLinks.push({
      name: "Portfolio",
      url: userData.portfolio_url,
      icon: Globe,
      username:
        userData.portfolio_url.replace(/^https?:\/\//, "").split("/")[0] ||
        "Portfolio",
      color: "text-gray-400 hover:text-emerald-400",
    });
  }

  if (userData?.social_links) {
    const socials = userData.social_links;
    if (socials.twitter) {
      socialLinks.push({
        name: "Twitter",
        url: socials.twitter,
        icon: Twitter,
        username: socials.twitter.includes("twitter.com/")
          ? "@" + socials.twitter.split("twitter.com/")[1]?.split("/")[0] ||
            "Twitter"
          : "Twitter",
        color: "text-gray-400 hover:text-blue-400",
      });
    }
    if (socials.linkedin) {
      socialLinks.push({
        name: "LinkedIn",
        url: socials.linkedin,
        icon: Linkedin,
        username: socials.linkedin.includes("linkedin.com/in/")
          ? socials.linkedin.split("linkedin.com/in/")[1]?.split("/")[0] ||
            "LinkedIn"
          : "LinkedIn",
        color: "text-gray-400 hover:text-blue-500",
      });
    }
    if (socials.website) {
      socialLinks.push({
        name: "Website",
        url: socials.website,
        icon: Globe,
        username:
          socials.website.replace(/^https?:\/\//, "").split("/")[0] ||
          "Website",
        color: "text-gray-400 hover:text-emerald-400",
      });
    }
  }

  const handleProfileUpdate = async () => {
    // Refresh user data after update
    if (session?.user?.email) {
      const updatedUserData = await fetchUserData(session.user.email);
      setUserData(updatedUserData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-pulse text-gray-400">
            Loading profile data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-sans text-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-rose-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-15 from-gray-900 to-gray-800 font-sans text-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          profile={{
            name: userData?.name || session?.user?.name || "User",
            avatar_url:
              userData?.avatar_url ||
              session?.user?.image ||
              githubData?.profile?.avatar_url ||
              "/default-avatar.png",
            bio:
              userData?.bio ||
              githubData?.profile?.bio ||
              "Update your profile to add a bio",
            public_repos: githubData?.profile?.public_repos || 0,
            followers: githubData?.profile?.followers || 0,
            following: githubData?.profile?.following || 0,
            created_at:
              userData?.created_at ||
              githubData?.profile?.created_at ||
              new Date().toISOString(),
          }}
          socialLinks={socialLinks}
          commitsCount={allCommits?.total_count || 0}
          onEdit={() => setShowEditModal(true)}
        />

        {/* Connect GitHub Section - Show if user doesn't have GitHub connected */}
        {!userData?.github_token && !userData?.github_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                  <Github className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">
                    Connect Your GitHub Account
                  </h3>
                  <p className="text-sm text-gray-400">
                    Connect GitHub to appear in developer rankings and showcase
                    your contributions
                  </p>
                </div>
              </div>
              <button
                onClick={() => signIn("github")}
                className="relative overflow-hidden group bg-gray-700 hover:bg-gray-600 border border-gray-600 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <ProjectsSection
            createdProjects={createdProjects}
            joinedProjects={joinedProjects}
          />

          {githubData && <GithubStatsSection githubData={githubData} />}
        </div>

        {githubData &&
          githubData.recentRepos &&
          githubData.recentRepos.length > 0 && (
            <RecentReposSection repos={githubData.recentRepos} />
          )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProfileUpdated={handleProfileUpdate}
        initialData={{
          name: userData?.name,
          bio: userData?.bio,
          username: userData?.username,
          avatar_url: userData?.avatar_url,
          portfolio_url: userData?.portfolio_url,
          social_links: userData?.social_links,
        }}
      />
    </div>
  );
}
