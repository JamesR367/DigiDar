import React, { useEffect, useMemo, useRef } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

type Props = { width?: number; height?: number };

// ---- CONFIG ----
const OWM_ZOOM = 2; // keep low (2–3) for performance
const TILE_SIZE = 256;
const UPDATE_MS = 60_000; // refresh every 60s
const FADE_MS = 900;

const OWM_KEY = import.meta.env.OPENWEATHER_KEY as string | undefined;

export default function WeatherGlobeWidget({
  width = 720,
  height = 720,
}: Props) {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    // camera
    globeRef.current.pointOfView({ lat: 20, lng: -30, altitude: 2.2 }, 900);

    const scene: THREE.Scene = globeRef.current.scene();

    const radius = globeRef.current.getGlobeRadius?.() ?? 100;

    const clouds = createFadingOverlaySphere(radius + 0.55, 0.55);
    clouds.mesh.name = "__owm_clouds";
    scene.add(clouds.mesh);

    const precip = createFadingOverlaySphere(radius + 0.65, 0.7);
    precip.mesh.name = "__owm_precip";
    scene.add(precip.mesh);

    let stopped = false;
    let tClouds: number | undefined;
    let tPrecip: number | undefined;

    const updateClouds = async () => {
      if (stopped) return;
      await updateOverlayFromOpenWeather(clouds, "clouds_new");
      tClouds = window.setTimeout(updateClouds, UPDATE_MS);
    };

    const updatePrecip = async () => {
      if (stopped) return;
      await updateOverlayFromOpenWeather(precip, "precipitation_new");
      tPrecip = window.setTimeout(updatePrecip, UPDATE_MS);
    };

    // kick off
    updateClouds();
    updatePrecip();

    // slow rotation animation
    let raf = 0;
    const spin = () => {
      clouds.mesh.rotation.y += 0.0007;
      precip.mesh.rotation.y += 0.0007;
      raf = requestAnimationFrame(spin);
    };
    spin();

    return () => {
      stopped = true;
      if (tClouds) clearTimeout(tClouds);
      if (tPrecip) clearTimeout(tPrecip);
      cancelAnimationFrame(raf);

      scene.remove(clouds.mesh);
      scene.remove(precip.mesh);
      clouds.dispose();
      precip.dispose();
    };
  }, []);

  return (
    <div style={{ width }}>
      <div
        style={{ borderRadius: 16, overflow: "hidden", background: "#0b1220" }}
      >
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereAltitude={0.18}
          atmosphereColor="#ffffff"
        />
      </div>
      <div style={{ marginTop: 8, color: "#dbe7ff", fontFamily: "system-ui" }}>
        Clouds + precipitation are global tile overlays (OpenWeather).
      </div>
    </div>
  );
}

type FadingOverlay = {
  mesh: THREE.Mesh;
  matA: THREE.MeshBasicMaterial;
  matB: THREE.MeshBasicMaterial;
  texA: THREE.CanvasTexture;
  texB: THREE.CanvasTexture;
  canvasA: HTMLCanvasElement;
  canvasB: HTMLCanvasElement;
  usingA: boolean;
  dispose: () => void;
};

function createFadingOverlaySphere(
  radius: number,
  opacity: number,
): FadingOverlay {
  const geo = new THREE.SphereGeometry(radius, 64, 64);

  const { canvas: canvasA, tex: texA } = makeCanvasTex(2048, 1024);
  const { canvas: canvasB, tex: texB } = makeCanvasTex(2048, 1024);

  const matA = new THREE.MeshBasicMaterial({
    map: texA,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const matB = new THREE.MeshBasicMaterial({
    map: texB,
    transparent: true,
    opacity: 0, // starts hidden
    depthWrite: false,
  });

  const meshA = new THREE.Mesh(geo, matA);
  const meshB = new THREE.Mesh(geo, matB);
  const group = new THREE.Group();
  group.add(meshA);
  group.add(meshB);

  const overlay: FadingOverlay = {
    mesh: group as unknown as THREE.Mesh,
    matA,
    matB,
    texA,
    texB,
    canvasA,
    canvasB,
    usingA: true,
    dispose: () => {
      geo.dispose();
      matA.dispose();
      matB.dispose();
      texA.dispose();
      texB.dispose();
    },
  };

  return overlay;
}

function makeCanvasTex(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return { canvas, tex };
}

async function updateOverlayFromOpenWeather(
  overlay: FadingOverlay,
  layer: string,
) {
  if (!OWM_KEY) return;

  const nextCanvas = overlay.usingA ? overlay.canvasB : overlay.canvasA;
  const nextTex = overlay.usingA ? overlay.texB : overlay.texA;
  const nextMat = overlay.usingA ? overlay.matB : overlay.matA;
  const prevMat = overlay.usingA ? overlay.matA : overlay.matB;

  const stitched = await stitchMercatorTiles(layer, OWM_ZOOM);

  reprojectMercatorToEquirect(stitched, nextCanvas);

  nextTex.needsUpdate = true;

  await crossFade(prevMat, nextMat, FADE_MS);

  overlay.usingA = !overlay.usingA;
}

async function stitchMercatorTiles(
  layer: string,
  z: number,
): Promise<HTMLCanvasElement> {
  const n = 2 ** z;

  const canvas = document.createElement("canvas");
  canvas.width = n * TILE_SIZE;
  canvas.height = n * TILE_SIZE;
  const ctx = canvas.getContext("2d")!;

  const jobs: Promise<void>[] = [];

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${encodeURIComponent(
        OWM_KEY!,
      )}`;

      jobs.push(
        loadImage(url)
          .then((img) => {
            ctx.drawImage(
              img,
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE,
              TILE_SIZE,
            );
          })
          .catch(() => {
            // ignore missing tiles
          }),
      );
    }
  }

  await Promise.all(jobs);
  return canvas;
}

function reprojectMercatorToEquirect(
  srcMerc: HTMLCanvasElement,
  dstEq: HTMLCanvasElement,
) {
  const sw = srcMerc.width;
  const sh = srcMerc.height;

  const srcCtx = srcMerc.getContext("2d")!;
  const src = srcCtx.getImageData(0, 0, sw, sh).data;

  const dw = dstEq.width;
  const dh = dstEq.height;

  const dstCtx = dstEq.getContext("2d")!;
  const out = dstCtx.createImageData(dw, dh);
  const dst = out.data;

  for (let j = 0; j < dh; j++) {
    const v = j / (dh - 1);
    const lat = 90 - v * 180;
    const latRad = (lat * Math.PI) / 180;

    const mercY =
      (1 - Math.log(Math.tan(Math.PI / 4 + latRad / 2)) / Math.PI) / 2;

    const sy = clampInt(Math.round(mercY * (sh - 1)), 0, sh - 1);

    for (let i = 0; i < dw; i++) {
      const u = i / (dw - 1);

      const sx = clampInt(Math.round(u * (sw - 1)), 0, sw - 1);

      const si = (sy * sw + sx) * 4;
      const di = (j * dw + i) * 4;

      dst[di] = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }

  dstCtx.putImageData(out, 0, 0);
}

function clampInt(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function crossFade(
  a: THREE.MeshBasicMaterial,
  b: THREE.MeshBasicMaterial,
  ms: number,
) {
  a.opacity = Math.max(0, a.opacity);
  b.opacity = Math.max(0, b.opacity);

  const startA = a.opacity;
  const startB = b.opacity;

  const targetA = 0;
  const targetB = startA; // bring B up to A's previous level

  return new Promise<void>((resolve) => {
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      a.opacity = startA + (targetA - startA) * k;
      b.opacity = startB + (targetB - startB) * k;

      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}
