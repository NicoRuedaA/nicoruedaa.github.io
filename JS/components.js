class MiHeader extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu header
    this.innerHTML = `
     
<style>
/* --- Barra principal --- */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.topBar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #111;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  z-index: 9999;
}

/* --- Logo --- */
.logo {
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
  text-decoration: none;
}

/* --- Menú principal --- */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 5px;
  transition: background 0.3s, color 0.3s;
}

.nav-links a:hover {
  background-color: #da850f;
  color: black;
}

/* --- Dropdown --- */
.dropdown {
  position: relative;
}

.dropbtn {
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 0.8rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.dropbtn:hover {
  background-color: #da850f;
  color: black;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 120%;
  left: 0;
  background-color: #f1f1f1;
  min-width: 180px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
  z-index: 10;
  border-radius: 5px;
  overflow: hidden;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  display: block;
  text-decoration: none;
  transition: background 0.3s;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown.active .dropdown-content {
  display: block;
}

/* --- Acciones y redes sociales --- */
.actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.actions a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;
}

.actions a:hover {
  color: #da850f;
}

/* --- Iconos redes sociales --- */
.actions .fa-brands {
  font-size: 1.2rem;
}

/* --- Responsive móvil --- */
.hamburger {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .nav-links, .actions {
    display: none;
    flex-direction: column;
    background-color: #111;
    width: 100%;
  }

  .nav-links a, .actions a {
    padding: 1rem;
    width: 100%;
    text-align: center;
  }

  .nav-links.active, .actions.active {
    display: flex;
  }

  .hamburger {
    display: block;
  }

  .dropdown-content {
    position: relative;
    top: 0;
  }
}
</style>

<header>
  <nav class="topBar">
    <a href="index.html" class="logo">Logo</a>

    <div class="hamburger"><i class="fa fa-bars"></i></div>

    <div class="nav-links">
      <div class="dropdown">
        <button class="dropbtn">Menú <i class="fa fa-caret-down"></i></button>
        <div class="dropdown-content">
          <a href="#section1">Me</a>
          <a href="#section2">Who I Am</a>
          <a href="#section3">Skills</a>
          <a href="#section4">Professional Experience</a>
          <a href="#section5">Personal Projects</a>
          <a href="#section6">Contact</a>
        </div>
      </div>
      


 
<a href="favs.html"><i class="fa-solid fa-heart"></i></a>
       <li><a href="#" class="lang-option lang-active" hreflang="es">🇪🇸</a></li>
          <li><a href="#" class="lang-option" hreflang="en">🇬🇧 </a></li>
    </div>

    <div class="actions">
            <input type="text"     id="nav-username" name="username"
               placeholder="Usuari" autocomplete="username" />
        <input type="password" id="nav-password" name="password"
               placeholder="••••••" autocomplete="current-password" />
        <a href="login.html"><i class="fa-solid fa-user"></i></a>
       </div>
  </nav>
</header>

<script>
// Dropdown click
this.querySelectorAll('.dropbtn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    this.parentElement.classList.toggle('active');
  });
});

// Cerrar dropdown al hacer click fuera
window.addEventListener('click', () => {
  this.querySelectorAll('.dropdown').forEach(drop => drop.classList.remove('active'));
});

// Hamburger menú
const hamburger = this.querySelector('.hamburger');
const navLinks = this.querySelector('.nav-links');
const actions = this.querySelector('.actions');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  actions.classList.toggle('active');
});
</script>
        `;
  }
}

// 2. Definimos el Footer
class MiFooter extends HTMLElement {
  connectedCallback() {
    // Aquí dentro pones todo el HTML de tu footer
    this.innerHTML = `
<footer>

        <p>© 2026 Nicolás Rueda. 
          <a href="https://github.com/NicoRuedaA" target="_blank"><i class="fa-brands fa-github"></i></a>
      <a href="https://www.linkedin.com/in/nicolas-rueda-araque-737241199/" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
   
        </p>
      </footer>
        `;
  }
}

// 3. Registramos las nuevas etiquetas en el navegador
// Importante: El nombre de la etiqueta SIEMPRE debe llevar un guion (-)
customElements.define("m-header", MiHeader);
customElements.define("m-footer", MiFooter);
