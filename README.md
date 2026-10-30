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
| `index.html` | La web |
| `assets/` | CSS, JS, imágenes, vídeos y los escaneos del cuaderno (`assets/cuaderno/`) |
| `juegos/` | Builds jugables enlazadas desde la web: `catpire/`, `sapoGuvasto/` e `isometric/` |

Los detalles del diseño (cómo se recortan los escaneos, las figuras interactivas, los temas papel y tinta) están en el README del repo `NicoRuedaA/NicoRuedaA`, carpeta `portfolio/`.

## Ver en local

```sh
npx http-server -c-1 .   # o: python3 -m http.server
```

Los módulos ES y el Web Worker necesitan servirse por HTTP (no funcionan con `file://`).

## La web anterior

La versión anterior (la consola con los juegos y las páginas de prueba) está en la rama [`old-site`](../../tree/old-site).
