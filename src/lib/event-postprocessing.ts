import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import type { QualityLevel } from './event-quality';

/** One scene render and one shared, nine-tap pass for soft highlights and distant focus. */
export function createRidePostprocessing(renderer: THREE.WebGLRenderer) {
  const supported = renderer.extensions.has('EXT_color_buffer_float');
  let target: THREE.WebGLRenderTarget | null = null;
  let level: QualityLevel = 0;
  const uniforms = {
    sceneColor: { value: null as THREE.Texture | null },
    sceneDepth: { value: null as THREE.DepthTexture | null },
    texel: { value: new THREE.Vector2(1, 1) },
    cameraNear: { value: .15 }, cameraFar: { value: 1800 },
    focusDistance: { value: 35 }, dofStrength: { value: 0 }, bloomStrength: { value: .16 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D sceneColor, sceneDepth;
      uniform vec2 texel;
      uniform float cameraNear, cameraFar, focusDistance, dofStrength, bloomStrength;
      float distanceAt(vec2 uv) {
        float depth = texture2D(sceneDepth, uv).r;
        return cameraNear * cameraFar / (cameraFar - depth * (cameraFar - cameraNear));
      }
      vec3 highlight(vec3 color) {
        float brightness = max(max(color.r, color.g), color.b);
        return color * smoothstep(.85, 1.3, brightness);
      }
      void main() {
        vec3 sharp = texture2D(sceneColor, vUv).rgb;
        float distance = distanceAt(vUv);
        // Only the distant world softens. The trolley, near rails and UI stay sharp.
        float coc = smoothstep(focusDistance, focusDistance + 90.0, distance) * dofStrength;
        vec2 radius = texel * (2.0 + coc * 3.0);
        vec3 blur = sharp * 2.0;
        vec3 glow = highlight(sharp) * 2.0;
        float weight = 2.0;
        for (int i = 0; i < 8; i++) {
          float angle = float(i) * .785398163;
          vec2 uv = clamp(vUv + vec2(cos(angle), sin(angle)) * radius, texel * .5, 1.0 - texel * .5);
          vec3 neighbor = texture2D(sceneColor, uv).rgb;
          // Reject foreground samples at distant silhouettes to avoid dark fringes.
          float accept = coc > .01 ? smoothstep(focusDistance * .65, focusDistance, distanceAt(uv)) : 1.0;
          blur += neighbor * accept; weight += accept;
          glow += highlight(neighbor);
        }
        gl_FragColor = vec4(mix(sharp, blur / weight, coc) + glow * (bloomStrength / 10.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const quad = new FullScreenQuad(material);
  function releaseTarget() {
    target?.dispose(); target = null;
    uniforms.sceneColor.value = uniforms.sceneDepth.value = null;
  }
  return {
    get enabled() { return target !== null; },
    get depthOfField() { return !!target && uniforms.dofStrength.value > 0; },
    resize(width: number, height: number, quality: QualityLevel, reduced: boolean) {
      level = quality;
      // Release the extra GPU buffers entirely on constrained devices or reduced motion.
      if (!supported || quality === 0 || reduced) { releaseTarget(); return; }
      if (!target) {
        target = new THREE.WebGLRenderTarget(width, height, {
          type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false,
          samples: Math.min(2, renderer.capabilities.maxSamples),
        });
        target.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedIntType);
        uniforms.sceneColor.value = target.texture;
        uniforms.sceneDepth.value = target.depthTexture;
      }
      target.setSize(width, height);
      uniforms.texel.value.set(1 / width, 1 / height);
    },
    render(scene: THREE.Scene, camera: THREE.PerspectiveCamera, mapBlend: number, compact: boolean, speed: number) {
      if (!target) { renderer.render(scene, camera); return; }
      uniforms.cameraNear.value = camera.near; uniforms.cameraFar.value = camera.far;
      uniforms.focusDistance.value = 32 + Math.min(1, Math.abs(speed) / 36) * 16;
      uniforms.dofStrength.value = level === 2 ? (compact ? .32 : .58) * (1 - mapBlend) : 0;
      uniforms.bloomStrength.value = (level === 2 ? .16 : .1) * (1 - mapBlend * .65);
      const previous = renderer.getRenderTarget();
      try {
        renderer.setRenderTarget(target); renderer.render(scene, camera);
        renderer.setRenderTarget(previous); quad.render(renderer);
      } finally { renderer.setRenderTarget(previous); }
    },
    dispose() { releaseTarget(); quad.dispose(); material.dispose(); },
  };
}
