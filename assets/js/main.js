/**
 * main.js - Inicializa todas las secciones dinamicas de index.html
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Main] DOMContentLoaded iniciado');

    initMobileMenu();
    initNavbarScroll();
    initScrollToTop();

    // Cargar secciones segun pagina
    const page = getCurrentPage();
    console.log('[Main] Pagina detectada:', page);

    if (page === 'index') {
        console.log('[Main] Cargando secciones index...');
        await loadActividadesDestacadas();
        await loadTimeline();
        await loadComunicados();
        await loadCampanas();
        await loadTemasManual();
        await loadConfig();
    } else if (page === 'campana-lista') {
        await loadAllCampanas();
        initCampanaSearchFilter();
    } else if (page === 'campana-detalle') {
        await loadCampanaData();
    } else if (page === 'manual-index') {
        await loadAllTemas();
        await loadConfig();
        initSearchFilter();
    } else if (page === 'manual-tema') {
        await loadTemaContent();
    }
});

/**
 * Obtiene la pagina actual por nombre de archivo
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const search = window.location.search;

    if (filename === 'tema.html' && path.includes('manual')) return 'manual-tema';
    if (filename === 'index.html' && path.includes('manual')) return 'manual-index';
    if (filename === 'campana.html') {
        // Si hay parametro id, mostrar campana individual; si no, mostrar listado
        const params = new URLSearchParams(search);
        if (params.has('id')) return 'campana-detalle';
        return 'campana-lista';
    }
    if (filename === 'index.html') return 'index';
    return 'index';
}

/**
 * Menu hamburguesa movil
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

/**
 * Navbar sombra al hacer scroll
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
    });
}

/**
 * Boton scroll to top
 */
function initScrollToTop() {
    const btn = document.getElementById('scroll-top');

    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            btn.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * Carga config desde Sheets y actualiza elementos estaticos
 */
async function loadConfig() {
    try {
        const nombre = await getConfig('nombre_institucion');
        const correo = await getConfig('correo_contacto');
        const direccion = await getConfig('direccion');
        const telefono = await getConfig('telefono');
        const whatsapp = await getConfig('whatsapp');

        // Actualizar top bar
        const topCorreo = document.getElementById('top-correo');
        const topDireccion = document.getElementById('top-direccion');

        if (topCorreo && correo) topCorreo.href = `mailto:${correo}`;
        if (topDireccion && direccion) topDireccion.textContent = direccion;

        // Actualizar WhatsApp en contacto
        const whatsappLink = document.getElementById('whatsapp-link');
        const whatsappNum = document.getElementById('whatsapp-num');
        if (whatsappLink && whatsapp) {
            whatsappLink.href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
        }
        if (whatsappNum && whatsapp) {
            whatsappNum.textContent = whatsapp;
        }
    } catch (error) {
        console.error('Error cargando config:', error);
    }
}

/**
 * Carga actividades destacadas
 */
async function loadActividadesDestacadas() {
    const container = document.getElementById('actividades-container');
    if (!container) return;

    try {
        const actividades = await getActividades({ destacado: 'si' });
        // Ordenar por fecha ascendente y limitar a 4 mas proximas
        actividades.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const limited = actividades.slice(0, 4);

        if (limited.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay actividades destacadas</p>';
            return;
        }

        container.innerHTML = limited.map(act => createActividadCard(act)).join('');

        observeCards(container.querySelectorAll('.card-animated'));
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Error cargando actividades</p>';
    }
}

/**
 * Carga linea de tiempo
 */
async function loadTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) {
        console.error('[Timeline] Contenedor #timeline-container no encontrado');
        return;
    }

    console.log('[Timeline] Inicio de carga');

    try {
        console.log('[Timeline] Llamando getActividades...');
        const actividades = await getActividades({ soloFuturas: false });
        console.log('[Timeline] Resultado getActividades:', actividades);
        console.log('[Timeline] Llamando renderTimeline...');
        renderTimeline(actividades, 'timeline-container');
        console.log('[Timeline] renderTimeline completado');
    } catch (error) {
        console.error('[Timeline] Error:', error);
        container.innerHTML = '<p class="text-red-500 text-center">Error cargando linea de tiempo</p>';
    }
}

