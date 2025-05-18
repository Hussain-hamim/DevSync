import { supabase } from '@/app/lib/supabase';
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      }, // repo = needed to access user's repos private and public
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.login = profile.login; // GitHub username
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.login) {
        session.user.login = token.login; // GitHub username
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      // Extract GitHub info
      const github_id = `github_${profile.id}`;
      const email = user.email!;
      const name = user.name || profile.login;
      const avatar_url = profile.avatar_url;
      const github_token = account.access_token;

      // Insert or update user in Supabase
      const { data, error } = await supabase.from('users').upsert(
        {
          github_id,
          email,
          name,
          avatar_url,
          github_token,
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
