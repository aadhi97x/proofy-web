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
    trailOpacity = 0.08, // Lower opacity = longer, smoother trails
    particleCount = 2000, // Significantly increased for "intense" look
    speed = 1.2,
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
        let mouse = { x: -1000, y: -1000, active: false };

        // --- PARTICLE CLASS ---
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            age: number;
            life: number;
            baseSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 300 + 100;
                this.baseSpeed = speed * (0.5 + Math.random() * 0.5); // Varied speeds
            }

            update() {
                // 1. Flow Field Math (Simplex-ish noise)
                // We calculate an angle based on position to create the "flow"
                // Increased frequency for more "swirly" vivid look
                const angle = (Math.cos(this.x * 0.003) + Math.sin(this.y * 0.003)) * Math.PI * 1.5;

                // 2. Add force from flow field
                const forceX = Math.cos(angle);
                const forceY = Math.sin(angle);

                this.vx += forceX * 0.1 * this.baseSpeed;
                this.vy += forceY * 0.1 * this.baseSpeed;

                // 3. Strong Mouse Repulsion / Breakdown
                // "Break down and flow field around the cursor"
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 250; // Larger radius

                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    // Strong repulsion
                    const pushStrength = 2.5;
                    this.vx -= (dx / distance) * force * pushStrength;
                    this.vy -= (dy / distance) * force * pushStrength;

                    // Add "chaos" (breakdown) to velocity when near mouse
                    this.vx += (Math.random() - 0.5) * force * 1.5;
                    this.vy += (Math.random() - 0.5) * force * 1.5;
                }

                // 4. Apply Velocity & Friction
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.96;
                this.vy *= 0.96;

                // 5. Aging
                this.age++;
                if (this.age > this.life) {
                    this.reset();
                }

                // 6. Wrap around screen
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 300 + 100;
            }

            draw(context: CanvasRenderingContext2D) {
                // Vividness: Higher opacity for new particles
                const alpha = Math.min(1, (1 - Math.abs((this.age / this.life) - 0.5) * 2) + 0.2);
                context.globalAlpha = alpha;
                context.fillStyle = color;
                context.fillRect(this.x, this.y, 1.2, 1.2);
            }
        }

        // --- INITIALIZATION ---
        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // --- ANIMATION LOOP ---
        const animate = () => {
            // Create trails
            ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // --- EVENT LISTENERS ---
        const handleResize = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
            mouse.active = false;
        }

        // Start
        init();
        animate();

        // Use window listener for easier tracking if needed, 
        // but container listener is usually safer for component isolation.
        // For hero background, we might want full interactivity.
        // Let's stick to container for now.
        window.addEventListener("resize", handleResize);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, trailOpacity, particleCount, speed]);

    return (
        <div ref={containerRef} className={cn("relative w-full h-full bg-black overflow-hidden pointer-events-auto", className)}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
