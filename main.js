import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
const heroCanvas = document.getElementById("hero-canvas");
const aboutCanvas = document.getElementById("about-canvas");
const servicesCanvas = document.getElementById("services-canvas");

const scenes = [];
const clock = new THREE.Clock();

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  return renderer;
}

function createCamera(canvas, position) {
  const camera = new THREE.PerspectiveCamera(
    42,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );
  camera.position.copy(position);
  return camera;
}

function addStudioLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(6, 8, 6);
  scene.add(key);

  const rim = new THREE.PointLight(0xffffff, 0.55, 40);
  rim.position.set(-8, 4, -6);
  scene.add(rim);
}

function registerScene(entry) {
  scenes.push(entry);
  resizeScene(entry);
}

function resizeScene(entry) {
  const { canvas, camera, renderer } = entry;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function initHeroScene() {
  if (!heroCanvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0b, 8, 40);

  const renderer = createRenderer(heroCanvas);
  const camera = createCamera(heroCanvas, new THREE.Vector3(0, 2.8, 10));

  const controls = new OrbitControls(camera, heroCanvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI * 0.5;

  addStudioLights(scene);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0f0f0f,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.2;
  scene.add(floor);

  const orbiters = new THREE.Group();
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0xbfbfbf,
    metalness: 0.8,
    roughness: 0.2,
  });

  for (let i = 0; i < 7; i += 1) {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), orbMaterial);
    orb.userData = {
      radius: 2.8 + Math.random() * 2.2,
      speed: 0.3 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
      lift: 0.3 + Math.random() * 0.9,
    };
    orbiters.add(orb);
  }
  scene.add(orbiters);
  const sculpture = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({
    color: 0xbfbfbf,
    metalness: 0.85,
    roughness: 0.2,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    metalness: 0.6,
    roughness: 0.4,
  });

  const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.35, 160, 24), metal);
  core.position.y = 0.2;
  sculpture.add(core);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 20, 120), darkMetal);
  ring.rotation.x = Math.PI / 2.6;
  ring.rotation.y = Math.PI / 6;
  sculpture.add(ring);

  const capsuleGeo = new THREE.CapsuleGeometry(0.22, 1.2, 12, 24);
  for (let i = 0; i < 3; i += 1) {
    const capsule = new THREE.Mesh(capsuleGeo, metal);
    capsule.userData = {
      radius: 2.6 + i * 0.5,
      speed: 0.35 + i * 0.15,
      offset: i * (Math.PI * 2) * 0.33,
    };
    capsule.rotation.z = Math.PI / 2;
    sculpture.add(capsule);
  }

  sculpture.position.y = -0.4;
  scene.add(sculpture);

  registerScene({
    canvas: heroCanvas,
    scene,
    camera,
    renderer,
    controls,
    update: (delta, elapsed) => {
      orbiters.children.forEach((orb, index) => {
        const { radius, speed, offset, lift } = orb.userData;
        const angle = elapsed * speed + offset;
        orb.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.7) * lift,
          Math.sin(angle) * radius
        );
        orb.rotation.y += 0.02 + index * 0.001;
      });

      sculpture.children.forEach((child) => {
        if (child.geometry.type === "CapsuleGeometry") {
          const { radius, speed, offset } = child.userData;
          const angle = elapsed * speed + offset;
          child.position.set(Math.cos(angle) * radius, Math.sin(angle * 0.4) * 0.6, Math.sin(angle) * radius);
          child.rotation.x += 0.6 * delta;
        }
      });
      sculpture.rotation.y += 0.2 * delta;
    },
  });
}

function initAboutScene() {
  if (!aboutCanvas) return;

  const scene = new THREE.Scene();
  const renderer = createRenderer(aboutCanvas);
  const camera = createCamera(aboutCanvas, new THREE.Vector3(0, 1.5, 6));

  addStudioLights(scene);

  const group = new THREE.Group();
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xb4b4b4,
    metalness: 0.7,
    roughness: 0.2,
  });

  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.32, 140, 32), coreMaterial);
  group.add(knot);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.08, 20, 100),
    new THREE.MeshStandardMaterial({ color: 0x5f5f5f, metalness: 0.6, roughness: 0.4 })
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 })
  );
  sphere.position.set(-1.8, 0.4, 0.5);
  group.add(sphere);

  scene.add(group);

  registerScene({
    canvas: aboutCanvas,
    scene,
    camera,
    renderer,
    update: (delta) => {
      group.rotation.y += 0.35 * delta;
      group.rotation.x += 0.15 * delta;
    },
  });
}

