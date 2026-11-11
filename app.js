(async function () {
  const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
  const HEADER_H = 48;
  const PALETTE = ['#f4d58d', '#a8d5ba', '#f2a9a0', '#b5c7ed', '#e0bbe4', '#ffd6a5'];
  const TOTAL = COUNTRIES.length * 2;

  const svg = d3.select('#map');
  const $ = id => document.getElementById(id);

  // ---------- Datos del mapa ----------
  let topo;
  try {
    topo = await d3.json(TOPO_URL);
  } catch (e) {
    $('loading').textContent = 'No se pudo cargar el mapa. Comprueba la conexión a Internet.';
    return;
  }
  $('loading').remove();

  const geoms = topo.objects.countries.geometries;
  const features = topojson.feature(topo, topo.objects.countries).features;
  const byName = new Map(features.map(f => [f.properties.name, f]));
  const neighbors = topojson.neighbors(geoms);
  const idxByName = new Map(geoms.map((g, i) => [g.properties.name, i]));

  // Colorear sin que dos vecinos tengan el mismo color
  const colorOf = new Map();
  const quizIdx = COUNTRIES.map(c => idxByName.get(c.id)).filter(i => i !== undefined);
  quizIdx.sort((a, b) => neighbors[b].length - neighbors[a].length);
  quizIdx.forEach(i => {
    const used = new Set(neighbors[i].map(n => colorOf.get(n)));
    colorOf.set(i, PALETTE.find(c => !used.has(c)) || PALETTE[0]);
  });

  // ---------- Estado ----------
  const byId = new Map(COUNTRIES.map(c => [c.id, c]));
  const answers = new Map(COUNTRIES.map(c => [c.id, { country: '', cap: '' }]));
  const marks = new Map(COUNTRIES.map(c => [c.id, { country: null, cap: null }])); // ok | bad | revealed
  let openId = null;

  // ---------- Capas SVG ----------
  const root = svg.append('g');            // todo el mapa va aquí dentro (recibe el zoom)
  const gBase = root.append('g');
  const gQuiz = root.append('g');
  const gMarkers = root.append('g');
  const gBadges = root.append('g').style('pointer-events', 'none');

  gBase.selectAll('path').data(features).join('path').attr('class', 'base');

  const quizData = COUNTRIES.map(c => ({ c, feat: byName.get(c.id), idx: idxByName.get(c.id) }));
  const polys = gQuiz.selectAll('path').data(quizData.filter(d => d.feat)).join('path')
    .attr('class', 'country')
    .attr('fill', d => colorOf.get(d.idx));

  // Marcadores clicables para países diminutos o sin polígono
  const markerData = quizData.filter(d => d.c.micro || !d.feat);
  const markers = gMarkers.selectAll('circle').data(markerData).join('circle').attr('class', 'marker');

  // Insignias de progreso (P = país, C = capital)
  const badges = gBadges.selectAll('g').data(quizData).join('g').attr('class', 'badge');
  badges.each(function () {
    const g = d3.select(this);
    [['P', -8], ['C', 8]].forEach(([t, x]) => {
      g.append('circle').attr('class', 'b' + t).attr('cx', x).attr('r', 7.5);
      g.append('text').attr('x', x).attr('y', 3.5).text(t);
    });
  });

  // Hover / clic
  // El resaltado se dibuja en capas aparte (sin mover el país, para no perder el evento de salida del ratón)
  const gHover = root.append('g').style('pointer-events', 'none');
  const gSel = root.append('g').style('pointer-events', 'none');
  function drawOutline(g, id, cls) {
    g.selectAll('*').remove();
    const d = quizData.find(q => q.c.id === id);
    if (id && d && d.feat) g.append('path').attr('class', cls).attr('d', path(d.feat));
  }
  function setHover(id, on) {
    drawOutline(gHover, on ? id : null, 'hlpath');
    markers.filter(d => d.c.id === id).classed('hl', on);
  }
  [polys, markers].forEach(sel => {
    sel.on('mouseenter', (e, d) => setHover(d.c.id, true))
      .on('mouseleave', (e, d) => setHover(d.c.id, false))
      .on('click', (e, d) => { e.stopPropagation(); openMenu(d.c.id, e.clientX, e.clientY); });
  });
  svg.on('click', closeMenu).on('mouseleave', () => { gHover.selectAll('*').remove(); markers.classed('hl', false); });

  // ---------- Proyección ----------
  const projection = d3.geoConicConformal().parallels([42, 62]).rotate([-14, 0]);
  const path = d3.geoPath(projection);
  const fitShape = {
    type: 'MultiPoint',
    coordinates: [[-24, 33], [-24, 68], [44, 33], [44, 68], [14, 33], [14, 71], [-8, 33], [34, 71]],
  };

  function layout() {
    const w = innerWidth, h = innerHeight;
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    projection.clipExtent(null).fitExtent([[6, HEADER_H + 4], [w - 6, h - 6]], fitShape);
    projection.clipExtent([[0, 0], [w, h]]);

    gBase.selectAll('path').attr('d', path);
    polys.attr('d', d => path(d.feat));
    markers.attr('cx', d => projection(d.c.anchor)[0]).attr('cy', d => projection(d.c.anchor)[1]);
    badges.each(d => {
      [d.bx, d.by] = projection(d.c.anchor);
      d.off = d.c.micro || !d.feat ? [20, -14] : [0, 0];
    });

    zoom.extent([[0, 0], [w, h]]).translateExtent([[0, 0], [w, h]]);
    svg.call(zoom.transform, d3.zoomIdentity);
    applyScale(1);
  }

  // ---------- Zoom ----------
  // Insignias y puntos mantienen su tamaño en pantalla al acercar
  function applyScale(k) {
    markers.attr('r', 6 / k);
    badges.attr('transform', d => `translate(${d.bx},${d.by}) scale(${1 / k}) translate(${d.off[0]},${d.off[1]})`);
  }
  const zoom = d3.zoom().scaleExtent([1, 8])
    .on('zoom', e => {
      root.attr('transform', e.transform);
      applyScale(e.transform.k);
      closeMenu();
    });
  svg.call(zoom).on('dblclick.zoom', null);
  $('zoomIn').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1.6));
  $('zoomOut').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6));
  $('zoomReset').addEventListener('click', () => svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (openId) closeMenu(); }, 120); });

  // ---------- Insignias ----------
  function renderBadge(id) {
    const a = answers.get(id), m = marks.get(id);
    const g = badges.filter(d => d.c.id === id);
    const show = a.country || a.cap || m.country || m.cap;
    g.style('display', show ? null : 'none');
    [['P', 'country'], ['C', 'cap']].forEach(([t, k]) => {
      const cls = m[k] ? m[k] : (a[k] ? 'on' : 'off');
      g.select('.b' + t).attr('class', 'b' + t + ' ' + cls);
    });
    const full = a.country && a.cap;
    g.classed('full', !!full);
  }

  function updateAll() {
    COUNTRIES.forEach(c => renderBadge(c.id));
    const n = [...answers.values()].reduce((s, a) => s + (a.country ? 1 : 0) + (a.cap ? 1 : 0), 0);
    $('progress').textContent = `Respondidas: ${n} / ${TOTAL}`;
  }

  // ---------- Menú ----------
  const pop = $('pop'), popC = $('popC'), popK = $('popK');
  const esSort = (a, b) => a.localeCompare(b, 'es');
  popC.add(new Option('Elige el país…', ''));
  [...COUNTRIES].sort((a, b) => esSort(a.es, b.es)).forEach(o => popC.add(new Option(o.es, o.id)));
  popK.add(new Option('Elige la capital…', ''));
  [...COUNTRIES].sort((a, b) => esSort(a.cap, b.cap)).forEach(o => popK.add(new Option(o.cap, o.id)));

  function syncMenu() {
    const a = answers.get(openId), m = marks.get(openId);
    popC.value = a.country; popK.value = a.cap;
    popK.disabled = !a.country && !a.cap;
    [[popC, 'country'], [popK, 'cap']].forEach(([s, k]) => {
      s.className = m[k] || '';
    });
  }

  function openMenu(id, x, y) {
    markers.classed('sel', false);
    openId = id;
    drawOutline(gSel, id, 'selpath');
    markers.filter(d => d.c.id === id).classed('sel', true);
    syncMenu();
    pop.hidden = false;
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - pw - 8, x + 14)) + 'px';
    pop.style.top = Math.max(HEADER_H + 4, Math.min(innerHeight - ph - 8, y + 14)) + 'px';
  }

  function closeMenu() {
    if (!openId) return;
    gSel.selectAll('*').remove();
    markers.classed('sel', false);
    openId = null;
    pop.hidden = true;
  }

  // Confirmación personalizada (devuelve una promesa)
  function askConfirm(text) {
    return new Promise(resolve => {
      $('confirmText').textContent = text;
      $('confirm').hidden = false;
      const done = v => {
        $('confirm').hidden = true;
        $('confirmYes').onclick = $('confirmNo').onclick = null;
        resolve(v);
      };
      $('confirmYes').onclick = () => done(true);
      $('confirmNo').onclick = () => done(false);
    });
  }

  // Cambia un campo ('country' o 'cap'); avisa si el valor ya estaba en otro país
  async function setField(field, value) {
    const id = openId, a = answers.get(id);
    if (value) {
      const other = [...answers].find(([oid, oa]) => oid !== id && oa[field] === value);
      if (other) {
        const c = byId.get(value);
        const msg = field === 'country'
          ? `Ya has puesto «${c.es}» en otro país. ¿Seguro que quieres cambiarlo?`
          : `Ya has puesto la capital «${c.cap}» en otro país. ¿Seguro que quieres cambiarla?`;
        if (!(await askConfirm(msg))) { syncMenu(); return; }
        const oa = answers.get(other[0]);
        oa[field] = '';
        marks.get(other[0])[field] = null;
      }
    }
    a[field] = value;
    marks.get(id)[field] = null;
    syncMenu();
    updateAll();
  }

  popC.addEventListener('change', () => setField('country', popC.value));
  popK.addEventListener('change', () => setField('cap', popK.value));
  $('popX').addEventListener('click', closeMenu);
  addEventListener('keydown', e => { if (e.key === 'Escape') { $('confirm').hidden ? closeMenu() : $('confirmNo').click(); } });

  // ---------- Validación ----------
  const modal = $('modal'), chip = $('chip');

  function level(pct) {
    if (pct >= THRESHOLDS.bueno) return { name: 'Bueno', emoji: '🏆', color: '#1b9e47', msg: '¡Muy bien, lo dominas!' };
    if (pct >= THRESHOLDS.regular) return { name: 'Regular', emoji: '🙂', color: '#e08a00', msg: 'Vas por buen camino, sigue practicando.' };
    return { name: 'Malo', emoji: '📚', color: '#d62828', msg: 'Toca repasar un poco más. ¡Tú puedes!' };
  }

  function validate() {
    let okC = 0, okK = 0;
    COUNTRIES.forEach(c => {
      const a = answers.get(c.id), m = marks.get(c.id);
      const rc = a.country === c.id, rk = a.cap === c.id;
      m.country = rc ? 'ok' : 'bad';
      m.cap = rk ? 'ok' : 'bad';
      if (rc) okC++;
      if (rk) okK++;
    });
    if (openId) syncMenu();
    updateAll();
    const n = COUNTRIES.length;
    const pct = Math.round((okC + okK) / TOTAL * 100);
    const lv = level(pct);

    $('resEmoji').textContent = lv.emoji;
    $('resLevel').textContent = lv.name; $('resLevel').style.color = lv.color;
    $('resPct').textContent = pct + '%';
    $('resDetail').textContent = `${lv.msg} Países: ${okC}/${n} · Capitales: ${okK}/${n}`;
    $('resLegend').textContent =
      `Bueno: ${THRESHOLDS.bueno}% o más · Regular: ${THRESHOLDS.regular}% a ${THRESHOLDS.bueno - 1}% · Malo: menos de ${THRESHOLDS.regular}%`;
    chip.textContent = `${lv.name} · ${pct}%`;
    chip.style.background = lv.color;
    chip.hidden = false;
    modal.hidden = false;
  }

  function reset() {
    COUNTRIES.forEach(c => {
      answers.set(c.id, { country: '', cap: '' });
      marks.set(c.id, { country: null, cap: null });
    });
    chip.hidden = true;
    modal.hidden = true;
    closeMenu();
    updateAll();
  }

  function showSolutions() {
    COUNTRIES.forEach(c => {
      const a = answers.get(c.id), m = marks.get(c.id);
      if (a.country !== c.id) { a.country = c.id; m.country = 'revealed'; }
      if (a.cap !== c.id) { a.cap = c.id; m.cap = 'revealed'; }
    });
    if (openId) syncMenu();
    updateAll();
    modal.hidden = true;
  }

  $('btnValidate').addEventListener('click', validate);
  $('btnReset').addEventListener('click', async () => {
    if (await askConfirm('¿Borrar todas las respuestas?')) reset();
  });
  $('btnClose').addEventListener('click', () => { modal.hidden = true; });
  $('btnRestart').addEventListener('click', reset);
  $('btnSolutions').addEventListener('click', showSolutions);
  chip.addEventListener('click', () => { modal.hidden = false; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });

  layout();
  updateAll();
})();
