document.getElementById("btn-login").addEventListener("submit", function(event) {
  event.preventDefault(); 

  let user = (document.forms["btn-login"]["user"].value);
  let pass = (document.forms["btn-login"]["pass"].value);

  if (user.length < 6 || user.length > 12) {
    alert("Usuari ha de tenir entre 6-12 caracters");
  }
  else if (pass.length < 6 || pass.length > 12) {
    alert("Contra ha de tenir entre 6-12 caracters");
  }
  else if (!caractersMinims(pass)) {
    alert("Contra ha de tenir una majuscula, una minuscula i un numero");
  }
  else {
    if (user === pass) {
      sessionStorage.setItem("usuariLoguejat", user);
      alert("Login correcte amb usuari " + user);
      window.location.href = "index.html";
    }
    else {
      alert("Login incorrecte");
    }
  }
});

function caractersMinims(text) {
    let majuscula = false;
    let minuscula = false;
    let numero = false;

    for (let caracter of text) {
        if (caracter >= '0' && caracter <= '9') {
            numero = true;
        }
        else if (caracter === caracter.toUpperCase() && caracter !== caracter.toLowerCase()) {
            majuscula = true;
        }
        else if (caracter === caracter.toLowerCase() && caracter !== caracter.toUpperCase()) {
            minuscula = true;
        }
    }

    return majuscula && minuscula && numero; 
}