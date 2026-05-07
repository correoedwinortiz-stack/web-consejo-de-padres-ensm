# Consejo de Padres de Familia ENSM - Monterrey, Casanare

Sitio web institucional del Consejo de Padres de Familia ENSM. Proyecto web para el ano lectivo 2026.

## Tecnologias

- HTML5 semantico
- Tailwind CSS via CDN
- JavaScript vanilla
- Google Sheets como CMS (lectura via CSV publico)

## Estructura del proyecto

```
consejo-padres/
├── index.html                      # Pagina principal
├── campana-convivencia.html        # Pagina de campana de convivencia
├── manual/
│   ├── index.html                  # Biblioteca del manual
│   └── tema.html                   # Pagina individual de tema
├── assets/
│   ├── css/
│   │   └── styles.css             # Estilos personalizados
│   ├── js/
│   │   ├── sheets.js              # Acceso a Google Sheets
│   │   ├── timeline.js            # Renderizado de linea de tiempo
│   │   └── main.js               # Logica principal
│   ├── img/
│   ├── videos/
│   ├── juegos/
│   └── documentos/
└── README.md
```

## Google Sheets Integration

El sitio lee datos desde Google Sheets publicado como CSV publico.

### URL del documento
`https://docs.google.com/spreadsheets/d/1AxVIB1Kp8SK1Yvw356Pl3GjvzOIkq0g1kng_8YmnA2s`

### Pestanas configuradas

1. config - Configuracion general del sitio
2. actividades - Calendario de actividades
3. comunicados - Comunicados recientes
4. campanas - Campanas activas
5. recursos - Recursos descargables
6. videos - Videos educativos
7. juegos - Juegos interactivos
8. temas_manual - Temas del manual
9. bloques_manual - Contenido de cada tema
10. enlaces - Enlaces utiles

## Desarrollo local

1. Clonar el repositorio
2. Abrir `index.html` en un navegador
3. Los datos se cargan automaticamente desde Google Sheets

## Publicacion

Compatible con:
- GitHub Pages
- Cloudflare Pages
- Cualquier hosting estatico

Las rutas son relativas, no requiere configuracion adicional.

## Configuracion de Google Sheets

Para que funcione la lectura de datos:

1. Crear spreadsheet en Google Drive
2. Compartir con "Cualquier persona con el enlace"
3. Usar las pestanas con los nombres exactos especificados
4. La primera fila debe contener los nombres de las columnas

## Ano lectivo 2026

Monterrey, Casanare, Colombia


.\iniciar_web.bat