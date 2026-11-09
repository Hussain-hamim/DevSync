/* eslint-disable */
// Originkit — props baked into the default export.
"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MAX_DPR = 2 // quality tier, not a design control (rule 10)
const REF_WIDTH = 1200 // the width the font size is quoted at
const MAX_TEX = 4096

// --- source constants, frozen (rule 11b) ---------------------------------
const HANDLES = 3 // the source builds exactly three
const CELL_ASPECT = 0.6 // 0.15 / 0.25 — cell height as a fraction of its width
const DRIFT_X = 0.08 // fraction of a cell
const DRIFT_Y = 0.04
const DRIFT_RATE = 1.3 // radians/sec at Speed 50 (source: t_ms * 0.0013)
const DRIFT_RATE_Y = 1.3 * 1.3
const SWEEP_RATE = 0.5 // uv/sec at Speed 50
// The source parks its no-pointer sweep at uv.y 0.15 of a frame whose atlas
// occupies 0..0.54 — 28% up the wordmark, through the x-height. Centred, that
// has to be derived from where the wordmark actually is, or the sweep runs
// along empty space below it.
const SWEEP_BAND = 0.28
const RESNAP = 0.2 // seconds between lattice re-snaps while sweeping
const DAMP_REF = 20 // Damping 100 -> lerp rate 20/sec; the source's 7 is 35
const SPEED_REF = 50
const LABEL_MAX = 0.6 // Labels on = readouts visible at all times, no height fade
const DOT_DIAMETER = 4 / 440 // measured off the reference atlas
const DOT_PITCH = 12 / 440

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x)
const fract = (x: number) => x - Math.floor(x)

// --- colour --------------------------------------------------------------
type RGBA = [number, number, number, number]

/**
 * ControlType.Color emits rgb()/rgba()/hsl()/hsla() and var(--token, value) as
 * well as hex, so a hex-only parse leaves the dial looking dead.
 */
function parseColor(input: string | undefined, fallback: RGBA): RGBA {
    if (!input) return fallback
    let s = String(input).trim()
    if (s.slice(0, 4).toLowerCase() === "var(") {
        const comma = s.indexOf(",")
        const close = s.lastIndexOf(")")
        if (comma < 0 || close < comma) return fallback
        s = s.slice(comma + 1, close).trim()
    }
    if (s[0] === "#") {
        let h = s.slice(1)
        if (h.length === 3 || h.length === 4) {
            let x = ""
            for (const c of h) x += c + c
            h = x
        }
        if (h.length === 6) h += "ff"
        if (h.length !== 8 || /[^0-9a-f]/i.test(h)) return fallback
        return [
            parseInt(h.slice(0, 2), 16) / 255,
            parseInt(h.slice(2, 4), 16) / 255,
            parseInt(h.slice(4, 6), 16) / 255,
            parseInt(h.slice(6, 8), 16) / 255,
        ]
    }
    const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)$/i)
    if (!m) return fallback
    const parts = m[2].split(/[\s,/]+/).filter((p) => p.length > 0)
    if (parts.length < 3) return fallback
    const num = (t: string, scale: number) => {
        const v = parseFloat(t)
        if (!Number.isFinite(v)) return 0
        return t.indexOf("%") >= 0 ? (v / 100) * scale : v
    }
    const alpha = parts.length > 3 ? clamp(num(parts[3], 1), 0, 1) : 1
    if (m[1].toLowerCase().slice(0, 3) === "rgb") {
        return [
            clamp(num(parts[0], 255) / 255, 0, 1),
            clamp(num(parts[1], 255) / 255, 0, 1),
            clamp(num(parts[2], 255) / 255, 0, 1),
            alpha,
        ]
    }
    const hh = fract(parseFloat(parts[0]) / 360)
    const sat = clamp(num(parts[1], 1), 0, 1)
    const li = clamp(num(parts[2], 1), 0, 1)
    const q = li < 0.5 ? li * (1 + sat) : li + sat - li * sat
    const p = 2 * li - q
    const chan = (t: number) => {
        let u = fract(t)
        if (u < 1 / 6) return p + (q - p) * 6 * u
        if (u < 1 / 2) return q
        if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6
        return p
    }
    return [chan(hh + 1 / 3), chan(hh), chan(hh - 1 / 3), alpha]
}

