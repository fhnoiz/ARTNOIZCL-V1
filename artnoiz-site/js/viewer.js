export async function initStlViewer({ models = [] } = {}) {
  const mount = document.querySelector('#viewer-canvas');
  const wrap = document.querySelector('#viewer-canvas-wrap');
  const placeholder = document.querySelector('#viewer-placeholder');
  const fileInput = document.querySelector('#stl-file-input');
  const dropzone = document.querySelector('#stl-dropzone');
  const publishedModels = document.querySelector('#published-models');
  const fileMeta = document.querySelector('#viewer-file-meta');
  const fileName = document.querySelector('#viewer-file-name');
  const fileSize = document.querySelector('#viewer-file-size');
  const sizeLabel = document.querySelector('#viewer-size-label');
  const wireframeToggle = document.querySelector('#wireframe-toggle');
  const rotateToggle = document.querySelector('#rotate-toggle');

  if (!mount || !wrap || !placeholder || !fileInput) return;

  let THREE;
  let OrbitControls;
  let STLLoader;
  try {
    const modules = await Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/loaders/STLLoader.js')
    ]);
    THREE = modules[0];
    OrbitControls = modules[1].OrbitControls;
    STLLoader = modules[2].STLLoader;
  } catch (error) {
    showPlaceholder('El visor necesita conexión a internet para cargar sus controles 3D.', 'Puedes seguir explorando el sitio y cotizar por WhatsApp.');
    return;
  }

  let renderer;
  let scene;
  let camera;
  let controls;
  let activeMesh = null;
  let activeGeometry = null;
  let activeMaterial = null;
  let currentLabel = '';
  let autoRotate = false;
  let wireframe = false;

  function showPlaceholder(title, detail) {
    const titleEl = placeholder.querySelector('b');
    const detailEl = placeholder.querySelector('span');
    if (titleEl) titleEl.textContent = title;
    if (detailEl) detailEl.textContent = detail;
    placeholder.hidden = false;
    if (mount) mount.hidden = true;
    if (sizeLabel) sizeLabel.hidden = true;
  }

  function hidePlaceholder() {
    placeholder.hidden = true;
    mount.hidden = false;
  }

  function clearModel() {
    if (activeMesh && scene) scene.remove(activeMesh);
    if (activeGeometry) activeGeometry.dispose();
    if (activeMaterial) activeMaterial.dispose();
    activeMesh = null;
    activeGeometry = null;
    activeMaterial = null;
  }

  function setMeta(label, size, dimensions) {
    currentLabel = label;
    if (fileMeta) fileMeta.hidden = false;
    if (fileName) fileName.textContent = label;
    if (fileSize) fileSize.textContent = size ? formatBytes(size) : 'Diseño publicado por ARTNOIZ';
    if (sizeLabel) {
      sizeLabel.hidden = false;
      sizeLabel.textContent = dimensions.map((n) => trimNumber(n)).join(' × ') + ' unidades STL';
    }
  }

  function setModel(geometry, label, size = 0) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position || geometry.attributes.position.count < 3) {
      throw new Error('El archivo no contiene una malla STL válida.');
    }
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const dimensionVector = new THREE.Vector3();
    bounds.getSize(dimensionVector);
    const dimensions = [dimensionVector.x, dimensionVector.y, dimensionVector.z];
    const longestSide = Math.max(...dimensions);
    if (!Number.isFinite(longestSide) || longestSide <= 0) throw new Error('No se pudo calcular el tamaño del modelo.');
    geometry.center();
    geometry.computeVertexNormals();
    const targetSize = 1.8;
    const scale = targetSize / longestSide;
    const material = new THREE.MeshStandardMaterial({
      color: '#c7bbb0',
      metalness: 0.08,
      roughness: 0.42,
      vertexColors: Boolean(geometry.hasColors),
      wireframe
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(scale);
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clearModel();
    activeGeometry = geometry;
    activeMaterial = material;
    activeMesh = mesh;
    scene.add(mesh);
    controls.target.set(0, 0, 0);
    camera.position.set(2.65, 1.95, 3.15);
    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();
    controls.update();
    hidePlaceholder();
    setMeta(label, size, dimensions);
    updateCanvasStatus(label);
  }

  function updateCanvasStatus(label) {
    const mainTitle = placeholder.querySelector('b');
    if (mainTitle) mainTitle.textContent = label;
  }

  function formatBytes(bytes) {
    if (!bytes) return 'Diseño publicado por ARTNOIZ';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return (bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1) + ' ' + units[index];
  }

  function trimNumber(value) {
    if (!Number.isFinite(value)) return '0';
    return value.toFixed(1).replace(/\.0$/, '');
  }

  async function parseLocalFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.stl')) {
      showPlaceholder('El archivo debe terminar en .stl.', 'Selecciona el modelo 3D terminado que quieras revisar.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showPlaceholder('El archivo supera los 100 MB.', 'Prueba una versión STL más liviana para que el navegador pueda abrirla.');
      return;
    }
    showPlaceholder('Cargando el modelo…', 'El STL se abre solo en este navegador.');
    try {
      const buffer = await file.arrayBuffer();
      const geometry = new STLLoader().parse(buffer);
      setModel(geometry, file.name, file.size);
    } catch (error) {
      showPlaceholder('No pudimos abrir ese STL.', error && error.message ? error.message : 'Comprueba que el archivo esté completo y vuelve a intentarlo.');
    }
  }

  async function loadPublishedModel(model) {
    if (!model || !model.url) return;
    showPlaceholder('Abriendo el diseño de ARTNOIZ…', model.title || 'Cargando STL publicado.');
    try {
      const response = await fetch(model.url);
      if (!response.ok) throw new Error('No se pudo encontrar ese archivo publicado.');
      const buffer = await response.arrayBuffer();
      const geometry = new STLLoader().parse(buffer);
      setModel(geometry, model.title || 'Modelo ARTNOIZ', buffer.byteLength);
    } catch (error) {
      showPlaceholder('No pudimos abrir este diseño.', error && error.message ? error.message : 'Revisa que la ruta del STL esté publicada.');
    }
  }

  function buildModelList() {
    if (!publishedModels) return;
    publishedModels.replaceChildren();
    if (!Array.isArray(models) || models.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'catalog-empty';
      empty.textContent = 'Los STL terminados publicados por ARTNOIZ aparecerán aquí. Mientras tanto, puedes cargar uno desde tu equipo para revisarlo.';
      publishedModels.append(empty);
      return;
    }
    models.forEach((model) => {
      const button = document.createElement('button');
      button.className = 'model-option';
      button.type = 'button';
      const mark = document.createElement('span');
      mark.className = 'model-option-mark';
      mark.textContent = '3D';
      const text = document.createElement('span');
      const title = document.createElement('b');
      title.textContent = model.title || 'Modelo personalizado';
      const note = document.createElement('small');
      note.textContent = model.style || 'Diseño terminado';
      text.append(title, note);
      button.append(mark, text);
      button.addEventListener('click', () => loadPublishedModel(model));
      publishedModels.append(button);
    });
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9e4dc');
    camera = new THREE.PerspectiveCamera(37, 1, 0.01, 100);
    camera.position.set(2.65, 1.95, 3.15);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 1.4;
    controls.maxDistance = 9;
    controls.autoRotateSpeed = 1.5;
    controls.target.set(0, 0, 0);
    scene.add(new THREE.HemisphereLight('#fffdf7', '#978b7d', 2.1));
    const keyLight = new THREE.DirectionalLight('#ffffff', 3.1);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight('#f2d2c1', 1.1);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);
    const grid = new THREE.GridHelper(5, 24, '#bdb5aa', '#d0c8bd');
    grid.position.y = -1.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.36;
    scene.add(grid);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.35, 64), new THREE.MeshStandardMaterial({ color: '#ded8cf', roughness: 0.82, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.03;
    floor.receiveShadow = true;
    scene.add(floor);
  } catch (error) {
    showPlaceholder('Este navegador no pudo iniciar el visor 3D.', 'Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.');
    return;
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  window.addEventListener('resize', resize);
  resize();

  function render() {
    controls.autoRotate = autoRotate;
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
  }
  render();
  buildModelList();

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    parseLocalFile(file);
    event.target.value = '';
  });

  if (dropzone) {
    ['dragenter', 'dragover'].forEach((name) => dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach((name) => dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragover');
    }));
    dropzone.addEventListener('drop', (event) => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      parseLocalFile(file);
    });
  }

  if (wireframeToggle) wireframeToggle.addEventListener('click', () => {
    wireframe = !wireframe;
    if (activeMaterial) activeMaterial.wireframe = wireframe;
    wireframeToggle.setAttribute('aria-pressed', String(wireframe));
  });
  if (rotateToggle) rotateToggle.addEventListener('click', () => {
    autoRotate = !autoRotate;
    rotateToggle.setAttribute('aria-pressed', String(autoRotate));
  });
  document.querySelector('#reset-view')?.addEventListener('click', () => {
    if (!controls || !camera) return;
    controls.target.set(0, 0, 0);
    camera.position.set(2.65, 1.95, 3.15);
    controls.update();
  });
  document.querySelector('#zoom-in')?.addEventListener('click', () => {
    camera.position.multiplyScalar(0.83);
    controls.update();
  });
  document.querySelector('#zoom-out')?.addEventListener('click', () => {
    camera.position.multiplyScalar(1.2);
    controls.update();
  });
}
