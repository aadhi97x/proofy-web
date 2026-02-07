/*
  Single-file Wave component using @react-three/fiber and @react-three/drei.
  - Transparent background
  - Centered plane in scene
  - Smooth pointer interpolation
*/

"use client"

import type React from "react"
import { useRef, useState, Suspense } from "react"
import * as THREE from "three"
import { Canvas, extend, useFrame } from "@react-three/fiber"
import { shaderMaterial, OrthographicCamera } from "@react-three/drei"

// Wave shader material
const WaveMaterial = shaderMaterial(
    {
        time: 0,
        resolution: new THREE.Vector2(1, 1),
        pointer: new THREE.Vector2(0.0, 0.0),
        tiles: 1.5,
    },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
    }
  `,
  /* glsl */ `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 pointer;
    uniform float tiles;
    varying vec2 vUv;

    vec3 palette(float t) {
      // Saturated Green + White palette for #00FF9C neon theme
      vec3 a = vec3(0.0, 0.7, 0.4);   // Strong green base
      vec3 b = vec3(0.2, 0.5, 0.3);   // Amplitude
      vec3 c = vec3(1.0, 1.0, 1.0);   // Frequency
      vec3 d = vec3(0.0, 0.25, 0.1);  // Phase - more green shift
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      vec2 uv0 = uv;
      vec3 finalColor = vec3(0.0);

      uv = uv * tiles - pointer;

      float d = length(uv) * exp(-length(uv0));
      vec3 col = palette(length(uv0) + time * 0.4);
      d = sin(d * 8.0 + time) / 8.0;
      d = abs(d);
      d = pow(0.02 / d, 2.0);
      finalColor += col * d;

      float alpha = clamp(length(finalColor), 0.0, 1.0);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
)

extend({ WaveMaterial })

export type WaveProps = {
    width?: number | string
    height?: number | string
    speed?: number
    tiles?: number
    pointer?: { x: number; y: number }
    disablePointerTracking?: boolean
    dpr?: number | [number, number]
    onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void
    className?: string
    style?: React.CSSProperties
}

function WaveQuad({
    speed = 1,
    tiles = 1.5,
    pointerOverride,
    trackPointer = true,
}: {
    speed?: number
    tiles?: number
    pointerOverride?: { x: number; y: number }
    trackPointer?: boolean
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null)
    // Smoothed pointer position for seamless transitions
    const smoothPointer = useRef(new THREE.Vector2(0, 0))

    useFrame((state, delta) => {
        if (!matRef.current) return
        matRef.current.uniforms.time.value += delta * speed
        matRef.current.uniforms.resolution.value.set(
            state.size.width,
            state.size.height,
        )

        // Get target pointer position
        let targetX = 0
        let targetY = 0

        if (pointerOverride) {
            targetX = pointerOverride.x
            targetY = pointerOverride.y
        } else if (trackPointer) {
            targetX = state.pointer.x
            targetY = state.pointer.y
        }

        // Smooth interpolation (lerp) for seamless movement
        const lerpFactor = 1 - Math.pow(0.001, delta) // Smooth easing
        smoothPointer.current.x += (targetX - smoothPointer.current.x) * lerpFactor * 3
        smoothPointer.current.y += (targetY - smoothPointer.current.y) * lerpFactor * 3

        matRef.current.uniforms.pointer.value.set(
            smoothPointer.current.x,
            smoothPointer.current.y
        )
        matRef.current.uniforms.tiles.value = tiles
    })

    return (
        <group>
            <OrthographicCamera makeDefault position={[0, 0, 10]} />
            <mesh position={[0, 0, 0]}>
                {/* Use viewport-sized plane */}
                <planeGeometry args={[2, 2]} />
                {/* @ts-expect-error - intrinsic element added via extend */}
                <waveMaterial ref={matRef} transparent />
            </mesh>
        </group>
    )
}

export function Wave({
    width = "100%",
    height = "100%",
    speed = 1,
    tiles = 1.5,
    pointer: pointerOverride,
    disablePointerTracking = false,
    dpr = [1, 2],
    onPointerMove,
    className,
    style,
}: WaveProps) {
    const [localPointer, setLocalPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

    return (
        <div
            className={className}
            style={{
                width,
                height,
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                ...style,
            }}
            onPointerMove={(e) => {
                if (!disablePointerTracking && !pointerOverride) {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
                    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
                    setLocalPointer({ x: nx, y: ny })
                }
                onPointerMove?.(e)
            }}
        >
            <Canvas
                dpr={dpr}
                frameloop="always"
                gl={{ antialias: true, alpha: true }}
                style={{
                    background: "transparent",
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%"
                }}
            >
                <Suspense fallback={null}>
                    <WaveQuad
                        speed={speed}
                        tiles={tiles}
                        pointerOverride={pointerOverride ?? localPointer}
                        trackPointer={!disablePointerTracking && !pointerOverride}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}
