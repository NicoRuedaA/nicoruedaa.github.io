class MiHeader extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu header
    this.innerHTML = `
     
    <header>
      <nav class="topBar">
   
        <a href="index.html">✳</a>
        <a href="index.html">Inicio </a>
        <a href="decks.html"> Decks </a>
        <a href="https://github.com/NicoRuedaA" target="_blank"><i class="fa-brands fa-github"></i></a>
        <a href="https://www.linkedin.com/in/nicolas-rueda-araque-737241199/" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
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
      <p>© 2026 Nicolás Rueda.</p>
      <div class="footer-socials">
        <a href="#"><i class="fab fa-linkedin-in"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
      </div>
        `;
  }
}

// 3. Registramos las nuevas etiquetas en el navegador
// Importante: El nombre de la etiqueta SIEMPRE debe llevar un guion (-)
customElements.define("m-header", MiHeader);
customElements.define("m-footer", MiFooter);
