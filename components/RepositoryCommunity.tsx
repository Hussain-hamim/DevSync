"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Github, Star } from "lucide-react";
import styles from "@/app/landing.module.css";

const repoUrl = "https://github.com/Hussain-hamim/DevSync";
const contributorRoles: Record<string, string> = {
  "hussain-hamim": "Founder & Maintainer",
  "samsoorsamander": "Fullstack Developer",
  "daman599": "Frontend Developer",
  "mahveen-fatima": "Frontend Developer",
  "coderamrin": "Full Stack Developer",
  "siddiqui223": "Full Stack Developer",
};

type Repository = { stars: number; contributors: { id: number; login: string; avatar: string; contributions: number; commits?: number; additions?: number | null; deletions?: number | null; activity?: { week: number; commits: number }[] | null }[] };

function ActivityChart({ weeks, maximum }: { weeks: { week: number; commits: number }[]; maximum: number }) {
  const labels = weeks.flatMap((week, index) => {
    const date = new Date(week.week * 1000);
    const previous = index ? new Date(weeks[index - 1].week * 1000) : null;
    return !previous || date.getUTCMonth() !== previous.getUTCMonth()
      ? [{ index, text: date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) }] : [];
  });
  return <svg className={styles.activityChart} viewBox="0 0 440 160" role="img" aria-label="Weekly commits over the last 12 weeks">
    {[0, 1, 2, 3].map(step => <g key={step}><line x1="4" x2="400" y1={120 - step * 34} y2={120 - step * 34} stroke="#ffffff18" strokeDasharray="4 4" /><text x="410" y={124 - step * 34} fill="#81959f" fontSize="10">{Math.round(maximum * step / 3)}</text></g>)}
    {weeks.map((week, index) => <rect key={week.week} x={7 + index * 33} y={120 - week.commits / maximum * 102} width="25" height={week.commits / maximum * 102} rx="2" fill="#14b8a6"><title>{new Date(week.week * 1000).toISOString().slice(0, 10)}: {week.commits} commits</title></rect>)}
    {labels.map(label => <text key={label.index} x={Math.min(365, 7 + label.index * 33)} y="148" fill="#81959f" fontSize="11">{label.text}</text>)}
  </svg>;
}

export default function RepositoryCommunity() {
  const [data, setData] = useState<Repository | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/repository", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(setData)
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  return (
    <section id="contributors" className={`${styles.repositorySection} ${styles.container}`} aria-labelledby="contributors-heading">
      <div className={styles.sectionIntro}>
        <h2 id="contributors-heading">Built by contributors.</h2>
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
          <Github size={17} /> Star on GitHub {data && <><Star size={15} /><span>{data.stars.toLocaleString()}</span></>}
        </a>
      </div>
      <div aria-live="polite">
        {data ? <div className={styles.contributorGrid}>{data.contributors.filter(person => person.login.toLowerCase() !== "vercel[bot]").map(person => (
          <a key={person.id} href={`https://github.com/${encodeURIComponent(person.login)}`} target="_blank" rel="noopener noreferrer" className={styles.contributor}>
            <span className={styles.contributorIdentity}>
            <Image src={person.avatar} alt="" width={48} height={48} unoptimized />
            <span className={styles.contributorDetails}><span>{person.login}</span><small>{contributorRoles[person.login.toLowerCase()] ?? "Contributor"}</small></span><ArrowUpRight size={15} aria-hidden="true" />
            </span>
            <span className={styles.contributorStats}>
              <span title="All-time commits">{(person.commits ?? person.contributions ?? 0).toLocaleString()} commits</span>
              {person.additions != null && <span className={styles.linesAdded} title="All-time lines added">{person.additions.toLocaleString()} ++</span>}
              {person.deletions != null && <span className={styles.linesRemoved} title="All-time lines removed">{person.deletions.toLocaleString()} −−</span>}
            </span>
            {person.activity?.length ? <ActivityChart weeks={person.activity} maximum={Math.max(3, Math.ceil(Math.max(...data.contributors.flatMap(item => item.activity?.map(week => week.commits) ?? [0])) / 3) * 3)} /> : <span className={styles.repositoryStatus}>Activity pending</span>}

          </a>
        ))}</div> : <p className={styles.repositoryStatus}>{failed ? "Contributors are available on GitHub." : "Loading contributors…"}</p>}
      </div>
      <a href={`${repoUrl}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className={styles.textLink}>View contributions <ArrowUpRight size={16} /></a>
    </section>
  );
}
