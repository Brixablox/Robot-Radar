"use client";

import { useEffect, useRef } from "react";

type TrailPoint = {
  x: number;
  y: number;
  alpha: number;
};

type Robot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  turnSpeed: number;
  trail: TrailPoint[];
};

function RobotTrailBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const robotsRef = useRef<Robot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastTime = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const randomVelocity = () => {
      const speed = 0.2 + Math.random() * 0.35;
      const angle = Math.random() * Math.PI * 2;

      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    };

    const createRobots = () => {
      robotsRef.current = Array.from({ length: 10 }, () => {
        const { vx, vy } = randomVelocity();

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          size: 16 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
          turnSpeed: (Math.random() - 0.5) * 0.01,
          trail: [],
        };
      });
    };

    const pushTrailPoint = (robot: Robot) => {
      const last = robot.trail[robot.trail.length - 1];

      if (!last) {
        robot.trail.push({ x: robot.x, y: robot.y, alpha: 1 });
        return;
      }

      const dx = robot.x - last.x;
      const dy = robot.y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 12) {
        robot.trail.push({ x: robot.x, y: robot.y, alpha: 1 });
      }
    };

    const updateRobots = (delta: number) => {
      const moveFactor = delta * 0.06;

      for (const robot of robotsRef.current) {
        robot.x += robot.vx * moveFactor;
        robot.y += robot.vy * moveFactor;
        robot.angle += robot.turnSpeed * moveFactor;

        if (robot.x <= 0 || robot.x >= width) {
          robot.vx *= -1;
          robot.x = Math.max(0, Math.min(width, robot.x));
        }

        if (robot.y <= 0 || robot.y >= height) {
          robot.vy *= -1;
          robot.y = Math.max(0, Math.min(height, robot.y));
        }

        pushTrailPoint(robot);

        for (const point of robot.trail) {
          point.alpha -= 0.001 * moveFactor;
        }

        robot.trail = robot.trail.filter((point) => point.alpha > 0);
      }
    };

    const drawTrail = (robot: Robot) => {
      if (robot.trail.length < 2) return;

      for (let i = 1; i < robot.trail.length; i++) {
        const prev = robot.trail[i - 1];
        const curr = robot.trail[i];
        const alpha = Math.min(prev.alpha, curr.alpha) * 0.32;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `rgba(103, 232, 249, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 8]);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    };

    const drawRobot = (robot: Robot) => {
      ctx.save();
      ctx.translate(robot.x, robot.y);
      ctx.rotate(robot.angle);

      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(-robot.size / 2, -robot.size / 2, robot.size, robot.size);

      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 1;
      ctx.strokeRect(-robot.size / 2, -robot.size / 2, robot.size, robot.size);

      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const render = (time: number) => {
      const delta = lastTime ? time - lastTime : 16;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      updateRobots(delta);

      for (const robot of robotsRef.current) {
        drawTrail(robot);
      }

      for (const robot of robotsRef.current) {
        drawRobot(robot);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    createRobots();
    animationRef.current = requestAnimationFrame(render);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #123456 0%, #0B1020 35%, #060b16 100%)",
        color: "white",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <RobotTrailBackground />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(103,232,249,0.08), transparent 30%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "160px 24px 40px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(34, 211, 238, 0.12)",
              color: "#67e8f9",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              marginBottom: "20px",
              fontSize: "0.9rem",
            }}
          >
            FRC scouting, simplified
          </div>

          <h1
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              lineHeight: 1,
              margin: 0,
              letterSpacing: "-0.05em",
            }}
          >
            RobotRadar
          </h1>

          <p
            style={{
              marginTop: "20px",
              fontSize: "1.15rem",
              color: "#cbd5e1",
              maxWidth: "640px",
              lineHeight: 1.7,
            }}
          >
            A sleek scouting dashboard for tracking robot capabilities, match
            performance, auto tendencies, endgame value, and alliance strategy.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "28px",
            }}
          >
            <a
              href="/scout"
              style={{
                textDecoration: "none",
                background: "#22d3ee",
                color: "#081626",
                padding: "14px 20px",
                borderRadius: "14px",
                fontWeight: 800,
                boxShadow: "0 10px 30px rgba(34, 211, 238, 0.25)",
                transition: "transform 0.2s ease",
              }}
            >
              Start Scouting
            </a>

            <a
              href="/teams"
              style={{
                textDecoration: "none",
                color: "#e2e8f0",
                padding: "14px 20px",
                borderRadius: "14px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "rgba(255,255,255,0.03)",
                fontWeight: 700,
              }}
            >
              View Teams
            </a>
            <a
              href="/auth/signup"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, #22d3ee, #0891b2)",
                color: "#04111f",
                padding: "14px 20px",
                borderRadius: "14px",
                fontWeight: 800,
                boxShadow: "0 10px 30px rgba(34, 211, 238, 0.35)",
                transition: "transform 0.2s ease",
              }}
            >
              Sign Up
            </a>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            minHeight: "420px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "40px",
              borderRadius: "28px",
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(59,130,246,0.1))",
              border: "1px solid rgba(34, 211, 238, 0.16)",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "20px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(34, 211, 238, 0.16)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.16)",
              filter: "blur(50px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "70px",
              borderRadius: "24px",
              background: "rgba(8, 22, 38, 0.85)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              padding: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
                color: "#94a3b8",
              }}
            >
              <span>Robot Profile</span>
              <span style={{ color: "#67e8f9" }}>Live Match Intel</span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {[
                "Accurate Info",
                "Trusted by many",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(148, 163, 184, 0.12)",
                    borderRadius: "16px",
                    padding: "16px",
                    color: "#e2e8f0",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}