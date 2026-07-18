import * as THREE from 'three';
import { Scene3DLight } from './scene3DPrimitives';

export function createThreeLight(light: Scene3DLight): THREE.Light {
  let threeLight: THREE.Light;

  const color = new THREE.Color(light.color);

  switch (light.type) {
    case 'ambient': {
      threeLight = new THREE.AmbientLight(color, light.intensity);
      break;
    }
    case 'directional': {
      const dir = new THREE.DirectionalLight(color, light.intensity);
      dir.position.set(light.position[0], light.position[1], light.position[2]);
      dir.castShadow = light.castShadow;
      if (dir.castShadow) {
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        dir.shadow.camera.near = 0.1;
        dir.shadow.camera.far = 50;
        dir.shadow.camera.left = -15;
        dir.shadow.camera.right = 15;
        dir.shadow.camera.top = 15;
        dir.shadow.camera.bottom = -15;
      }
      threeLight = dir;
      break;
    }
    case 'point': {
      const point = new THREE.PointLight(color, light.intensity, light.distance || 50);
      point.position.set(light.position[0], light.position[1], light.position[2]);
      point.castShadow = light.castShadow;
      threeLight = point;
      break;
    }
    case 'spot': {
      const spot = new THREE.SpotLight(color, light.intensity, light.distance || 50, light.angle || Math.PI / 6, light.penumbra || 0.3);
      spot.position.set(light.position[0], light.position[1], light.position[2]);
      spot.castShadow = light.castShadow;
      threeLight = spot;
      break;
    }
    default:
      threeLight = new THREE.AmbientLight(0xffffff, 0.5);
  }

  threeLight.name = light.id;
  threeLight.visible = light.visible;
  return threeLight;
}

export function updateThreeLight(threeLight: THREE.Light, light: Scene3DLight): void {
  threeLight.visible = light.visible;
  threeLight.color.set(light.color);
  threeLight.intensity = light.intensity;

  if (light.type === 'directional') {
    const dir = threeLight as THREE.DirectionalLight;
    dir.position.set(light.position[0], light.position[1], light.position[2]);
    dir.castShadow = light.castShadow;
  } else if (light.type === 'point') {
    const point = threeLight as THREE.PointLight;
    point.position.set(light.position[0], light.position[1], light.position[2]);
    point.distance = light.distance || 50;
    point.castShadow = light.castShadow;
  } else if (light.type === 'spot') {
    const spot = threeLight as THREE.SpotLight;
    spot.position.set(light.position[0], light.position[1], light.position[2]);
    spot.angle = light.angle || Math.PI / 6;
    spot.penumbra = light.penumbra || 0.3;
    spot.distance = light.distance || 50;
    spot.castShadow = light.castShadow;
  }
}

export function createLightHelper(light: Scene3DLight): THREE.Object3D | null {
  if (light.type === 'directional') {
    const dirLight = new THREE.DirectionalLight(new THREE.Color(light.color), light.intensity);
    dirLight.position.set(light.position[0], light.position[1], light.position[2]);
    return new THREE.DirectionalLightHelper(dirLight, 1);
  }
  if (light.type === 'point') {
    return new THREE.PointLightHelper(
      new THREE.PointLight(new THREE.Color(light.color), light.intensity, light.distance || 50),
      0.5
    );
  }
  if (light.type === 'spot') {
    const spotLight = new THREE.SpotLight(
      new THREE.Color(light.color),
      light.intensity,
      light.distance || 50,
      light.angle || Math.PI / 6,
      light.penumbra || 0.3
    );
    spotLight.position.set(light.position[0], light.position[1], light.position[2]);
    return new THREE.SpotLightHelper(spotLight);
  }
  return null;
}
