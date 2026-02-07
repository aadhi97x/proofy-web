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
    trailOpacity = 0.15, // Higher opacity for clearer trails? No, strictly controlls fade. 
    // If we want "vivid", we want the trails to stack up a bit but not become a solid block.
    // 0.1 is usually good for lines.
    particleCount = 5000,
    speed = 1.5,
}: NeuralBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- CONFIGURATION ---
        let width = container.clientWidth;
        let height = container.clientHeight;
        let particles: Particle[] = [];
        let animationFrameId: number;
        // Track mouse influence
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
            history: { x: number, y: number }[];

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.prevX = this.x;
                this.prevY = this.y;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 200 + 100;
                this.baseSpeed = speed * (0.8 + Math.random() * 0.4);
                this.history = [];
            }

            update() {
                this.prevX = this.x;
                this.prevY = this.y;

                // 1. Flow Field (Simplex-ish)
                // Adjust scale for "swirly" look
                const zoom = 0.004;
                const angle = (Math.cos(this.x * zoom) + Math.sin(this.y * zoom)) * Math.PI * 2;

                const forceX = Math.cos(angle);
                const forceY = Math.sin(angle);

                this.vx += forceX * 0.1 * this.baseSpeed;
                this.vy += forceY * 0.1 * this.baseSpeed;

                // 2. Mouse Interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 200;

                if (dist < radius) {
                    const force = (radius - dist) / radius;
                    const angleToMouse = Math.atan2(dy, dx);

                    // Disperse / Breakdown
                    // We push them away OR swirl them. "Break down and flow field around"
                    // Let's do a turbulent push.
                    const pushX = -Math.cos(angleToMouse) * force * 5;
                    const pushY = -Math.sin(angleToMouse) * force * 5;

                    // Add some noise
                    this.vx += pushX + (Math.random() - 0.5);
                    this.vy += pushY + (Math.random() - 0.5);
                }

                // 3. Physics
                this.x += this.vx;
                this.y += this.vy;

                this.vx *= 0.94; // Friction
                this.vy *= 0.94;

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

                // Anti-teleport line fix
                if (Math.abs(this.x - this.prevX) > 50 || Math.abs(this.y - this.prevY) > 50) {
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
                this.life = Math.random() * 200 + 100;
            }

            draw(context: CanvasRenderingContext2D) {
                // Line drawing for continuous stroke
                context.beginPath();
                context.moveTo(this.prevX, this.prevY);
                context.lineTo(this.x, this.y);

                // Intensity mapping
                const lifeRatio = this.age / this.life;
                const alpha = Math.sin(lifeRatio * Math.PI); // Smooth fade in/out

                context.globalAlpha = alpha * 0.8; // Max alpha
                context.strokeStyle = color;
                context.lineWidth = 1.5;
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

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // --- ANIMATE ---
        const animate = () => {
            // Trail effect: clear with high transparency
            ctx.globalAlpha = 1;
            ctx.fillStyle = `rgba(5, 5, 5, ${trailOpacity})`; // Matches --charcoal #050505
            ctx.fillRect(0, 0, width, height);

            // Draw all particles
            // Batch drawing state changes for performance?
            // Actually standard loop is fine for 5000 on modern devices.
            // But setting strokeStyle 5000 times is slow.

            ctx.fillStyle = color; // Unused for lines
            ctx.strokeStyle = color;

            // Batching lines is tricky with varying opacity.
            // We'll trust the browser on this for 5k.
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
        window.addEventListener("mousemove", handleMouseMove); // Window to catch cursor even if fast

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
