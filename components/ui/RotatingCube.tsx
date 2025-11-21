"use client";

// Three.js core library handles low-level 3D objects, cameras, renderers, etc.
import * as THREE from "three";
// React hooks let us wire Three.js lifecycle into the React component tree.
import React, { useEffect, useRef } from "react";

type RotatingCubeProps = {
    sizePx?: number;
    className?: string;
};

export function RotatingCube({ sizePx = 180, className = "" }: RotatingCubeProps) {
    const containerRef = useRef<HTMLDivElement | null>(null); // DOM node where the WebGL canvas will be injected
    const frameRef = useRef<number | null>(null); // Stores the active requestAnimationFrame id so we can cancel it on cleanup

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene(); // Scene is the root graph: everything added here becomes renderable

        const geometry = new THREE.BoxGeometry(); // Creates vertices/faces for a 1x1x1 cube
        geometry.center(); // Recenters geometry so rotations happen around the middle instead of a corner
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Simple unlit wireframe material
        const cube = new THREE.Mesh(geometry); // Mesh = geometry + material; this is the object that will rotate
        scene.add(cube); // <--- The cube enters the scene graph here and will be drawn once the scene renders

        const camera = new THREE.PerspectiveCamera(); // 45° FOV, square aspect ratio, clipping planes 0.1-100 units
        camera.position.set(3, 3, 3); // Pull camera back/up so the cube fits in frame
        camera.lookAt(0, 0, 0); // Ensure the camera points to the cube positioned at origin

        const renderer = new THREE.WebGLRenderer(); // WebGL renderer outputs pixels to a canvas
        renderer.setSize(sizePx, sizePx, false); // Internal render resolution matches requested size
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // Keep high-DPI displays sharp but capped for perf
        renderer.setClearColor(0x000000, 0); // Transparent background so parent styles show through
        renderer.domElement.style.width = "50%";
        renderer.domElement.style.height = "50%";

        if (containerRef.current) {
            // StrictMode mounts components twice in dev; clear old canvas before appending the new one
            containerRef.current.replaceChildren(renderer.domElement); // removes old canvas first
        }

        const animate = () => {
            cube.rotation.y += 0.04; // Spin cube on Y axis too for a tumbling effect
            renderer.render(scene, camera); // Render pass: camera views the scene and produces pixels
            frameRef.current = requestAnimationFrame(animate); // Schedule next frame to keep animation running
        };
        animate(); // Kick off the render loop immediately once everything is ready

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            if (containerRef.current?.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [sizePx]);


    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center justify-center overflow-hidden"
        />
    );
}