/**
 * Carga comunicados recientes
 */
async function loadComunicados() {
    const container = document.getElementById('comunicados-container');
    if (!container) return;

    try {
        const comunicados = await getComunicados();
        const limited = comunicados.slice(0, 3);

        if (limited.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay comunicados</p>';
            return;
        }

        container.innerHTML = limited.map(com => createComunicadoCard(com)).join('');

        observeCards(container.querySelectorAll('.card-animated'));
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Error cargando comunicados</p>';
    }
}

/**
 * Carga campanas activas
 */
async function loadCampanas() {
    const container = document.getElementById('campanas-container');
    if (!container) return;

    try {
        const campanas = await getCampanas();

        if (campanas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay campanas activas</p>';
            return;
        }

        container.innerHTML = campanas.map(camp => createCampanaCard(camp)).join('');

        observeCards(container.querySelectorAll('.card-animated'));
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Error cargando campanas</p>';
    }
}

/**
 * Carga temas del manual
 */
async function loadTemasManual() {
    const container = document.getElementById('temas-container');
    if (!container) return;

    try {
        const temas = await getTemasManual({ visible: 'si' });
        const limited = temas.slice(0, 6);

        if (limited.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay temas disponibles</p>';
            return;
        }

        container.innerHTML = limited.map(tema => createTemaCard(tema)).join('');

        observeCards(container.querySelectorAll('.card-animated'));
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center col-span-full">Error cargando temas</p>';
    }
}

/**
 * Carga todas las campañas para el listado
 */
async function loadAllCampanas() {
    const container = document.getElementById('campanas-container');
    if (!container) return;

    try {
        const campanas = await getCampanas();
        console.log('[Campana] Todas las campañas:', campanas.length);

        if (campanas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay campañas disponibles</p>';
            return;
        }

        window.allCampanas = campanas;
        container.innerHTML = campanas.map(camp => createCampanaCard(camp)).join('');
        observeCards(container.querySelectorAll('.card-animated'));

        // Ocultar secciones de detalle (hero, about, videos, juegos, recursos, temas)
        document.getElementById('hero-campana').classList.add('hidden');
        document.getElementById('campana-about-section').classList.add('hidden');
        document.getElementById('videos-section').classList.add('hidden');
        document.getElementById('juegos-section').classList.add('hidden');
        document.getElementById('recursos-section').classList.add('hidden');
        document.getElementById('temas-section').classList.add('hidden');
    } catch (error) {
        console.error('[Campana] Error:', error);
        container.innerHTML = '<p class="text-red-500 text-center">Error cargando campañas</p>';
    }
}

/**
 * Inicializa buscador y filtros de campañas
 */
function initCampanaSearchFilter() {
    const searchInput = document.getElementById('search-input');
    const estadoFilter = document.getElementById('estado-filter');
    const container = document.getElementById('campanas-container');

    if (!searchInput || !estadoFilter || !container) return;

    const filterCampanas = () => {
        const query = searchInput.value.toLowerCase();
        const estado = estadoFilter.value;
        console.log('[filterCampanas] query:', query, 'estado:', estado);

        const filtered = window.allCampanas.filter(camp => {
            const matchText = (camp.nombre || '').toLowerCase().includes(query) ||
                (camp.descripcion || '').toLowerCase().includes(query);
            const matchEstado = !estado || camp.estado === estado;
            return matchText && matchEstado;
        });

        console.log('[filterCampanas] resultado:', filtered.length);
        container.innerHTML = filtered.map(camp => createCampanaCard(camp)).join('');
        observeCards(container.querySelectorAll('.card-animated'));
    };

    searchInput.addEventListener('input', filterCampanas);
    estadoFilter.addEventListener('change', filterCampanas);
}

/**
 * Carga datos de una campana por ID desde URL (?id=cam-001)
 */
