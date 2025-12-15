import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

console.log("✅ register.js cargado");
const registerForm = document.getElementById("registerForm");
const msg = document.getElementById("msg");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const nivel = document.getElementById("nivel").value.trim();
  const curso = document.getElementById("curso").value.trim();
  const periodo = document.getElementById("periodo").value.trim();

  if (!nombre || !email || !password || !nivel || !curso || !periodo) {
    msg.textContent = "Por favor completa todos los campos.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("📌 Objeto DB:", db);
    // Guardar en Firebase Realtime Database
    await set(ref(db, "usuarios/" + user.uid), {
      nombre,
      email,
      nivel,
      curso,
      periodo,
      rol: "estudiante"
    });

    msg.style.color = "green";
    msg.textContent = "✅ Registro exitoso. Redirigiendo...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "❌ " + error.message;
  }
});

