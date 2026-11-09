import { NextResponse } from "next/server";

const repository = "Hussain-hamim/DevSync";
type Contributor = { id: number; login: string; avatar_url: string; contributions: number };

type ContributorActivity = { author: { id: number } | null; total: number; weeks: { w: number; c: number; a: number; d: number }[] };

async function github(path: string) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "DevSync" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return response;
}

export async function GET() {
  try {
    const [repoResponse, firstPage, activityResponse] = await Promise.all([
      github(""),
      github("/contributors?per_page=100&page=1"),
      github("/stats/contributors").catch(() => null),
    ]);
    // GitHub returns 202 while computing statistics. Keep the cards usable meanwhile.
    const activity: ContributorActivity[] = activityResponse?.status === 200 ? await activityResponse.json() : [];
    const activityById = new Map(activity.filter(item => item.author).map(item => [item.author!.id, item]));
    const repo = await repoResponse.json();
    let response = firstPage;
    let page = 1;
    const contributors: Contributor[] = [];
    while (true) {
      if (response.status !== 204) contributors.push(...await response.json());
      if (!response.headers.get("link")?.includes('rel="next"')) break;
      response = await github(`/contributors?per_page=100&page=${++page}`);
    }
    return NextResponse.json({
      stars: repo.stargazers_count,
      contributors: contributors.map(({ id, login, avatar_url, contributions }) => {
        const stats = activityById.get(id);
        return {
          id, login, avatar: avatar_url, contributions,
          commits: stats?.total ?? contributions,
          additions: stats ? stats.weeks.reduce((sum, week) => sum + week.a, 0) : null,
          deletions: stats ? stats.weeks.reduce((sum, week) => sum + week.d, 0) : null,
          activity: stats ? stats.weeks.slice(-12).map(week => ({ week: week.w, commits: week.c })) : null,
        };
      }),
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "GitHub data is temporarily unavailable." }, { status: 503 });
  }
}