async function loadCampanaData() {
    const params = new URLSearchParams(window.location.search);
    const idCampana = params.get('id');

    console.log('[Campana] ID de URL:', idCampana);

    if (!idCampana) {
        showCampanaError('No se especifico ninguna campana.');
        return;
    }

    try {
        // Cargar datos de la campana
        const campana = await getCampanaById(idCampana);

        if (!campana) {
            showCampanaError('La campana "' + idCampana + '" no existe o no esta disponible.');
            return;
        }

        // Actualizar UI con datos de la campana
        updateCampanaUI(campana);

        // Ocultar modo lista, mostrar modo detalle
        document.getElementById('campana-search-section').classList.add('hidden');
        document.getElementById('campanas-grid-section').classList.add('hidden');
        document.getElementById('hero-campana').classList.remove('hidden');
        document.getElementById('campana-about-section').classList.remove('hidden');
        document.getElementById('videos-section').classList.remove('hidden');
        document.getElementById('juegos-section').classList.remove('hidden');
        document.getElementById('recursos-section').classList.remove('hidden');
        document.getElementById('temas-section').classList.remove('hidden');

        // Cargar contenido en paralelo
        await Promise.all([
            loadCampanaVideos(idCampana),
            loadCampanaJuegos(idCampana),
            loadCampanaRecursos(idCampana),
            loadTemasRelacionados()
        ]);
    } catch (error) {
        console.error('[Campana] Error general:', error);
        showCampanaError('Error al cargar la campana. Intenta de nuevo.');
    }
}

/**
 * Muestra mensaje de error amigable
 */
function showCampanaError(mensaje) {
    const heroTitulo = document.getElementById('hero-titulo');
    const heroDesc = document.getElementById('hero-descripcion');
    const heroBadge = document.getElementById('hero-badge');
    const campanaAbout = document.querySelector('.bg-light');
    const allSections = document.querySelectorAll('section');

    if (heroTitulo) heroTitulo.textContent = 'Campana no encontrada';
    if (heroBadge) heroBadge.textContent = 'Error';
    if (heroDesc) heroDesc.innerHTML = mensaje + '<br><a href="index.html" class="btn-primary mt-4 inline-block">Volver al inicio</a>';

    // Ocultar demas secciones
    allSections.forEach(section => {
        if (!section.classList.contains('hero') && !section.classList.contains('footer') && !section.classList.contains('top-bar') && !section.classList.contains('navbar')) {
            section.style.display = 'none';
        }
    });
}

/**
 * Actualiza elementos UI de la campana con datos del Sheets
 */
function updateCampanaUI(campana) {
    console.log('[Campana] updateCampanaUI:', campana);

    // Badge superior
    const heroBadge = document.getElementById('hero-badge');
    if (heroBadge) heroBadge.textContent = campana.subtitulo || 'Campana';

    // Titulo principal
    const heroTitulo = document.getElementById('hero-titulo');
    if (heroTitulo) heroTitulo.textContent = campana.nombre || 'Campana sin nombre';

    // Descripcion
    const heroDesc = document.getElementById('hero-descripcion');
    if (heroDesc) heroDesc.textContent = campana.descripcion || '';

    // Descripcion about
    const aboutText = document.getElementById('campana-about-text');
    if (aboutText) aboutText.textContent = campana.descripcion || campana.subtitulo || '';

    // Titulo de about
    const aboutTitle = document.getElementById('campana-about-title');
    if (aboutTitle) aboutTitle.textContent = 'Sobre esta campana';

    // Imagen de fondo del hero si existe
    const hero = document.getElementById('hero-campana');
    if (hero && campana.imagen_url) {
        hero.style.backgroundImage = `url(${campana.imagen_url})`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
    }

    // Actualizar titulo de pagina
    document.title = `${campana.nombre || 'Campana'} - Consejo de Padres`;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = campana.descripcion || '';

    // Nav link NO cambiar - debe seguir diciendo "Campañas" para volver al listado
}

/**
 * Carga videos de una campana especifica
 */
