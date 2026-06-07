
async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

let cars = [];
let images = [];
let carsWrapper = null; // keep original wrapper (e.g. {version, cars}) if present

function setStatus(msg) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
}

function getImageValue(car) {
  return car.img ?? car.image ?? null;
}

function setImageValue(car, val) {
  if ('img' in car) car.img = val;
  else car.image = val;
}

function createCarCard(car, index) {
  const wrap = document.createElement('div');
  wrap.className = 'car-card';
  // make card addressable and record brand
  wrap.id = `car-${car.id ?? index}`;
  wrap.dataset.brand = car.brand || '';

  const title = document.createElement('h3');
  const year = car.year ? ` (${car.year})` : '';
  title.textContent = car.name ? (car.name + year) : `Car ${index}`;
  wrap.appendChild(title);

  const preview = document.createElement('img');
  preview.className = 'preview';
  preview.alt = car.name || '';
  const imgVal = getImageValue(car);
  const displayedVal = imgVal || 'unknown.png';
  preview.src = `assets/img/cars/${displayedVal}`;
  wrap.appendChild(preview);

  // image picker: open modal for full-page selection
  if (!images.includes('unknown.png')) images = ['unknown.png', ...images];
  const filenameEl = document.createElement('div');
  filenameEl.className = 'current-filename';
  const displayed = imgVal || 'unknown.png';
  filenameEl.textContent = displayed;
  wrap.appendChild(filenameEl);

  const chooseBtn = document.createElement('button');
  chooseBtn.type = 'button';
  chooseBtn.className = 'choose-image-btn';
  chooseBtn.textContent = 'Choose image…';
  chooseBtn.addEventListener('click', () => openImageModal(car, preview, filenameEl));
  wrap.appendChild(chooseBtn);

  // create modal element if not already present
  function ensureModal() {
    if (document.getElementById('img-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'img-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div id="img-modal-title" class="modal-title"></div>
          <input id="img-modal-search" placeholder="Filter images" />
          <button id="img-modal-close">Close</button>
        </div>
        <div id="img-modal-grid" class="modal-grid"></div>
      </div>
    `;
    document.body.appendChild(modal);

    // close handler
    modal.querySelector('#img-modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    // search handler (fuzzy token matching)
    modal.querySelector('#img-modal-search').addEventListener('input', (e) => {
      const raw = e.target.value || '';
      const tokens = raw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const grid = document.getElementById('img-modal-grid');
      grid.querySelectorAll('.modal-thumb').forEach(el => {
        const name = el.getAttribute('data-name') || '';
        const norm = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const visible = tokens.length === 0 || tokens.every(t => norm.includes(t));
        el.style.display = visible ? '' : 'none';
      });
    });
  }

  function openImageModal(carObj, previewEl, filenameEl) {
    ensureModal();
    const modal = document.getElementById('img-modal');
    const grid = document.getElementById('img-modal-grid');
    grid.innerHTML = '';

    const current = getImageValue(carObj) || 'unknown.png';
    // set modal title to show car name and year
    const titleEl = modal.querySelector('#img-modal-title');
    if (titleEl) titleEl.textContent = (carObj.name || 'Car') + (carObj.year ? ` (${carObj.year})` : '');

    images.forEach(fn => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'modal-thumb';
      cell.setAttribute('data-name', fn);
      if (fn === current) cell.classList.add('selected');

      const t = document.createElement('img');
      t.src = `assets/img/cars/${fn}`;
      t.alt = fn;
      cell.appendChild(t);

      const label = document.createElement('div');
      label.className = 'thumb-label';
      label.textContent = fn === 'unknown.png' ? '(unknown image)' : fn;
      cell.appendChild(label);

      cell.addEventListener('click', () => {
        setImageValue(carObj, fn === 'unknown.png' ? null : fn);
        previewEl.src = `assets/img/cars/${fn}`;
        // update filename display for this card
        if (filenameEl && typeof filenameEl.textContent !== 'undefined') {
          filenameEl.textContent = fn;
        }
        // refresh counts
        updateCounts();
        modal.classList.remove('open');
      });

      grid.appendChild(cell);
    });

    // open modal
    modal.classList.add('open');
    const search = modal.querySelector('#img-modal-search');
    if (search) { search.value = ''; search.focus(); }
  }

  return wrap;
}

function render() {
  const container = document.getElementById('cars');
  container.innerHTML = '';
  if (!Array.isArray(cars)) {
    setStatus('Error: cars data is not an array');
    console.error('cars is not array', cars);
    return;
  }
  cars.forEach((c, i) => container.appendChild(createCarCard(c, i)));
  // build floating brand list for quick navigation
  buildBrandList();
  // update counts
  updateCounts();
}

function updateCounts() {
  const el = document.getElementById('img-count');
  if (!el) return;
  const count = cars.reduce((acc, c) => {
    const v = getImageValue(c);
    if (v && v !== 'unknown.png') return acc + 1;
    return acc;
  }, 0);
  el.textContent = `Assigned: ${count}/${cars.length}`;
}

function buildBrandList() {
  // remove existing
  const old = document.getElementById('brand-list');
  if (old) old.remove();
  const brands = Array.from(new Set(cars.map(c => c.brand || ''))).filter(Boolean).sort();
  if (brands.length === 0) return;
  const container = document.createElement('div');
  container.id = 'brand-list';
  brands.forEach(b => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'brand-btn';
    btn.textContent = b;
    btn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.car-card');
      let target = null;
      for (const el of cards) {
        if ((el.dataset.brand || '') === b) { target = el; break; }
      }
      if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
    container.appendChild(btn);
  });
  // top button
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'brand-btn top';
  topBtn.textContent = 'Top';
  topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  container.insertBefore(topBtn, container.firstChild);
  document.body.appendChild(container);
}

async function loadAll() {
  try {
    setStatus('Loading...');
    const [carsJson, imagesJson] = await Promise.all([
      fetchJson('/assets/data/cars.json'),
      fetchJson('/assets/data/images.json')
    ]);
    // support wrapper { version: X, cars: [...] }
    if (carsJson && Array.isArray(carsJson.cars)) {
      carsWrapper = carsJson;
      cars = carsJson.cars;
    } else if (Array.isArray(carsJson)) {
      carsWrapper = null;
      cars = carsJson;
    } else {
      // unexpected shape
      carsWrapper = null;
      cars = [];
      console.warn('Unexpected cars.json format:', carsJson);
    }

    images = Array.isArray(imagesJson) ? imagesJson : [];
    render();
    setStatus('Loaded');
  } catch (e) {
    setStatus('Error: ' + e.message);
    console.error(e);
  }
}

function downloadUpdated() {
  let out;
  if (carsWrapper && typeof carsWrapper === 'object') {
    const copy = Object.assign({}, carsWrapper);
    copy.cars = cars;
    out = copy;
  } else {
    out = cars;
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cars.updated.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const refreshBtn = document.getElementById('refresh');
const downloadBtn = document.getElementById('download');
if (refreshBtn) refreshBtn.addEventListener('click', loadAll);
if (downloadBtn) downloadBtn.addEventListener('click', downloadUpdated);

window.addEventListener('load', () => {
  loadAll();
});
