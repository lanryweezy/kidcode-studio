/**
 * 3D Game Engine Renderer
 * Uses Three.js for WebGL rendering
 */

import * as THREE from 'three';

export interface Camera3D {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
  type: 'perspective' | 'orthographic';
}

export interface Light3D {
  id: string;
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color: string;
  intensity: number;
  position?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
}

export interface GameObject3D {
  id: string;
  modelUrl?: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  animation?: string;
  isAnimated: boolean;
}

export interface PhysicsConfig {
  enabled: boolean;
  gravity: number;
  friction: number;
  bounciness: number;
}

export class GameEngine3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private models: Map<string, THREE.Object3D>;
  private lights: Map<string, THREE.Light>;
  private mixer: THREE.AnimationMixer | null;
  private animations: Map<string, THREE.AnimationClip>;
  private physicsConfig: PhysicsConfig;
  private onRenderCallback?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clock
    this.clock = new THREE.Clock();

    // Collections
    this.models = new Map();
    this.lights = new Map();
    this.mixer = null;
    this.animations = new Map();

    // Physics
    this.physicsConfig = {
      enabled: false,
      gravity: -9.8,
      friction: 0.9,
      bounciness: 0.5
    };

    // Default lighting
    this.setupDefaultLighting();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private setupDefaultLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);
    this.lights.set('ambient', ambient);

    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    this.scene.add(sun);
    this.lights.set('sun', sun);
  }

  public setCamera(config: Camera3D) {
    if (config.type === 'perspective') {
      this.camera = new THREE.PerspectiveCamera(
        config.fov,
        (this.camera as THREE.PerspectiveCamera).aspect || 1,
        config.near,
        config.far
      );
    } else {
      this.camera = new THREE.OrthographicCamera(
        -config.fov / 2,
        config.fov / 2,
        config.fov / 2,
        -config.fov / 2,
        config.near,
        config.far
      );
    }

    this.camera.position.set(
      config.position.x,
      config.position.y,
      config.position.z
    );
    this.camera.lookAt(
      config.target.x,
      config.target.y,
      config.target.z
    );
  }

  public addLight(light: Light3D) {
    let threeLight: THREE.Light;

    switch (light.type) {
      case 'ambient':
        threeLight = new THREE.AmbientLight(
          new THREE.Color(light.color),
          light.intensity
        );
        break;
      case 'directional':
        threeLight = new THREE.DirectionalLight(
          new THREE.Color(light.color),
          light.intensity
        );
        if (light.position) {
          threeLight.position.set(
            light.position.x,
            light.position.y,
            light.position.z
          );
        }
        break;
      case 'point':
        threeLight = new THREE.PointLight(
          new THREE.Color(light.color),
          light.intensity
        );
        if (light.position) {
          threeLight.position.set(
            light.position.x,
            light.position.y,
            light.position.z
          );
        }
        break;
      case 'spot':
        threeLight = new THREE.SpotLight(
          new THREE.Color(light.color),
          light.intensity
        );
        if (light.position) {
          threeLight.position.set(
            light.position.x,
            light.position.y,
            light.position.z
          );
        }
        break;
      default:
        return;
    }

    this.scene.add(threeLight);
    this.lights.set(light.id, threeLight);
  }

  public removeLight(id: string) {
    const light = this.lights.get(id);
    if (light) {
      this.scene.remove(light);
      this.lights.delete(id);
    }
  }

  public async loadModel(id: string, url: string): Promise<void> {
    try {
      const loader = new (THREE as any).GLTFLoader();
      const gltf = await loader.loadAsync(url);
      const model = gltf.scene;

      model.traverse((child: any) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      this.scene.add(model);
      this.models.set(id, model);

      // Store animations
      if (gltf.animations && gltf.animations.length > 0) {
        gltf.animations.forEach((clip: any) => {
          this.animations.set(`${id}_${clip.name}`, clip);
        });
      }
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  public addGameObject(obj: GameObject3D) {
    if (obj.modelUrl) {
      this.loadModel(obj.id, obj.modelUrl);
    } else {
      // Create primitive (cube for now)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add(mesh);
      this.models.set(obj.id, mesh);
    }

    this.setGameObjectTransform(obj.id, obj.position, obj.rotation, obj.scale);
  }

  public setGameObjectTransform(
    id: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    scale: { x: number; y: number; z: number }
  ) {
    const model = this.models.get(id);
    if (model) {
      model.position.set(position.x, position.y, position.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      model.scale.set(scale.x, scale.y, scale.z);
    }
  }

  public playAnimation(id: string, animationName: string) {
    const model = this.models.get(id);
    if (model && this.animations.has(`${id}_${animationName}`)) {
      this.mixer = new THREE.AnimationMixer(model);
      const clip = this.animations.get(`${id}_${animationName}`);
      if (clip) {
        const action = this.mixer.clipAction(clip);
        action.play();
      }
    }
  }

  public setBackgroundColor(color: string) {
    this.scene.background = new THREE.Color(color);
    this.scene.fog = new THREE.Fog(new THREE.Color(color), 10, 100);
  }

  public enablePhysics(config: PhysicsConfig) {
    this.physicsConfig = { ...config, enabled: true };
  }

  public disablePhysics() {
    this.physicsConfig.enabled = false;
  }

  public setOnRender(callback: () => void) {
    this.onRenderCallback = callback;
  }

  public render() {
    const delta = this.clock.getDelta();

    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Apply physics if enabled
    if (this.physicsConfig.enabled) {
      this.applyPhysics(delta);
    }

    // Custom render callback
    if (this.onRenderCallback) {
      this.onRenderCallback();
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    // Request next frame
    requestAnimationFrame(() => this.render());
  }

  private applyPhysics(delta: number) {
    // Simple physics simulation
    this.models.forEach((model) => {
      // Apply gravity
      if (model.position.y > 0) {
        model.position.y += this.physicsConfig.gravity * delta;
      }

      // Ground collision
      if (model.position.y < 0) {
        model.position.y = 0;
        // Apply bounciness
        model.position.y *= -this.physicsConfig.bounciness;
      }

      // Apply friction
      model.position.x *= this.physicsConfig.friction;
      model.position.z *= this.physicsConfig.friction;
    });
  }

  private handleResize() {
    const canvas = this.renderer.domElement;
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = canvas.width / canvas.height;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(canvas.width, canvas.height);
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }

  public getRenderer() {
    return this.renderer;
  }

  public dispose() {
    this.models.forEach((model) => {
      this.scene.remove(model);
    });
    this.models.clear();
    this.renderer.dispose();
  }
}

// GLTF Loader (lazy loaded)
class GLTFLoader {
  loadAsync(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const loader = new (window as any).THREE.GLTFLoader();
      loader.load(
        url,
        (gltf: any) => resolve(gltf),
        undefined,
        reject
      );
    });
  }
}

(THREE as any).GLTFLoader = GLTFLoader;
