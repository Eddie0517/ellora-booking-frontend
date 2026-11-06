import { useEffect, useRef, useState } from 'react'
import { Renderer, Camera, Transform, Program, Mesh, Sphere, Geometry } from 'ogl'
import { Sparkles, Star, Zap, Heart, MousePointerClick } from 'lucide-react'

// WebGL Vertex Shader for Iridescent Fluid Sphere
const sphereVertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uPulse;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec3 n = normalize(normal);

    // Dynamic wave ripples simulating liquid lacquer / crystal gloss
    float freq = 2.2;
    float wave1 = sin(position.x * freq + uTime * 1.4) * cos(position.y * freq + uTime * 1.2);
    float wave2 = sin(position.z * 2.8 + uTime * 1.6) * 0.5;
    float wave3 = cos((position.x + position.y) * 2.0 + uTime * 1.0) * 0.3;
    float displacement = (wave1 + wave2 + wave3) * (0.04 + uHover * 0.025);

    // Pulse shockwave when clicked
    float pulseEffect = sin(uPulse * 6.28) * exp(-uPulse * 2.0) * 0.07;
    displacement += pulseEffect;

    vec3 displacedPos = position + n * displacement;
    vPosition = displacedPos;
    vNormal = normalize(normalMatrix * n);

    vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
    vViewDir = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`

// WebGL Fragment Shader for Iridescent Top-Coat Luster & Fresnel Glint
const sphereFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vViewDir;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Fresnel rim calculation
    float NdotV = max(dot(normal, viewDir), 0.0);
    float fresnel = 1.0 - NdotV;
    float fresnelPower = pow(fresnel, 2.4);

    // Ellora Signature Palette:
    vec3 cBrand = vec3(0.847, 0.290, 0.420);       // #d84a6b primary brand
    vec3 cRoseLight = vec3(0.984, 0.812, 0.910);   // #fbcfe8 rose pink
    vec3 cGold = vec3(1.0, 0.88, 0.74);           // warm champagne sparkle
    vec3 cLilac = vec3(0.80, 0.65, 0.94);         // iridescent lavender
    vec3 cWhite = vec3(1.0, 1.0, 1.0);

    // Iridescent shifting spectrum
    float angle = dot(normal, vec3(0.577, 0.577, 0.577)) * 0.5 + 0.5;
    vec3 iridescent = mix(cBrand, cLilac, sin(angle * 6.28 + uTime * 0.7) * 0.5 + 0.5);
    iridescent = mix(iridescent, cGold, cos(angle * 3.14 + uTime * 0.5) * 0.5 + 0.5);

    // Dual specular reflections (studio softbox highlights)
    vec3 light1 = normalize(vec3(0.9, 1.1, 1.2));
    vec3 light2 = normalize(vec3(-1.0, -0.7, 0.9));

    vec3 half1 = normalize(light1 + viewDir);
    float spec1 = pow(max(dot(normal, half1), 0.0), 32.0);

    vec3 half2 = normalize(light2 + viewDir);
    float spec2 = pow(max(dot(normal, half2), 0.0), 16.0);

    // Translucent glass composition
    vec3 color = iridescent * 0.32;
    color += cRoseLight * (fresnelPower * 1.35);
    color += cWhite * (spec1 * 0.9 + spec2 * 0.35);
    color += cGold * (spec1 * 0.4);

    // Edge opacity with translucent center so internal Ellora logo shines
    float alpha = clamp(0.18 + fresnelPower * 0.76 + spec1 * 0.4, 0.0, 0.96);

    gl_FragColor = vec4(color, alpha);
  }
`

// Star Sparkles Particle Vertex Shader
const particleVertexShader = /* glsl */ `
  attribute vec3 position;
  attribute float scale;
  attribute float speed;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;

  varying float vAlpha;

  void main() {
    float angle = uTime * speed * 0.5;
    float cosA = cos(angle);
    float sinA = sin(angle);

    // Orbital rotation around Y axis
    vec3 rotatedPos = vec3(
      position.x * cosA - position.z * sinA,
      position.y + sin(uTime * speed + position.x) * 0.08,
      position.x * sinA + position.z * cosA
    );

    vec4 mvPos = modelViewMatrix * vec4(rotatedPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Twinkling point size
    float twinkle = sin(uTime * 3.0 * speed + position.y * 5.0) * 0.5 + 0.5;
    gl_PointSize = scale * (6.0 + twinkle * 8.0) * (300.0 / -mvPos.z);
    vAlpha = 0.3 + twinkle * 0.6;
  }
`

// Star Sparkles Particle Fragment Shader
const particleFragmentShader = /* glsl */ `
  precision highp float;

  varying float vAlpha;

  void main() {
    // Soft radial circle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    vec3 color = mix(vec3(1.0, 0.85, 0.92), vec3(1.0, 0.95, 0.80), dist * 2.0);

    gl_FragColor = vec4(color, glow * vAlpha);
  }
`

