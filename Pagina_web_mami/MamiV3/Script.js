// ===== ESTADO =====
let postreSeleccionado = null;
let saboresElegidos = {};
let carrito = [];
let editandoUid = null;

// ===== INIT =====
function init() {
  const cfg = DB.getConfig();
  document.getElementById('shop-name').textContent = cfg.nombre;
  document.getElementById('shop-tagline').textContent = cfg.slogan;
  document.getElementById('footer-phone').textContent = formatWA(cfg.whatsapp);

  const waBtn = document.getElementById('contact-wa');
  waBtn.href = `https://wa.me/${cfg.whatsapp}`;
  waBtn.querySelector('span').textContent = formatWA(cfg.whatsapp);

  renderPostres();
}

function formatWA(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.length >= 12) {
    const cc = digits.slice(0, 2);
    const rest = digits.slice(2);
    return `+${cc} ${rest.slice(0,3)} ${rest.slice(3,6)} ${rest.slice(6)}`;
  }
  return `+${digits}`;
}

// ===== RENDERIZAR POSTRES =====
function renderPostres() {
  const postres = DB.getPostres().filter(p => p.activo);
  const grid = document.getElementById('postres-grid');

  if (postres.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-light);font-size:.9rem;padding:2rem 0">Próximamente más opciones...</p>`;
    return;
  }

  grid.innerHTML = postres.map(p => `
    <div class="postre-card" data-id="${p.id}" onclick="seleccionarPostre(${p.id})">
      ${p.imagen
        ? `<img class="postre-card-img" src="${p.imagen}" alt="${p.nombre}"/>`
        : `<div class="postre-card-placeholder"><span>${p.emoji || '🎂'}</span><p>Ver opciones</p></div>`
      }
      <div class="postre-card-body">
        <div class="postre-card-name">${p.nombre}</div>
        <div class="postre-card-desc">${p.descripcion}</div>
        <div class="postre-card-footer">
          <span class="postre-price">${p.precio ? `$${p.precio}` : 'Consultar precio'}</span>
          <span class="postre-select-badge">Seleccionar</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== SELECCIONAR POSTRE =====
function seleccionarPostre(id) {
  const postres = DB.getPostres();
  postreSeleccionado = postres.find(p => p.id === id);
  if (!postreSeleccionado) return;

  saboresElegidos = {};

  document.querySelectorAll('.postre-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.postre-card[data-id="${id}"]`)?.classList.add('selected');

  const conf = document.getElementById('configurador');
  conf.classList.remove('hidden');
  conf.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('preview-name').textContent = postreSeleccionado.nombre;
  document.getElementById('preview-price').textContent = postreSeleccionado.precio
    ? `Desde $${postreSeleccionado.precio}` : '';
  document.getElementById('config-postre-nombre').textContent = postreSeleccionado.nombre.toLowerCase();

  // Mostrar imagenDetalle al seleccionar (puede ser diferente a la portada)
  const imgInicial = postreSeleccionado.imagenDetalle || postreSeleccionado.imagen || '';
  actualizarPreviewImagen(imgInicial);
  renderConfigFields();
}

