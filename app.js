import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from './vendor/mindar/mindar-image-three.prod.js';
import { CONFIG } from './config.js';

const $ = (id) => document.getElementById(id);
const deg = THREE.MathUtils.degToRad;

const state = { skala: 'full', stil: 'massiv', opasitet: 1 };
const fyllMaterialer = [];
const streker = [];
const fyll = [];

// ---------- Testhus (meter, Y opp, origo midt på grunnflaten) ----------
function lagTesthus() {
  const g = new THREE.Group();
  const B = 6, L = 8, H = 2.6, tak = 35, utstikk = 0.4;
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0 });

  const vegg = new THREE.Mesh(new THREE.BoxGeometry(B, H, L), mat(0x6b4e3a));
  vegg.position.y = H / 2; g.add(vegg);

  const halv = B / 2 + utstikk;
  const mone = halv * Math.tan(deg(tak));
  const form = new THREE.Shape([new THREE.Vector2(-halv, 0), new THREE.Vector2(halv, 0), new THREE.Vector2(0, mone)]);
  const takGeo = new THREE.ExtrudeGeometry(form, { depth: L + 2 * utstikk, bevelEnabled: false });
  takGeo.translate(0, H, -(L + 2 * utstikk) / 2);
  g.add(new THREE.Mesh(takGeo, mat(0x3a3f38)));

  const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), mat(0x5a5a55));
  pipe.position.set(1.0, H + mone - 0.2, -1.5); g.add(pipe);

  // Dør og vinduer på gavlen som vender mot skiltet (+Z)
  const mork = mat(0x1c2430);
  const dor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 0.08), mork);
  dor.position.set(-1.6, 1.0, L / 2 + 0.04); g.add(dor);
  for (const [x, y, w, h] of [[0.6, 1.4, 1.0, 1.1], [2.0, 1.4, 0.8, 1.1], [0, H + 0.8, 0.8, 0.8]]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), mork);
    v.position.set(x, y, L / 2 + 0.04); g.add(v);
  }
  // Vinduer på langsidene
  for (const z of [-2, 1.5]) for (const s of [-1, 1]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 1.0), mork);
    v.position.set(s * (B / 2 + 0.04), 1.4, z); g.add(v);
  }
  return g;
}

// Skygge på bakken gir bygget forankring i bildet
function lagBakkeskygge(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x + 1.2, size.z + 1.2),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2; m.position.set(c.x, 0.01, c.z);
  return m;
}

// Klargjør materialer og strekversjon for alle meshes
function klargjor(root) {
  const strekMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => { m.transparent = true; fyllMaterialer.push(m); });
    fyll.push(o);
    const linjer = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), strekMat);
    o.add(linjer); streker.push(linjer);
  }
}