// --- GL ------------------------------------------------------------------
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;

uniform sampler2D uMap;
uniform vec2 uRes;      // host box, css px
uniform vec2 uAtlas;    // drawn wordmark size, css px
uniform vec2 uPtr;      // eased pointer, screen uv
uniform float uReach;   // reveal radius, as a fraction of the host width
uniform vec3 uText;
uniform vec3 uShade;
uniform vec4 uAccent;   // rig colour; its alpha IS the rig intensity
uniform vec2 uV0;
uniform vec2 uV1;
uniform vec2 uV2;
uniform float uHalf;    // handle half-side, in y-normalised units

varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// The source's blur: taps on a ring at even angles, each pushed out by a
// random amount, so six taps read as a soft disc rather than a hexagon.
vec2 blurRG(vec2 uv, float e) {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < 6; i++) {
        float fi = float(i);
        float th = radians(fi / 6.0 * 360.0);
        vec2 dir = vec2(cos(th), sin(th));
        vec2 off = dir * (hash(vec2(fi, uv.x + uv.y)) + e);
        sum += texture2D(uMap, uv + off * e);
    }
    return (sum / 6.0).rg;
}

// Perpendicular distance to a segment, plus the parameter along it — the
// parameter is what the dash pattern runs on.
vec2 segment(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    vec2 ap = p - a;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    return vec2(length(ap - ab * t), t);
}

// smoothstep with edge0 > edge1 is UNDEFINED in GLSL — the source's node
// graph writes it that way and gets away with it, raw GLSL does not, and the
// whole rig silently renders nothing. Written as 1 - smoothstep(lo, hi, x).
float stroke(float d, float lw, float px) {
    return 1.0 - smoothstep(lw, lw + px, d);
}

float dashedLine(vec2 p, vec2 a, vec2 b, float lw, float px) {
    vec2 s = segment(p, a, b);
    float dash = step(0.5, fract(s.y * length(b - a) * 100.0));
    return stroke(s.x, lw, px) * dash;
}

float boxEdge(vec2 p, vec2 c, float h, float lw, float px) {
    vec2 q = abs(p - c) - vec2(h);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    return stroke(abs(d), lw, px);
}

