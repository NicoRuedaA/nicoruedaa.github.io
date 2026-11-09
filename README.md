# nicorueda.dev

Web personal de **Nico Rueda**, servida con GitHub Pages en <https://nicorueda.dev> (el dominio está en `CNAME`).

Sitio estático: HTML, CSS y JavaScript sin frameworks ni paso de build, bilingüe (ES/EN). Todo lo escrito y dibujado a mano son fotos reales de sus cuadernos.

## Despliegue

**Cada push a `main` publica la web**: GitHub Pages construye y despliega solo («pages build and deployment» en la pestaña *Actions*), normalmente en uno o dos minutos. No hay nada que copiar ni ejecutar a mano.

- `.nojekyll` desactiva Jekyll: los archivos se sirven tal cual, sin procesar.
- `CNAME` mantiene el dominio `nicorueda.dev`. No lo borres.
- `404.html` es la página que se ve en una dirección que no existe.

## Qué hay aquí

| Ruta | Qué es |
| --- | --- |
| `index.html` | La web (la v2, que pasó a ser la única) |
| `assets/` | CSS, JS, imágenes, vídeos y los escaneos del cuaderno (`assets/cuaderno/`) |
| `juegos/` | Builds jugables enlazadas desde la web: `catpire/`, `sapoGuvasto/` e `isometric/` |

Los detalles del diseño (cómo se recortan los escaneos, las figuras interactivas, los temas papel y tinta) están en el README del repo `NicoRuedaA/NicoRuedaA`, carpeta `portfolio/`.

## Ver en local

```sh
npx http-server -c-1 .   # o: python3 -m http.server
```

Los módulos ES y el Web Worker necesitan servirse por HTTP (no funcionan con `file://`).

## Mover los dibujos (modo editor)

`tools/edit-server.py` sirve la web y acepta guardados: escribe los desplazamientos de cada elemento `data-ed` en su atributo `style`, así que la página guardada no necesita JS.

```sh
python3 tools/edit-server.py            # imprime la URL a abrir
```

Abre la URL que imprime con `?edit` al final (`http://127.0.0.1:8124/index.html?edit`). Edita `index.html`; para otro archivo, `--page otro.html` o `NR_EDIT_PAGE`.

**Mover dibujos.** Arrastrar mueve, la rueda escala, `⌥` + rueda rota, doble clic reinicia, clic + `Delete` borra. **Save** escribe el HTML y deja una copia del anterior en `tools/.edit-backups/` (las 20 últimas).

**Editar textos.** Clic en cualquier texto abre un panel con el español y el inglés a la vez, así el bilingüe no se desincroniza. **Apply** lo cambia en la página; **Save** lo escribe.

Para que un elemento se pueda mover necesita `data-ed="nombre-unico"`; un texto editable lleva `data-ed-text="id"`. Los pares bilingües comparten número (`tx7-es` / `tx7-en`) y el panel los edita juntos. `site.css` convierte `--ex/--ey/--es/--er` en `translate`, `scale` y `rotate`.

Los textos y bloques que JavaScript reescribe al cargar (números escritos a mano, el marcador del voxel, los precios de MTG, el botón de copiar) no llevan `data-ed-text` a propósito: editarlos se perdería en la siguiente recarga.

## La web anterior

La versión anterior (la consola con los juegos y las páginas de prueba) está en la rama [`old-site`](../../tree/old-site).