// ===== RENDERIZAR CAMPOS DE CONFIGURACIÓN =====
function renderConfigFields() {
  const container = document.getElementById('config-fields');
  const p = postreSeleccionado;
  let html = '';

  if (p.tieneSabores && p.numSabores > 0) {
    const sabores = DB.getSabores();
    for (let i = 1; i <= p.numSabores; i++) {
      const label = p.numSabores === 1 ? 'Sabor del pastel'
        : i === 1 ? 'Primer sabor' : i === 2 ? 'Segundo sabor' : `Sabor ${i}`;
      const opciones = sabores.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
      html += `
        <div class="config-field">
          <label>${label}</label>
          <select class="config-select sabor-select" data-pos="${i}" onchange="elegirSabor(${i}, this.value)">
            <option value="">— Elige tu sabor —</option>
            ${opciones}
          </select>
        </div>`;
    }
  }

  // Campo tipo de betún
  const betunes = DB.getBetunes();
  const opcionesBetun = betunes.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('');
  html += `
    <div class="config-field">
      <label>Tipo de betún</label>
      <select class="config-select" id="betun-select">
        <option value="">— Elige el betún —</option>
        ${opcionesBetun}
      </select>
      <p class="config-field-desc">El betún es la cobertura interior del pastel.</p>
    </div>`;

  html += `
    <div class="config-field">
      <label>Cantidad</label>
      <select class="config-select" id="cant-select">
        ${[1,2,3,4,5,6,12].map(n => `<option value="${n}">${n} ${n === 1 ? 'pieza' : 'piezas'}</option>`).join('')}
      </select>
    </div>`;

  container.innerHTML = html;
}

// ===== ELEGIR SABOR =====
function elegirSabor(pos, saborId) {
  if (!saborId) { delete saboresElegidos[pos]; }
  else {
    const sabor = DB.getSabores().find(s => s.id == saborId);
    if (!sabor) return;
    saboresElegidos[pos] = sabor;
  }
  sincronizarOpcionesSabores();
  const resultado = buscarImagenActual();
  actualizarPreviewImagen(resultado.url, resultado.esComboSinFoto, resultado.nombresCombo);
  actualizarFlavorTags();
}

// Evita que el mismo sabor aparezca en más de un select
function sincronizarOpcionesSabores() {
  const selects = document.querySelectorAll('.sabor-select');
  selects.forEach(sel => {
    const pos = parseInt(sel.dataset.pos);
    const valorActual = sel.value;
    // IDs elegidos en los OTROS selects
    const otrosIds = Object.entries(saboresElegidos)
      .filter(([p]) => parseInt(p) !== pos)
      .map(([, s]) => String(s.id));

    Array.from(sel.options).forEach(opt => {
      if (opt.value === '') return; // dejar la opción vacía siempre visible
      opt.disabled = otrosIds.includes(opt.value);
      opt.style.display = otrosIds.includes(opt.value) ? 'none' : '';
    });

    // Si el valor actual fue deshabilitado (caso raro), resetear
    if (otrosIds.includes(valorActual)) {
      sel.value = '';
      delete saboresElegidos[pos];
    }
  });
}

function buscarImagenActual() {
  const elegidos = Object.values(saboresElegidos);
  if (elegidos.length === 0) return { url: postreSeleccionado.imagenDetalle || postreSeleccionado.imagen || '', esComboSinFoto: false };

  const combinaciones = DB.getCombinaciones();
  const idsElegidos = elegidos.map(s => Number(s.id)).sort((a, b) => a - b);

  // Solo buscar combinaciones cuando ya eligió todos los sabores requeridos
  if (elegidos.length === postreSeleccionado.numSabores) {
    for (const combo of combinaciones) {
      const idsCombo = combo.saboresIds.map(Number).sort((a, b) => a - b);
      if (idsCombo.length === idsElegidos.length && idsCombo.every((id, i) => id === idsElegidos[i])) {
        if (combo.imagen) return { url: combo.imagen, esComboSinFoto: false };
        // Combinación registrada pero sin foto → mensaje especial
        return { url: '', esComboSinFoto: true, nombresCombo: combo.nombres };
      }
    }
    // Combinación no registrada (nueva) → también mensaje especial
    const nombresNuevos = elegidos.map(s => s.nombre).join(' + ');
    return { url: '', esComboSinFoto: true, nombresCombo: nombresNuevos };
  }

  // Mientras selecciona sabores parcialmente, mostrar imagen del último sabor
  const ultimoConImagen = [...elegidos].reverse().find(s => s.imagen);
  if (ultimoConImagen) return { url: ultimoConImagen.imagen, esComboSinFoto: false };
  return { url: postreSeleccionado.imagenDetalle || postreSeleccionado.imagen || '', esComboSinFoto: false };
}

