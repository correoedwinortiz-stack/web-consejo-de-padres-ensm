# Manual de Administración: Web Consejo de Padres ENSM

Este manual explica cómo gestionar el contenido de la página web utilizando únicamente el archivo de Google Sheets. Cada pestaña del Excel controla una parte específica del sitio.

---

## 📋 Reglas Generales de Oro
1. **No cambies el nombre de las columnas:** El sistema busca nombres específicos (ej. `titulo`, `url`). Si los cambias, la información dejará de aparecer.
2. **IDs Únicos:** En pestañas como `campanas` o `temas_manual`, el `id` (ej. `cam-001`) debe ser único. No lo repitas.
3. **Imágenes:** Usa enlaces directos a imágenes (que terminen en `.jpg`, `.png`). Se recomienda subirlas a un servidor o usar enlaces públicos de Google Drive/Cloudinary.
4. **Visibilidad:** Casi todas las pestañas tienen una columna `visible`. Escribe `si` para mostrar el contenido o `no` para ocultarlo sin borrarlo.

---

## 📂 Guía de Pestañas (10 Secciones)

### 1. `config` (Configuración General)
Controla los datos de contacto y nombre que aparecen en toda la web.
*   **Columnas:** `clave`, `valor`.
*   **Claves obligatorias:**
    *   `nombre_institucion`: El nombre que sale en el logo y pie de página.
    *   `correo_contacto`: Email oficial del consejo.
    *   `direccion`: Dirección física de la oficina.
    *   `whatsapp`: Número de celular (solo números, ej: `573113155906`).
    *   `horario`: Texto del horario (ej: `Lunes a Viernes 7am - 5pm`).

### 2. `enlaces` (Redes Sociales y Footer)
Controla los iconos de redes sociales y los links rápidos del pie de página.
*   **Columna `grupo`:** 
    *   Usa `redes` para que aparezca el icono (Facebook, Instagram, etc.).
    *   Usa `principal` para los links de texto en el footer.
*   **Columna `nombre`:** El sistema detecta "Facebook", "Instagram", "YouTube" para poner el icono correcto automáticamente.

### 3. `actividades` (Línea de Tiempo)
Es la sección de "Nuestra Gestión" en la página de inicio.
*   **`fecha`**: El mes o año de la actividad.
*   **`titulo`**: Nombre corto de la gestión.
*   **`descripcion`**: Detalle de lo realizado.
*   **`categoria`**: Usa `gestion`, `reunion` o `evento` para cambiar el color del punto.

### 4. `comunicados` (Noticias)
Aparecen en la sección de Comunicados de la página principal.
*   **`destacado`**: Escribe `si` para que aparezca más grande y con un borde especial.
*   **`pdf_url`**: Enlace al documento PDF si el comunicado es una circular.
*   **`imagen_url`**: Foto para acompañar la noticia.

### 5. `campanas` (Campañas Institucionales)
Crea las secciones especiales como "Convivencia Escolar".
*   **`id`**: Muy importante (ej. `cam-001`). Se usa para conectar los videos y recursos a esta campaña.
*   **`imagen_url`**: Foto de portada y fondo del encabezado.
*   **`estado`**: `activa` o `inactiva`.

### 6. `videos_campana` (Multimedia)
Videos o fotos que aparecen dentro de una campaña específica.
*   **`id_campana`**: Debe coincidir con el `id` de la pestaña `campanas`.
*   **`video_url`**: Enlace de YouTube o link directo al video/imagen.
*   **`miniatura_url`**: Imagen que se ve antes de darle "Play".

### 7. `juegos_campana` (Actividades)
Juegos interactivos de la sección "Aprende Jugando".
*   **`id_campana`**: Conecta el juego con su campaña.
*   **`juego_url`**: Enlace al juego (ej: de Wordwall o Genially).

### 8. `recursos_campana` (Descargables)
Archivos para que los padres bajen en la sección de Documentos.
*   **`tipo`**: Usa `pdf`, `documento` o `enlace`.
*   **`url`**: Link de descarga.

### 9. `temas_manual` (Manual de Convivencia)
Crea los temas que aparecen en la sección del Manual.
*   **`id`**: Único (ej. `tema-001`). Se usa para conectar los bloques de texto.
*   **`slug`**: Nombre amigable para la URL (ej: `derechos-deberes`). Sin espacios ni tildes.
*   **`categoria`**: `convivencia`, `participacion`, `familias` o `compromiso`.
*   **`imagen_url`**: Foto de cabecera para el tema.

### 10. `bloques_manual` (Contenido del Manual)
Aquí es donde escribes el texto detallado de cada tema.
*   **`id_tema`**: Debe coincidir con el `id` de `temas_manual`.
*   **`tipo_bloque`**: Determina cómo se ve el texto:
    *   `intro`: Párrafo normal.
    *   `lista`: Lista con puntos (escribe los elementos separados por saltos de línea).
    *   `alerta`: Cuadro de texto resaltado para cosas importantes.
    *   `faq`: Pregunta frecuente (usa `titulo_bloque` para la pregunta y `contenido` para la respuesta).
    *   `cita`: Texto en cursiva con barra lateral.

---

## 🚀 ¿Cómo actualizar los cambios?
Una vez que edites el Google Sheets, los cambios son **instantáneos**. Solo necesitas refrescar la página web (F5) para ver la nueva información. No necesitas tocar nada del código.
