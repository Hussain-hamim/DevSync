import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // adjust path if needed

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in with GitHub.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    // Use user's GitHub access token
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/vnd.github+json',
    };

    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!userRes.ok) {
      throw new Error('GitHub user not found');
    }

    const userData = await userRes.json();

    const reposRes = await fetch(userData.repos_url, { headers });
    const reposData = await reposRes.json();

    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events/public`,
      { headers }
    );
    const eventsData = await eventsRes.json();

    const contributions = eventsData.filter(
      (event: any) =>
        event.type === 'PushEvent' || event.type === 'PullRequestEvent'
    ).length;

    return NextResponse.json({
      profile: {
        name: userData.name || username,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
      },
      stats: {
        contributions,
        repositories: reposData.length,
        stars: reposData.reduce(
          (acc: number, repo: any) => acc + repo.stargazers_count,
          0
        ),
        forks: reposData.reduce(
          (acc: number, repo: any) => acc + repo.forks_count,
          0
        ),
      },
      skills: Array.from(
        new Set(reposData.flatMap((repo: any) => repo.language).filter(Boolean))
      ).slice(0, 8) as string[],
      recentRepos: reposData
        .sort(
          (a: any, b: any) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 5)
        .map((repo: any) => ({
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
        })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch GitHub data',
      },
      { status: 500 }
    );
  }
}
