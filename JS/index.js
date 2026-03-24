const modal = document.getElementById("miModal");
const btnAbrir = document.getElementById("btnAbrir");
const btnCerrar = document.getElementById("btnCerrar");

// Abrir el modal
btnAbrir.addEventListener("click", () => {
  modal.showModal(); // Importante: showModal() habilita el fondo oscuro
});

// Cerrar el modal
btnCerrar.addEventListener("click", () => {
  modal.close();
});

// Cerrar al hacer clic fuera del contenido (en el backdrop)
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});
