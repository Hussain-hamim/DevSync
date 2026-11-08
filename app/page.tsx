"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Code2, GitBranch, GitPullRequest, Heart, Layers, Lightbulb, Plus, Terminal, Users } from "lucide-react";
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
    { label: "Discover", title: "Find a project that interests you", text: "Explore the technologies you enjoy and the problems you want to solve. Choose a project that gives you a reason to open your editor.", href: "/projects", cta: "Explore projects", steps: ["Explore the possibilities", "Find a stack you enjoy", "Choose your next challenge"] },
    { label: "Connect", title: "Find people to build with", text: "Explore teams with shared interests and complementary skills. Look at the roles they need and find where you can contribute.", href: "/teams", cta: "Explore teams", steps: ["Meet your collaborators", "Bring your perspective", "Choose a shared direction"] },
    { label: "Contribute", title: "Build experience through contributions", text: "Take on a manageable task, learn alongside others, and turn your skills into real contributions. Build your experience one step at a time.", href: session ? "/profile" : "/login", cta: "Start contributing", steps: ["Pick a meaningful task", "Make your contribution", "Keep building together"] },
  ];
  const selectedShowcase = showcase[activeTab];

  const startHref = session ? "/dashboard" : "/login";

  return (
    <div ref={pageRef} className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <main id="main-content">
        <ReferenceHero startHref={startHref} signedIn={!!session} />

        <section id="how-it-works" className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>01 / How it works</p><h2>A project, a team, a place to contribute</h2></div><p>Everything you need to find your next project<br className={styles.desktopBreak} /> and the people to build it with.</p></div>
          <div className={styles.featureGrid}>
            {[{ icon: Code2, title: "Discover projects", text: "Discover projects that match your interests and stack. Bring what you know, learn something new.", link: "Explore projects", href: "/projects", number: "01" }, { icon: Users, title: "Find your team", text: "Connect with developers who share your curiosity. Find a team where your skills make a difference.", link: "Find a team", href: "/teams", number: "02" }, { icon: GitPullRequest, title: "Build your experience", text: "Take on tasks, contribute real code, and build a portfolio that shows what you can do.", link: "Meet the contributors", href: "/rankings", number: "03" }].map(feature => (
              <article className={styles.featureCard} key={feature.number}><div className={styles.featureTop}><feature.icon size={23} /><span>{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><Link href={feature.href}>{feature.link}<ArrowRight size={15} /></Link></article>
            ))}
          </div>
        </section>

        <section data-reveal className={`${styles.restoredSection} ${styles.container}`} aria-labelledby="showcase-heading">
          <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>02 / Working together</p><h2 id="showcase-heading">Choose where to start</h2></div></div>
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
              <ol className={styles.showcaseSteps}>{selectedShowcase.steps.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}<Check size={16} aria-hidden="true" /></li>)}</ol>
            </div>
          </div>
        </section>

        <section id="projects" className={`${styles.projectsSection} ${styles.container}`}>
          <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>03 / Community projects</p><h2>Projects looking for collaborators</h2></div><Link href="/projects" className={styles.secondaryButton}>View all projects <ArrowRight size={16} /></Link></div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <><span className={styles.srOnly}>Loading community projects</span><div className={styles.projectGrid}>{[1, 2, 3].map(item => <div key={item} className={styles.skeleton} aria-hidden="true"><div /><div /><div /></div>)}</div></> : error ? <div className={styles.emptyState}><Layers size={27} /><h3>Projects couldn’t load just now.</h3><p>Give it another try to see what the community is building.</p><button type="button" className={styles.secondaryButton} onClick={() => setAttempt(value => value + 1)}>Try again <ArrowRight size={15} /></button></div> : projects.length ? <div className={styles.projectGrid}>{projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectCard}><div className={styles.projectCardTop}><span className={styles.projectIcon}>{index % 3 === 0 ? <Code2 size={23} /> : index % 3 === 1 ? <Layers size={23} /> : <Terminal size={23} />}</span><ArrowRight size={18} /></div><h3>{project.title}</h3><p>{project.description || "A new idea, a fresh challenge, and a chance to build something together."}</p><div className={styles.techTags}>{project.tech_stack?.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}</div><div className={styles.projectCardFooter}><span><Users size={14} />{project.roles_needed?.length ? `${project.roles_needed.length} roles to explore` : "Explore the project"}</span><span>View project <ArrowRight size={13} /></span></div></Link>
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
            <p>Find your next project idea on IdeaHunt, then bring it to DevSync and find your people to build it with.</p>
            <a href="https://ideahunt.pro" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Find ideas on IdeaHunt<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
        </section>

        <section data-reveal className={`${styles.restoredSection} ${styles.container}`} aria-labelledby="journey-heading">
          <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>04 / Your first contribution</p><h2 id="journey-heading">From introduction to first contribution</h2></div></div>
          <div className={styles.journeyGrid}>
            {[
              { title: "Introduce yourself", text: "Create a profile with your skills, interests, and what you want to learn." },
              { title: "Explore projects", text: "Look for a project or team that matches your interests and experience." },
              { title: "Find your first task", text: "Start small. Choose something manageable and get to know your collaborators." },
              { title: "Keep building", text: "Share what you learn, contribute regularly, and grow with your team." },
            ].map((step, index) => <article className={styles.journeyStep} key={step.title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
          </div>
        </section>

        <section data-reveal className={`${styles.restoredSection} ${styles.container}`} aria-labelledby="builders-heading">
          <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>05 / Who it’s for</p><h2 id="builders-heading">There’s more than one way to contribute</h2></div><p>Learning, starting, or sharing your experience?<br className={styles.desktopBreak} /> There’s more than one way to contribute.</p></div>
          <div className={styles.builderGrid}>
            {[
              { icon: Code2, title: "Learning by doing", text: "Take a skill beyond the tutorial. Ask questions, try things, and learn through a real project." },
              { icon: Lightbulb, title: "Starting something new", text: "Give the idea in your notes a first commit. Share your direction and find people to build with." },
              { icon: GitBranch, title: "Sharing your experience", text: "Bring a fresh perspective to a team. Help a project move forward and learn something along the way." },
            ].map(builder => <article className={styles.builderCard} key={builder.title}><builder.icon size={24} aria-hidden="true" /><h3>{builder.title}</h3><p>{builder.text}</p></article>)}
          </div>
        </section>

        <section data-reveal className={`${styles.faqSection} ${styles.container}`} aria-labelledby="faq-heading">
          <div><p className={styles.eyebrow}>06 / Questions</p><h2 id="faq-heading">Before you join</h2><p>Get to know DevSync before your first contribution.</p></div>
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
          <h2>Ready to build together?</h2>
          <p>Find a project that interests you and take the first step.</p>
          <Link href={startHref} className={styles.primaryButton}>{session ? "Open your workspace" : "Get started"}<ArrowRight size={17} /></Link>
        </section>
        <div className={`${styles.supportRow} ${styles.container}`}><span><Heart size={16} /> Help the next generation of builders.</span><Link href="/sponsors">Meet our sponsors & support DevSync <ArrowRight size={15} /></Link></div>
      </main>
      <footer className={`${styles.footer} ${styles.container}`}><Link href="/" className={styles.brand}><Terminal size={22} />DevSync<span>Built for the way developers connect.</span></Link><nav aria-label="Footer"><Link href="/projects">Projects</Link><Link href="/teams">Teams</Link><Link href="/rankings">Rankings</Link><Link href="/sponsors">Sponsors</Link></nav><div className={styles.footerBottom}><span>© {new Date().getFullYear()} DevSync</span><span>Made for humans who write code.<span className={styles.liveDot} /></span></div></footer>
    </div>
  );
}
