"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lightbulb, Menu, Rocket, Terminal, Users, X } from "lucide-react";
import styles from "./ReferenceHero.module.css";
import VectorWordmark from "./originkit/ui/vector-wordmark";

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
      <div className={styles.headerActions}><Link className={styles.login} href="/projects">Explore projects</Link><Link className={styles.signup} href={signedIn ? "/teams" : startHref}>{signedIn ? "Find a team" : "Get started"}</Link></div>
      <button className={styles.menuButton} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    <div className={styles.heroLayout}>
    <div className={styles.content}>
      <h1 id="hero-heading">Find Your Next Project<br />Build It with a Team</h1>
      <p>Find developers who share your curiosity.<br />Real projects. Shared ideas. Better together.</p>
      <div className={styles.actions}>
        <Link className={styles.primaryAction} href="/projects">Explore open projects <ArrowRight size={18} /></Link>
        <Link className={styles.secondaryAction} href={signedIn ? "/teams" : startHref}>{signedIn ? "Find a team" : "Start building together"} <ArrowUpRight size={18} /></Link>
      </div>
    </div>
    <div className={styles.wordmark} aria-hidden="true">
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
    </div>
    </div>
    <ol className={styles.buildSteps} aria-label="Your path to building together">
      <li><Lightbulb className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Find your spark</strong><p>Discover a project you care about.</p></div></li>
      <li><Users className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Meet your people</strong><p>Connect with developers who share it.</p></div></li>
      <li><Rocket className={styles.stepIcon} size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>Make it happen</strong><p>Turn your next idea into a shared build.</p></div></li>
    </ol>
  </section>;
}