async function loadCampanaVideos(idCampana) {
    const container = document.getElementById('videos-container');
    if (!container) return;

    try {
        const videos = await getVideosCampana(idCampana);
        console.log('[Campana] Videos cargados:', videos.length);

        if (videos.length === 0) {
            container.innerHTML = createPlaceholder('videos');
            return;
        }

        container.innerHTML = videos.map(vid => createVideoCard(vid)).join('');
        initVideoModal();
    } catch (error) {
        console.error('[Campana] Error videos:', error);
        container.innerHTML = '<p class="text-red-500">Error cargando videos</p>';
    }
}

/**
 * Carga juegos de una campana especifica
 */
async function loadCampanaJuegos(idCampana) {
    const container = document.getElementById('juegos-container');
    if (!container) return;

    try {
        const juegos = await getJuegosCampana(idCampana);
        console.log('[Campana] Juegos cargados:', juegos.length);

        if (juegos.length === 0) {
            container.innerHTML = createPlaceholder('juegos');
            return;
        }

        container.innerHTML = juegos.map(juego => createJuegoCard(juego)).join('');
    } catch (error) {
        console.error('[Campana] Error juegos:', error);
        container.innerHTML = '<p class="text-red-500">Error cargando juegos</p>';
    }
}

/**
 * Carga recursos de una campana especifica
 */
async function loadCampanaRecursos(idCampana) {
    const container = document.getElementById('recursos-container');
    if (!container) return;

    try {
        const recursos = await getRecursosCampana(idCampana);
        console.log('[Campana] Recursos cargados:', recursos.length);

        if (recursos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay recursos disponibles para esta campana.</p>';
            return;
        }

        container.innerHTML = recursos.map(rec => createRecursoCard(rec)).join('');
    } catch (error) {
        console.error('[Campana] Error recursos:', error);
        container.innerHTML = '<p class="text-red-500">Error cargando recursos</p>';
    }
}

/**
 * Carga temas relacionados
 */
async function loadTemasRelacionados() {
    const container = document.getElementById('temas-relacionados');
    if (!container) return;

    try {
        const temas = await getTemasManual({ categoria: 'convivencia', visible: 'si' });
        const limited = temas.slice(0, 4);

        if (limited.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No hay temas relacionados</p>';
            return;
        }

        container.innerHTML = limited.map(tema => createTemaCard(tema)).join('');
    } catch (error) {
        console.error('[Campana] Error temas:', error);
        container.innerHTML = '<p class="text-red-500">Error cargando temas</p>';
    }
}

/**
 * Carga todos los temas para manual/index.html
 */
async function loadAllTemas() {
    const container = document.getElementById('all-temas-container');
    if (!container) return;

    try {
        const temas = await getTemasManual({ visible: 'si' });

        if (temas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-full">No hay temas disponibles</p>';
            return;
        }

        window.allTemas = temas; // Guardar para filtro
        container.innerHTML = temas.map(tema => createTemaCard(tema, true)).join('');

        observeCards(container.querySelectorAll('.card-animated'));
    } catch (error) {
        container.innerHTML = '<p class="text-red-500 text-center">Error cargando temas</p>';
    }
}

/**
 * Inicializa buscador y filtros
 */
function initSearchFilter() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const container = document.getElementById('all-temas-container');

    if (!searchInput || !categoryFilter || !container) return;

    const filterTemas = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        console.log('[filterTemas] query:', query, 'category:', category);
        console.log('[filterTemas] allTemas exists:', !!window.allTemas, 'length:', window.allTemas ? window.allTemas.length : 0);

        const filtered = window.allTemas.filter(tema => {
            const matchText = tema.titulo.toLowerCase().includes(query) ||
                tema.resumen.toLowerCase().includes(query);
            const matchCategory = !category || tema.categoria === category;
            return matchText && matchCategory;
        });

        console.log('[filterTemas] filtered count:', filtered.length);
        container.innerHTML = filtered.map(tema => createTemaCard(tema, true)).join('');
        observeCards(container.querySelectorAll('.card-animated'));
    };

    searchInput.addEventListener('input', filterTemas);
    categoryFilter.addEventListener('change', filterTemas);
}

