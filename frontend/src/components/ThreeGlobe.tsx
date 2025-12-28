"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeGlobeComponent = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const globeRef = useRef<THREE.Mesh | null>(null);
    const atmosphereRef = useRef<THREE.Mesh | null>(null);
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const autoRotate = useRef(true);
    const targetRotation = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            50,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 2.5;
        cameraRef.current = camera;

        // Create renderer with transparent background
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Fully transparent background
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create globe geometry
        const geometry = new THREE.SphereGeometry(1, 64, 64);

        // Load textures
        const textureLoader = new THREE.TextureLoader();
        
        // Earth texture - night lights version for dark theme
        const earthTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg'
        );
        
        // Bump map for topology
        const bumpTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png'
        );

        // Create material with textures - darker theme
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.03,
            specular: new THREE.Color(0x222244),
            shininess: 10,
            transparent: true,
            opacity: 1
        });

        // Create mesh
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        globeRef.current = globe;

        // Add lights - adjusted for dark theme
        const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Add subtle colored lights for glow effect
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.4); // Indigo
        pointLight1.position.set(3, 0, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.4); // Purple
        pointLight2.position.set(-3, 0, -2);
        scene.add(pointLight2);

        // Add atmosphere glow - matching dark theme
        const atmosphereGeometry = new THREE.SphereGeometry(1.12, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.4, 0.3, 0.9, 0.8) * intensity; // Purple-ish glow
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);
        atmosphereRef.current = atmosphere;

        // Mouse/Touch interaction handlers
        const onMouseDown = (event: MouseEvent) => {
            isDragging.current = true;
            autoRotate.current = false;
            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grabbing';
            }
        };

        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging.current || !globeRef.current) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.current.x,
                y: event.clientY - previousMousePosition.current.y
            };

            // Rotate globe based on mouse movement
            targetRotation.current.y += deltaMove.x * 0.005;
            targetRotation.current.x += deltaMove.y * 0.005;

            // Clamp vertical rotation
            targetRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.current.x));

            previousMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        };

        const onMouseUp = () => {
            isDragging.current = false;
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grab';
            }
            // Resume auto-rotation after 2 seconds of no interaction
            setTimeout(() => {
                if (!isDragging.current) {
                    autoRotate.current = true;
                }
            }, 2000);
        };

        const onMouseLeave = () => {
            isDragging.current = false;
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grab';
            }
        };

        // Touch handlers for mobile
        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length === 1) {
                isDragging.current = true;
                autoRotate.current = false;
                previousMousePosition.current = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        };

        const onTouchMove = (event: TouchEvent) => {
            if (!isDragging.current || !globeRef.current || event.touches.length !== 1) return;

            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.current.x,
                y: event.touches[0].clientY - previousMousePosition.current.y
            };

            targetRotation.current.y += deltaMove.x * 0.005;
            targetRotation.current.x += deltaMove.y * 0.005;
            targetRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.current.x));

            previousMousePosition.current = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        };

        const onTouchEnd = () => {
            isDragging.current = false;
            setTimeout(() => {
                if (!isDragging.current) {
                    autoRotate.current = true;
                }
            }, 2000);
        };

        // Add event listeners
        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('touchstart', onTouchStart);
        canvas.addEventListener('touchmove', onTouchMove);
        canvas.addEventListener('touchend', onTouchEnd);

        // Set initial cursor
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }

        // Animation
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            
            if (globeRef.current) {
                // Auto rotation when not dragging
                if (autoRotate.current) {
                    targetRotation.current.y += 0.003;
                }

                // Smooth interpolation for rotation
                globeRef.current.rotation.y += (targetRotation.current.y - globeRef.current.rotation.y) * 0.1;
                globeRef.current.rotation.x += (targetRotation.current.x - globeRef.current.rotation.x) * 0.1;

                // Rotate atmosphere with globe
                if (atmosphereRef.current) {
                    atmosphereRef.current.rotation.y = globeRef.current.rotation.y;
                    atmosphereRef.current.rotation.x = globeRef.current.rotation.x;
                }
            }
            
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            
            rendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
            cancelAnimationFrame(animationId);
            
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            
            rendererRef.current?.dispose();
            geometry.dispose();
            material.dispose();
            atmosphereMaterial.dispose();
            atmosphereGeometry.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ minHeight: '350px' }}
        />
    );
};

export default ThreeGlobeComponent;