function actualizarPreviewImagen(url, esComboSinFoto, nombresCombo) {
  const img = document.getElementById('preview-img');
  const placeholder = document.getElementById('preview-placeholder');
  const comboMsg = document.getElementById('preview-combo-msg');

  // Ocultar mensaje especial por defecto
  if (comboMsg) comboMsg.classList.add('hidden');

  if (esComboSinFoto) {
    // Mostrar mensaje especial de combinación nueva
    img.classList.add('hidden');
    placeholder.style.display = 'none';
    if (comboMsg) {
      comboMsg.classList.remove('hidden');
    }
  } else if (url) {
    img.src = url; img.classList.remove('hidden'); placeholder.style.display = 'none';
  } else if (postreSeleccionado?.imagenDetalle || postreSeleccionado?.imagen) {
    img.src = postreSeleccionado.imagenDetalle || postreSeleccionado.imagen;
    img.classList.remove('hidden'); placeholder.style.display = 'none';
  } else {
    img.classList.add('hidden'); placeholder.style.display = '';
  }
}

function actualizarFlavorTags() {
  document.getElementById('flavor-tags').innerHTML = Object.values(saboresElegidos).map(s =>
    `<span class="flavor-tag" style="border-left:3px solid ${s.color}">${s.nombre}</span>`
  ).join('');
}

// ===== CARRITO =====
function agregarAlCarrito() {
  if (!postreSeleccionado) {
    mostrarToast('⬆️ Primero selecciona un postre del menú');
    return;
  }
  const cant = parseInt(document.getElementById('cant-select')?.value || '1');
  const betunId = document.getElementById('betun-select')?.value;
  const betunSeleccionado = betunId ? DB.getBetunes().find(b => b.id == betunId) : null;
  // Detectar si la combinación es nueva (sin foto registrada)
  const resultadoActual = buscarImagenActual();
  const esComboNuevo = resultadoActual.esComboSinFoto || false;
  const nombresComboNuevo = resultadoActual.nombresCombo || '';
  carrito.push({
    uid: Date.now(),
    postre: { ...postreSeleccionado },
    sabores: [...Object.values(saboresElegidos)],
    betun: betunSeleccionado || null,
    cantidad: cant,
    esComboNuevo,
    nombresComboNuevo
  });
  renderCarrito();
  mostrarToast('✅ ' + cant + 'x ' + postreSeleccionado.nombre + ' agregado');
  document.getElementById('order-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCarrito() {
  const tbody = document.getElementById('carrito-tbody');
  const empty = document.getElementById('carrito-empty');
  const tableWrap = document.getElementById('carrito-table-wrap');
  const totalBox = document.getElementById('total-box');

  if (carrito.length === 0) {
    empty.classList.remove('hidden');
    tableWrap.classList.add('hidden');
    totalBox.classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  tableWrap.classList.remove('hidden');

  tbody.innerHTML = carrito.map(item => {
    const saboresHtml = item.sabores.length > 0
      ? item.sabores.map(s => `<span class="carrito-sabor-tag" style="border-color:${s.color}">${s.nombre}</span>`).join('')
      : '<span style="color:var(--text-light);font-size:.8rem">—</span>';
    const betunHtml = item.betun
      ? `<span class="carrito-sabor-tag" style="border-color:${item.betun.color};margin-top:3px">🎂 ${item.betun.nombre}</span>`
      : '';
    const precioTotal = item.postre.precio
      ? '$' + (item.postre.precio * item.cantidad).toLocaleString('es-MX', {minimumFractionDigits:2}) : '—';
    return `
      <tr class="carrito-row" data-uid="${item.uid}">
        <td class="carrito-nombre"><span class="carrito-emoji">${item.postre.emoji || '🎂'}</span>${item.postre.nombre}</td>
        <td class="carrito-sabores">${saboresHtml}${betunHtml}</td>
        <td class="col-cant">
          <div class="qty-ctrl">
            <button onclick="cambiarCantidad(${item.uid}, -1)" class="qty-btn">−</button>
            <span class="qty-num">${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.uid}, 1)" class="qty-btn">+</button>
          </div>
        </td>
        <td class="col-precio carrito-precio">${precioTotal}</td>
        <td class="col-acciones">
          <button class="accion-btn editar-btn" onclick="abrirEdicion(${item.uid})" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="accion-btn eliminar-btn" onclick="eliminarItem(${item.uid})" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </td>
      </tr>`;
  }).join('');

  let total = 0;
  let todoConPrecio = true;
  carrito.forEach(item => {
    if (item.postre.precio) total += item.postre.precio * item.cantidad;
    else todoConPrecio = false;
  });

  if (total > 0) {
    document.getElementById('total-amount').textContent =
      '$' + total.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2}) + (!todoConPrecio ? ' +' : '');
    totalBox.classList.remove('hidden');
  } else {
    totalBox.classList.add('hidden');
  }
}

