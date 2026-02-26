/**
 * JOYSTICK IZQUIERDO (Teclado)
 */
function crearJoystick(selector, controles) {
  const elemento = document.querySelector(selector);
  if (!elemento) return;

  const distancia = 12;
  const teclasActivas = { up: false, down: false, left: false, right: false };

  function actualizar() {
    let x = 0,
      y = 0;
    if (teclasActivas.up) y -= distancia;
    if (teclasActivas.down) y += distancia;
    if (teclasActivas.left) x -= distancia;
    if (teclasActivas.right) x += distancia;
    elemento.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  const procesarTecla = (key, estado) => {
    if (!key) return;
    key = key.toLowerCase();
    if (key === controles.up) teclasActivas.up = estado;
    if (key === controles.down) teclasActivas.down = estado;
    if (key === controles.left) teclasActivas.left = estado;
    if (key === controles.right) teclasActivas.right = estado;
    actualizar();
  };

  // Eventos locales
  window.addEventListener("keydown", (e) => procesarTecla(e.key, true));
  window.addEventListener("keyup", (e) => procesarTecla(e.key, false));

  // Eventos desde el Iframe
  window.addEventListener("message", (e) => {
    if (e.data.tipo === "KEY_EVENT") {
      procesarTecla(e.data.key, e.data.estado);
    }
  });
}

/**
 * JOYSTICK DERECHO (Ratón)
 */
function crearJoystickRaton(selector) {
  const elemento = document.querySelector(selector);
  if (!elemento) return;
  const contenedor = elemento.parentElement;

  const RADIO_MAX_VISUAL = 20;
  const RADIO_SENSIBILIDAD = 150;

  function actualizarPosicion(coords) {
    const rect = contenedor.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    const deltaX = coords.clientX - centroX;
    const deltaY = coords.clientY - centroY;

    const angulo = Math.atan2(deltaY, deltaX);
    const distanciaRaton = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const intensidad = Math.min(distanciaRaton, RADIO_SENSIBILIDAD) / RADIO_SENSIBILIDAD;

    const moveX = Math.cos(angulo) * (RADIO_MAX_VISUAL * intensidad);
    const moveY = Math.sin(angulo) * (RADIO_MAX_VISUAL * intensidad);

    elemento.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  }

  // Evento local
  window.addEventListener("mousemove", (e) => {
    actualizarPosicion({ clientX: e.clientX, clientY: e.clientY });
  });

  // Evento desde el Iframe
  window.addEventListener("message", (e) => {
    if (e.data.tipo === "MOUSE_MOVE") {
      actualizarPosicion({ clientX: e.data.clientX, clientY: e.data.clientY });
    }
  });
}

// Inicialización
crearJoystick(".joystick-left", { up: "w", down: "s", left: "a", right: "d" });
crearJoystickRaton(".joystick-right");
