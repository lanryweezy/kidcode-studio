import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SpriteState } from '../types';

interface GameStage3DProps {
    spriteState: SpriteState;
    spriteStateRef: React.MutableRefObject<SpriteState>;
    isExecuting: boolean;
    width: number;
    height: number;
}

const GameStage3D: React.FC<GameStage3DProps> = ({
    spriteState,
    spriteStateRef,
    isExecuting,
    width,
    height
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const playerRef = useRef<THREE.Group | null>(null);
    const entitiesRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const gltfLoader = useRef(new GLTFLoader());
    const mixers = useRef<Map<string, THREE.AnimationMixer>>(new Map());
    const clock = useRef(new THREE.Clock());

    useEffect(() => {
        if (!mountRef.current) return;

        // Initialize Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#87ceeb'); // Sky blue
        sceneRef.current = scene;

        // Initialize Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 5, 10);
        cameraRef.current = camera;

        // Initialize Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Add Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Add Floor
        const gridHelper = new THREE.GridHelper(100, 100, 0x000000, 0xcccccc);
        scene.add(gridHelper);

        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: '#22c55e' });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.01;
        scene.add(floor);

        // Function to create a 3D object (player or entity)
        const createObject3D = (entity: { id: string, emoji?: string, texture?: string | null, modelUrl?: string }) => {
            const group = new THREE.Group();
            group.userData.id = entity.id;

            if (entity.modelUrl && entity.modelUrl.endsWith('.glb')) {
                gltfLoader.current.load(entity.modelUrl, (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(0.5, 0.5, 0.5);
                    group.add(model);

                    // Setup Animation Mixer
                    if (gltf.animations && gltf.animations.length > 0) {
                        const mixer = new THREE.AnimationMixer(model);
                        mixers.current.set(entity.id, mixer);
                    }
                });
            } else {
                // Default cube if no GLB or image texture
                const bodyGeom = new THREE.BoxGeometry(1, 1, 1);
                const bodyMat = new THREE.MeshStandardMaterial({ color: '#3b82f6' });
                const body = new THREE.Mesh(bodyGeom, bodyMat);
                group.add(body);

                const canvas = document.createElement('canvas');
                canvas.width = 64; canvas.height = 64;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.font = '48px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(entity.emoji || '🤖', 32, 32);
                }
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const emojiSprite = new THREE.Sprite(spriteMaterial);
                emojiSprite.position.y = 1.2;
                group.add(emojiSprite);
            }
            return group;
        };

        // Initial Player Setup
        const playerObject = createObject3D({ id: 'player', ...spriteState });
        scene.add(playerObject);
        playerRef.current = playerObject;

        // Animation Loop
        let rafId: number;
        const animate = () => {
            const delta = clock.current.getDelta();
            mixers.current.forEach(mixer => mixer.update(delta));

            const state = isExecuting ? spriteStateRef.current : spriteState;

            if (playerRef.current) {
                playerRef.current.position.x = (state.x - 200) / 10;
                playerRef.current.position.z = (state.z || 0) / 10;
                playerRef.current.position.y = (200 - state.y) / 10 + 0.5;
                playerRef.current.rotation.y = THREE.MathUtils.degToRad(-state.rotation);

                // Handle Player Animations
                const mixer = mixers.current.get('player');
                if (mixer && state.currentAnimation) {
                    const model = playerRef.current.children.find(c => c instanceof THREE.Group) as THREE.Group;
                    if (model && model.animations) {
                        const clip = THREE.AnimationClip.findByName(model.animations, state.currentAnimation);
                        if (clip) {
                            const action = mixer.clipAction(clip);
                            if (!action.isRunning()) {
                                mixer.stopAllAction();
                                action.play();
                            }
                        }
                    }
                }
            }

            // Sync Entities (Enemies, Items)
            const currentEntities = [...state.enemies, ...state.items];

            // Remove old entities
            entitiesRef.current.forEach((obj, id) => {
                if (!currentEntities.find(e => e.id === id)) {
                    scene.remove(obj);
                    entitiesRef.current.delete(id);
                    mixers.current.delete(id);
                }
            });

            // Add/Update entities
            currentEntities.forEach(e => {
                let obj = entitiesRef.current.get(e.id);
                if (!obj) {
                    obj = createObject3D(e);
                    scene.add(obj);
                    entitiesRef.current.set(e.id, obj);
                }
                obj.position.x = (e.x - 200) / 10;
                obj.position.z = (e.z || 0) / 10;
                obj.position.y = (200 - e.y) / 10 + 0.5;

                // Handle Entity Animations
                const mixer = mixers.current.get(e.id);
                if (mixer && e.currentAnimation) {
                    const model = obj.children.find(c => c instanceof THREE.Group) as THREE.Group;
                    if (model && model.animations) {
                        const clip = THREE.AnimationClip.findByName(model.animations, e.currentAnimation);
                        if (clip) {
                            const action = mixer.clipAction(clip);
                            if (!action.isRunning()) {
                                mixer.stopAllAction();
                                action.play();
                            }
                        }
                    }
                }
            });

            // Camera Follow
            if (cameraRef.current && playerRef.current) {
                if (state.cameraMode === 'third_person') {
                    const offset = new THREE.Vector3(0, 5, 10);
                    offset.applyQuaternion(playerRef.current.quaternion);
                    cameraRef.current.position.copy(playerRef.current.position).add(offset);
                    cameraRef.current.lookAt(playerRef.current.position);
                } else if (state.cameraMode === 'first_person') {
                    cameraRef.current.position.copy(playerRef.current.position).add(new THREE.Vector3(0, 0.5, 0));
                    const lookTarget = new THREE.Vector3(0, 0, -1);
                    lookTarget.applyQuaternion(playerRef.current.quaternion);
                    cameraRef.current.lookAt(playerRef.current.position.clone().add(lookTarget));
                } else {
                    cameraRef.current.position.set(0, 20, 0);
                    cameraRef.current.lookAt(0, 0, 0);
                }
            }

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(rafId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [width, height, isExecuting]);

    return <div ref={mountRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner bg-black" />;
};

export default GameStage3D;
