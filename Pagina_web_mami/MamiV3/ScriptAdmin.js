// ===== PIN DE ACCESO =====
const PIN_CORRECTO = '2208'; // 🔑 Cambia este PIN por el tuyo
const PIN_SESSION_KEY = 'admin_unlocked';
let pinActual = '';

function initPin() {
  // Si ya está autenticado en esta sesión, quitar overlay
  if (sessionStorage.getItem(PIN_SESSION_KEY) === 'true') {
    document.getElementById('pin-overlay').classList.add('hidden');
    return;
  }
}

function pinPress(digit) {
  if (pinActual.length >= 4) return;
  pinActual += digit;
  actualizarDots();
  if (pinActual.length === 4) setTimeout(pinEnter, 200);
}

function pinClear() {
  pinActual = pinActual.slice(0, -1);
  actualizarDots();
}

function pinEnter() {
  if (pinActual === PIN_CORRECTO) {
    sessionStorage.setItem(PIN_SESSION_KEY, 'true');
    document.getElementById('pin-overlay').classList.add('hidden');
  } else {
    const dots = document.querySelectorAll('#pin-dots span');
    dots.forEach(d => { d.classList.remove('filled'); d.classList.add('error'); });
    document.getElementById('pin-error').classList.remove('hidden');
    setTimeout(() => {
      dots.forEach(d => d.classList.remove('error'));
      document.getElementById('pin-error').classList.add('hidden');
      pinActual = '';
      actualizarDots();
    }, 800);
  }
}

function actualizarDots() {
  const dots = document.querySelectorAll('#pin-dots span');
  dots.forEach((d, i) => {
    d.classList.toggle('filled', i < pinActual.length);
  });
}

// Soporte teclado físico para el PIN
document.addEventListener('keydown', e => {
  if (document.getElementById('pin-overlay').classList.contains('hidden')) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  else if (e.key === 'Backspace') pinClear();
  else if (e.key === 'Enter') pinEnter();
});

initPin();

// ===== NAVEGACIÓN DE TABS =====
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    if (tab === 'postres') renderPostresList();
    if (tab === 'sabores') { renderSaboresList(); renderComboChecks(); renderCombosList(); }
  });
});

// ===== CONFIGURACIÓN =====
function initConfig() {
  const cfg = DB.getConfig();
  document.getElementById('cfg-nombre').value = cfg.nombre;
  document.getElementById('cfg-slogan').value = cfg.slogan;
  document.getElementById('cfg-whatsapp').value = cfg.whatsapp;
}

document.getElementById('guardar-config').addEventListener('click', () => {
  const cfg = {
    nombre: document.getElementById('cfg-nombre').value.trim() || 'Pastelería Dulce',
    slogan: document.getElementById('cfg-slogan').value.trim(),
    whatsapp: document.getElementById('cfg-whatsapp').value.trim().replace(/\D/g, '')
  };
  DB.saveConfig(cfg);
  flashSuccess('config-ok');
});

// ===== TOGGLE SABORES =====
document.getElementById('np-tiene-sabores').addEventListener('change', function() {
  document.getElementById('np-sabores-config').style.display = this.checked ? 'block' : 'none';
});

