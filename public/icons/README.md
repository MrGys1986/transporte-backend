# Iconos PWA - Transporte

Este directorio contiene los iconos necesarios para la Progressive Web App (PWA).

## Iconos Requeridos

Para que la PWA funcione correctamente, necesitas generar los siguientes iconos:

### Iconos principales
- `icon-72x72.png` - 72x72 píxeles
- `icon-96x96.png` - 96x96 píxeles
- `icon-128x128.png` - 128x128 píxeles
- `icon-144x144.png` - 144x144 píxeles
- `icon-152x152.png` - 152x152 píxeles
- `icon-192x192.png` - 192x192 píxeles (**importante**)
- `icon-384x384.png` - 384x384 píxeles
- `icon-512x512.png` - 512x512 píxeles (**importante**)

### Iconos adicionales
- `badge-72x72.png` - Badge para notificaciones (72x72)
- `apple-touch-icon.png` - Icono para iOS (180x180)
- `favicon.ico` - Favicon del sitio

### Iconos de shortcuts
- `shortcut-trips.png` - Icono para shortcut de viajes (96x96)
- `shortcut-location.png` - Icono para shortcut de ubicación (96x96)
- `shortcut-notifications.png` - Icono para shortcut de notificaciones (96x96)

## Cómo Generar los Iconos

### Opción 1: Usar una herramienta online

1. **PWA Asset Generator**
   - Visita: https://www.pwabuilder.com/imageGenerator
   - Sube tu logo/icono original (mínimo 512x512 px)
   - Descarga el paquete completo de iconos

2. **RealFaviconGenerator**
   - Visita: https://realfavicongenerator.net/
   - Sube tu icono
   - Configura las opciones
   - Descarga y extrae en esta carpeta

### Opción 2: Usar ImageMagick (línea de comandos)

```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# Generar todos los tamaños desde un icono original (icon-original.png)
convert icon-original.png -resize 72x72 icon-72x72.png
convert icon-original.png -resize 96x96 icon-96x96.png
convert icon-original.png -resize 128x128 icon-128x128.png
convert icon-original.png -resize 144x144 icon-144x144.png
convert icon-original.png -resize 152x152 icon-152x152.png
convert icon-original.png -resize 192x192 icon-192x192.png
convert icon-original.png -resize 384x384 icon-384x384.png
convert icon-original.png -resize 512x512 icon-512x512.png
convert icon-original.png -resize 72x72 badge-72x72.png
convert icon-original.png -resize 180x180 apple-touch-icon.png
```

### Opción 3: Usar Node.js (pwa-asset-generator)

```bash
# Instalar la herramienta
npm install -g pwa-asset-generator

# Generar todos los iconos
pwa-asset-generator icon-original.png ./icons --background "#2196F3" --maskable false
```

## Especificaciones de Diseño

### Recomendaciones
- **Formato**: PNG con transparencia
- **Resolución original**: Mínimo 512x512 píxeles
- **Diseño**: Simple y reconocible
- **Colores**: Que contrasten con el tema de la app (#2196F3)
- **Padding**: Dejar un pequeño margen (safe area) de ~10% alrededor del contenido principal

### Iconos Maskable (Adaptive Icons)
Para Android, considera crear versiones "maskable" que tengan contenido importante dentro del "safe zone" (círculo del 80% en el centro).

## Iconos Temporales

Si necesitas iconos temporales para desarrollo, puedes usar:

```bash
# Crear iconos de placeholder con colores sólidos
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:'#2196F3' \
    -gravity center -pointsize $((size/3)) \
    -fill white -annotate +0+0 'T' \
    icon-${size}x${size}.png
done
```

## Verificación

Después de agregar los iconos, verifica que estén correctamente configurados:

1. Abre Chrome DevTools
2. Ve a la pestaña "Application"
3. En el menú lateral, selecciona "Manifest"
4. Verifica que todos los iconos aparezcan correctamente

## Estructura Final

```
icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png         ← Importante
├── icon-384x384.png
├── icon-512x512.png         ← Importante
├── badge-72x72.png
├── apple-touch-icon.png
├── favicon.ico
├── shortcut-trips.png
├── shortcut-location.png
└── shortcut-notifications.png
```

## Recursos Útiles

- [Google PWA Icon Guidelines](https://web.dev/add-manifest/#icons)
- [PWA Builder](https://www.pwabuilder.com/)
- [Maskable.app Editor](https://maskable.app/editor)
- [Favicon Generator](https://favicon.io/)
