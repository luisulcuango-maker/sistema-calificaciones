import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

console.log("auth.js cargado");

const btnLogin = document.getElementById("btnLogin");
const btnGoRegister = document.getElementById("btnGoRegister");
const errorMsg = document.getElementById("errorMsg");

btnLogin.addEventListener("click", async () => {
  errorMsg.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Por favor completa todos los campos.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos del usuario desde la base de datos
    const snap = await get(ref(db, "usuarios/" + user.uid));
    if (!snap.exists()) {
      errorMsg.textContent = "No se encontraron datos del usuario.";
      return;
    }

    const datosUsuario = snap.val();
    if (datosUsuario.rol === "estudiante") {
      window.location.href = "estudiante.html";
    } else if (datosUsuario.rol === "docente") {
      window.location.href = "panel-docente.html";
    } else {
      errorMsg.textContent = "Rol de usuario no válido.";
    }

  } catch (error) {
    errorMsg.textContent = error.message;
  }
});

btnGoRegister.addEventListener("click", () => {
  console.log("Redirigiendo a register.html");
  window.location.href = "register.html";
});

