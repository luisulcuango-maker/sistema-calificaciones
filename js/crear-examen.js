// js/crear-examen.js
import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const formExamen = document.getElementById("formExamen");
const msg = document.getElementById("msg");

formExamen.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const titulo = document.getElementById("titulo").value.trim();
  const nivel = document.getElementById("nivel").value.trim();
  const curso = document.getElementById("curso").value.trim();
  const periodo = document.getElementById("periodo").value.trim();
  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;
  const respuestasText = document.getElementById("respuestas").value.trim();

  // Validaciones básicas
  if (!titulo || !nivel || !curso || !periodo || !fechaInicio || !fechaFin || !respuestasText) {
    msg.style.color = "red";
    msg.textContent = "⚠️ Por favor complete todos los campos.";
    return;
  }

  const respuestasCorrectas = respuestasText
    .split(",")
    .map(r => r.trim().toUpperCase());

  // Validar formato de respuestas
  const opcionesValidas = ["A", "B", "C", "D", "V", "F"];
  if (!respuestasCorrectas.every(r => opcionesValidas.includes(r))) {
    msg.style.color = "red";
    msg.textContent = "⚠️ Las respuestas deben ser A, B, C, D, V o F separadas por comas.";
    return;
  }

  try {
    // Crear examen en la BD
    const nuevoExamenRef = push(ref(db, "examenes"));
    await set(nuevoExamenRef, {
      titulo,
      nivel,
      curso,
      periodo,
      fechaInicio,
      fechaFin,
      respuestasCorrectas
    });

    msg.style.color = "green";
    msg.textContent = "✅ Examen creado con éxito";
    formExamen.reset();

  } catch (error) {
    console.error(error);
    msg.style.color = "red";
    msg.textContent = "❌ Error: " + error.message;
  }
});
