import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NeuralBackgroundProps {
    className?: string;
    color?: string;
    trailOpacity?: number;
    particleCount?: number;
    speed?: number;
    scale?: number;
}

export default function NeuralBackground({
    className,
    color = "#00FF9C",
    // VIVID SETTINGS
    trailOpacity = 0.035,
    particleCount = 22000,
    speed = 1.6,
}: NeuralBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        // --- CONFIGURATION ---
        let width = container.clientWidth;
        let height = container.clientHeight;
        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };

        // --- PARTICLE CLASS ---
        class Particle {
            x: number;
            y: number;
            prevX: number;
            prevY: number;
            vx: number;
            vy: number;
            age: number;
            life: number;
            baseSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.prevX = this.x;
                this.prevY = this.y;
                this.vx = 0;
                this.vy = 0;
                this.age = Math.random() * 100;
                this.life = Math.random() * 300 + 200;
                this.baseSpeed = speed * (0.8 + Math.random() * 0.4);
            }

            update() {
                this.prevX = this.x;
                this.prevY = this.y;

                // 1. Flow Field 
                // Decreased zoom factor = Larger, more grouped patterns
                const zoom = 0.0025;
                const angle = (Math.cos(this.x * zoom) + Math.sin(this.y * zoom)) * Math.PI * 4;

                const forceX = Math.cos(angle);
                const forceY = Math.sin(angle);

                this.vx += forceX * 0.15 * this.baseSpeed;
                this.vy += forceY * 0.15 * this.baseSpeed;

                // 2. Mouse Interaction (Turbulence)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 220; // Reduced radius

                if (dist < radius) {
                    const force = (radius - dist) / radius;
                    const angleToMouse = Math.atan2(dy, dx);

                    // Reduced turbulence, more push
                    const pushX = -Math.cos(angleToMouse) * force * 3;
                    const pushY = -Math.sin(angleToMouse) * force * 3;

                    this.vx += pushX;
                    this.vy += pushY;
                }

                // 3. Physics
                this.x += this.vx;
                this.y += this.vy;

                this.vx *= 0.96;
                this.vy *= 0.96;

                // 4. Aging
                this.age++;
                if (this.age > this.life) {
                    this.reset();
                }

                // 5. Wrap
                if (this.x < 0) { this.x = width; this.prevX = width; }
                if (this.x > width) { this.x = 0; this.prevX = 0; }
                if (this.y < 0) { this.y = height; this.prevY = height; }
                if (this.y > height) { this.y = 0; this.prevY = 0; }

                // Anti-teleport
                if (Math.abs(this.x - this.prevX) > 100 || Math.abs(this.y - this.prevY) > 100) {
                    this.prevX = this.x;
                    this.prevY = this.y;
                }
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.prevX = this.x;
                this.prevY = this.y;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 300 + 200;
            }

            draw(context: CanvasRenderingContext2D) {
                context.beginPath();
                context.moveTo(this.prevX, this.prevY);
                context.lineTo(this.x, this.y);

                // Slightly lower alpha to accommodate grouping
                const lifeRatio = this.age / this.life;
                const alpha = Math.sin(lifeRatio * Math.PI);

                context.globalAlpha = alpha * 0.8;
                context.stroke();
            }
        }

        // --- INIT ---
        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `100%`;
            canvas.style.height = `100%`;

            // Fill black initially
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, width, height);

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // --- ANIMATE ---
        const animate = () => {
            ctx.globalAlpha = 1;
            ctx.fillStyle = `rgba(5, 5, 5, ${trailOpacity})`;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // --- EVENT ---
        const handleResize = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        // Start
        init();
        animate();

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, particleCount, speed, trailOpacity]);

    return (
        <div ref={containerRef} className={cn("relative w-full h-full bg-[#050505] overflow-hidden", className)}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
