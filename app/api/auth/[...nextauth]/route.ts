import { supabase } from '@/app/lib/supabase';
import NextAuth, { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
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
  ],
  callbacks: {
    async jwt({ token, account, profile }): Promise<CustomJWT> {
      if (account && profile) {
        const githubProfile = profile as GithubProfile;
        const customToken = token as CustomJWT;
        customToken.accessToken = account.access_token;
        customToken.login = githubProfile.login;
        return customToken;
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {
      const customSession: CustomSession = {
        ...session,
        accessToken: (token as CustomJWT).accessToken,
        user: {
          ...session.user,
          login: (token as CustomJWT).login,
        },
      };
      return customSession;
    },
    async signIn({ user, account, profile }): Promise<boolean | string> {
      if (!account || !profile) return false;

      const githubProfile = profile as GithubProfile;
      const github_id = `github_${githubProfile.id}`;
      const email = user.email as string;
      const name = user.name || githubProfile.login || '';
      const avatar_url = githubProfile.avatar_url;
      const github_token = account.access_token as string;
      const github_username = githubProfile.username || githubProfile.login;

      const { error } = await supabase.from('users').upsert(
        {
          github_id,
          email,
          name,
          avatar_url,
          github_token,
          github_username,
        },
        { onConflict: 'github_id' }
      );

      if (error) {
        console.error('Supabase user insert error:', error.message);
        return false;
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