// ===== IMAGEN PREVIEW (helper) =====
function setupImgPreview(inputId, previewId, zoneId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande (máx. 2MB). Comprime la foto primero.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      document.querySelector(`#${zoneId} .img-upload-label`).style.display = 'none';
      document.querySelector(`#${zoneId} .img-remove-btn`)?.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

function quitarImagen(previewId, zoneId, inputId) {
  const preview = document.getElementById(previewId);
  const input = document.getElementById(inputId);
  preview.src = '';
  preview.classList.add('hidden');
  if (input) input.value = '';
  document.querySelector(`#${zoneId} .img-upload-label`).style.display = '';
  document.querySelector(`#${zoneId} .img-remove-btn`)?.classList.add('hidden');
}

// ===== AGREGAR POSTRE =====
setupImgPreview('np-img', 'np-img-preview', 'np-img-zone');

document.getElementById('agregar-postre').addEventListener('click', () => {
  const nombre = document.getElementById('np-nombre').value.trim();
  const desc = document.getElementById('np-desc').value.trim();
  const precio = parseFloat(document.getElementById('np-precio').value) || 0;
  const emoji = document.getElementById('np-emoji').value.trim() || '🎂';
  const tieneSabores = document.getElementById('np-tiene-sabores').checked;
  const numSabores = parseInt(document.getElementById('np-num-sabores').value) || 2;
  const imgPreview = document.getElementById('np-img-preview');
  const imagen = imgPreview.classList.contains('hidden') ? '' : imgPreview.src;

  if (!nombre) return alert('Ingresa el nombre del postre.');

  const postres = DB.getPostres();
  postres.push({
    id: DB.nextId(postres),
    nombre,
    descripcion: desc,
    precio,
    emoji,
    imagen,
    activo: true,
    tieneSabores,
    numSabores: tieneSabores ? numSabores : 0,
  });
  DB.savePostres(postres);

  // Limpiar
  ['np-nombre','np-desc','np-precio'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('np-emoji').value = '';
  document.getElementById('np-img-preview').classList.add('hidden');
  document.querySelector('#np-img-zone .img-upload-label').style.display = '';

  flashSuccess('postre-ok');
  renderPostresList();
});

// ===== LISTA DE POSTRES =====
function renderPostresList() {
  const postres = DB.getPostres();
  const container = document.getElementById('postres-list');

  if (postres.length === 0) {
    container.innerHTML = `<p style="color:var(--text-light);font-size:.9rem;padding:1rem 0">No hay postres todavía. ¡Agrega el primero arriba!</p>`;
    return;
  }

  container.innerHTML = postres.map(p => `
    <div class="postre-list-item">
      <div class="postre-list-thumb">
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}"/>`
          : p.emoji || '🎂'}
      </div>
      <div class="postre-list-info">
        <div class="postre-list-name">${p.nombre} ${!p.activo ? '<span style="font-size:.72rem;color:#b91c1c;background:#fee2e2;padding:2px 8px;border-radius:20px;margin-left:6px">Oculto</span>' : ''}</div>
        <div class="postre-list-meta">
          $${p.precio} · ${p.tieneSabores ? `${p.numSabores} sabor${p.numSabores > 1 ? 'es' : ''}` : 'Sin sabores'}
        </div>
      </div>
      <div class="postre-list-actions">
        <button class="btn-sm" onclick="abrirEditarPostre(${p.id})">✏ Editar</button>
        <button class="btn-sm" onclick="togglePostre(${p.id})">${p.activo ? 'Ocultar' : 'Mostrar'}</button>
        <button class="btn-sm danger" onclick="eliminarPostre(${p.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function togglePostre(id) {
  const postres = DB.getPostres();
  const p = postres.find(x => x.id === id);
  if (p) { p.activo = !p.activo; DB.savePostres(postres); renderPostresList(); }
}
function eliminarPostre(id) {
  if (!confirm('¿Eliminar este postre?')) return;
  DB.savePostres(DB.getPostres().filter(p => p.id !== id));
  renderPostresList();
}

// ===== MODAL EDITAR POSTRE =====
function abrirEditarPostre(id) {
  const postres = DB.getPostres();
  const p = postres.find(x => x.id === id);
  if (!p) return;

  // Eliminar modal previo si existe
  document.getElementById('edit-modal-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'edit-modal-backdrop';
  backdrop.id = 'edit-modal-backdrop';

  backdrop.innerHTML = `
    <div class="edit-modal">
      <button class="edit-modal-close" onclick="cerrarEditarPostre()">✕</button>
      <div class="edit-modal-title">✏ Editar postre</div>

      <div class="a-form-grid">
        <div class="a-field">
          <label>Nombre del postre</label>
          <input type="text" id="ep-nombre" value="${p.nombre}"/>
        </div>
        <div class="a-field">
          <label>Descripción corta</label>
          <input type="text" id="ep-desc" value="${p.descripcion}"/>
        </div>
        <div class="a-field">
          <label>Precio base (MXN)</label>
          <input type="number" id="ep-precio" value="${p.precio}" min="0"/>
        </div>
        <div class="a-field">
          <label>Emoji decorativo</label>
          <input type="text" id="ep-emoji" value="${p.emoji || '🎂'}" maxlength="4"/>
        </div>
      </div>

      <div class="a-field">
        <label>¿Tiene selección de sabores?</label>
        <div class="a-toggle-row">
          <label class="toggle">
            <input type="checkbox" id="ep-tiene-sabores" ${p.tieneSabores ? 'checked' : ''}
              onchange="document.getElementById('ep-sabores-config').style.display=this.checked?'block':'none'"/>
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Sí, tiene sabores personalizables</span>
        </div>
      </div>

      <div id="ep-sabores-config" style="display:${p.tieneSabores ? 'block' : 'none'}">
        <div class="a-field">
          <label>Número de sabores a elegir</label>
          <select id="ep-num-sabores">
            <option value="1" ${p.numSabores==1?'selected':''}>1 sabor</option>
            <option value="2" ${p.numSabores==2?'selected':''}>2 sabores</option>
            <option value="3" ${p.numSabores==3?'selected':''}>3 sabores</option>
          </select>
        </div>
      </div>

      <div class="a-field">
        <label>Imagen del postre</label>
        <div class="img-upload-zone" id="ep-img-zone" style="position:relative">
          <input type="file" accept="image/*" class="img-input" id="ep-img"/>
          <div class="img-upload-label" id="ep-img-label" ${p.imagen ? 'style="display:none"' : ''}>
            <span>📷</span>
            <p>Haz clic para cambiar imagen</p>
            <span class="a-hint">JPG, PNG o WebP · máx. 2MB</span>
          </div>
          <img id="ep-img-preview" class="img-preview ${p.imagen ? '' : 'hidden'}"
            src="${p.imagen || ''}" alt="preview"/>
          <button type="button" class="img-remove-btn ${p.imagen ? '' : 'hidden'}"
            onclick="quitarImagen('ep-img-preview','ep-img-zone','ep-img')">✕ Quitar imagen</button>
        </div>
      </div>

      <div class="edit-modal-actions">
        <button class="btn-sm primary" onclick="guardarEditarPostre(${id})">💾 Guardar cambios</button>
        <button class="btn-sm" onclick="cerrarEditarPostre()">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  // Preview imagen en el modal
  document.getElementById('ep-img').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen es demasiado grande (máx. 2MB).'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('ep-img-preview');
      prev.src = e.target.result;
      prev.classList.remove('hidden');
      document.getElementById('ep-img-label').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  // Cerrar al hacer clic fuera
  backdrop.addEventListener('click', e => { if (e.target === backdrop) cerrarEditarPostre(); });
}

function cerrarEditarPostre() {
  document.getElementById('edit-modal-backdrop')?.remove();
}

function guardarEditarPostre(id) {
  const postres = DB.getPostres();
  const p = postres.find(x => x.id === id);
  if (!p) return;

  const nombre = document.getElementById('ep-nombre').value.trim();
  if (!nombre) return alert('El nombre no puede estar vacío.');

  p.nombre      = nombre;
  p.descripcion = document.getElementById('ep-desc').value.trim();
  p.precio      = parseFloat(document.getElementById('ep-precio').value) || 0;
  p.emoji       = document.getElementById('ep-emoji').value.trim() || '🎂';
  p.tieneSabores= document.getElementById('ep-tiene-sabores').checked;
  p.numSabores  = p.tieneSabores ? parseInt(document.getElementById('ep-num-sabores').value) : 0;

  const prev = document.getElementById('ep-img-preview');
  p.imagen = prev.classList.contains('hidden') ? '' : (prev.src || '');

  DB.savePostres(postres);
  cerrarEditarPostre();
  renderPostresList();
  flashSuccess('postre-ok');
}

// ===== AGREGAR SABOR =====
setupImgPreview('ns-img', 'ns-img-preview', 'ns-img-zone');

document.getElementById('agregar-sabor').addEventListener('click', () => {
  const nombre = document.getElementById('ns-nombre').value.trim();
  const color = document.getElementById('ns-color').value;
  const imgPreview = document.getElementById('ns-img-preview');
  const imagen = imgPreview.classList.contains('hidden') ? '' : imgPreview.src;

  if (!nombre) return alert('Ingresa el nombre del sabor.');

  const sabores = DB.getSabores();
  sabores.push({ id: DB.nextId(sabores), nombre, color, imagen });
  DB.saveSabores(sabores);

  document.getElementById('ns-nombre').value = '';
  document.getElementById('ns-color').value = '#f472b6';
  document.getElementById('ns-img-preview').classList.add('hidden');
  document.querySelector('#ns-img-zone .img-upload-label').style.display = '';

  flashSuccess('sabor-ok');
  renderSaboresList();
});

// ===== LISTA DE SABORES =====
function renderSaboresList() {
  const sabores = DB.getSabores();
  const container = document.getElementById('sabores-list');

  if (sabores.length === 0) {
    container.innerHTML = `<p style="color:var(--text-light);font-size:.9rem">No hay sabores todavía.</p>`;
    return;
  }

  container.innerHTML = sabores.map(s => `
    <span class="sabor-chip">
      <span class="sabor-chip-color" style="background:${s.color}"></span>
      ${s.imagen ? '📷 ' : ''}${s.nombre}
      <button class="sabor-chip-del" onclick="eliminarSabor(${s.id})" title="Eliminar">✕</button>
    </span>
  `).join('');
}

function eliminarSabor(id) {
  if (!confirm('¿Eliminar este sabor?')) return;
  DB.saveSabores(DB.getSabores().filter(s => s.id !== id));
  renderSaboresList();
}

// ===== COMBINACIONES DE SABORES =====
setupImgPreview('combo-img', 'combo-img-preview', 'combo-img-zone');

function renderComboChecks() {
  const sabores = DB.getSabores();
  const container = document.getElementById('combo-checks');
  if (!container) return;
  if (sabores.length === 0) {
    container.innerHTML = '<p style="font-size:.84rem;color:var(--text-muted)">Agrega sabores primero.</p>';
    return;
  }
  container.innerHTML = sabores.map(s => `
    <label class="combo-check-label">
      <input type="checkbox" class="combo-check" value="${s.id}"/>
      <span class="combo-check-color" style="background:${s.color}"></span>
      ${s.nombre}
    </label>
  `).join('');
}

document.getElementById('agregar-combo').addEventListener('click', () => {
  const checks = [...document.querySelectorAll('.combo-check:checked')];
  if (checks.length < 2) return alert('Selecciona al menos 2 sabores para la combinación.');

  const imgPreview = document.getElementById('combo-img-preview');
  const imagen = imgPreview.classList.contains('hidden') ? '' : imgPreview.src;
  if (!imagen) return alert('Agrega una imagen para esta combinación.');

  const saboresIds = checks.map(c => Number(c.value));
  const sabores = DB.getSabores();
  const nombres = saboresIds.map(id => sabores.find(s => s.id === id)?.nombre || '').join(' + ');

  const combinaciones = DB.getCombinaciones();

  // Si ya existe esta combinación, actualizarla
  const idsOrdenados = [...saboresIds].sort((a, b) => a - b);
  const existente = combinaciones.find(c => {
    const idsC = c.saboresIds.map(Number).sort((a, b) => a - b);
    return idsC.length === idsOrdenados.length && idsC.every((id, i) => id === idsOrdenados[i]);
  });

  if (existente) {
    existente.imagen = imagen;
    existente.nombres = nombres;
  } else {
    combinaciones.push({ id: DB.nextId(combinaciones), saboresIds, nombres, imagen });
  }

  DB.saveCombinaciones(combinaciones);

  // Limpiar
  document.querySelectorAll('.combo-check').forEach(c => c.checked = false);
  quitarImagen('combo-img-preview', 'combo-img-zone', 'combo-img');

  flashSuccess('combo-ok');
  renderCombosList();
});

function renderCombosList() {
  const combinaciones = DB.getCombinaciones();
  const container = document.getElementById('combos-list');
  if (!container) return;

  if (combinaciones.length === 0) {
    container.innerHTML = '<p style="font-size:.84rem;color:var(--text-muted);padding:.5rem 0">No hay combinaciones guardadas todavía.</p>';
    return;
  }

  container.innerHTML = combinaciones.map(c => `
    <div class="postre-list-item">
      <div class="postre-list-thumb">
        ${c.imagen ? `<img src="${c.imagen}" alt="${c.nombres}"/>` : '🎨'}
      </div>
      <div class="postre-list-info">
        <div class="postre-list-name">${c.nombres}</div>
        <div class="postre-list-meta">${c.saboresIds.length} sabores · ${c.imagen ? 'Con imagen' : 'Sin imagen'}</div>
      </div>
      <div class="postre-list-actions">
        <button class="btn-sm danger" onclick="eliminarCombo(${c.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function eliminarCombo(id) {
  if (!confirm('¿Eliminar esta combinación?')) return;
  DB.saveCombinaciones(DB.getCombinaciones().filter(c => c.id !== id));
  renderCombosList();
}

// ===== UTILIDADES =====
function flashSuccess(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

// ===== INIT =====
initConfig();
renderPostresList();
renderSaboresList();