function initServicesScene() {
  if (!servicesCanvas) return;

  const scene = new THREE.Scene();
  const renderer = createRenderer(servicesCanvas);
  const camera = createCamera(servicesCanvas, new THREE.Vector3(0, 3, 8));

  addStudioLights(scene);

  const grid = new THREE.Group();
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a9a9a,
    metalness: 0.7,
    roughness: 0.3,
  });

  for (let i = 0; i < 10; i += 1) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), boxMaterial);
    box.position.set(
      (Math.random() - 0.5) * 4,
      Math.random() * 2.2,
      (Math.random() - 0.5) * 4
    );
    box.userData = {
      speed: 0.2 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
    };
    grid.add(box);
  }

  const plane = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f0f0f, roughness: 0.5, metalness: 0.1 })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.4;
  scene.add(plane);
  scene.add(grid);

  registerScene({
    canvas: servicesCanvas,
    scene,
    camera,
    renderer,
    update: (delta, elapsed) => {
      grid.children.forEach((box) => {
        const { speed, offset } = box.userData;
        box.rotation.x += 0.4 * delta;
        box.rotation.y += 0.3 * delta;
        box.position.y = Math.sin(elapsed * speed + offset) * 0.6 + 0.4;
      });
      grid.rotation.y += 0.12 * delta;
    },
  });
}

initHeroScene();
initAboutScene();
initServicesScene();

const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const canvas = entry.target;
    const sceneEntry = scenes.find((item) => item.canvas === canvas);
    if (sceneEntry) resizeScene(sceneEntry);
  });
});

scenes.forEach((entry) => resizeObserver.observe(entry.canvas));

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  scenes.forEach((entry) => {
    if (entry.update) entry.update(delta, elapsed);
    if (entry.controls) entry.controls.update();
    entry.renderer.render(entry.scene, entry.camera);
  });

  requestAnimationFrame(animate);
}

animate();

document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => {
    if (item.dataset.delay) {
      item.style.transitionDelay = item.dataset.delay;
    }
    observer.observe(item);
  });
}

const servicesFrame = document.querySelector(".canvas-frame.tall");
const servicesImages = document.querySelectorAll(".services-image");
if (servicesFrame && servicesImages.length >= 2) {
  const [firstImage, secondImage] = servicesImages;
  const swap = (showSecond) => {
    firstImage.classList.toggle("is-visible", !showSecond);
    secondImage.classList.toggle("is-visible", showSecond);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          swap(entry.intersectionRatio >= 0.5);
        });
      },
      { threshold: [0, 0.5, 1] }
    );
    observer.observe(servicesFrame);
  } else {
    const onScrollSwap = () => {
      const rect = servicesFrame.getBoundingClientRect();
      if (rect.height <= 0) return;
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, visibleHeight) / rect.height;
      swap(ratio >= 0.5);
    };
    onScrollSwap();
    window.addEventListener("scroll", onScrollSwap, { passive: true });
    window.addEventListener("resize", onScrollSwap);
  }
}

const contactForm = document.getElementById("contact-form");
const thankYou = document.getElementById("contact-thankyou");
const statusEl = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (statusEl) statusEl.textContent = "Sending...";

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactForm.hidden = true;
        if (thankYou) thankYou.hidden = false;
        contactForm.reset();
        if (statusEl) statusEl.textContent = "";
      } else {
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        const message =
          data && data.errors && data.errors[0] && data.errors[0].message
            ? data.errors[0].message
            : "Sorry — something went wrong. Please try again.";
        if (statusEl) statusEl.textContent = message;
      }
    } catch (error) {
      if (statusEl) statusEl.textContent = "Network error. Please try again.";
    }
  });
}
