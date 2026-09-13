"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CheckCheck, Code2, GitBranch, GitPullRequest, Github, Globe2, Heart, Layers, Lightbulb, MessageSquare, MoreHorizontal, Pause, Play, Plus, Terminal, Users, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
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
  const [showcaseTab, setShowcaseTab] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const landingRef = useRef<HTMLDivElement>(null);
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
    const root = landingRef.current;
    if (!root || !window.IntersectionObserver) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealState = "visible";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    elements.forEach(element => {
      if (element.dataset.revealState === "visible") return;
      // Keep content visible by default, including without JavaScript.
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.dataset.revealState = "waiting";
      }
      observer.observe(element);
    });

    const revealFocusedContent = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-reveal]");
      if (element) {
        element.dataset.revealState = "visible";
        observer.unobserve(element);
      }
    };
    root.addEventListener("focusin", revealFocusedContent);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", revealFocusedContent);
      elements.forEach(element => {
        if (element.dataset.revealState === "waiting") delete element.dataset.revealState;
      });
    };
  }, [projects]);

  const moveSpotlight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || motionPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };

  const showcase = [
    { label: "Find your direction", icon: Layers, title: "An idea worth opening your editor for.", description: "Explore projects by the technologies you love and the problems you want to solve. Find a starting point that makes you curious.", href: "/projects", cta: "Discover a project", lines: ["Explore the possibilities", "Find a stack you enjoy", "Choose your next challenge"] },
    { label: "Find your people", icon: Users, title: "Different skills. A shared ambition.", description: "A great team brings different perspectives to the same problem. Explore teams, discover the roles they need, and find where you fit.", href: "/teams", cta: "Explore teams", lines: ["Meet your collaborators", "Bring your perspective", "Build a shared direction"] },
    { label: "Make your mark", icon: GitPullRequest, title: "Let the work tell your story.", description: "Turn the things you’re learning into real contributions. Take on a task, build alongside others, and give your next idea somewhere to grow.", href: session ? "/profile" : "/login", cta: "Start your next chapter", lines: ["Pick a meaningful task", "Make your contribution", "Keep building together"] },
  ];
  const activeShowcase = showcase[showcaseTab];

  const startHref = session ? "/dashboard" : "/login";

  return (
    <div ref={landingRef} className={styles.landing} data-motion={motionPaused ? "paused" : "running"}>
      <div className={styles.readingProgress} aria-hidden="true" />
      <button type="button" className={styles.motionControl} onClick={() => setMotionPaused(value => !value)} aria-pressed={motionPaused} aria-label={motionPaused ? "Resume page animations" : "Pause page animations"}>{motionPaused ? <Play size={13} /> : <Pause size={13} />}<span>{motionPaused ? "Resume motion" : "Pause motion"}</span></button>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <Header />
      <main id="main-content">
        <section onPointerMove={moveSpotlight} className={`${styles.hero} ${styles.container}`}>
          <div className={styles.heroAtmosphere} aria-hidden="true"><i /><i /><i /><span>+</span><span>+</span><span>+</span></div>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span className={styles.liveDot} /> YOUR NEXT CHAPTER STARTS WITH A COMMIT</div>
            <h1>Great code.<br />Even better<br /><span>company.</span></h1>
            <p className={styles.heroDescription}>Find your people. Build something real.<br className={styles.desktopBreak} /> A home for developers who want to turn side projects into shared progress.</p>
            <div className={styles.actions}>
              <Link href={startHref} className={styles.primaryButton}>{session ? "Open your workspace" : "Start building together"}<ArrowRight size={17} /></Link>
              <Link href="/projects" className={styles.secondaryButton}>Explore projects <ArrowRight size={16} /></Link>
            </div>
            <div className={styles.heroNote}><Github size={16} /><span>Your skills. Your curiosity. Your next team.</span></div>
          </div>

          <div className={styles.previewWrap}>
            <div className={styles.previewCaption}><span><span className={styles.liveDot} /> A LITTLE LESS SOLO. A LOT MORE SHIPPING.</span><span>WORKSPACE PREVIEW</span></div>
            <div className={styles.workspace}>
              <div className={styles.workspaceBar}><div className={styles.windowDots}><i /><i /><i /></div><span><Terminal size={13} /> devsync / workspace</span><MoreHorizontal size={17} /></div>
              <div className={styles.workspaceBody}>
                <aside className={styles.workspaceSidebar} aria-hidden="true"><div className={styles.sidebarLogo}><Terminal size={19} /></div><Layers size={17} /><Code2 size={17} /><Users size={17} /><MessageSquare size={17} /><div className={styles.sidebarAvatar}>Y</div></aside>
                <div className={styles.workspaceMain}>
                  <div className={styles.breadcrumb}>Workspace <span>/</span> <strong>Launchpad</strong><span className={styles.projectMark}><Globe2 size={12} /> Public</span></div>
                  <div className={styles.boardTitle}><div><h2>Let’s build something.</h2><p>One idea. Different skills. Shared momentum.</p></div><span className={styles.projectIcon}><Zap size={21} /></span></div>
                  <div className={styles.boardTabs}><span className={styles.activeTab}><Layers size={13} /> Project board</span><span><Code2 size={13} /> Code</span><span><Users size={13} /> Team</span><div className={styles.miniAvatars}><i>AK</i><i>JL</i><i>MN</i><i>+2</i></div></div>
                  <div className={styles.board}>
                    {[{ title: "To do", name: "Build the dashboard", tag: "Frontend", person: "AK", color: "purple" }, { title: "In progress", name: "Connect the API", tag: "Backend", person: "JL", color: "amber" }, { title: "Shipped", name: "Set up authentication", tag: "Infrastructure", person: "MN", color: "mint" }].map((task, index) => (
                      <div className={styles.boardColumn} key={task.title}>
                        <div className={styles.columnHeading}><span className={`${styles.columnDot} ${styles[task.color]}`} />{task.title}<span>1</span><Plus size={12} /></div>
                        <div className={styles.taskCard}><span className={styles.taskId}>LP-00{index + 1}<MoreHorizontal size={13} /></span><h3>{task.name}</h3><span className={`${styles.taskTag} ${styles[task.color]}`}>{task.tag}</span><div className={styles.taskBottom}><span>{index === 2 ? <CheckCheck size={13} /> : <MessageSquare size={12} />}{index === 2 ? "Complete" : index + 2}</span><i className={styles[task.color]}>{task.person}</i></div></div>
                        <div className={styles.addTask}><Plus size={12} /> Add a task</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.commitLine}><GitBranch size={13} /><span>main</span><span className={styles.commitHash}>a8f24c1</span><span>Good things happen together.</span><Check size={14} /></div>
                </div>
              </div>
            </div>
            <div className={styles.mergeCard}><div className={styles.mergeIcon}><GitPullRequest size={18} /></div><div><strong>Small commits. Big possibilities.</strong><span>Your next contribution starts here.</span></div><span className={styles.mergedBadge}>Merged</span></div>
          </div>
        </section>

        <div className={`${styles.stackStrip} ${styles.container}`}>
          <span>BRING YOUR STACK.<br /><strong>FIND YOUR PEOPLE.</strong></span>
          <div className={styles.marquee}>
            <div className={styles.marqueeTrack}>
              {[0, 1].map(copy => (
                <div className={styles.marqueeGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  <div className={styles.stackItem}><Code2 /> React</div>
                  <div className={styles.stackItem}><Terminal /> Next.js</div>
                  <div className={styles.stackItem}><span className={styles.tsIcon}>TS</span> TypeScript</div>
                  <div className={styles.stackItem}><GitBranch /> Python</div>
                  <div className={styles.stackItem}><Github /> GitHub</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="how-it-works" className={`${styles.section} ${styles.container}`}>
          <div data-reveal className={styles.sectionIntro}><div><p className={styles.eyebrow}>FROM “WHAT IF” TO “WE SHIPPED IT”</p><h2>Good ideas deserve a team.</h2></div><p>Everything you need to find your next project<br className={styles.desktopBreak} /> and the people to build it with.</p></div>
          <div className={styles.featureGrid}>
            {[{ icon: Code2, title: "Find your next big thing", text: "Discover projects that match your interests and stack. Bring what you know, learn something new.", link: "Explore projects", href: "/projects", number: "01" }, { icon: Users, title: "Meet your kind of builders", text: "Connect with developers who share your curiosity. Find a team where your skills make a difference.", link: "Find a team", href: "/teams", number: "02" }, { icon: GitPullRequest, title: "Make every commit count", text: "Take on tasks, contribute real code, and build a portfolio that shows what you can do.", link: "Meet the contributors", href: "/rankings", number: "03" }].map(feature => (
              <article data-reveal className={styles.featureCard} key={feature.number}><div className={styles.featureTop}><feature.icon size={23} /><span>{feature.number}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><Link href={feature.href}>{feature.link}<ArrowRight size={15} /></Link></article>
            ))}
          </div>
        </section>

        <section className={`${styles.showcaseSection} ${styles.container}`} aria-labelledby="showcase-heading">
          <div data-reveal className={styles.centeredIntro}>
            <p className={styles.eyebrow}>A SPACE FOR YOUR NEXT POSSIBILITY</p>
            <h2 id="showcase-heading">Less friction.<br /><span>More forward motion.</span></h2>
            <p>From the first spark to the next contribution, find your rhythm.</p>
          </div>
          <div data-reveal className={styles.showcaseShell} onPointerMove={moveSpotlight}>
            <div className={styles.showcaseTabs} role="tablist" aria-label="Explore collaboration">
              {showcase.map((item, index) => (
                <button key={item.label} type="button" role="tab" id={`showcase-tab-${index}`} aria-selected={showcaseTab === index} aria-controls="showcase-panel" tabIndex={showcaseTab === index ? 0 : -1} onClick={() => setShowcaseTab(index)} onKeyDown={event => {
                  let next = index;
                  if (event.key === "ArrowRight") next = (index + 1) % showcase.length;
                  else if (event.key === "ArrowLeft") next = (index + showcase.length - 1) % showcase.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = showcase.length - 1;
                  else return;
                  event.preventDefault();
                  setShowcaseTab(next);
                  document.getElementById(`showcase-tab-${next}`)?.focus();
                }}><item.icon size={17} /><span>{item.label}</span><span className={styles.tabNumber}>0{index + 1}</span></button>
              ))}
            </div>
            <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${showcaseTab}`} tabIndex={0} className={styles.showcasePanel}>
              <div className={styles.showcaseCopy} key={activeShowcase.title}>
                <span className={styles.eyebrow}>YOUR NEXT MOVE / 0{showcaseTab + 1}</span>
                <h3>{activeShowcase.title}</h3>
                <p>{activeShowcase.description}</p>
                <Link href={activeShowcase.href} className={styles.primaryButton}>{activeShowcase.cta}<ArrowRight size={16} /></Link>
              </div>
              <div className={styles.orbitScene}>
                <div className={styles.orbitArtwork} aria-hidden="true"><div className={styles.orbitRing} /><div className={styles.orbitRingOuter} /><div className={styles.orbitCore}><activeShowcase.icon size={34} /></div><span className={styles.orbitNode}><Code2 size={19} /></span><span className={styles.orbitNode}><Users size={19} /></span><span className={styles.orbitNode}><GitBranch size={19} /></span></div>
                <div className={styles.showcaseChecklist} key={activeShowcase.label}>{activeShowcase.lines.map((line, index) => <div key={line}><span>0{index + 1}</span>{line}<Check size={14} /></div>)}</div>
                <span className={styles.previewLabel}>A LITTLE INSPIRATION FOR YOUR JOURNEY</span>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className={`${styles.projectsSection} ${styles.container}`}>
          <div data-reveal className={styles.sectionIntro}><div><p className={styles.eyebrow}><span className={styles.liveDot} /> THE COMMUNITY IS BUILDING</p><h2>Your next project is out there.</h2></div><Link href="/projects" className={styles.secondaryButton}>View all projects <ArrowRight size={16} /></Link></div>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? <><span className={styles.srOnly}>Loading community projects</span><div className={styles.projectGrid}>{[1, 2, 3].map(item => <div key={item} className={styles.skeleton} aria-hidden="true"><div /><div /><div /></div>)}</div></> : error ? <div className={styles.emptyState}><Layers size={27} /><h3>Projects couldn’t load just now.</h3><p>Give it another try to see what the community is building.</p><button type="button" className={styles.secondaryButton} onClick={() => setAttempt(value => value + 1)}>Try again <ArrowRight size={15} /></button></div> : projects.length ? <div className={styles.projectGrid}>{projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} data-reveal className={styles.projectCard}><div className={styles.projectCardTop}><span className={styles.projectIcon}>{index % 3 === 0 ? <Code2 size={23} /> : index % 3 === 1 ? <Layers size={23} /> : <Terminal size={23} />}</span><ArrowRight size={18} /></div><h3>{project.title}</h3><p>{project.description || "A new idea, a fresh challenge, and a chance to build something together."}</p><div className={styles.techTags}>{project.tech_stack?.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}</div><div className={styles.projectCardFooter}><span><Users size={14} />{project.roles_needed?.length ? `${project.roles_needed.length} roles to explore` : "Explore the project"}</span><span>View project <ArrowRight size={13} /></span></div></Link>
            ))}</div> : <div className={styles.emptyState}><Code2 size={27} /><h3>Every great project starts with someone.</h3><p>Share your idea and give other builders a place to start.</p><Link href={session ? "/projects/new" : "/login"} className={styles.primaryButton}>Create the first project<Plus size={16} /></Link></div>}
          </div>
        </section>

        <section data-reveal className={`${styles.ideaHuntSection} ${styles.container}`} aria-labelledby="ideahunt-heading">
          <div className={styles.ideaHuntBrand}>
            <span className={styles.ideaHuntIcon}><Lightbulb size={28} aria-hidden="true" /></span>
            <div><strong>IdeaHunt<span>.pro</span></strong><span>FROM THE CREATOR OF DEVSYNC</span></div>
          </div>
          <div className={styles.ideaHuntCopy}>
            <p className={styles.eyebrow}>EVERY GREAT BUILD STARTS WITH A SPARK</p>
            <h2 id="ideahunt-heading">Got the skills. Need an idea?</h2>
            <p>Find your next project idea on IdeaHunt, then bring it to DevSync and find your people to build it with.</p>
            <a href="https://ideahunt.pro" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Find ideas on IdeaHunt<ArrowUpRight size={16} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
        </section>

        <section className={`${styles.journeySection} ${styles.container}`} aria-labelledby="journey-heading">
          <div data-reveal className={styles.sectionIntro}><div><p className={styles.eyebrow}>SMALL STEPS. REAL MOMENTUM.</p><h2 id="journey-heading">Your next adventure, in four commits.</h2></div><p>No perfect plan required.<br />Just a little curiosity and a place to start.</p></div>
          <div className={styles.journeyGrid}>
            {[
              { title: "Say hello", text: "Create a profile that introduces your interests, skills, and the things you want to learn.", icon: Users },
              { title: "Follow your curiosity", text: "Explore the projects and teams that make you think: I’d love to work on that.", icon: Globe2 },
              { title: "Find your first task", text: "Start with something manageable. A small contribution is a great way to get to know a project.", icon: Code2 },
              { title: "Build from there", text: "Keep showing up, share what you learn, and see where a little collaboration takes you.", icon: GitPullRequest },
            ].map((step, index) => <article data-reveal className={styles.journeyStep} key={step.title}><div className={styles.journeyMarker}><step.icon size={20} /><span>COMMIT 0{index + 1}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}
          </div>
        </section>

        <section className={`${styles.builderSection} ${styles.container}`} aria-labelledby="builders-heading">
          <div data-reveal className={styles.builderManifesto}><span className={styles.eyebrow}>CURIOSITY IS THE COMMON LANGUAGE</span><h2 id="builders-heading">For the weekend<br />tinkerers.<br />The late-night<br /><span>“what if” people.</span></h2><p>Whether you’re finding your feet or exploring your next big idea, there’s something powerful about building alongside someone else.</p><Link href={startHref} className={styles.secondaryButton}>Find your people<ArrowRight size={16} /></Link></div>
          <div className={styles.builderCards}>
            {[{ title: "Learning by doing", tag: "THE EXPLORER", icon: Code2, text: "Bring a new skill out of the tutorial and into a project. Ask questions, try things, and learn with others." }, { title: "An idea looking for a team", tag: "THE STARTER", icon: Zap, text: "That idea in your notes deserves a first commit. Share your direction and invite people to build with you." }, { title: "Experience worth sharing", tag: "THE COLLABORATOR", icon: GitBranch, text: "Bring your perspective to a fresh challenge. Help a project move forward and discover something new along the way." }].map(persona => <article data-reveal onPointerMove={moveSpotlight} className={styles.builderCard} key={persona.tag}><persona.icon size={23} /><div><span className={styles.eyebrow}>{persona.tag}</span><h3>{persona.title}</h3><p>{persona.text}</p></div><ArrowRight size={17} aria-hidden="true" /></article>)}
          </div>
        </section>

        <section className={`${styles.faqSection} ${styles.container}`} aria-labelledby="faq-heading">
          <div data-reveal className={styles.faqIntro}><p className={styles.eyebrow}>BEFORE YOUR FIRST COMMIT</p><h2 id="faq-heading">A few things<br />you might be wondering.</h2><p>Your next project starts with a little curiosity.</p><Terminal size={40} aria-hidden="true" /></div>
          <div data-reveal className={styles.faqList}>
            {[
              { question: "What is DevSync?", answer: "DevSync is a place for developers to discover projects, find teams, and build together. Explore the community to find a project that fits your interests or share an idea of your own." },
              { question: "Do I need to be an experienced developer?", answer: "You can explore at any stage of your journey. Look at each project’s stack and roles to find a suitable challenge, and be open with collaborators about what you know and what you’re learning." },
              { question: "Can I bring my own project?", answer: "Yes. Sign in and use the project creation page to introduce your idea, describe its technology stack, and explain the roles you’re looking for." },
              { question: "How do I find the right team?", answer: "Browse the Teams and Projects pages. Look for shared interests, a familiar stack or something you want to learn, and roles where you can contribute." },
              { question: "What if I’m just looking around?", answer: "Start by exploring the projects. You can get a feel for what people are building before deciding where you’d like to get involved." },
            ].map(item => <details className={styles.faqItem} key={item.question}><summary>{item.question}<Plus size={17} aria-hidden="true" /></summary><div className={styles.faqAnswer}><p>{item.answer}</p></div></details>)}
          </div>
        </section>

        <section data-reveal className={`${styles.finalCta} ${styles.container}`}><div className={styles.ctaOrb} aria-hidden="true"><Terminal size={34} /></div><p className={styles.eyebrow}>LESS “SOMEDAY.” MORE DAY ONE.</p><h2>Your next chapter.<br /><span>Built together.</span></h2><p>You bring the idea. We’ll help you find the people.</p><Link href={startHref} className={styles.primaryButton}>{session ? "Back to your workspace" : "Find your place on DevSync"}<ArrowRight size={17} /></Link><a href="#how-it-works" className={styles.ctaTextLink}>See how it works <ArrowDown size={13} /></a></section>
        <div className={`${styles.supportRow} ${styles.container}`}><span><Heart size={16} /> Help the next generation of builders.</span><Link href="/sponsors">Meet our sponsors & support DevSync <ArrowRight size={15} /></Link></div>
      </main>
      <footer className={`${styles.footer} ${styles.container}`}><Link href="/" className={styles.brand}><Terminal size={22} />DevSync<span>Built for the way developers connect.</span></Link><nav aria-label="Footer"><Link href="/projects">Projects</Link><Link href="/teams">Teams</Link><Link href="/rankings">Rankings</Link><Link href="/sponsors">Sponsors</Link></nav><div className={styles.footerBottom}><span>© {new Date().getFullYear()} DevSync</span><span>Made for humans who write code.<span className={styles.liveDot} /></span></div></footer>
    </div>
  );
}
