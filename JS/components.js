// 1. Definimos el Header
class MiHeader extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu header
    this.innerHTML = `
       <iframe id="fondo-aliens" src="background.html"></iframe>
    <header>
      <nav class="topBar">
        <a href="index.html">Inicio </a>
        <a href="about-me.html"> Sobre mi</a>
        <a href="decks.html"> Decks </a>
       
      </nav>
    </header>
        `;
  }
}

// 2. Definimos el Footer
class MiFooter extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu footer
    this.innerHTML = `
        <footer>
         <h4>página en construcción</h4>
      <p>&copy; 2025-26 Nicolás Rueda</p>
    </footer>
        `;
  }
}

// 3. Registramos las nuevas etiquetas en el navegador
// Importante: El nombre de la etiqueta SIEMPRE debe llevar un guion (-)
customElements.define("m-header", MiHeader);
customElements.define("m-footer", MiFooter);