function cambiarCantidad(uid, delta) {
  const item = carrito.find(i => i.uid === uid);
  if (!item) return;
  item.cantidad = Math.max(1, item.cantidad + delta);
  renderCarrito();
}

function eliminarItem(uid) {
  const row = document.querySelector(`.carrito-row[data-uid="${uid}"]`);
  if (row) {
    row.style.transition = 'all .22s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(16px)';
    setTimeout(() => { carrito = carrito.filter(i => i.uid !== uid); renderCarrito(); }, 230);
  } else {
    carrito = carrito.filter(i => i.uid !== uid);
    renderCarrito();
  }
}

// ===== MODAL EDITAR =====
function abrirEdicion(uid) {
  const item = carrito.find(i => i.uid === uid);
  if (!item) return;
  editandoUid = uid;

  document.getElementById('modal-editar-titulo').textContent = item.postre.nombre;
  const sabores = DB.getSabores();
  const p = item.postre;
  let html = '';

  if (p.tieneSabores && p.numSabores > 0) {
    for (let i = 1; i <= p.numSabores; i++) {
      const label = p.numSabores === 1 ? 'Sabor del pastel'
        : i === 1 ? 'Primer sabor' : i === 2 ? 'Segundo sabor' : `Sabor ${i}`;
      const selectedId = item.sabores[i-1]?.id || '';
      html += `
        <div class="config-field">
          <label>${label}</label>
          <select class="config-select" id="edit-sabor-${i}">
            <option value="">— Elige tu sabor —</option>
            ${sabores.map(s => `<option value="${s.id}" ${s.id == selectedId ? 'selected' : ''}>${s.nombre}</option>`).join('')}
          </select>
        </div>`;
    }
  }

  // Campo betún en modal editar
  const betunes = DB.getBetunes();
  const betunActualId = item.betun?.id || '';
  html += `
    <div class="config-field">
      <label>Tipo de betún</label>
      <select class="config-select" id="edit-betun">
        <option value="">— Elige el betún —</option>
        ${betunes.map(b => `<option value="${b.id}" ${b.id == betunActualId ? 'selected' : ''}>${b.nombre}</option>`).join('')}
      </select>
      <p class="config-field-desc">El betún es la cobertura exterior del pastel.</p>
    </div>`;

  html += `
    <div class="config-field">
      <label>Cantidad</label>
      <select class="config-select" id="edit-cant">
        ${[1,2,3,4,5,6,12].map(n => `<option value="${n}" ${n === item.cantidad ? 'selected' : ''}>${n} ${n===1?'pieza':'piezas'}</option>`).join('')}
      </select>
    </div>`;

  document.getElementById('modal-editar-fields').innerHTML = html;
  document.getElementById('modal-editar').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function guardarEdicion() {
  const item = carrito.find(i => i.uid === editandoUid);
  if (!item) return;
  const sabores = DB.getSabores();
  const p = item.postre;
  const nuevosSabores = [];

  if (p.tieneSabores && p.numSabores > 0) {
    for (let i = 1; i <= p.numSabores; i++) {
      const sel = document.getElementById(`edit-sabor-${i}`)?.value;
      if (sel) { const s = sabores.find(s => s.id == sel); if (s) nuevosSabores.push(s); }
    }
  }

  item.sabores = nuevosSabores;
  const editBetunId = document.getElementById('edit-betun')?.value;
  item.betun = editBetunId ? (DB.getBetunes().find(b => b.id == editBetunId) || null) : null;
  item.cantidad = parseInt(document.getElementById('edit-cant').value);
  cerrarModalEditar();
  renderCarrito();
  mostrarToast('✏️ Ítem actualizado');
}

function cerrarModalEditar() {
  document.getElementById('modal-editar').classList.add('hidden');
  document.body.style.overflow = '';
  editandoUid = null;
}

document.getElementById('modal-editar-close').addEventListener('click', cerrarModalEditar);
document.getElementById('modal-editar').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-editar')) cerrarModalEditar();
});

