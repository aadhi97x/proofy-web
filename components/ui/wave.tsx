"use client"

import React, { useRef, useState, Suspense } from "react"
import * as THREE from "three"
import { Canvas, extend, useFrame, useThree, ReactThreeFiber } from "@react-three/fiber"
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

    // Green Palette
    vec3 palette(float t) {
      vec3 a = vec3(0.0, 0.5, 0.0); // Bias mainly green
      vec3 b = vec3(0.0, 0.5, 0.0); // Amplitude
      vec3 c = vec3(0.5, 1.0, 0.5); // Frequency
      vec3 d = vec3(0.0, 0.3, 0.0); // Phase
      return a + b * cos(6.28318 * (c * t + d));
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0; 
      vec2 uv0 = uv;
      vec3 finalColor = vec3(0.0);

      // Reduced pointer influence to avoid strong center pull
      uv = uv * tiles; 
      
      // Removed the exponential falloff that created the "box" vignette
      // float d = length(uv) * exp(-length(uv0)); 
      
      float d = length(uv);

      vec3 col = palette(length(uv0) + time * 0.2);
      
      d = sin(d * 8.0 - time * 0.5) / 8.0;
      d = abs(d);
      
      // Sharpen the lines, make them neon
      d = pow(0.015 / d, 1.5);

      finalColor += col * d;

      // Ensure it covers full screen by removing the clamp that might hide edges
      // and boosting alpha
      float alpha = min(length(finalColor) * 0.8, 1.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
)

extend({ WaveMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            waveMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof WaveMaterial> & {
                ref?: React.Ref<THREE.ShaderMaterial>
                transparent?: boolean
            }
        }
    }
}

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
    width,
    height,
    pointerOverride,
    trackPointer = true,
}: {
    speed?: number
    tiles?: number
    width?: number | string
    height?: number | string
    pointerOverride?: { x: number; y: number }
    trackPointer?: boolean
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const { viewport } = useThree()

    useFrame((state, delta) => {
        if (!matRef.current) return
        matRef.current.uniforms.time.value += delta * speed
        matRef.current.uniforms.resolution.value.set(
            state.size.width,
            state.size.height,
        )

        if (pointerOverride) {
            matRef.current.uniforms.pointer.value.set(pointerOverride.x, pointerOverride.y)
        } else if (trackPointer) {
            matRef.current.uniforms.pointer.value.set(state.pointer.x, state.pointer.y)
        }

        matRef.current.uniforms.tiles.value = tiles
    })

    return (
        <group>
            <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={1} />
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[viewport.width, viewport.height]} />
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
    const [localPointer, setLocalPointer] = useState<{ x: number; y: number } | null>(null)

    return (
        <div
            className={className}
            style={{
                width,
                height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
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
                camera={{ position: [0, 0, 10] }}
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    <WaveQuad
                        speed={speed}
                        tiles={tiles}
                        width={width}
                        height={height}
                        pointerOverride={pointerOverride ?? (localPointer || undefined)}
                        trackPointer={!disablePointerTracking && !pointerOverride}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}