/**
 * Carga contenido de un tema individual
 */
async function loadTemaContent() {
    const container = document.getElementById('tema-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        container.innerHTML = '<p class="text-red-500">Tema no especificado</p>';
        return;
    }

    try {
        const tema = await getTemaBySlug(slug);

        if (!tema) {
            container.innerHTML = '<p class="text-red-500">Tema no encontrado</p>';
            return;
        }

        // Actualizar titulo y meta
        document.title = `${tema.titulo} - Manual de Convivencia`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = tema.resumen;

        // Renderizar tema header
        const headerHtml = `
            <div class="tema-header">
                <span class="tema-category">${tema.categoria}</span>
                <h1 class="tema-title">${tema.titulo}</h1>
                <p class="tema-resumen">${tema.resumen}</p>
            </div>
        `;

        // Cargar bloques
        const bloques = await getBloquesManual(tema.id);

        if (bloques.length === 0) {
            container.innerHTML = headerHtml + '<p class="text-gray-500 italic">Contenido en construccion</p>';
            return;
        }

        const bloquesHtml = bloques.map(bloque => renderBloque(bloque)).join('');
        container.innerHTML = headerHtml + bloquesHtml;

        // Inicializar acordeones
        initAccordions();
    } catch (error) {
        container.innerHTML = '<p class="text-red-500">Error cargando contenido</p>';
    }
}

/**
 * Renderiza un bloque segun su tipo
 */
function renderBloque(bloque) {
    switch (bloque.tipo_bloque) {
        case 'intro':
            return `<div class="bloque-intro"><p>${bloque.contenido}</p></div>`;

        case 'lista':
            return `<div class="bloque-lista">
                <h3>${bloque.titulo_bloque || ''}</h3>
                <ul>${formatListContent(bloque.contenido)}</ul>
            </div>`;

        case 'pasos':
            return `<div class="bloque-pasos">
                <h3>${bloque.titulo_bloque || ''}</h3>
                <ol class="steps-list">${formatListContent(bloque.contenido)}</ol>
            </div>`;

        case 'faq':
            return `<div class="bloque-faq">
                <div class="faq-item">
                    <button class="faq-question">${bloque.titulo_bloque}</button>
                    <div class="faq-answer">${bloque.contenido}</div>
                </div>
            </div>`;

        case 'alerta':
            return `<div class="bloque-alerta">
                <strong>${bloque.titulo_bloque || 'Importante'}</strong>
                <p>${bloque.contenido}</p>
            </div>`;

        case 'cita':
            return `<blockquote class="bloque-cita">
                <p>${bloque.contenido}</p>
                ${bloque.titulo_bloque ? `<cite>${bloque.titulo_bloque}</cite>` : ''}
            </blockquote>`;

        case 'recurso':
            return `<div class="bloque-recurso">
                <h4>${bloque.titulo_bloque || 'Recurso'}</h4>
                <p>${bloque.contenido}</p>
            </div>`;

        default:
            return `<div class="bloque-default"><p>${bloque.contenido}</p></div>`;
    }
}

/**
 * Formatea contenido de lista
 */
function formatListContent(content) {
    if (!content) return '';
    const items = content.split('\n').filter(item => item.trim());
    return items.map(item => `<li>${item.trim()}</li>`).join('');
}

/**
 * Inicializa acordeones FAQ
 */
function initAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!question || !answer) return;

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });
}

// ==================== HELPERS ====================

/**
 * Crea HTML de tarjeta de actividad
 */
function createActividadCard(act) {
    return `
        <div class="card-animated bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
            <div class="text-sm text-gray-500 mb-2">${formatDate(act.fecha)}</div>
            <span class="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800 mb-3">${act.periodo || ''}</span>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${act.titulo}</h3>
            <p class="text-gray-600 text-sm mb-3">${act.descripcion || ''}</p>
            ${act.responsables ? `<p class="text-xs text-gray-500"><strong>Responsable:</strong> ${act.responsables}</p>` : ''}
        </div>
    `;
}

