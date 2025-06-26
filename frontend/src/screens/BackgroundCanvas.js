import React, { useRef, useEffect } from "react";

const SYMBOLS = [
  // Type Alignment & Thread Local Storage
  "restrict", "_Alignas", "_Alignof", "_Thread_local",
  // Assembly & Attributes
  "attribute", "asm", "_Static_assert",
  // Exception Handling
  "setjmp", "longjmp",
  // Signal Handling
  "signal", "sigaction",
  // Atomic Operations
  "atomic_compare_exchange_strong",
  // Integer Types
  "uint_fast32_t", "int_least64_t",
  // Threading
  "thrd_create", "mtx_lock",
  // Preprocessor
  "##", "VA_ARGS", "_Pragma", "#pragma comment",
  // POSIX Threading
  "pthread_create", "sched_yield",
  // System Time
  "nanosleep", "futex",
  // Data Types
  "union", "volatile", "bitfield"
];
const COLORS = [
  "rgba(229,62,62,0.85)", // soft red
  "rgba(255,247,230,0.75)", // pale yellow
  "rgba(102,126,234,0.75)", // blue
  "rgba(35,35,35,0.75)", // dark gray
  "rgba(16,26,40,0.75)" // blue-black
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createSymbols(count, width, height) {
  return Array.from({ length: count }).map(() => {
    const fontSize = randomBetween(55, 112);
    return {
      x: randomBetween(0, width),
      y: randomBetween(0, height),
      dx: randomBetween(-0.2, 0.2),
      dy: randomBetween(-0.15, 0.15),
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      fontSize,
      opacity: randomBetween(0.85, 1.0),
      fadeSpeed: randomBetween(0.0001, 0.0003),
      fadeDir: Math.random() > 0.5 ? 1 : -1
    };
  });
}

const BackgroundCanvas = ({ theme = "dark" }) => {
  const canvasRef = useRef();
  const symbolsRef = useRef([]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      symbolsRef.current = createSymbols(32, width, height);
    }

    function drawGradient() {
      let colorStart, colorEnd;

      if (theme === "light") {
        colorStart = "#abd1f7";
        colorEnd = "#4f81b3";
      } else {
        colorStart = "#232323";
        colorEnd = "#101a28";
      }

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, colorStart);
      grad.addColorStop(1, colorEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    function animate(timestamp) {
      const deltaTime = timestamp - lastTimeRef.current || 1;
      lastTimeRef.current = timestamp;
      const smoothingFactor = deltaTime / 16.67;

      drawGradient();
      symbolsRef.current.forEach((sym) => {
        sym.x += sym.dx * smoothingFactor;
        sym.y += sym.dy * smoothingFactor;
        
        sym.opacity += sym.fadeSpeed * sym.fadeDir * smoothingFactor;
        if (sym.opacity > 1.0) { sym.opacity = 1.0; sym.fadeDir = -1; }
        if (sym.opacity < 0.85) { sym.opacity = 0.85; sym.fadeDir = 1; }
        
        if (sym.x < -120) sym.x = width + 120;
        if (sym.x > width + 120) sym.x = -120;
        if (sym.y < -120) sym.y = height + 120;
        if (sym.y > height + 120) sym.y = -120;
        
        ctx.save();
        ctx.globalAlpha = sym.opacity;
        ctx.font = `${sym.fontSize}px 'Fira Mono', 'Consolas', 'Courier New', monospace`;
        ctx.fillStyle = sym.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sym.symbol, sym.x, sym.y);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    }

    resize();
    animationId = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        zIndex: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        transition: "background 0.5s"
      }}
      aria-hidden="true"
    />
  );
};

export default BackgroundCanvas; 