"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lightbulb, ListChecks, MessageSquare, Menu, Rocket, Terminal, Users, X } from "lucide-react";
import styles from "./ReferenceHero.module.css";

// Recreated from the supplied Arcade recording: a dark cyan aurora flow field.
// The field is procedural so it stays sharp, responsive, and independent of video playback.
const vertex = `attribute vec2 position; varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float; varying vec2 uv; uniform float time; uniform vec2 resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
void main(){
 vec2 p=vec2(uv.x,1.-uv.y);float t=time*.08;
 float drift=sin(t+p.x*5.)*.009+sin(t*.7+p.y*4.)*.006;
 float edge=.62-.44*p.x-.28*exp(-p.x/.07)+.12*exp(-pow((p.x-.15-drift)/.075,2.));
 edge+=.018*noise(vec2(p.x*7.+t*.15,p.y*4.));
 float d=p.y-edge;
 vec3 base=vec3(.039);
 vec3 cyan=vec3(.10,.34,.44),deepCyan=vec3(.035,.15,.20);
 vec3 c=mix(base,cyan,smoothstep(-.16,.025,d));
 c=mix(c,deepCyan,smoothstep(.015,.20,d));
 float lower=p.y-(.89-.32*p.x+sin(p.x*9.+t)*.025);
 float pool=smoothstep(-.08,.12,lower)*(1.-smoothstep(.45,.95,p.x));
 c=mix(c,cyan,pool*.85);
 c=mix(c,deepCyan,smoothstep(.65,1.2,p.x+p.y*.15)*smoothstep(.05,.35,d)*.22);
 float grain=hash(gl_FragCoord.xy)-.5;c+=grain*.028;
 gl_FragColor=vec4(c,1.);
}`;

export function FlowBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false });
    if (!canvas || !gl) return;
    const shaders: WebGLShader[] = [];
    const program = gl.createProgram();
    if (!program) return;
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl.createShader(type);
      if (!shader) return;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); gl.deleteProgram(program); return; }
      gl.attachShader(program, shader); shaders.push(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, "time");
    const resolution = gl.getUniformLocation(program, "resolution");
    let frame = 0, elapsed = 0, last = 0, visible = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draw = () => { gl.uniform1f(time, elapsed); gl.drawArrays(gl.TRIANGLES, 0, 6); };
    const resize = () => { const rect = canvas.getBoundingClientRect(); const ratio = Math.min(window.devicePixelRatio || 1, 1.5); const scale = Math.min(ratio, 4096 / Math.max(rect.width, rect.height)); canvas.width = Math.round(rect.width*scale); canvas.height = Math.round(rect.height*scale); gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(resolution,canvas.width,canvas.height); draw(); };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); intersection.observe(canvas);
    const animate = (now: number) => {
      if (last && visible && !document.hidden && !reduced.matches) { elapsed += Math.min((now-last)/1000,.05); draw(); }
      last = now; frame = requestAnimationFrame(animate);
    };
    resize(); frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); gl.deleteBuffer(buffer); shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); };
  }, []);
  return <canvas ref={canvasRef} className={className || styles.flow} aria-hidden="true" />;
}

