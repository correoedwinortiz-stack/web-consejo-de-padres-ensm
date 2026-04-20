/**
 * timeline.js - Renderiza linea de tiempo de actividades
 */

// Almacenar actividades para filtrado
window.timelineActividades = [];

/**
 * Renderiza linea de tiempo vertical
 * @param {Array} actividades - Array de actividades
 * @param {string} containerId - ID del contenedor
 */
function renderTimeline(actividades, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Guardar para filtrado
    window.timelineActividades = actividades || [];

    // Ordenar por fecha (vacias al final)
    const sorted = [...window.timelineActividades].sort((a, b) => {
        const fechaA = a.fecha?.trim() || '';
        const fechaB = b.fecha?.trim() || '';

        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        return new Date(fechaA) - new Date(fechaB);
    });

    renderTimelineByPeriod(sorted, containerId);

    // Inicializar botones de filtro y filtrar Periodo 1 por defecto
    initTimelineFilters();
    filterTimeline('1');
    // Actualizar UI para mostrar Periodo 1 activo
    const buttons = document.querySelectorAll('.timeline-filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    const periodo1Btn = document.querySelector('.timeline-filter-btn[data-period="1"]');
    if (periodo1Btn) periodo1Btn.classList.add('active');
}

/**
 * Renderiza timeline filtrado por periodo
 */
function renderTimelineByPeriod(actividades, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !actividades || actividades.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay actividades para mostrar</p>';
        return;
    }

    let html = '<div class="timeline">';

    actividades.forEach((act, index) => {
        const fecha = formatDate(act.fecha);
        const colorClass = getPeriodColor(act.periodo);

        html += `
            <div class="timeline-item" data-index="${index}">
                <div class="timeline-marker ${colorClass}"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${fecha}</div>
                    <div class="timeline-period">${act.periodo || ''}</div>
                    <h4 class="timeline-title">${act.titulo}</h4>
                    <p class="timeline-description">${act.descripcion || ''}</p>
                    ${act.grados ? `<span class="timeline-grades">Grados: ${act.grados}</span>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    observeTimelineItems(container);
}

/**
 * Inicializa filtros de periodo
 */
function initTimelineFilters() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const buttons = document.querySelectorAll('.timeline-filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const period = btn.dataset.period;
            filterTimeline(period);
        });
    });
}

/**
 * Filtra timeline por periodo
 */
function filterTimeline(period) {
    const filtered = window.timelineActividades.filter(act => {
        if (period === 'all') return true;

        const p = (act.periodo || '').toLowerCase().replace(/\s+/g, '');

        const numPatterns = [period, 'periodo' + period];
        if (period === '1') numPatterns.push('primero', 'periodoprimero', 'primer', 'primerperiodo');
        if (period === '2') numPatterns.push('segundo', 'periodosegundo');
        if (period === '3') numPatterns.push('tercero', 'periodotercero', 'tercer', 'tercerperiodo');
        if (period === '4') numPatterns.push('cuarto', 'periodocuarto');
        return numPatterns.some(pattern => p.includes(pattern));
    });

    renderTimelineByPeriod(filtered, 'timeline-container');
}

/**
 * Obtiene clase de color segun periodo
 */
function getPeriodColor(periodo) {
    if (!periodo) return 'bg-blue-500';

    const p = periodo.toLowerCase();
    if (p.includes('primero') || p.includes('primer') || p.includes('1')) return 'bg-blue-600';
    if (p.includes('segundo') || p.includes('2')) return 'bg-green-600';
    if (p.includes('tercero') || p.includes('tercer') || p.includes('3')) return 'bg-amber-600';
    if (p.includes('cuarto') || p.includes('4')) return 'bg-purple-600';
    return 'bg-blue-500';
}

/**
 * Formatea fecha ISO a formato legible
 */
function formatDate(dateStr) {
    if (!dateStr || !dateStr.trim()) return '';

    try {
        // Append noon to avoid timezone-shifted day changes
        const date = new Date(dateStr + 'T12:00:00');
        if (isNaN(date.getTime())) return dateStr;

        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('es-CO', options);
    } catch {
        return dateStr;
    }
}

/**
 * Observa items para animacion al entrar en viewport
 */
function observeTimelineItems(container) {
    const items = container.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    items.forEach(item => observer.observe(item));
}

/**
 * Renderiza timeline horizontal
 */
function renderTimelineHorizontal(actividades, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !actividades || actividades.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay actividades</p>';
        return;
    }

    const sorted = [...actividades].sort((a, b) => {
        const fechaA = a.fecha?.trim() || '';
        const fechaB = b.fecha?.trim() || '';
        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;
        return new Date(fechaA) - new Date(fechaB);
    });

    let html = '<div class="timeline-horizontal">';

    sorted.forEach((act, index) => {
        const fecha = formatDate(act.fecha);
        const colorClass = getPeriodColor(act.periodo);

        html += `
            <div class="timeline-h-item" data-index="${index}">
                <div class="timeline-h-marker ${colorClass}"></div>
                <div class="timeline-h-content">
                    <div class="timeline-h-date">${fecha}</div>
                    <h5 class="timeline-h-title">${act.titulo}</h5>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    const items = container.querySelectorAll('.timeline-h-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    items.forEach(item => observer.observe(item));
}
