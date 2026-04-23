/**
 * sheets.js - Google Sheets data fetcher
 * Lee datos desde Google Sheets publicado como CSV publico
 */

const SHEETS_ID = '1AxVIB1Kp8SK1Yvw356Pl3GjvzOIkq0g1kng_8YmnA2s';

const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=`;

/**
 * Obtiene datos de una pestana del Sheets
 * @param {string} sheetName - Nombre de la pestana
 * @returns {Promise<Array>} Array de objetos con los datos
 */
async function getSheetData(sheetName) {
    try {
        const response = await fetch(BASE_URL + encodeURIComponent(sheetName));

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error cargando ${sheetName}:`, error);
        return [];
    }
}

/**
 * Parsea una cadena de fecha de forma robusta
 * Soporta YYYY-MM-DD, DD/MM/YYYY y objetos Date
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;
    
    const s = String(dateStr).trim();
    if (!s) return new Date(0);

    // Intentar formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        return new Date(s + 'T12:00:00');
    }
    
    // Intentar formato DD/MM/YYYY
    const parts = s.split('/');
    if (parts.length === 3) {
        let day = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        return new Date(year, month - 1, day, 12, 0, 0);
    }
    
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

/**
 * Parsea texto CSV a array de objetos
 * @param {string} csvText - Contenido CSV
 * @returns {Array} Array de objetos
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0) return [];

    // Extraer headers de la primera linea de forma simple
    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map((h, index) => {
        let clean = h.replace(/^"|"$/g, '').trim().toLowerCase();
        // Si el primer encabezado esta vacio, asumimos que es 'id'
        if (clean === '' && index === 0) return 'id';
        return clean;
    });

    // Parsear filas de datos
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            if (header) {
                // Limpiar comillas y espacios, manejar valores nulos
                let val = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
                row[header] = val;
            }
        });
        data.push(row);
    }

    return data;
}

/**
 * Parsea una linea CSV manejando comillas
 * @param {string} line - Linea CSV
 * @returns {Array} Array de valores
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

/**
 * Obtiene una fila de config por clave
 * @param {string} clave - Clave a buscar
 * @returns {string|null} Valor o null
 */
async function getConfig(clave) {
    const data = await getSheetData('config');
    const row = data.find(item => item.clave === clave);
    return row ? row.valor : null;
}

/**
 * Obtiene actividades filtradas
 * @param {Object} filtros - Objeto con filtros { destacado, estado, categoria }
 * @returns {Promise<Array>}
 */
async function getActividades(filtros = {}) {
    try {
        let data = await getSheetData('actividades');
        if (!data || !Array.isArray(data)) return [];

        // Filtrar por visibilidad primero (siempre)
        data = data.filter(item => {
            if (!item) return false;
            const visible = (item.visible || '').toLowerCase();
            return visible === 'si';
        });

        // Filtrar solo fechas futuras o de hoy
        if (filtros.soloFuturas !== false) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            data = data.filter(item => {
                const d = parseDate(item.fecha);
                return d.getTime() >= now.getTime();
            });
        }

        if (filtros.destacado) {
            data = data.filter(item => (item.destacado || '').toLowerCase() === 'si');
        }

        if (filtros.estado) {
            data = data.filter(item => (item.estado || '').toLowerCase() === filtros.estado.toLowerCase());
        }

        if (filtros.categoria) {
            data = data.filter(item => (item.categoria || '').toLowerCase() === filtros.categoria.toLowerCase());
        }

        return data;
    } catch (e) {
        console.error('Error en getActividades:', e);
        return [];
    }
}

/**
 * Obtiene comunicados visibles
 * @param {boolean} soloDestacados - Solo destacados
 * @returns {Promise<Array>}
 */
async function getComunicados(soloDestacados = false) {
    try {
        let data = await getSheetData('comunicados');
        if (!data || !Array.isArray(data)) return [];

        data = data.filter(item => (item.visible || '').toLowerCase() === 'si');

        if (soloDestacados) {
            data = data.filter(item => (item.destacado || '').toLowerCase() === 'si');
        }

        // Ordenar por fecha (mas recientes primero o segun logica)
        return data.sort((a, b) => {
            const da = parseDate(a.fecha).getTime();
            const db = parseDate(b.fecha).getTime();
            return db - da; // Descendente por defecto para comunicados
        });
    } catch (e) {
        console.error('Error en getComunicados:', e);
        return [];
    }
}

/**
 * Obtiene todas las campañas
 * @returns {Promise<Array>}
 */
