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

type Repository = { stars: number; contributors: { id: number; login: string; avatar: string; contributions: number }[] };

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
            <Image src={person.avatar} alt="" width={44} height={44} unoptimized />
            <span className={styles.contributorDetails}><span>{person.login}</span><small>{contributorRoles[person.login.toLowerCase()] ?? "Contributor"}</small></span><ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ))}</div> : <p className={styles.repositoryStatus}>{failed ? "Contributors are available on GitHub." : "Loading contributors…"}</p>}
      </div>
      <a href={`${repoUrl}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className={styles.textLink}>View contributions <ArrowUpRight size={16} /></a>
    </section>
  );
}
