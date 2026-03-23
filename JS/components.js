// 1. Definimos el Header

const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

class MiHeader extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu header
    this.innerHTML = `
       <iframe id="fondo-aliens" src="background.html"></iframe>
    <header>
      <nav class="topBar">
   
        <a href="index.html">✳</a>
        <a href="index.html">Inicio </a>
        <a href="about-me.html"> Sobre mi</a>
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
        <footer>
      <p>&copy; 2025-26 Nicolás Rueda</p>
    </footer>
        `;
  }
}

// 3. Registramos las nuevas etiquetas en el navegador
// Importante: El nombre de la etiqueta SIEMPRE debe llevar un guion (-)
customElements.define("m-header", MiHeader);
customElements.define("m-footer", MiFooter);
