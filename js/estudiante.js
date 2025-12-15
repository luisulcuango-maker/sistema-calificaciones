// js/estudiante.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const selectExamen = document.getElementById("selectExamen");
const btnIniciar = document.getElementById("btnIniciar");
const examenContainer = document.getElementById("examenContainer");
const tituloExamen = document.getElementById("tituloExamen");
const formExamen = document.getElementById("formExamen");
const msg = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const panelExamenes = document.querySelector(".card.section"); // Panel de selección

let usuarioActual = null;
let examenSeleccionado = null;
let examenData = null;
let preguntaActual = 0;
let respuestasUsuario = [];

// 🔹 Cerrar sesión
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// 🔹 Escuchar sesión y cargar datos del usuario
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  usuarioActual = user;

  // Obtener datos del usuario
  const snap = await get(ref(db, `usuarios/${user.uid}`));
  if (!snap.exists()) {
    msg.textContent = "No se encontraron datos del usuario.";
    return;
  }

  const { nivel, curso, periodo, nombre, rol, email } = snap.val();
  userInfo.textContent = `👤 ${nombre} | 📧 ${email} | 🎓 ${rol} | 📚 ${nivel} ${curso} | 📅 ${periodo}`;

  // Cargar exámenes disponibles
  const examSnap = await get(ref(db, "examenes"));
  if (examSnap.exists()) {
    const examenes = examSnap.val();
    for (let id in examenes) {
      const ex = examenes[id];
      const ahora = new Date();
      const inicio = new Date(ex.fechaInicio);
      const fin = new Date(ex.fechaFin);

      if (ex.nivel === nivel && ex.curso === curso && ex.periodo === periodo &&
          ahora >= inicio && ahora <= fin) {

        // Verificar si ya presentó el examen
        const yaRespondido = await get(ref(db, `respuestasEstudiantes/${id}/${user.uid}`));

        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = ex.titulo + (yaRespondido.exists() ? " (YA PRESENTADO)" : "");

        // Deshabilitar si ya presentó
        if (yaRespondido.exists()) {
          opt.disabled = true;
        }

        selectExamen.appendChild(opt);
      }
    }
  }
});

// 🔹 Habilitar botón iniciar
selectExamen.addEventListener("change", () => {
  const selected = selectExamen.selectedOptions[0];
  btnIniciar.disabled = !selected || selected.disabled;
});

// 🔹 Iniciar examen
btnIniciar.addEventListener("click", async () => {
  examenSeleccionado = selectExamen.value;
  if (!examenSeleccionado) return;

  // Ocultar panel de selección
  panelExamenes.style.display = "none";

  const snap = await get(ref(db, `examenes/${examenSeleccionado}`));
  if (snap.exists()) {
    examenData = snap.val();
    tituloExamen.textContent = examenData.titulo;

    preguntaActual = 0;
    respuestasUsuario = new Array(examenData.respuestasCorrectas.length).fill("");
    mostrarPregunta();

    examenContainer.style.display = "block";
  }
});

// 🔹 Mostrar pregunta actual
function mostrarPregunta() {
  formExamen.innerHTML = "";

  // Progreso
  const progreso = document.createElement("div");
  progreso.style.fontWeight = "bold";
  progreso.style.marginBottom = "10px";
  progreso.textContent = `Pregunta ${preguntaActual + 1} de ${examenData.respuestasCorrectas.length}`;
  formExamen.appendChild(progreso);

  // Pregunta y opciones
  const qDiv = document.createElement("div");
  qDiv.innerHTML = `
    <label>Pregunta ${preguntaActual + 1}:</label>
    <select id="respuesta" required>
      <option value="">-- Selecciona --</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
      <option value="V">Verdadero</option>
      <option value="F">Falso</option>
    </select>
  `;
  formExamen.appendChild(qDiv);

  // Botón siguiente / enviar
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = preguntaActual < examenData.respuestasCorrectas.length - 1 ? "Siguiente" : "Enviar";
  btn.style.marginTop = "15px";
  btn.addEventListener("click", siguientePregunta);
  formExamen.appendChild(btn);
}

// 🔹 Pasar a la siguiente pregunta
function siguientePregunta() {
  const seleccion = document.getElementById("respuesta").value;
  if (!seleccion) {
    alert("Debes seleccionar una respuesta antes de continuar");
    return;
  }

  respuestasUsuario[preguntaActual] = seleccion;

  if (preguntaActual < examenData.respuestasCorrectas.length - 1) {
    preguntaActual++;
    mostrarPregunta();
  } else {
    enviarExamen();
  }
}

// 🔹 Enviar examen a Firebase
async function enviarExamen() {
  let correctas = 0;
  respuestasUsuario.forEach((r, i) => {
    if (r === examenData.respuestasCorrectas[i]) correctas++;
  });

  const puntaje = (correctas / examenData.respuestasCorrectas.length) * 10;

  await set(ref(db, `respuestasEstudiantes/${examenSeleccionado}/${usuarioActual.uid}`), {
    nombreEstudiante: usuarioActual.email,
    respuestas: respuestasUsuario,
    respuestasCorrectas: correctas,
    respuestasIncorrectas: respuestasUsuario.length - correctas,
    puntaje
  });

  msg.style.color = "green";
  msg.textContent = `Examen enviado ✅ Tu puntaje es ${puntaje.toFixed(2)}/10`;
  examenContainer.style.display = "none";
}


