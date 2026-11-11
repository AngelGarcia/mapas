# Mapa político de Europa

Web para estudiar los países y capitales de Europa (pensada para 6º de primaria).

- Haz clic en un país del mapa y elige su **país** y su **capital** en el menú.
- Las insignias **P** (país) y **C** (capital) muestran lo que ya has escrito.
- Pulsa **Validar** para ver el porcentaje de aciertos: Bueno, Regular o Malo.
- Rueda del ratón para acercar/alejar, arrastra para mover el mapa.

## Es una web estática

Solo HTML, CSS y JavaScript; no necesita servidor propio. Carga D3, topojson y el mapa
desde el CDN jsDelivr, así que hace falta conexión a Internet.

### Probar en local

```bash
python -m http.server 5173
```

y abre <http://localhost:5173>.

### Publicar con GitHub Pages

1. Sube los archivos a un repositorio público.
2. **Settings → Pages → Deploy from a branch** → rama `main`, carpeta `/ (root)`.
3. La web quedará en `https://<usuario>.github.io/<repositorio>/`.

## Configuración

En [`data.js`](data.js):

- `THRESHOLDS`: porcentajes para Bueno (≥ 80 %) y Regular (≥ 50 %).
- `COUNTRIES`: países, capitales y posición de cada uno en el mapa.

## Créditos

Datos del mapa: [Natural Earth](https://www.naturalearthdata.com/) vía
[world-atlas](https://github.com/topojson/world-atlas). Dibujo con [D3](https://d3js.org/).