// ---------- Oppsett ----------
async function start() {
  $('start').hidden = true;
  $('ar-ui').hidden = false;
  setStatus('Starter kamera');

  const mindar = new MindARThree({
    container: $('ar'),
    imageTargetSrc: './targets/skilt.mind',
    uiLoading: 'no', uiScanning: 'no', uiError: 'yes',
    filterMinCF: CONFIG.utjevning.filterMinCF,
    filterBeta: CONFIG.utjevning.filterBeta,
    warmupTolerance: 5, missTolerance: 10
  });
  const { renderer, scene, camera } = mindar;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5246, 1.3));
  const sol = new THREE.DirectionalLight(0xffffff, 1.4);
  sol.position.set(4, 10, 6); scene.add(sol);

  const anker = mindar.addAnchor(0);
  const ramme = new THREE.Group();      // fra skiltets enheter til meter
  const verden = new THREE.Group();     // meter, Y opp, bakke i y = 0
  const plassering = new THREE.Group(); // byggets posisjon
  anker.group.add(ramme); ramme.add(verden); verden.add(plassering);

  let bygg;
  if (CONFIG.modellFil) {
    setStatus('Laster modell');
    try {
      const gltf = await new GLTFLoader().loadAsync(CONFIG.modellFil);
      bygg = gltf.scene;
    } catch (e) {
      setStatus('Fant ikke modellen ' + CONFIG.modellFil + '. Viser testhuset.');
      bygg = lagTesthus();
    }
  } else {
    bygg = lagTesthus();
  }
  klargjor(bygg);
  plassering.add(bygg);
  const skygge = lagBakkeskygge(bygg);
  plassering.add(skygge);

  function oppdaterPlassering() {
    const W = CONFIG.skiltBredde;
    const bord = state.skala === 'bord';
    const flatt = bord || CONFIG.montering === 'bakke';
    // Skiltets lokale system: X høyre, Y mot toppkanten, Z ut av bildet. 1 enhet = bildebredden.
    ramme.rotation.set(flatt ? Math.PI / 2 : 0, 0, 0);
    ramme.scale.setScalar((1 / W) * (bord ? CONFIG.bordmodellSkala : 1));
    verden.position.set(0, flatt ? 0 : -CONFIG.skiltHoyde, 0);
    if (bord) {
      plassering.position.set(0, 0, 0);
    } else {
      const b = CONFIG.bygg;
      plassering.position.set(b.side, b.hoydeJustering, -b.frem);
    }
    plassering.rotation.y = deg(CONFIG.bygg.rotasjon);
  }

  function oppdaterStil() {
    const strek = state.stil === 'strek';
    fyllMaterialer.forEach((m) => {
      m.opacity = strek ? state.opasitet * 0.15 : state.opasitet;
      m.depthWrite = !strek && state.opasitet > 0.98;
    });
    streker.forEach((l) => { l.visible = strek; });
    skygge.visible = !strek;
  }

  anker.onTargetFound = () => setStatus(state.skala === 'bord' ? 'Skiltet funnet. Bordmodell 1:50.' : 'Skiltet funnet. Hold det i bildet.', true);
  anker.onTargetLost = () => setStatus('Pek kameraet mot skiltet');

  // Kontroller
  document.querySelectorAll('[data-skala]').forEach((b) => b.addEventListener('click', () => {
    state.skala = b.dataset.skala; velg('[data-skala]', b); oppdaterPlassering();
  }));
  document.querySelectorAll('[data-stil]').forEach((b) => b.addEventListener('click', () => {
    state.stil = b.dataset.stil; velg('[data-stil]', b); oppdaterStil();
  }));
  $('opasitet').addEventListener('input', (e) => { state.opasitet = e.target.value / 100; oppdaterStil(); });

  oppdaterPlassering(); oppdaterStil();

  try {
    await mindar.start();
    setStatus('Pek kameraet mot skiltet');
  } catch (e) {
    setStatus('Kameraet startet ikke. Sjekk at siden har kameratilgang og at adressen starter med https.');
    console.error(e);
    return;
  }
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}

function velg(sel, aktiv) {
  document.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', b === aktiv ? 'true' : 'false'));
}
function setStatus(t, funnet = false) {
  $('status').textContent = t;
  $('status').classList.toggle('funnet', funnet);
}

// Startskjerm med verdier fra config
$('felt-montering').textContent = CONFIG.montering === 'bakke' ? 'Flatt på bakken' : 'Loddrett på vegg';
$('felt-avstand').textContent = CONFIG.bygg.frem.toLocaleString('nb-NO') + ' m frem';
$('felt-bredde').textContent = Math.round(CONFIG.skiltBredde * 1000) + ' mm';
$('felt-modell').textContent = CONFIG.modellFil ? CONFIG.modellFil.split('/').pop() : 'Testhus 6 × 8 m';
$('instruks').textContent = CONFIG.montering === 'bakke'
  ? 'Legg skiltet flatt med toppkanten mot der bygget skal stå. Still deg ved nederste kant og pek kameraet mot skiltet.'
  : 'Fest skiltet loddrett, vendt mot deg. Bygget står bak skiltet. Pek kameraet mot skiltet.';
$('startknapp').addEventListener('click', start);
