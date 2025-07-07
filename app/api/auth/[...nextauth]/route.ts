// /app/api/auth/[...nextauth]/route.ts

import { supabase } from '@/app/lib/supabase';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';
import type { Profile, Session } from 'next-auth';

// Define custom interface for Session to include additional properties
interface CustomSession extends Session {
  accessToken?: string;
  user: {
    login?: string;
  } & Session['user'];
}

// Define custom interface for JWT to include additional properties
interface CustomJWT extends JWT {
  accessToken?: string;
  login?: string;
}

// Define interface matching NextAuth's expected GitHub profile
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

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email',
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
        };
      },
    }),

    // Add Google provider

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Google doesn't provide a username, so we'll use the email prefix
          username: profile.email.split('@')[0],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        // Handle both GitHub and Google profiles
        if (profile) {
          if ('login' in profile) {
            // GitHub profile
            const githubProfile = profile as GithubProfile;
            token.login = githubProfile.login;
            token.username = githubProfile.login;
          } else if ('sub' in profile) {
            // Google profile
            const googleProfile = profile as GoogleProfile;
            token.username = googleProfile.email.split('@')[0];
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      const customSession: CustomSession = {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          login: token.username, // Use username for both providers
        },
      };
      return customSession;
    },
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      try {
        let userData;

        if (account.provider === 'github') {
          const githubProfile = profile as GithubProfile;
          userData = {
            github_id: `github_${githubProfile.id}`,
            email: user.email as string,
            name: user.name || githubProfile.login || '',
            avatar_url: githubProfile.avatar_url,
            github_token: account.access_token as string,
            github_username: githubProfile.username || githubProfile.login,
          };
        } else if (account.provider === 'google') {
          const googleProfile = profile as GoogleProfile;
          userData = {
            google_id: `google_${googleProfile.sub}`,
            email: googleProfile.email,
            name: googleProfile.name,
            avatar_url: googleProfile.picture,
            google_token: account.access_token as string,
            username: googleProfile.email.split('@')[0],
          };
        }

        if (userData) {
          const { error } = await supabase.from('users').upsert(
            userData,
            { onConflict: 'email' } // Assuming email is unique across providers
          );

          if (error) {
            console.error('Supabase user insert error:', error.message);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
