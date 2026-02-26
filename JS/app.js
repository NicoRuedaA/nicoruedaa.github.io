const pixelWrapper = document.querySelector(".pixel_wrapper");
const menu = document.querySelector(".menu");
const tog = document.querySelector(".toggle");
let menuActive = false;

let pixels = [];

function getDimensions() {
  pixelWrapper.innerHTML = "";
  // Ajuste: usar Math.ceil para asegurar enteros
  let size = window.innerWidth < 400 ? 10 : window.innerWidth < 1000 ? 30 : 50;
  pixels = [];

  let pixelWidth = window.innerWidth / size;
  let height = window.innerHeight;

  for (let i = 0; i < size; i++) {
    let pixelColumn = document.createElement("div");
    pixelColumn.className = "pixel_column";
    pixelColumn.style.width = `${100 / size}vw`;
    pixelWrapper.appendChild(pixelColumn);

    // CORRECCIÓN AQUÍ: aseguramos que cubra toda la altura
    for (let j = 0; j < height + pixelWidth; j += pixelWidth) {
      let pixelDiv = document.createElement("div");
      pixelDiv.className = "pixel";
      pixelDiv.style.height = `${pixelWidth}px`; // Asegúrate que el CSS tenga width: 100%
      pixels.push(pixelDiv);
      pixelColumn.appendChild(pixelDiv);
    }
  }
}

tog.addEventListener("click", () => {
  menuActive = !menuActive;
  for (let i = 0; i < pixels.length; i++) {
    setTimeout(() => {
      let random = Math.floor(Math.random() * pixels.length);
      if (menuActive) {
        pixels[random].classList.add("active");
      } else {
        pixels[random].classList.remove("active");
      }
      pixels.splice(random, 1);
    }, i);

    if (i === pixels.length - 1) {
      setTimeout(() => {
        pixels = [...document.querySelectorAll(".pixel")];
        if (menuActive) {
          menu.style.pointerEvents = "all";
          menu.style.opacity = "1";
        }
      }, i + 10);
    }
  }
});

function reset() {
  menuActive = false; // Reiniciamos el estado lógico
  pixels = [...document.querySelectorAll(".pixel")];

  // Quitamos la clase active de los píxeles (limpiamos la pantalla de cuadraditos)
  for (let i = 0; i < pixels.length; i++) {
    pixels[i].classList.remove("active");
  }

  // CORRECCIÓN: Forzamos a que el menú sea visible y clicable
  menu.style.pointerEvents = "all";
  menu.style.opacity = "1";
}

getDimensions();

window.addEventListener("resize", getDimensions);
window.addEventListener("resize", reset);
