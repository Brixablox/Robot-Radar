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
  imageIndex: number;
};

type Props = {
  imageUrls?: string[];
  robotCount?: number;
};

const DEFAULT_IMAGES = [
  "/robots/robot1.png",
  "/robots/robot2.png",
  "/robots/robot3.png",
  "/robots/robot4.png",
];

export default function RobotTrailBackground({
  imageUrls = DEFAULT_IMAGES,
  robotCount = 8,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const robotsRef = useRef<Robot[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);

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

    const loadImages = async () => {
      const loaded = await Promise.all(
        imageUrls.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = () => resolve(img);
              img.onerror = () => resolve(img);
            })
        )
      );

      imagesRef.current = loaded;
    };

    const randomVelocity = () => {
      const speed = 0.18 + Math.random() * 0.28;
      const angle = Math.random() * Math.PI * 2;

      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    };

    const createRobots = () => {
      robotsRef.current = Array.from({ length: robotCount }, (_, i) => {
        const { vx, vy } = randomVelocity();
        const size = 18 + Math.random() * 10;

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          size,
          angle: Math.random() * Math.PI * 2,
          turnSpeed: (Math.random() - 0.5) * 0.01,
          trail: [],
          imageIndex: i % Math.max(imageUrls.length, 1),
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
      const speedFactor = delta * 0.06;

      for (const robot of robotsRef.current) {
        robot.x += robot.vx * speedFactor;
        robot.y += robot.vy * speedFactor;
        robot.angle += robot.turnSpeed * speedFactor;

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
          point.alpha -= 0.008 * speedFactor;
        }

        robot.trail = robot.trail.filter((point) => point.alpha > 0);
      }
    };

    const drawTrail = (robot: Robot) => {
      if (robot.trail.length < 2) return;

      for (let i = 1; i < robot.trail.length; i++) {
        const prev = robot.trail[i - 1];
        const curr = robot.trail[i];
        const alpha = Math.min(prev.alpha, curr.alpha) * 0.28;

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
      const img = imagesRef.current[robot.imageIndex];

      ctx.save();
      ctx.translate(robot.x, robot.y);
      ctx.rotate(robot.angle);

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = 0.18;
        ctx.drawImage(
          img,
          -robot.size / 2,
          -robot.size / 2,
          robot.size,
          robot.size
        );
      } else {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(
          -robot.size / 2,
          -robot.size / 2,
          robot.size,
          robot.size
        );
      }

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

    const init = async () => {
      resizeCanvas();
      await loadImages();
      createRobots();
      animationRef.current = requestAnimationFrame(render);
    };

    init();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [imageUrls, robotCount]);

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