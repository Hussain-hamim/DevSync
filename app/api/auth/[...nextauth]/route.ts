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
          scope: 'openid email profile',
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
        const email = user.email as string;
        if (!email) {
          console.error('No email provided in user data');
          return false;
        }

        // Check if user already exists by email
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned", which is fine for new users
          console.error('Error fetching existing user:', fetchError.message);
          return false;
        }

        let updateData: Record<string, any> = {};

        if (account.provider === 'github') {
          const githubProfile = profile as GithubProfile;
          updateData = {
            github_id: `github_${githubProfile.id}`,
            email,
            name: user.name || githubProfile.login || existingUser?.name || '',
            avatar_url: githubProfile.avatar_url || existingUser?.avatar_url,
            github_token: account.access_token as string,
            github_username: githubProfile.username || githubProfile.login,
            // Preserve Google data if user already exists
            ...(existingUser?.google_id && { google_id: existingUser.google_id }),
            ...(existingUser?.google_token && { google_token: existingUser.google_token }),
            ...(existingUser?.username && !existingUser.github_username && { username: existingUser.username }),
          };
        } else if (account.provider === 'google') {
          const googleProfile = profile as GoogleProfile;
          const username = googleProfile.email.split('@')[0];
          
          updateData = {
            google_id: `google_${googleProfile.sub}`,
            email,
            name: googleProfile.name || existingUser?.name || '',
            avatar_url: googleProfile.picture || existingUser?.avatar_url,
            google_token: account.access_token as string,
            username: username,
            // Preserve GitHub data if user already exists
            ...(existingUser?.github_id && { github_id: existingUser.github_id }),
            ...(existingUser?.github_token && { github_token: existingUser.github_token }),
            ...(existingUser?.github_username && { github_username: existingUser.github_username }),
          };
        }

        // If user exists, update; otherwise insert
        if (existingUser) {
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('email', email);

          if (updateError) {
            console.error('Supabase user update error:', updateError.message);
            return false;
          }
        } else {
          const { error: insertError } = await supabase
            .from('users')
            .insert(updateData);

          if (insertError) {
            console.error('Supabase user insert error:', insertError.message);
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
