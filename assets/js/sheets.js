/**
 * sheets.js - Google Sheets data fetcher
 * Lee datos desde Google Sheets publicado como CSV publico
 */

const SHEETS_ID = '1AxVIB1Kp8SK1Yvw356Pl3GjvzOIkq0g1kng_8YmnA2s';

const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=`;

/**
 * Obtiene datos de una pestana del Sheets
 */
async function getSheetData(sheetName) {
    try {
        const response = await fetch(BASE_URL + encodeURIComponent(sheetName));
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error cargando ${sheetName}:`, error);
        return [];
    }
}

/**
 * Parsea una cadena de fecha de forma robusta
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;
    const s = String(dateStr).trim();
    if (!s) return new Date(0);

    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        return new Date(s + 'T12:00:00');
    }
    
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
 * Parsea texto CSV a array de objetos (VERSION ESTABLE)
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]).map((h, i) => {
        let clean = h.replace(/^"|"$/g, '').trim().toLowerCase();
        if (clean === '' && i === 0) return 'id';
        return clean;
    });

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                if (header) {
                    row[header] = (values[index] || '').replace(/^"|"$/g, '').trim();
                }
            });
            data.push(row);
        }
    }
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else current += char;
    }
    result.push(current);
    return result;
}

/**
 * API del sitio
 */
async function getConfig(clave) {
    const data = await getSheetData('config');
    const row = data.find(item => item.clave === clave);
    return row ? row.valor : null;
}

async function getActividades(filtros = {}) {
    let data = await getSheetData('actividades');
    
    // Filtro visible opcional (si no existe la columna, se asume 'si')
    data = data.filter(item => {
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    });

    if (filtros.soloFuturas !== false) {
        const now = new Date();
        now.setHours(0,0,0,0);
        data = data.filter(item => parseDate(item.fecha) >= now);
    }

    if (filtros.destacado) {
        data = data.filter(item => (item.destacado || '').toLowerCase() === 'si');
    }

    return data.sort((a, b) => parseDate(a.fecha) - parseDate(b.fecha));
}

async function getComunicados(soloDestacados = false) {
    let data = await getSheetData('comunicados');
    data = data.filter(item => {
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    });
    if (soloDestacados) {
        data = data.filter(item => (item.destacado || '').toLowerCase() === 'si');
    }
    return data.sort((a, b) => parseDate(b.fecha) - parseDate(a.fecha));
}

async function getCampanas() {
    let data = await getSheetData('campanas');
    return data.filter(item => {
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }).sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getTemasManual(filtros = {}) {
    let data = await getSheetData('temas_manual');
    if (filtros.visible !== undefined) {
        data = data.filter(item => {
            if (item.visible === undefined) return true;
            return (item.visible || '').toLowerCase() === 'si';
        });
    }
    if (filtros.categoria) {
        data = data.filter(item => item.categoria === filtros.categoria);
    }
    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getBloquesManual(temaId) {
    let data = await getSheetData('bloques_manual');
    return data.filter(item => {
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }).sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getTemaBySlug(slug) {
    const data = await getSheetData('temas_manual');
    return data.find(item => item.slug === slug) || null;
}

async function getCampanaById(idCampana) {
    const data = await getSheetData('campanas');
    return data.find(item => {
        if (item.id !== idCampana) return false;
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }) || null;
}

async function getVideosCampana(idCampana) {
    let data = await getSheetData('videos');
    return data.filter(item => {
        if (item.campana !== idCampana) return false;
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }).sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getJuegosCampana(idCampana) {
    let data = await getSheetData('juegos');
    return data.filter(item => {
        if (item.campana !== idCampana) return false;
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }).sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getRecursosCampana(idCampana) {
    let data = await getSheetData('recursos');
    return data.filter(item => {
        if (item.categoria !== idCampana) return false;
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    }).sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}

async function getEnlaces(grupo = null) {
    let data = await getSheetData('enlaces');
    data = data.filter(item => {
        if (item.visible === undefined) return true;
        return (item.visible || '').toLowerCase() === 'si';
    });
    if (grupo) {
        data = data.filter(item => (item.grupo || '').toLowerCase() === grupo.toLowerCase());
    }
    return data.sort((a, b) => parseInt(a.orden || 0) - parseInt(b.orden || 0));
}