export default function ReferenceHero({ startHref, signedIn }: { startHref: string; signedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <section className={styles.hero} aria-labelledby="hero-heading">
    <FlowBackground key="cyan-flow" />
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Terminal size={24} strokeWidth={2.5} />DevSync</Link>
      <nav className={`${styles.navigation} ${menuOpen ? styles.menuOpen : ""}`} aria-label="Main navigation">
        {["Projects", "Teams", "Rankings", "Profile", "Sponsors"].map(label => <Link key={label} href={`/${label.toLowerCase()}`}>{label}</Link>)}
      </nav>
      <div className={styles.headerActions}><Link className={styles.login} href="/projects">Explore projects</Link><Link className={styles.signup} href={startHref}>{signedIn ? "Workspace" : "Get started"}</Link></div>
      <button className={styles.menuButton} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    <div className={styles.heroLayout}>
    <div className={styles.content}>
      <h1 id="hero-heading">Find Your Next Project<br />Build It with a Team</h1>
      <p>Find developers who share your curiosity.<br />Real projects. Shared ideas. Better together.</p>
      <div className={styles.actions}>
        <Link className={styles.primaryAction} href="/projects">Explore open projects <ArrowRight size={18} /></Link>
        <Link className={styles.secondaryAction} href={startHref}>{signedIn ? "Open your workspace" : "Start building together"} <ArrowUpRight size={18} /></Link>
      </div>
    </div>
    <div className={styles.appPreview} aria-label="Example DevSync project workspace">
      <div className={styles.previewBar}><span><Terminal size={16} /> DevSync</span><small>Project preview</small></div>
      <div className={styles.previewBody}>

        <h2>Your next build.</h2>

        <div className={styles.previewMeta}><span>Community dashboard</span><span><Users size={14} /> 3 builders</span></div>
        <div className={styles.board}>
          {[
            {label: "To do", task: "Design the overview", tag: "Design", name: "Alex Kim", id: "DS-12", progress: "0/3", comments: 2, skin: "#c88964", hair: "#332521", shirt: "#7772cf", bg: "#e6dfff"},
            {label: "In progress", task: "Connect the API", tag: "Backend", name: "Jamie Lee", id: "DS-13", progress: "2/4", comments: 4, skin: "#e8b98e", hair: "#292b37", shirt: "#397fa3", bg: "#cce8f6"},
            {label: "Done", task: "Set up the project", tag: "Setup", name: "Morgan Noor", id: "DS-14", progress: "3/3", comments: 1, skin: "#986347", hair: "#24201e", shirt: "#379888", bg: "#c8eee4"},
          ].map(column => <div key={column.label} className={styles.boardColumn}>
            <div className={styles.columnTitle}><i />{column.label}<span>1</span></div>
            <div className={styles.taskCard}>
              <span className={styles.taskId}>{column.id}</span>
              <strong>{column.task}</strong>
              <span className={styles.taskTag}>{column.tag}</span>
              <div className={styles.taskFooter}>
                <span className={styles.taskStats}><span aria-label={`${column.progress} checklist items`}><ListChecks size={12} />{column.progress}</span><span aria-label={`${column.comments} comments`}><MessageSquare size={11} />{column.comments}</span></span>
                <svg className={styles.assigneeAvatar} viewBox="0 0 32 32" role="img" aria-label={`Assigned to ${column.name}`}><title>{`${column.name} · Assignee`}</title><circle cx="16" cy="16" r="16" fill={column.bg} /><path d="M3 32c0-9 5-13 13-13s13 4 13 13" fill={column.shirt} /><rect x="13" y="18" width="6" height="7" rx="3" fill={column.skin} /><ellipse cx="16" cy="13" rx="8" ry="10" fill={column.hair} /><ellipse cx="16" cy="14" rx="6" ry="8" fill={column.skin} /><path d="M9 12c-1-9 14-11 14 1-4-1-6-3-8-5-1 3-3 4-6 4" fill={column.hair} /><circle cx="14" cy="14" r=".65" fill="#292524" /><circle cx="19" cy="14" r=".65" fill="#292524" /><path d="M14 18q2 2 4 0" fill="none" stroke="#fff" strokeWidth=".8" strokeLinecap="round" /></svg>
              </div>
            </div>
          </div>)}
        </div>
        <div className={styles.previewFooter}><span className={styles.statusDot} />Built together.<ArrowUpRight size={15} /></div>
      </div>
    </div>
    </div>
    <ol className={styles.buildSteps} aria-label="Your path to building together">
      <li><Lightbulb className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Find your spark</strong><p>Discover a project you care about.</p></div></li>
      <li><Users className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Meet your people</strong><p>Connect with developers who share it.</p></div></li>
      <li><Rocket className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Make it happen</strong><p>Turn your next idea into a shared build.</p></div></li>
    </ol>
  </section>;
}