/**
 * Crea HTML de tarjeta de comunicado
 */
function createComunicadoCard(com) {
    const isDestacado = com.destacado === 'si';
    const cardClass = isDestacado ? 'bg-amber-50 border-l-4 border-amber-400' : 'bg-white';

    const imageHtml = com.miniatura_url ? `<img src="${com.miniatura_url}" alt="${com.titulo}" class="w-full h-40 object-cover rounded-lg mb-4">` : '';

    return `
        <div class="card-animated ${cardClass} rounded-xl shadow-md p-6">
            <div class="text-sm text-gray-500 mb-2">${formatDate(com.fecha)}</div>
            ${isDestacado ? '<span class="inline-block px-2 py-1 text-xs rounded bg-amber-200 text-amber-800 mb-2">Destacado</span>' : ''}
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${com.titulo}</h3>
            ${imageHtml}
            <p class="text-gray-600 text-sm mb-4">${com.resumen || ''}</p>
            ${com.pdf_url ? `<a href="${com.pdf_url}" target="_blank" class="btn-secondary text-sm">Ver Archivo</a>` : ''}
        </div>
    `;
}

/**
 * Crea HTML de tarjeta de campana
 */
function createCampanaCard(camp) {
    return `
        <div class="card-animated bg-white rounded-xl shadow-md overflow-hidden">
            ${camp.imagen_url ? `<img src="${camp.imagen_url}" alt="${camp.nombre}" class="w-full h-40 object-cover">` : ''}
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${camp.nombre}</h3>
                <p class="text-sm text-primary font-medium mb-2">${camp.subtitulo || ''}</p>
                <p class="text-gray-600 text-sm mb-4">${camp.descripcion || ''}</p>
                ${camp.enlace ? `<a href="${camp.enlace}" class="btn-primary text-sm">Ver mas</a>` : ''}
            </div>
        </div>
    `;
}

/**
 * Crea HTML de tarjeta de tema
 */
function createTemaCard(tema, linkToTema = false) {
    const href = linkToTema ? `tema.html?slug=${tema.slug}` : `manual/tema.html?slug=${tema.slug}`;
    const categoryLabels = {
        'convivencia': 'bg-red-100 text-red-800',
        'participacion': 'bg-blue-100 text-blue-800',
        'familias': 'bg-purple-100 text-purple-800'
    };
    const catClass = categoryLabels[tema.categoria] || 'bg-gray-100 text-gray-800';

    return `
        <div class="card-animated bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <span class="inline-block px-2 py-1 text-xs rounded ${catClass} mb-3">${tema.categoria}</span>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${tema.titulo}</h3>
            <p class="text-gray-600 text-sm mb-4">${tema.resumen || ''}</p>
            <a href="${href}" class="btn-secondary text-sm">Ver tema</a>
        </div>
    `;
}

/**
 * Crea HTML de tarjeta de video
 */
function createVideoCard(vid) {
    let mediaHtml = '';

    if (vid.video_url && vid.video_url.includes('youtube')) {
        mediaHtml = `
            <div class="video-container" data-video-url="${vid.video_url}">
                <img src="${vid.miniatura_url || 'https://img.youtube.com/vi/' + vid.video_url.split('v=')[1] + '/hqdefault.jpg'}" alt="${vid.titulo}" class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80">
                <button class="play-btn absolute inset-0 flex items-center justify-center" data-video-url="${vid.video_url}">
                    <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
        `;
    } else if (vid.video_url && vid.video_url.includes('cloudinary')) {
        mediaHtml = `
            <div class="video-wrapper" data-video-url="${vid.video_url}" data-poster="${vid.miniatura_url || ''}">
                <img src="${vid.miniatura_url || ''}" alt="${vid.titulo}" class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80">
                <button class="play-btn absolute inset-0 flex items-center justify-center" data-video-url="${vid.video_url}" data-poster="${vid.miniatura_url || ''}">
                    <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
            </div>
        `;
    } else if (vid.video_url) {
        mediaHtml = `
            <video controls class="w-full rounded-lg" poster="${vid.miniatura_url || ''}">
                <source src="${vid.video_url}" type="video/mp4">
            </video>
        `;
    }

    return `
        <div class="bg-white rounded-xl shadow-md p-6">
            ${mediaHtml}
            <div class="mt-4">
                <h4 class="font-semibold text-gray-800">${vid.titulo}</h4>
                <p class="text-sm text-gray-600">${vid.descripcion || ''}</p>
            </div>
        </div>
    `;
}