void main() {
    float aspect = uRes.x / uRes.y;

    // Centred on both axes.
    vec2 E = (vUv * uRes - (uRes - uAtlas) * 0.5) / uAtlas;
    float inside = step(0.0, E.x) * step(E.x, 1.0) * step(0.0, E.y) * step(E.y, 1.0);
    vec2 safeUv = clamp(E, 0.0, 1.0);

    float b = clamp(1.0 - E.y * 3.5, 0.0, 1.0) * 0.008;
    vec2 soft = blurRG(safeUv, b);
    vec2 sharp = blurRG(safeUv, b * 0.1);

    float d = length((vUv - uPtr) / vec2(1.0, aspect));
    float k = 1.0 - pow(smoothstep(0.0, max(uReach, 1e-4), d), 3.0);

    float mask = mix(soft.r, sharp.g, k) * inside;
    vec3 fill = mix(uShade, uText, smoothstep(0.0, 1.0, E.y));

    // Rig space: x scaled by aspect so a cell and a handle stay square.
    vec2 P = vec2(vUv.x * aspect, vUv.y);
    float px = 1.0 / uRes.y;
    float lw = px * 0.2;
    float lines = max(
        max(dashedLine(P, uV0, uV1, lw, px), dashedLine(P, uV1, uV2, lw, px)),
        dashedLine(P, uV2, uV0, lw, px)
    );
    float boxes = max(
        max(boxEdge(P, uV0, uHalf, lw, px), boxEdge(P, uV1, uHalf, lw, px)),
        boxEdge(P, uV2, uHalf, lw, px)
    );
    float A = max(lines, boxes) * uAccent.a * (1.0 - vUv.y);

    // Everything premultiplied from here, so the canvas composites cleanly
    // over the root background instead of fringing.
    vec4 card = vec4(fill * mask, mask);
    vec4 comp = vec4(uAccent.rgb * A, A) + card * (1.0 - A);

    // The source melts the wordmark's foot into the page by mixing toward an
    // 80%-opaque plate of the background colour. Bottom-anchored that plate
    // sat on the frame edge and was invisible; centred it would be a band of
    // flat colour under the wordmark. Fading the PREMULTIPLIED composite is
    // algebraically the same result over a background-coloured root — check
    // it at any weight — and needs no plate, so the background colour is now
    // only ever the root's CSS background.
    gl_FragColor = comp * pow(clamp(E.y, 0.0, 1.0), 0.7);
}`

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
    const make = (type: number, src: string) => {
        const sh = gl.createShader(type)!
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        return sh
    }
    const p = gl.createProgram()!
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs))
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs))
    gl.bindAttribLocation(p, 0, "aPos")
    gl.linkProgram(p)
    return p
}

// --- atlas ---------------------------------------------------------------
type Atlas = { canvas: HTMLCanvasElement; cssW: number; cssH: number }

type FontSpec = {
    family: string
    weight: string
    style: string
    size: number
    letterSpacing: string
}

function fontString(f: FontSpec, px: number) {
    return `${f.style} ${f.weight} ${px}px ${f.family}`
}

/**
 * Draws the two-channel atlas the shader samples: R is the solid fill, G the
 * dotted outline. The ground is OPAQUE black so upload never unpremultiplies
 * the antialiased edges (see the file header).
 */
function buildAtlas(
    text: string,
    f: FontSpec,
    drawFontPx: number,
    dpr: number
): Atlas | null {
    const probe = document.createElement("canvas").getContext("2d")
    if (!probe) return null

    const setFont = (ctx: CanvasRenderingContext2D, px: number) => {
        ctx.font = fontString(f, px)
        // Chrome and Safari support ctx.letterSpacing; older engines do not,
        // and a throw here would take the whole atlas down.
        try {
            if ("letterSpacing" in ctx) {
                ;(ctx as unknown as { letterSpacing: string }).letterSpacing =
                    f.letterSpacing
            }
        } catch (e) {
            /* engine without canvas letter-spacing — glyphs still measure */
        }
    }

    const measure = (px: number) => {
        setFont(probe, px)
        const m = probe.measureText(text)
        const asc = m.actualBoundingBoxAscent || px * 0.8
        const desc = m.actualBoundingBoxDescent || px * 0.22
        return { w: Math.max(1, m.width), asc, desc }
    }

    let fpx = Math.max(8, drawFontPx * dpr)
    let m = measure(fpx)
    let pad = fpx * 0.12
    const over = Math.max(
        (m.w + pad * 2) / MAX_TEX,
        (m.asc + m.desc + pad * 2) / MAX_TEX
    )
    if (over > 1) {
        fpx = Math.max(8, fpx / over)
        m = measure(fpx)
        pad = fpx * 0.12
    }

    const w = Math.max(1, Math.ceil(m.w + pad * 2))
    const h = Math.max(1, Math.ceil(m.asc + m.desc + pad * 2))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, w, h)
    setFont(ctx, fpx)
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = "left"
    ctx.globalCompositeOperation = "lighter"

    ctx.fillStyle = "#ff0000"
    ctx.fillText(text, pad, pad + m.asc)

    // Zero-length dashes with a round cap ARE the dots. A solid stroke here
    // would read as an outline, not as a vector path with points on it.
    // Dot diameter and pitch are the reference texture's, measured off it:
    // 4 px and 12 px against a 440 px glyph block, so they are quoted against
    // the block height and hold at any font size.
    const block = m.asc + m.desc
    ctx.strokeStyle = "#00ff00"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = Math.max(1, block * DOT_DIAMETER)
    ctx.setLineDash([0, Math.max(2, block * DOT_PITCH)])
    ctx.strokeText(text, pad, pad + m.asc)

    const cssPerPx = drawFontPx / fpx
    return { canvas, cssW: w * cssPerPx, cssH: h * cssPerPx }
}

// --- props ---------------------------------------------------------------
type HandleGroup = { size: number; spread: number; labels: boolean }

const HANDLE_DEFAULTS: HandleGroup = { size: 109, spread: 27, labels: true }

export interface VectorWordmarkProps {
    text?: string
    font?: React.CSSProperties
    background?: string
    textColor?: string
    shade?: string
    accent?: string
    reach?: number
    speed?: number
    damping?: number
    handles?: Partial<HandleGroup>
    style?: React.CSSProperties
}

function __OriginkitBase_VectorWordmark(props: VectorWordmarkProps) {
    const {
        text = "VECTOR",
        font = {
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: "200px",
            lineHeight: "1em",
            letterSpacing: "-0.02em",
            textAlign: "left",
        } as React.CSSProperties,
        background = "#000000",
        textColor = "#FFFFFF",
        shade = "#FFFFFF",
        accent = "#FFFFFF",
        reach = 290,
        speed = 50,
        damping = 60,
        handles,
        style,
    } = props

    // Spread-merge over a typed literal: a group the designer never opened
    // arrives undefined, and a hand-written ?? chain is where one missed key
    // silently pins a control forever (rule 11).
    const hg: HandleGroup = { ...HANDLE_DEFAULTS, ...(handles ?? {}) }

    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const labelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])

    const rawSize = font?.fontSize
    const fontSpec: FontSpec = {
        family: (font?.fontFamily as string) || "Inter, system-ui, sans-serif",
        weight: String(font?.fontWeight ?? 500),
        style: font?.fontStyle === "italic" ? "italic" : "normal",
        size: Math.max(8, parseFloat(String(rawSize ?? 240)) || 240),
        letterSpacing: String(font?.letterSpacing ?? "0px"),
    }

    const accentRGBA = parseColor(accent, [1, 1, 1, 0.4])
    const labelColor = `rgb(${Math.round(accentRGBA[0] * 255)}, ${Math.round(
        accentRGBA[1] * 255
    )}, ${Math.round(accentRGBA[2] * 255)})`

    // Every live input is read from a ref inside the loop, so changing a dial
    // never tears down the GL context (rule 6).
    const live = useRef({
        text,
        fontSpec,
        textColor,
        shade,
        background,
        accentRGBA,
        reach,
        speed,
        damping,
        hg,
    })
    live.current.text = text
    live.current.fontSpec = fontSpec
    live.current.textColor = textColor
    live.current.shade = shade
    live.current.background = background
    live.current.accentRGBA = accentRGBA
    live.current.reach = reach
    live.current.speed = speed
    live.current.damping = damping
    live.current.hg = hg

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const attrs: WebGLContextAttributes = {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: true,
            powerPreference: "high-performance",
        }
        const gl = (canvas.getContext("webgl2", attrs) ||
            canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null
        if (!gl) return
        const isGL2 =
            typeof WebGL2RenderingContext !== "undefined" &&
            gl instanceof WebGL2RenderingContext

        const prog = compile(gl, VERT, FRAG)
        const U = {
            map: gl.getUniformLocation(prog, "uMap"),
            res: gl.getUniformLocation(prog, "uRes"),
            atlas: gl.getUniformLocation(prog, "uAtlas"),
            ptr: gl.getUniformLocation(prog, "uPtr"),
            reach: gl.getUniformLocation(prog, "uReach"),
            text: gl.getUniformLocation(prog, "uText"),
            shade: gl.getUniformLocation(prog, "uShade"),
            accent: gl.getUniformLocation(prog, "uAccent"),
            v0: gl.getUniformLocation(prog, "uV0"),
            v1: gl.getUniformLocation(prog, "uV1"),
            v2: gl.getUniformLocation(prog, "uV2"),
            half: gl.getUniformLocation(prog, "uHalf"),
        }

        const quad = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        )
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.BLEND)

        const tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 255])
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        let alive = true

        // --- layout ------------------------------------------------------
        // offsetWidth/Height, never getBoundingClientRect: the rect carries
        // the Framer canvas zoom and the atlas would re-bake on every zoom
        // step (rule G).
        let boxW = Math.max(1, host.offsetWidth)
        let boxH = Math.max(1, host.offsetHeight)
        let boxDirty = true
        let dpr = 1
        let bufW = 0
        let bufH = 0
        // Ratios, not sizes: cssW / drawFontPx is invariant to the
        // resolution the atlas happens to be baked at, so the displayed size
        // is recomputed every frame from the live box while the texture is
        // only re-baked when it crosses a resolution tier.
        let atlasRatioW = 1
        let atlasRatioH = 1
        let atlasKey = ""

        function drawFontPx() {
            return live.current.fontSpec.size * (boxW / REF_WIDTH)
        }

        function resize() {
            boxW = Math.max(1, host!.offsetWidth)
            boxH = Math.max(1, host!.offsetHeight)
            dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            const w = Math.max(1, Math.round(boxW * dpr))
            const h = Math.max(1, Math.round(boxH * dpr))
            if (w === bufW && h === bufH) return
            bufW = w
            bufH = h
            canvas!.width = w
            canvas!.height = h
        }

        function rebuildAtlas() {
            const L = live.current
            const f = L.fontSpec
            const px = Math.max(8, drawFontPx())
            const atlas = buildAtlas(L.text || " ", f, px, dpr)
            if (!atlas) return
            atlasRatioW = Math.max(1e-4, atlas.cssW / px)
            atlasRatioH = Math.max(1e-4, atlas.cssH / px)
            // A family still downloading would otherwise bake the fallback
            // glyphs in forever — re-bake once it lands.
            if (typeof document !== "undefined" && document.fonts) {
                try {
                    const probe = fontString(f, 64)
                    if (!document.fonts.check(probe)) {
                        const again = () => {
                            if (alive) atlasKey = ""
                        }
                        document.fonts.load(probe, L.text).then(again, again)
                    }
                } catch (e) {
                    /* engine without FontFaceSet */
                }
            }
            gl!.bindTexture(gl!.TEXTURE_2D, tex)
            gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true)
            gl!.texImage2D(
                gl!.TEXTURE_2D,
                0,
                gl!.RGBA,
                gl!.RGBA,
                gl!.UNSIGNED_BYTE,
                atlas.canvas
            )
            gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false)
            const cw = atlas.canvas.width
            const ch = atlas.canvas.height
            const pot = (cw & (cw - 1)) === 0 && (ch & (ch - 1)) === 0
            // WebGL1 refuses mipmaps on a non-power-of-two texture; WebGL2
            // does not, and the wordmark's dotted channel aliases badly.
            if (isGL2 || pot) {
                gl!.generateMipmap(gl!.TEXTURE_2D)
                gl!.texParameteri(
                    gl!.TEXTURE_2D,
                    gl!.TEXTURE_MIN_FILTER,
                    gl!.LINEAR_MIPMAP_LINEAR
                )
            } else {
                gl!.texParameteri(
                    gl!.TEXTURE_2D,
                    gl!.TEXTURE_MIN_FILTER,
                    gl!.LINEAR
                )
            }
        }

        // --- pointer + lattice -------------------------------------------
        const target = { x: -0.5, y: 0.5 } // raw pointer, screen uv
        const eased = { x: -0.5, y: 0.5 } // what the shader reads
        const cells: { x: number; y: number }[] = []
        const verts: { x: number; y: number }[] = []
        for (let i = 0; i < HANDLES; i += 1) {
            cells.push({ x: -0.5, y: 0.5 })
            verts.push({ x: -0.5, y: 0.5 })
        }
        let hasPointer = false
        let sweepClock = 0
        let driftT = 0

        /**
         * The 3x3 neighbourhood of cell centres around (x, y), sorted by
         * distance, taking ranks 1..3 — rank 0 is the cell the cursor is IN,
         * and skipping it is what makes the rig frame the cursor.
         */
        function snap(x: number, y: number, cw: number, ch: number) {
            const cx = Math.floor(x / cw)
            const cy = Math.floor(y / ch)
            const found: { x: number; y: number; d: number }[] = []
            for (let i = -1; i <= 1; i += 1) {
                for (let j = -1; j <= 1; j += 1) {
                    const px = (cx + i + 0.5) * cw
                    const py = (cy + j + 0.5) * ch
                    found.push({ x: px, y: py, d: Math.hypot(px - x, py - y) })
                }
            }
            found.sort((a, b) => a.d - b.d)
            for (let i = 0; i < HANDLES; i += 1) {
                cells[i].x = found[i + 1].x
                cells[i].y = found[i + 1].y
            }
        }

        const onMove = (e: PointerEvent) => {
            hasPointer = true
            // A FRACTION of the rect, not a measurement: clientX and the rect
            // are in the same zoomed space, so the zoom divides out. This is
            // the one place getBoundingClientRect is the right tool — every
            // size the shader reads still comes from offsetWidth (rule G).
            const r = host!.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            target.x = (e.clientX - r.left) / r.width
            target.y = 1 - (e.clientY - r.top) / r.height
        }
        host.addEventListener("pointermove", onMove)

        // --- loop ---------------------------------------------------------
        let raf = 0
        let last = 0
        let running = true

        function sync() {
            const L = live.current
            if (boxDirty) {
                boxDirty = false
                resize()
            }
            const f = L.fontSpec
            const key = [
                L.text,
                f.family,
                f.weight,
                f.style,
                f.letterSpacing,
                dpr,
                Math.ceil(Math.max(8, drawFontPx()) / 64), // resolution tier
            ].join("|")
            if (key !== atlasKey) {
                atlasKey = key
                rebuildAtlas()
            }
        }

        function step(dt: number) {
            const L = live.current
            const rate = Math.max(0, L.speed) / SPEED_REF
            const cw = Math.max(0.01, L.hg.spread / 100)
            const ch = cw * CELL_ASPECT
            const aspect = boxW / boxH

            if (!hasPointer) {
                // No pointer yet — the source's mobile branch: sweep a fake
                // one across and re-snap the lattice on a fixed cadence.
                const band = (atlasRatioH * Math.max(8, drawFontPx())) / boxH
                target.x += dt * SWEEP_RATE * rate
                target.y = (1 - band) / 2 + SWEEP_BAND * band
                if (target.x > 1.5) {
                    target.x = -0.5
                    eased.x = -0.5
                }
                sweepClock += dt
                if (sweepClock >= RESNAP) {
                    sweepClock = 0
                    snap(target.x * aspect, target.y, cw, ch)
                }
            } else {
                snap(target.x * aspect, target.y, cw, ch)
            }

            const damp = clamp((L.damping / 100) * DAMP_REF * dt, 0, 1)
            eased.x += (target.x - eased.x) * damp
            eased.y += (target.y - eased.y) * damp

            driftT += dt * rate
            for (let i = 0; i < HANDLES; i += 1) {
                const c = cells[i]
                const sx = Math.round(c.x / cw - 0.5)
                const sy = Math.round(c.y / ch - 0.5)
                const h1 = fract(Math.sin(sx * 127.1 + sy * 311.7) * 43758.5453)
                const h2 = fract(Math.sin(sx * 269.5 + sy * 183.3) * 43758.5453)
                verts[i].x =
                    c.x +
                    DRIFT_X * cw * Math.sin(driftT * DRIFT_RATE + h1 * Math.PI * 2)
                verts[i].y =
                    c.y +
                    DRIFT_Y *
                        ch *
                        Math.sin(driftT * DRIFT_RATE_Y + h2 * Math.PI * 2)
            }
        }

        function writeLabels() {
            const L = live.current
            const aspect = boxW / boxH
            const half = L.hg.size / 2
            for (let i = 0; i < HANDLES; i += 1) {
                const el = labelRefs.current[i]
                if (!el) continue
                const bx = verts[i].x / aspect
                const by = verts[i].y
                const gx = Math.round(clamp(bx * 100, 0, 100))
                const gy = Math.round(clamp(by * 100, 0, 100))
                el.style.transform = `translate(${bx * boxW - half}px, ${
                    (1 - by) * boxH - half
                }px)`
                el.style.opacity = String(LABEL_MAX)
                el.textContent = `${gx}, ${gy}`
            }
        }

        function draw() {
            const L = live.current
            const tc = parseColor(L.textColor, [0.859, 0.918, 0.992, 1])
            const sc = parseColor(L.shade, [0.035, 0.063, 0.102, 1])
            const ac = L.accentRGBA

            gl!.viewport(0, 0, bufW, bufH)
            gl!.useProgram(prog)
            gl!.uniform1i(U.map, 0)
            gl!.activeTexture(gl!.TEXTURE0)
            gl!.bindTexture(gl!.TEXTURE_2D, tex)
            gl!.uniform2f(U.res, boxW, boxH)
            const px = Math.max(8, drawFontPx())
            gl!.uniform2f(U.atlas, atlasRatioW * px, atlasRatioH * px)
            gl!.uniform2f(U.ptr, eased.x, eased.y)
            gl!.uniform1f(U.reach, Math.max(1, L.reach) / boxW)
            gl!.uniform3f(U.text, tc[0], tc[1], tc[2])
            gl!.uniform3f(U.shade, sc[0], sc[1], sc[2])
            gl!.uniform4f(U.accent, ac[0], ac[1], ac[2], ac[3])
            gl!.uniform2f(U.v0, verts[0].x, verts[0].y)
            gl!.uniform2f(U.v1, verts[1].x, verts[1].y)
            gl!.uniform2f(U.v2, verts[2].x, verts[2].y)
            gl!.uniform1f(U.half, L.hg.size / 2 / boxH)
            gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
        }

        const frame = (now: number) => {
            const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
            last = now
            sync()
            step(dt)
            writeLabels()
            draw()
            raf = requestAnimationFrame(frame)
        }

        const gate = () => {
            if (running && !document.hidden) {
                if (!raf) {
                    last = 0
                    raf = requestAnimationFrame(frame)
                }
            } else if (raf) {
                cancelAnimationFrame(raf)
                raf = 0
            }
        }

        const ro = new ResizeObserver(() => {
            boxDirty = true
        })
        ro.observe(host)
        document.addEventListener("visibilitychange", gate)

        // Safety net for a family that finishes after the first bake but
        // that document.fonts.check() reported as present.
        if (typeof document !== "undefined" && document.fonts) {
            document.fonts.ready.then(
                () => { if (alive) atlasKey = "" },
                () => {}
            )
        }

        gate()

        return () => {
            alive = false
            running = false
            if (raf) cancelAnimationFrame(raf)
            ro.disconnect()
            host.removeEventListener("pointermove", onMove)
            document.removeEventListener("visibilitychange", gate)
            // Never loseContext(): getContext returns the same context per
            // canvas, so StrictMode's mount -> cleanup -> mount would reuse a
            // force-lost one and render black (rule 6).
        }
        // Built once; every live input is read from `live` inside the loop.
    }, [])

    return (
        <div
            ref={hostRef}
            style={{
                position: "relative",
                overflow: "hidden",
                background,
                // Floor before the spread, so an explicit size on the instance
                // still wins and Fit Content can't collapse the root to 0x0.
                minWidth: 1200,
                minHeight: 800,
                width: "100%",
                height: "100%",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
            {hg.labels
                ? [0, 1, 2].map((i) => (
                      <div
                          key={i}
                          ref={(el) => {
                              labelRefs.current[i] = el
                          }}
                          style={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              opacity: LABEL_MAX,
                              pointerEvents: "none",
                              whiteSpace: "nowrap",
                              fontFamily:
                                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                              fontSize: 11,
                              letterSpacing: "0.08em",
                              color: labelColor,
                          }}
                      />
                  ))
                : null}
        </div>
    )
}

const __originkitPresetProps = {
  "handles": {
    "size": 109,
    "labels": true,
    "spread": 27
  }
};

export default function VectorWordmark(props: Record<string, unknown>) {
  return <__OriginkitBase_VectorWordmark {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
