/*
  Single-file Wave component using @react-three/fiber and @react-three/drei.
  - Full screen coverage
  - Flowing waves that react to cursor
*/

"use client"

import type React from "react"
import { useRef, Suspense, useEffect } from "react"
import * as THREE from "three"
import { Canvas, extend, useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"

// Wave shader material
const WaveMaterial = shaderMaterial(
    {
        time: 0,
        resolution: new THREE.Vector2(1, 1),
        pointer: new THREE.Vector2(0.0, 0.0),
    },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
      vUv = uv;
    }
  `,
  /* glsl */ `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 pointer;
    varying vec2 vUv;

    vec3 palette(float t) {
      vec3 a = vec3(0.0, 0.6, 0.35);
      vec3 b = vec3(0.3, 0.5, 0.4);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.0, 0.2, 0.1);
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= resolution.x / resolution.y;
      
      vec3 finalColor = vec3(0.0);
      
      // Create multiple flowing wave bands
      for(float i = 0.0; i < 4.0; i++) {
        float offset = i * 0.8;
        
        // Compute wave position influenced by cursor
        float waveY = sin(p.x * 2.0 + time * 0.5 + offset + pointer.x * 0.5) * 0.3;
        waveY += cos(p.x * 1.5 - time * 0.3 + i) * 0.2;
        waveY += pointer.y * 0.2;
        
        // Distance from wave center line
        float dist = abs(p.y - waveY + (i - 1.5) * 0.4);
        
        // Create glowing band
        float intensity = 0.015 / (dist + 0.01);
        intensity = pow(intensity, 1.5);
        
        vec3 col = palette(i * 0.25 + time * 0.1 + p.x * 0.2);
        finalColor += col * intensity * 0.15;
      }
      
      float alpha = clamp(length(finalColor), 0.0, 1.0);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
)

extend({ WaveMaterial })

export type WaveProps = {
    speed?: number
    className?: string
    style?: React.CSSProperties
}

function FullScreenQuad({
    speed = 1,
    mousePos,
}: {
    speed?: number
    mousePos: React.MutableRefObject<{ x: number; y: number }>
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const smoothPointer = useRef({ x: 0, y: 0 })

    useFrame((state, delta) => {
        if (!matRef.current) return
        matRef.current.uniforms.time.value += delta * speed
        matRef.current.uniforms.resolution.value.set(state.size.width, state.size.height)

        // Smooth follow cursor
        const lerpSpeed = 1.5
        smoothPointer.current.x += (mousePos.current.x - smoothPointer.current.x) * delta * lerpSpeed
        smoothPointer.current.y += (mousePos.current.y - smoothPointer.current.y) * delta * lerpSpeed

        matRef.current.uniforms.pointer.value.set(smoothPointer.current.x, smoothPointer.current.y)
    })

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            {/* @ts-expect-error - intrinsic element added via extend */}
            <waveMaterial ref={matRef} transparent depthTest={false} depthWrite={false} />
        </mesh>
    )
}

export function Wave({
    speed = 1,
    className,
    style,
}: WaveProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mousePos = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            mousePos.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mousePos.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                ...style,
            }}
        >
            <Canvas
                dpr={[1, 2]}
                frameloop="always"
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                style={{
                    background: "transparent",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
            >
                <Suspense fallback={null}>
                    <FullScreenQuad speed={speed} mousePos={mousePos} />
                </Suspense>
            </Canvas>
        </div>
    )
}
