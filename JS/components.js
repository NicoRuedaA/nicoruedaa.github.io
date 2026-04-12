class MiHeader extends HTMLElement {
  connectedCallback() {
    // contenido del header
    this.innerHTML = `
  
<header>
  <nav class="topBar">
    <div class="nav-links">
      <div class="dropdown">
        <button class="dropbtn">Menú <i class="fa fa-caret-down"></i></button>
        <div class="dropdown-content">
          <a href="index.html#section1">Me</a>
          <a href="index.html#section2">Who I Am</a>
          <a href="index.html#section3">Skills</a>
          <a href="index.html#section4">Professional Experience</a>
          <a href="index.html#section5">Personal Projects</a>
          <a href="index.html#section6">Contact</a>
        </div>
      </div>

      <ul>
      <li><a href="#" class="lang-option lang-active" hreflang="es">🇪🇸</a></li>
      <li><a href="#" class="lang-option" hreflang="en">🇬🇧 </a></li>
      
      </ul>
    </div>

    <a href="index.html" class="logo">Logo</a>

    <div class="login">


<form id="login" name="login">
  <input type="text" name="user" required>
  <input type="password" name="pass" required>
  <button type="submit">Log in</button>
</form>
      <a href="login.html"><i class="fa-solid fa-user"></i></a>
      <a href="favs.html"><i class="fa-solid fa-heart"></i></a>
    </div>
  </nav>
</header>


        `;
  }

  
}

class MiFooter extends HTMLElement {
  connectedCallback() {
    // contenido del footer
    this.innerHTML = `
<footer class = "botBar">

        <p>© 2026 Nicolás Rueda. 
          <a href="https://github.com/NicoRuedaA" target="_blank"><i class="fa-brands fa-github"></i></a>
      <a href="https://www.linkedin.com/in/nicolas-rueda-araque-737241199/" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
   
        </p>
      </footer>
        `;
  }
}

// Registramos las nuevas etiquetas e
customElements.define("m-header", MiHeader);
customElements.define("m-footer", MiFooter);