/**
 * Inicializa modal de video
 */
function initVideoModal() {
    const playBtns = document.querySelectorAll('.play-btn');

    playBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const videoUrl = btn.dataset.videoUrl;
            const poster = btn.dataset.poster || '';
            openVideoModal(videoUrl, poster);
        });
    });
}

/**
 * Abre modal con video
 */
function openVideoModal(videoUrl, poster) {
    // Crear modal si no existe
    let modal = document.getElementById('video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'fixed inset-0 bg-black/90 z-[100] flex items-center justify-center hidden';
        modal.innerHTML = `
            <button id="close-video-modal" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            <div class="video-modal-content max-w-4xl w-full mx-4"></div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-video-modal').addEventListener('click', closeVideoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoModal();
        });
    }

    const modalContent = modal.querySelector('.video-modal-content');

    if (videoUrl.includes('youtube')) {
        const videoId = videoUrl.split('v=')[1];
        modalContent.innerHTML = `
            <div class="video-container relative" style="padding-top: 56.25%;">
                <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay"></iframe>
            </div>
        `;
    } else {
        modalContent.innerHTML = `
            <video controls class="w-full rounded-lg" autoplay>
                <source src="${videoUrl}" type="video/mp4">
            </video>
        `;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra modal de video
 */
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.querySelector('.video-modal-content').innerHTML = '';
        document.body.style.overflow = '';
    }
}

/**
 * Crea HTML de tarjeta de juego
 */
function createJuegoCard(juego) {
    return `
        <div class="bg-white rounded-xl shadow-md p-6 text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                <img src="assets/img/rana-juego.png" alt="Juego" class="w-full h-full object-cover">
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">${juego.titulo}</h4>
            <p class="text-sm text-gray-600 mb-4">${juego.descripcion || ''}</p>
            ${juego.juego_url ?
            `<a href="${juego.juego_url}" target="_blank" class="btn-primary">Abrir juego</a>` :
            '<span class="text-gray-400">Proximamente</span>'
        }
        </div>
    `;
}

/**
 * Crea HTML de tarjeta de recurso
 */
function createRecursoCard(rec) {
    const iconMap = {
        'pdf': '📄',
        'enlace': '🔗',
        'documento': '📝',
        'video': '🎬'
    };

    return `
        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
            <span class="text-2xl">${iconMap[rec.tipo] || '📁'}</span>
            <div class="flex-1">
                <h4 class="font-medium text-gray-800">${rec.titulo}</h4>
                <p class="text-sm text-gray-600">${rec.descripcion || ''}</p>
            </div>
            ${rec.url ? `<a href="${rec.url}" target="_blank" class="btn-secondary text-sm">Ver</a>` : ''}
        </div>
    `;
}

/**
 * Crea placeholder para secciones vacias
 */
function createPlaceholder(tipo) {
    const content = {
        'videos': {
            'icon': '🎬',
            'title': 'Videos proximamente',
            'text': 'Estamos preparando contenido educativo en video.'
        },
        'juegos': {
            'icon': '🎮',
            'title': 'Juegos proximamente',
            'text': 'Actividades interactivas para aprender jugando.'
        }
    };

    const c = content[tipo] || { icon: '📁', title: 'Proximamente', text: '' };

    return `
        <div class="placeholder-card bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <div class="text-5xl mb-4">${c.icon}</div>
            <h4 class="text-lg font-semibold text-gray-700 mb-2">${c.title}</h4>
            <p class="text-gray-500">${c.text}</p>
        </div>
    `;
}

/**
 * Observa tarjetas para animacion
 */
function observeCards(cards) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}
