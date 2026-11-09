"use client";

import { useEffect, useState } from "react";
import { Github, Star } from "lucide-react";
import styles from "./ReferenceHero.module.css";

export default function GitHubStarButton({ compact = false }: { compact?: boolean }) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/repository", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (typeof data.stars === "number") setStars(data.stars); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (<a className={`${styles.githubButton} ${compact ? styles.githubCompact : ""}`} href="https://github.com/Hussain-hamim/DevSync" target="_blank" rel="noopener noreferrer" aria-label={`Star DevSync on GitHub${stars === null ? "" : `, ${stars} stars`} (opens in a new tab)`}><Github size={19} aria-hidden="true" /><span className={styles.githubLabel}>Star on GitHub</span><Star size={18} aria-hidden="true" /><span className={styles.githubCount}>{stars === null ? "—" : stars.toLocaleString()}</span></a>);
}
