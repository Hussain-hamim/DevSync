import { supabase } from "@/app/lib/supabase";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Profile } from "next-auth";
import { compare } from "bcryptjs";

// Define interfaces for profiles
interface GithubProfile extends Profile {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  email?: string;
  username: string;
}

interface GoogleProfile extends Profile {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check users table for admin with admin_password
        const { data: adminUser, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .eq("role", "admin")
          .single();

        if (error || !adminUser?.admin_password) {
          return null;
        }

        // Compare password with hashed admin_password
        const isValid = await compare(
          credentials.password,
          adminUser.admin_password
        );

        if (!isValid) return null;

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name || "Admin",
          role: "admin",
          provider: "admin",
        } as any;
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
          username: profile.login,
          role: "user",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email.split("@")[0],
          role: "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (user && "role" in user) {
        token.role = (user as any).role;
        token.provider = (user as any).provider || account?.provider;
      }

      if (account) {
        token.accessToken = account.access_token;
      }

      // Ensure role loaded for OAuth users
      if (!token.role && token.email) {
        const { data: userRecord } = await supabaseAdmin
          .from("users")
          .select("role")
          .eq("email", token.email)
          .maybeSingle();
        token.role = userRecord?.role || "user";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (token.username) {
        session.user.login = token.username as string;
      }
      session.user.role = (token as any).role || "user";
      session.user.provider = (token as any).provider || token?.provider;
      return session;
    },
    async signIn({ user, account, profile }) {
      // Admin credentials flow already validated in authorize
      if (account?.provider === "admin-credentials") {
        return true;
      }

      if (!account || !profile) return false;

      try {
        const email = user.email as string;
        if (!email) {
          console.error("No email provided in user data");
          return false;
        }

        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", email)
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching existing user:", fetchError.message);
          return false;
        }

        let updateData: Record<string, any> = {
          role: existingUser?.role || "user",
        };

        if (account.provider === "github") {
          const githubProfile = profile as GithubProfile;

          let githubBio = null;
          let githubBlog = null;

          if (account.access_token) {
            try {
              const githubResponse = await fetch(
                "https://api.github.com/user",
                {
                  headers: {
                    Authorization: `Bearer ${account.access_token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                  },
                }
              );

              if (githubResponse.ok) {
                const githubUserData = await githubResponse.json();
                githubBio = githubUserData.bio || null;
                githubBlog = githubUserData.blog || null;
              }
            } catch (err) {
              console.warn("Failed to fetch additional GitHub data:", err);
            }
          }

          updateData = {
            ...updateData,
            github_id: `github_${githubProfile.id}`,
            email,
            name: user.name || githubProfile.login || existingUser?.name || "",
            avatar_url: githubProfile.avatar_url || existingUser?.avatar_url,
            github_token: account.access_token as string,
            github_username: githubProfile.username || githubProfile.login,
            username: githubProfile.username || githubProfile.login,
            bio: existingUser?.bio || githubBio || null,
            portfolio_url: existingUser?.portfolio_url || githubBlog || null,
            ...(existingUser?.google_id && {
              google_id: existingUser.google_id,
            }),
            ...(existingUser?.google_token && {
              google_token: existingUser.google_token,
            }),
            social_links: existingUser?.social_links || {},
          };
        } else if (account.provider === "google") {
          const googleProfile = profile as GoogleProfile;
          const username = googleProfile.email.split("@")[0];

          updateData = {
            ...updateData,
            google_id: `google_${googleProfile.sub}`,
            email,
            name: googleProfile.name || existingUser?.name || "",
            avatar_url: googleProfile.picture || existingUser?.avatar_url,
            google_token: account.access_token as string,
            username,
            ...(existingUser?.github_id && {
              github_id: existingUser.github_id,
            }),
            ...(existingUser?.github_token && {
              github_token: existingUser.github_token,
            }),
            ...(existingUser?.github_username && {
              github_username: existingUser.github_username,
            }),
            ...(existingUser?.bio && { bio: existingUser.bio }),
            ...(existingUser?.portfolio_url && {
              portfolio_url: existingUser.portfolio_url,
            }),
            social_links: existingUser?.social_links || {},
          };
        }

        if (existingUser) {
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update(updateData)
            .eq("email", email);

          if (updateError) {
            console.error("Supabase user update error:", updateError.message);
            return false;
          }
        } else {
          const { error: insertError } = await supabaseAdmin
            .from("users")
            .insert(updateData);

          if (insertError) {
            console.error("Supabase user insert error:", insertError.message);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};