async function getCampanas() {
    let data = await getSheetData('campanas');
    return data.filter(item => (item.visible || '').toLowerCase() === 'si').sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene recursos por categoria
 * @param {string} categoria - Categoria (opcional)
 * @returns {Promise<Array>}
 */
async function getRecursos(categoria = null) {
    let data = await getSheetData('recursos');
    data = data.filter(item => (item.visible || '').toLowerCase() === 'si');

    if (categoria) {
        data = data.filter(item => item.categoria === categoria);
    }

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene videos por campana
 * @param {string} campana - Nombre de campana
 * @returns {Promise<Array>}
 */
async function getVideos(campana = null) {
    let data = await getSheetData('videos');
    data = data.filter(item => (item.visible || '').toLowerCase() === 'si');

    if (campana) {
        data = data.filter(item => item.campana === campana);
    }

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene juegos por campana
 * @param {string} campana - Nombre de campana
 * @returns {Promise<Array>}
 */
async function getJuegos(campana = null) {
    let data = await getSheetData('juegos');
    data = data.filter(item => (item.visible || '').toLowerCase() === 'si');

    if (campana) {
        data = data.filter(item => item.campana === campana);
    }

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene temas del manual
 * @param {Object} filtros - Filtros opcionales { categoria, visible }
 * @returns {Promise<Array>}
 */
async function getTemasManual(filtros = {}) {
    let data = await getSheetData('temas_manual');
    console.log('[Sheets] getTemasManual - datos crudos:', data);
    console.log('[Sheets] getTemasManual - columnas:', data.length > 0 ? Object.keys(data[0]) : 'vacio');

    if (filtros.categoria) {
        data = data.filter(item => item.categoria === filtros.categoria);
    }
    if (filtros.visible !== undefined) {
        data = data.filter(item => (item.visible || '').toLowerCase() === filtros.visible.toLowerCase());
        console.log('[Sheets] getTemasManual - filtrado por visible="' + filtros.visible + '", resultado:', data);
    }

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene bloques de un tema
 * @param {string} temaId - ID del tema
 * @returns {Promise<Array>}
 */
async function getBloquesManual(temaId) {
    let data = await getSheetData('bloques_manual');
    data = data.filter(item => item.tema_id === temaId && (item.visible || '').toLowerCase() === 'si');

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene tema por slug
 * @param {string} slug - Slug del tema
 * @returns {Promise<Object|null>}
 */
async function getTemaBySlug(slug) {
    const data = await getSheetData('temas_manual');
    return data.find(item => item.slug === slug) || null;
}

/**
 * Obtiene una campana por ID
 * @param {string} idCampana - ID de la campana (ej: cam-001)
 * @returns {Promise<Object|null>}
 */
async function getCampanaById(idCampana) {
    const data = await getSheetData('campanas');
    console.log('[Sheets] getCampanaById - id:', idCampana, 'datos:', data);
    return data.find(item => item.id === idCampana && (item.visible || '').toLowerCase() === 'si') || null;
}

/**
 * Obtiene videos de una campana
 * @param {string} idCampana - ID de la campana
 * @returns {Promise<Array>}
 */
async function getVideosCampana(idCampana) {
    let data = await getSheetData('videos');
    data = data.filter(item => item.campana === idCampana && (item.visible || '').toLowerCase() === 'si');
    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene juegos de una campana
 * @param {string} idCampana - ID de la campana
 * @returns {Promise<Array>}
 */
async function getJuegosCampana(idCampana) {
    let data = await getSheetData('juegos');
    data = data.filter(item => item.campana === idCampana && (item.visible || '').toLowerCase() === 'si');
    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

/**
 * Obtiene recursos de una campana
 * @param {string} idCampana - ID de la campana
 * @returns {Promise<Array>}
 */
async function getRecursosCampana(idCampana) {
    let data = await getSheetData('recursos');
    // Recursos filtran por categoria (campana, plan, comunicado, etc)
    data = data.filter(item => item.categoria === idCampana && (item.visible || '').toLowerCase() === 'si');
    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}
/**
 * Obtiene enlaces por grupo
 * @param {string} grupo - Grupo de enlaces (opcional)
 * @returns {Promise<Array>}
 */
async function getEnlaces(grupo = null) {
    let data = await getSheetData('enlaces');
    data = data.filter(item => (item.visible || '').toLowerCase() === 'si');

    if (grupo) {
        data = data.filter(item => (item.grupo || '').toLowerCase() === grupo.toLowerCase());
    }

    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}
