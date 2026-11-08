"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Code2, GitBranch, GitPullRequest, Search, Rocket, Layers, Lightbulb, Plus, Terminal, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import ReferenceHero from "@/components/ReferenceHero";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import styles from "./landing.module.css";

type Project = {
  id: string;
  title: string;
  description?: string;
  tech_stack?: string[];
  roles_needed?: string[];
};

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
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

  useEffect(() => {
    const root = pageRef.current;
    if (!root || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-entered", "true");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    root.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const showcase = [
    { label: "Discover", title: "Find your kind of project.", text: "A stack you enjoy. A problem worth solving.", href: "/projects", cta: "Explore projects", steps: ["React", "TypeScript", "Next.js"] },
    { label: "Connect", title: "Find your missing teammates.", text: "Different skills. One shared direction.", href: "/teams", cta: "Explore teams", steps: ["Frontend", "Backend", "Design"] },
    { label: "Contribute", title: "Make your first contribution.", text: "Start with one task. Build from there.", href: session ? "/profile" : "/login", cta: "Start contributing", steps: ["Pick a task", "Open a pull request", "Build together"] },
  ];
  const selectedShowcase = showcase[activeTab];

  const startHref = session ? "/dashboard" : "/login";

  return (
    <div ref={pageRef} className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <main id="main-content">
        <ReferenceHero startHref={startHref} signedIn={!!session} />

        <section id="how-it-works" className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionIntro}><div><h2>Good ideas need<br />good company.</h2></div></div>
          <div className={styles.visualGrid}>
            <article className={styles.discoveryTile}>
              <div className={styles.orbitArt} aria-hidden="true"><div className={styles.orbitRing} /><div className={styles.orbitRing} /><span className={styles.orbitCore}><Code2 size={42} /></span>{["React", "Node.js", "Design", "TypeScript"].map((tag,i)=><span key={tag} className={styles.orbitTag} data-position={i}>{tag}</span>)}</div>
              <div className={styles.tileCopy}><Search size={22} /><h3>A project that clicks.</h3><p>Find a project for your skills.</p><Link href="/projects">Discover projects <ArrowUpRight size={18}/></Link></div>
            </article>
            <article className={styles.teamTile}>
              <div className={styles.teamArt} aria-hidden="true"><span className={styles.teamLine}/>{["AK","JL","MN"].map((name,i)=><span key={name} className={styles.person} data-person={i}><span>{name}</span><small>{["Frontend","Backend","Design"][i]}</small></span>)}<span className={styles.teamCenter}><Users size={26}/></span></div>
              <div className={styles.tileCopy}><Users size={22}/><h3>Your people are here.</h3><p>Connect with developers to build with.</p><Link href="/teams">Meet the teams <ArrowUpRight size={18}/></Link></div>
            </article>
            <article className={styles.contributionTile}>
              <div className={styles.commitArt} aria-hidden="true"><div><GitBranch size={16}/><span>feature / your-first-build</span></div><p><span>+</span> Your perspective</p><p><span>+</span> A little curiosity</p><p><span>+</span> Something worth building</p><strong><Check size={15}/> Ready to contribute</strong></div>
              <div className={styles.tileCopy}><GitPullRequest size={22}/><h3>Small task. Real progress.</h3><p>Take on a task. Build your experience.</p><Link href="/rankings">Meet the contributors <ArrowUpRight size={18}/></Link></div>
            </article>
          </div>
        </section>

        <section data-reveal className={`${styles.restoredSection} ${styles.container}`} aria-labelledby="showcase-heading">
          <div className={styles.sectionIntro}><div><h2 id="showcase-heading">From “what if” to first commit.</h2></div></div>
          <div className={styles.showcaseShell}>
            <div className={styles.showcaseTabs} role="tablist" aria-label="Explore DevSync">
              {showcase.map((item, index) => <button key={item.label} id={`showcase-tab-${index}`} type="button" role="tab" aria-selected={activeTab === index} aria-controls="showcase-panel" tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={event => {
                let next = index;
                if (event.key === "ArrowRight") next = (index + 1) % showcase.length;
                else if (event.key === "ArrowLeft") next = (index + showcase.length - 1) % showcase.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = showcase.length - 1;
                else return;
                event.preventDefault();
                setActiveTab(next);
                document.getElementById(`showcase-tab-${next}`)?.focus();
              }}>{item.label}</button>)}
            </div>
            <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${activeTab}`} tabIndex={0} className={styles.showcasePanel}>
              <div className={styles.showcaseCopy} key={selectedShowcase.label}><h3>{selectedShowcase.title}</h3><p>{selectedShowcase.text}</p><Link href={selectedShowcase.href} className={styles.secondaryButton}>{selectedShowcase.cta}<ArrowRight size={16} /></Link></div>
              <div className={styles.playground} key={activeTab} aria-label={`Illustrative ${selectedShowcase.label.toLowerCase()} preview`}>
                <div className={styles.demoTop}><Terminal size={16}/><span>devsync / {selectedShowcase.label.toLowerCase()}</span><span className={styles.demoDots}>•••</span></div>
                {activeTab === 0 ? <><div className={styles.demoSearch}><Search size={17}/> Find your next project <span>⌘ K</span></div><div className={styles.demoProject}><span className={styles.demoLogo}><Layers size={30}/></span><div><strong>Community dashboard</strong><small>Looking for a frontend developer</small></div><ArrowUpRight size={19}/></div><div className={styles.demoTags}>{selectedShowcase.steps.map(x=><span key={x}>{x}</span>)}</div></> : activeTab === 1 ? <><div className={styles.demoPeople}>{["AK","JL","You"].map(x=><span key={x}>{x}</span>)}</div><div className={styles.demoTags}>{selectedShowcase.steps.map(x=><span key={x}>{x}</span>)}</div><p className={styles.demoNote}><Users size={16}/> Find a place for your skills.</p></> : <><div className={styles.demoTask}><span><Check size={19}/></span><div><strong>Build the project overview</strong><small>Your first contribution starts here</small></div></div><div className={styles.demoProgress}><i/></div><p className={styles.demoNote}><GitPullRequest size={17}/> One contribution at a time.</p></>}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className={`${styles.projectsSection} ${styles.container}`}>
          <div className={styles.sectionIntro}><div><h2>Real projects. Your next chapter.</h2></div><Link href="/projects" className={styles.secondaryButton}>View all projects <ArrowRight size={16} /></Link></div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <><span className={styles.srOnly}>Loading community projects</span><div className={styles.projectGrid}>{[1, 2, 3].map(item => <div key={item} className={styles.skeleton} aria-hidden="true"><div /><div /><div /></div>)}</div></> : error ? <div className={styles.emptyState}><Layers size={27} /><h3>Projects couldn’t load just now.</h3><p>Give it another try to see what the community is building.</p><button type="button" className={styles.secondaryButton} onClick={() => setAttempt(value => value + 1)}>Try again <ArrowRight size={15} /></button></div> : projects.length ? <div className={styles.projectGrid}>{projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectCard}><div className={styles.projectCardTop}><span className={styles.projectIcon}>{index % 3 === 0 ? <Code2 size={23} /> : index % 3 === 1 ? <Layers size={23} /> : <Terminal size={23} />}</span><ArrowRight size={18} /></div><h3>{project.title}</h3><p>{project.description || "Explore this project and its open roles."}</p><div className={styles.techTags}>{project.tech_stack?.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}</div><div className={styles.projectCardFooter}><span><Users size={14} />{project.roles_needed?.length ? `${project.roles_needed.length} roles to explore` : "Explore the project"}</span><span>View project <ArrowRight size={13} /></span></div></Link>
            ))}</div> : <div className={styles.emptyState}><Code2 size={27} /><h3>Every great project starts with someone.</h3><p>Share your idea and give other builders a place to start.</p><Link href={session ? "/projects/new" : "/login"} className={styles.primaryButton}>Create the first project<Plus size={16} /></Link></div>}
          </div>
        </section>

        <section className={`${styles.ideaHuntSection} ${styles.container}`} aria-labelledby="ideahunt-heading">
          <div className={styles.ideaHuntBrand}>
            <span className={styles.ideaHuntIcon}><Lightbulb size={28} aria-hidden="true" /></span>
            <div><strong>IdeaHunt<span>.pro</span></strong><span>Another project by the creator of DevSync</span></div>
          </div>
          <div className={styles.ideaHuntCopy}>

            <h2 id="ideahunt-heading">Need a project idea?</h2>
            <p>Find the spark on IdeaHunt. Build it with your people on DevSync.</p>
            <a href="https://ideahunt.pro" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Find ideas on IdeaHunt<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
        </section>

        <section data-reveal className={`${styles.faqSection} ${styles.container}`} aria-labelledby="faq-heading">
          <div><h2 id="faq-heading">Before you join</h2></div>
          <div className={styles.faqList}>
            {[
              { question: "What is DevSync?", answer: "DevSync helps developers discover projects, find teams, and build together. Explore the community or share an idea of your own." },
              { question: "Do I need to be an experienced developer?", answer: "You can explore at any stage. Check a project’s stack and roles to find a suitable challenge, and let collaborators know what you know and what you’re learning." },
              { question: "Can I bring my own project?", answer: "Yes. Sign in and create a project to introduce your idea, describe your technology stack, and explain which roles you need." },
              { question: "How do I find the right team?", answer: "Browse Teams and Projects. Look for shared interests, technologies you enjoy, and roles where you can contribute." },
              { question: "Can I just look around first?", answer: "Of course. Explore what people are building before deciding where you’d like to get involved." },
            ].map(item => <details className={styles.faqItem} key={item.question}><summary>{item.question}<Plus size={17} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}
          </div>
        </section>

        <section className={`${styles.finalCta} ${styles.container}`}>
          <span className={styles.launchMark} aria-hidden="true"><Rocket size={40}/></span><h2>Your next build<br />starts with a hello.</h2>

          <Link href={startHref} className={styles.primaryButton}>{session ? "Open your workspace" : "Get started"}<ArrowRight size={17} /></Link>
        </section>
        <div className={`${styles.supportRow} ${styles.container}`}><Link href="/sponsors">Meet our sponsors & support DevSync <ArrowRight size={15} /></Link></div>
      </main>
      <footer className={`${styles.footer} ${styles.container}`}><Link href="/" className={styles.brand}><Terminal size={22} />DevSync</Link><nav aria-label="Footer"><Link href="/projects">Projects</Link><Link href="/teams">Teams</Link><Link href="/rankings">Rankings</Link><Link href="/sponsors">Sponsors</Link></nav><div className={styles.footerBottom}><span>© {new Date().getFullYear()} DevSync</span></div><div className={styles.footerWordmark} aria-hidden="true">DevSync</div></footer>
    </div>
  );
}