// ===== TOAST =====
function mostrarToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast-show'), 2800);
}

// ===== ENVIAR POR WHATSAPP =====
document.getElementById('send-btn').addEventListener('click', () => {
  const nombre = document.getElementById('f-nombre').value.trim();
  const telefono = document.getElementById('f-telefono').value.trim();
  const notas = document.getElementById('f-notas').value.trim();

  if (!nombre) return alert('Por favor ingresa tu nombre completo.');
  if (!telefono) return alert('Por favor ingresa tu número de teléfono.');
  if (carrito.length === 0) return alert('Por favor agrega al menos un producto al carrito.');

  const cfg = DB.getConfig();
  let msg = `🎂 *Nuevo pedido — ${cfg.nombre}*\n\n`;
  msg += `👤 *Cliente:* ${nombre}\n`;
  msg += `📞 *Teléfono:* ${telefono}\n\n`;
  msg += `🛒 *Detalle del pedido:*\n`;

  let totalGeneral = 0;
  let todoConPrecio = true;

  carrito.forEach((item, i) => {
    let linea = `  ${i+1}. ${item.cantidad}x ${item.postre.nombre}`;
    if (item.sabores.length > 0) linea += ` (${item.sabores.map(s => s.nombre).join(' + ')})`;
    if (item.betun) linea += ` | Betún: ${item.betun.nombre}`;
    if (item.postre.precio) {
      const sub = item.postre.precio * item.cantidad;
      totalGeneral += sub;
      linea += ` — $${sub.toLocaleString('es-MX', {minimumFractionDigits:2})}`;
    } else { todoConPrecio = false; }
    msg += linea + '\n';
  });

  if (totalGeneral > 0) {
    msg += `\n💰 *Total a pagar:* $${totalGeneral.toLocaleString('es-MX', {minimumFractionDigits:2})}`;
    if (!todoConPrecio) msg += ' + consultar precio adicional';
    msg += '\n';
  }

  if (notas) msg += `\n💬 *Notas:* ${notas}\n`;

  // Si algún item tiene una combinación nueva, agregar sección especial
  const combosNuevos = carrito.filter(item => item.esComboNuevo && item.sabores.length >= 2);
  if (combosNuevos.length > 0) {
    msg += `\n\n🔍 *¡El cliente descubrió una combinación nueva!*\n`;
    combosNuevos.forEach(item => {
      const saboresTexto = item.sabores.map(s => s.nombre).join(' + ');
      msg += `  🌟 ${saboresTexto} (en ${item.postre.nombre})\n`;
    });
    msg += `_(Esta combinación aún no tiene foto — considera fotografiarla)_`;
  }

  msg += `\n\n✨ Pedido hecho desde la página web`;

  const url = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
});

// ===== ARRANCAR =====
init();