export function OglHeroSphere() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isVisibleRef = useRef(true)
  const animIdRef = useRef(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let renderer: Renderer | null = null

    try {
      renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    } catch {
      // Graceful fallback if WebGL not supported
      return
    }

    const gl = renderer.gl
    const camera = new Camera(gl, { fov: 36 })
    camera.position.set(0, 0, 4.3)

    const scene = new Transform()

    // 1. Crystal Sphere Mesh
    const sphereGeometry = new Sphere(gl, {
      radius: 1.35,
      widthSegments: 64,
      heightSegments: 64,
    })

    const sphereUniforms = {
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uHover: { value: 0 },
      uPulse: { value: 0 },
    }

    const sphereProgram = new Program(gl, {
      vertex: sphereVertexShader,
      fragment: sphereFragmentShader,
      uniforms: sphereUniforms,
      transparent: true,
      depthTest: true,
      cullFace: false,
    })

    const sphereMesh = new Mesh(gl, {
      geometry: sphereGeometry,
      program: sphereProgram,
    })
    sphereMesh.setParent(scene)

    // 2. Glimmering Sparkle Particles
    const numParticles = 65
    const positions = new Float32Array(numParticles * 3)
    const scales = new Float32Array(numParticles)
    const speeds = new Float32Array(numParticles)

    for (let i = 0; i < numParticles; i++) {
      // Golden spiral distribution on spherical shell
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      const radius = 1.6 + Math.random() * 0.8

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      scales[i] = 0.6 + Math.random() * 1.2
      speeds[i] = 0.3 + Math.random() * 0.6
    }

    const particleGeometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      scale: { size: 1, data: scales },
      speed: { size: 1, data: speeds },
    })

    const particleUniforms = {
      uTime: { value: 0 },
    }

    const particleProgram = new Program(gl, {
      vertex: particleVertexShader,
      fragment: particleFragmentShader,
      uniforms: particleUniforms,
      transparent: true,
      depthTest: false,
    })

    const particleMesh = new Mesh(gl, {
      geometry: particleGeometry,
      program: particleProgram,
      mode: gl.POINTS,
    })
    particleMesh.setParent(scene)

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      camera.perspective({ aspect: width / height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // IntersectionObserver to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    }, { threshold: 0.05 })
    observer.observe(container)

    // Smooth Drag & Inertia Interaction State
    const motion = {
      isDragging: false,
      startX: 0,
      startY: 0,
      targetRotY: 0,
      targetRotX: 0,
      currentRotY: 0,
      currentRotX: 0,
      targetHover: 0,
      currentHover: 0,
      pulseTime: 0,
    }

    const onPointerDown = (e: PointerEvent) => {
      motion.isDragging = true
      motion.startX = e.clientX
      motion.startY = e.clientY
      setIsInteracting(true)
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      setMousePos({ x, y })

      if (motion.isDragging) {
        const dx = e.clientX - motion.startX
        const dy = e.clientY - motion.startY
        motion.targetRotY += dx * 0.008
        motion.targetRotX += dy * 0.008
        motion.targetRotX = Math.max(-0.6, Math.min(0.6, motion.targetRotX))
        motion.startX = e.clientX
        motion.startY = e.clientY
      } else {
        motion.targetHover = 1.0
        motion.targetRotY += x * 0.0008
        motion.targetRotX = y * 0.25
      }
    }

    const onPointerUp = () => {
      motion.isDragging = false
      motion.targetHover = 0
      setIsInteracting(false)
    }

    const onPointerLeave = () => {
      motion.isDragging = false
      motion.targetHover = 0
      setIsInteracting(false)
      setMousePos({ x: 0, y: 0 })
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    container.addEventListener('pointerleave', onPointerLeave)

    // Render Animation Loop
    let lastTime = performance.now()
    let elapsed = 0

    const render = (now: number) => {
      animIdRef.current = requestAnimationFrame(render)
      if (!isVisibleRef.current) return

      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      elapsed += delta

      // Smooth damping interpolation
      motion.currentRotY += (motion.targetRotY - motion.currentRotY) * 0.06
      motion.currentRotX += (motion.targetRotX - motion.currentRotX) * 0.06
      motion.currentHover += (motion.targetHover - motion.currentHover) * 0.08

      // Idle gentle floating rotation
      sphereMesh.rotation.y = motion.currentRotY + elapsed * 0.22
      sphereMesh.rotation.x = motion.currentRotX + Math.sin(elapsed * 0.8) * 0.06
      sphereMesh.rotation.z = Math.cos(elapsed * 0.6) * 0.04

      // Particle mesh counter-rotation
      particleMesh.rotation.y = -elapsed * 0.12
      particleMesh.rotation.x = motion.currentRotX * 0.5

      // Uniform updates
      sphereUniforms.uTime.value = elapsed
      sphereUniforms.uHover.value = motion.currentHover

      // Decay pulse
      if (motion.pulseTime > 0) {
        motion.pulseTime = Math.max(0, motion.pulseTime - delta * 1.5)
        sphereUniforms.uPulse.value = 1.0 - motion.pulseTime
      } else {
        sphereUniforms.uPulse.value = 0
      }

      particleUniforms.uTime.value = elapsed

      renderer?.render({ scene, camera })
    }

    animIdRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animIdRef.current)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [pulseCount])

  const handleClickSphere = () => {
    setPulseCount((c) => c + 1)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClickSphere}
      className="relative mx-auto h-[380px] w-full max-w-[540px] cursor-grab select-none sm:h-[460px] md:h-[500px] active:cursor-grabbing"
      title="Chạm hoặc kéo để xoay quả cầu Ellora"
    >
      {/* Background Radial Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-pink-300/40 via-rose-400/25 to-pink-100/10 blur-3xl sm:h-[360px] sm:w-[360px]" />
        <div className="absolute h-[220px] w-[220px] rounded-full bg-rose-500/15 blur-2xl animate-pulse" />
      </div>

      {/* 3D WebGL Canvas for OGL Sphere */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
      />

      {/* CORE ELLORA LOGO INSIDE THE SPHERE */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate(-50%, -50%) perspective(800px) rotateY(${mousePos.x * 14}deg) rotateX(${-mousePos.y * 14}deg) scale(${isInteracting ? 1.05 : 1})`,
        }}
      >
        {/* Soft Inner Halo */}
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/40 p-4 shadow-[0_0_40px_rgba(216,74,107,0.35)] backdrop-blur-xs sm:h-36 sm:w-36">
          <div className="absolute inset-0 rounded-full border border-pink-200/60 bg-gradient-to-br from-white/70 via-rose-50/50 to-pink-100/30" />
          
          {/* Ellora Icon / Logo */}
          <img
            src="/ellora-icon.png"
            alt="Ellora Icon"
            className="relative z-10 h-16 w-auto object-contain drop-shadow-[0_4px_14px_rgba(216,74,107,0.4)] transition-transform duration-500 hover:scale-105 sm:h-20"
          />

          {/* Glistening highlight sweep */}
          <div className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-60 blur-xs" />
        </div>

        {/* Brand Tagline Beneath Logo */}
        <span className="mt-2.5 rounded-full border border-white/60 bg-white/70 px-3 py-0.5 text-[10px] font-bold tracking-widest text-brand uppercase shadow-xs backdrop-blur-md">
          BEAUTY & NAIL
        </span>
      </div>

      {/* 3D FLOATING GLASSMORPHISM HIGHLIGHT PILLS */}
      {/* Pill 1: Top Left */}
      <div
        className="pointer-events-none absolute left-2 top-6 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:left-4 sm:top-10"
        style={{
          transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-brand">
          <Sparkles size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">500+ Salon Tuyển Chọn</p>
          <p className="text-[10px] text-gray-500">Chuẩn chất lượng 5★</p>
        </div>
      </div>

      {/* Pill 2: Top Right */}
      <div
        className="pointer-events-none absolute right-2 top-8 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:right-4 sm:top-12"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * -10}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100/70 text-brand">
          <Zap size={16} className="text-brand fill-brand/30" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">Chốt Lịch Trong 30s</p>
          <p className="text-[10px] text-gray-500">Xác nhận tự động ngay</p>
        </div>
      </div>

      {/* Pill 3: Bottom Left */}
      <div
        className="pointer-events-none absolute bottom-8 left-2 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:bottom-12 sm:left-6"
        style={{
          transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * 12}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star size={16} className="fill-amber-400 text-amber-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">4.9 / 5.0 Đánh Giá</p>
          <p className="text-[10px] text-gray-500">Từ 12.000+ khách hàng</p>
        </div>
      </div>

      {/* Pill 4: Bottom Right */}
      <div
        className="pointer-events-none absolute bottom-6 right-2 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:bottom-10 sm:right-6"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-brand">
          <Heart size={16} className="fill-brand text-brand" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">Nail Art & Sơn Gel</p>
          <p className="text-[10px] text-gray-500">Cập nhật trend mới nhất</p>
        </div>
      </div>

      {/* Interactive Micro Hint */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/60 px-3 py-1 text-[11px] font-medium text-gray-500 backdrop-blur-xs transition hover:bg-white sm:bottom-3">
        <MousePointerClick size={12} className="text-brand animate-bounce" />
        <span>Kéo để xoay 3D • Nhấn để tạo sóng</span>
      </div>
    </div>
  )
}
