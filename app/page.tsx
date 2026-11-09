"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Pause, Play, Code2, Rocket, Layers, Lightbulb, Plus, Terminal, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import ReferenceHero from "@/components/ReferenceHero";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import { ProjectIllustration, TeamIllustration, ContributionIllustration, DiscoverIllustration, ConnectIllustration, ContributeIllustration } from "@/components/IdeaHuntIllustrations";
import styles from "./landing.module.css";
import { techImages } from "./lib/projectImages";
import VectorWordmark from "@/components/originkit/ui/vector-wordmark";

type Project = {
  id: string;
  title: string;
  description?: string;
  tech_stack?: string[];
  roles_needed?: string[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [showcaseHovered, setShowcaseHovered] = useState(false);
  const [showcaseFocused, setShowcaseFocused] = useState(false);
  const [showcasePaused, setShowcasePaused] = useState(false);

  useEffect(() => {
    if (showcaseHovered || showcaseFocused || showcasePaused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!motion.matches && !document.hidden) {
        timer = setInterval(() => setActiveTab(current => (current + 1) % 3), 2500);
      }
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [showcaseHovered, showcaseFocused, showcasePaused]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(6);
        if (error) throw error;
        if (active) setProjects(data || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchProjects();
    return () => { active = false; };
  }, [attempt]);

  const startHref = session ? "/projects" : "/login";
  const showcase = [
    { label: "Discover", title: "Find your next project.", cta: "Explore projects", href: "/projects", Illustration: DiscoverIllustration },
    { label: "Connect", title: "Find your teammates.", cta: "Explore teams", href: "/teams", Illustration: ConnectIllustration },
    { label: "Contribute", title: "Make your first contribution.", cta: "Get started", href: startHref, Illustration: ContributeIllustration },
  ];
  const selectedShowcase = showcase[activeTab];
  const ShowcaseIllustration = selectedShowcase.Illustration;

  return (
    <div className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <main id="main-content">
        <ReferenceHero startHref={startHref} signedIn={!!session} />

        <section id="how-it-works" className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionIntro}><h2>Build together.</h2></div>
          <div className={styles.visualGrid}>
            {[
              { title: "Find a project", href: "/projects", Illustration: ProjectIllustration },
              { title: "Meet your team", href: "/teams", Illustration: TeamIllustration },
              { title: "Start contributing", href: startHref, Illustration: ContributionIllustration },
            ].map(({ title, href, Illustration }) => (
              <Link href={href} key={title} className={styles.illustrationCard}>
                <Illustration />
                <div><h3>{title}</h3><ArrowUpRight size={20} aria-hidden="true" /></div>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.restoredSection} ${styles.container}`} aria-label="Discover, connect, contribute">
          <div className={styles.showcaseShell}
            onMouseEnter={() => setShowcaseHovered(true)} onMouseLeave={() => setShowcaseHovered(false)}
            onFocusCapture={() => setShowcaseFocused(true)}
            onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setShowcaseFocused(false); }}>
            <div className={styles.showcaseControls}>
            <div className={styles.showcaseTabs} role="tablist" aria-label="Explore DevSync">
              {showcase.map((item, index) => (
                <button key={item.label} id={`showcase-tab-${index}`} type="button" role="tab"
                  aria-selected={activeTab === index} aria-controls="showcase-panel"
                  tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)}
                  onKeyDown={event => {
                    let next = index;
                    if (event.key === "ArrowRight") next = (index + 1) % showcase.length;
                    else if (event.key === "ArrowLeft") next = (index + showcase.length - 1) % showcase.length;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = showcase.length - 1;
                    else return;
                    event.preventDefault();
                    setActiveTab(next);
                    document.getElementById(`showcase-tab-${next}`)?.focus();
                  }}>{item.label}</button>
              ))}
            </div>
              <button type="button" className={styles.rotationToggle} onClick={() => setShowcasePaused(value => !value)}
                aria-label={showcasePaused ? "Resume automatic tabs" : "Pause automatic tabs"}>
                {showcasePaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
              </button>
            </div>
            <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${activeTab}`} tabIndex={0} className={styles.showcasePanel}>
              <div className={styles.showcaseCopy}>
                <h2 className={styles.showcaseTitle}>{selectedShowcase.title}</h2>
                <Link href={selectedShowcase.href} className={styles.secondaryButton}>{selectedShowcase.cta}<ArrowRight size={16} /></Link>
              </div>
              <div className={styles.showcaseIllustration}><ShowcaseIllustration /></div>
            </div>
          </div>
        </section>

        <section id="projects" className={`${styles.projectsSection} ${styles.container}`}>
          <div className={styles.sectionIntro}><div><h2>Open projects.</h2></div><Link href="/projects" className={styles.secondaryButton}>View all projects <ArrowRight size={16} /></Link></div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <><span className={styles.srOnly}>Loading community projects</span><div className={styles.projectGrid}>{[1, 2, 3].map(item => <div key={item} className={styles.skeleton} aria-hidden="true"><div /><div /><div /></div>)}</div></> : error ? <div className={styles.emptyState}><Layers size={27} /><h3>Projects couldn’t load just now.</h3><button type="button" className={styles.secondaryButton} onClick={() => setAttempt(value => value + 1)}>Try again <ArrowRight size={15} /></button></div> : projects.length ? <div className={styles.projectGrid}>{projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectCard}><div className={styles.projectCardTop}><span className={styles.projectIcon}>{index % 3 === 0 ? <Code2 size={23} /> : index % 3 === 1 ? <Layers size={23} /> : <Terminal size={23} />}</span><ArrowRight size={18} /></div><div className={styles.projectImage}>
                <img
                  src={techImages[project.id.charCodeAt(0) % techImages.length]}
                  alt={project.title}
                  loading="lazy"
                  width={600}
                  height={400}
                  onError={event => {
                    const image = event.currentTarget;
                    if (image.dataset.fallback) return;
                    image.dataset.fallback = "true";
                    image.src = `https://picsum.photos/seed/${project.id}/400/300?grayscale`;
                  }}
                />
              </div><h3>{project.title}</h3><p>{project.description || "Explore this project and its open roles."}</p><div className={styles.techTags}>{project.tech_stack?.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}</div><div className={styles.projectCardFooter}><span><Users size={14} />{project.roles_needed?.length ? `${project.roles_needed.length} roles to explore` : "Explore the project"}</span><span>View project <ArrowRight size={13} /></span></div></Link>
            ))}</div> : <div className={styles.emptyState}><Code2 size={27} /><h3>Share a project.</h3><Link href={session ? "/projects/new" : "/login"} className={styles.primaryButton}>Create the first project<Plus size={16} /></Link></div>}
          </div>
        </section>

        <section className={`${styles.ideaHuntSection} ${styles.container}`} aria-labelledby="ideahunt-heading">
          <div className={styles.ideaHuntBrand}>
            <span className={styles.ideaHuntIcon}><Lightbulb size={28} aria-hidden="true" /></span>
            <div><strong>IdeaHunt<span>.pro</span></strong></div>
          </div>
          <div className={styles.ideaHuntCopy}>

            <h2 id="ideahunt-heading">Need an idea?</h2>
            <a href="https://ideahunt.pro" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Find ideas on IdeaHunt<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
        </section>

        <section className={`${styles.faqSection} ${styles.container}`} aria-labelledby="faq-heading">
          <div><h2 id="faq-heading">Questions?</h2></div>
          <div className={styles.faqList}>
            {[
              { question: "Can beginners join?", answer: "Yes. Look for projects that match your skills and interests." },
              { question: "Can I add my own project?", answer: "Yes. Sign in, create a project, and list the roles you need." },
              { question: "Can I browse first?", answer: "Yes. Explore projects and teams before signing in." },
            ].map(item => <details className={styles.faqItem} key={item.question}><summary>{item.question}<Plus size={17} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}
          </div>
        </section>

        <div className={styles.closingSection}>
        <section className={`${styles.finalCta} ${styles.container}`}>
          <span className={styles.launchMark} aria-hidden="true"><Rocket size={40}/></span><h2>Let’s build.</h2>

          <Link href={startHref} className={styles.primaryButton}>{session ? "Explore projects" : "Get started"}<ArrowRight size={17} /></Link>
        </section>
        <div className={`${styles.supportRow} ${styles.container}`}><Link href="/sponsors">Support DevSync <ArrowRight size={15} /></Link></div>
      <footer className={`${styles.footer} ${styles.container}`}><Link href="/" className={styles.brand}><Terminal size={22} />DevSync</Link><nav aria-label="Footer"><Link href="/projects">Projects</Link><Link href="/teams">Teams</Link><Link href="/rankings">Rankings</Link><Link href="/sponsors">Sponsors</Link></nav><div className={styles.footerBottom}><span>© {new Date().getFullYear()} DevSync</span></div><div className={styles.footerWordmark} aria-hidden="true">
        <VectorWordmark
          text="DevSync"
          background="transparent"
          textColor="#f3f4f6"
          shade="#34d399"
          accent="rgba(52, 211, 153, 0.65)"
          font={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: 280, letterSpacing: "-5px" }}
          handles={{ size: 64, spread: 27, labels: true }}
          style={{ minWidth: 0, minHeight: 0 }}
        />
      </div></footer>
        </div>
      </main>
    </div>
  );
}
