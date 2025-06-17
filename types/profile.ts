// types/profile.ts
export interface GithubProfile {
  avatar_url: string;
  name: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  login: string;
}

export interface GithubRepo {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export interface GithubStats {
  stars: number;
  forks: number;
}

export interface GithubData {
  profile: GithubProfile;
  recentRepos: GithubRepo[];
  stats: GithubStats;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  members?: number;
  roleTitle?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  username: string;
  color: string;
}

export interface CommitsData {
  total_count: number;
}
