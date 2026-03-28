const modal = document.getElementById("miModal");
const btnAbrir = document.getElementById("btnAbrir");
const btnCerrar = document.getElementById("btnCerrar");

// Abrir el modal
btnAbrir.addEventListener("click", () => {
  modal.showModal(); // showModal() habilita el fondo oscuro
});

// Cerrar el modal
btnCerrar.addEventListener("click", () => {
  modal.close();
});
