import { db } from './firebase-config.js';
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const selectExamen = document.getElementById("selectExamen");
const formClave = document.getElementById("formClave");
const inputClave = document.getElementById("inputClave");
const msg = document.getElementById("msg");
const tablaResultados = document.querySelector("#tablaResultados tbody");
const btnExportar = document.getElementById("btnExportar");

let resultadosActuales = [];

// 1️⃣ Cargar lista de exámenes
async function cargarExamenes() {
  const snapshot = await get(ref(db, "examenes"));
  if (snapshot.exists()) {
    const examenes = snapshot.val();
    Object.keys(examenes).forEach(id => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = `${id} - ${examenes[id].titulo}`;
      selectExamen.appendChild(opt);
    });
  }
}

// 2️⃣ Mostrar clave y resultados al seleccionar examen
selectExamen.addEventListener("change", async () => {
  msg.textContent = "";
  tablaResultados.innerHTML = "";
  resultadosActuales = [];

  if (!selectExamen.value) return;

  // Clave actual
  const snapshotClave = await get(ref(db, `examenes/${selectExamen.value}/respuestasCorrectas`));
  inputClave.value = snapshotClave.exists() ? snapshotClave.val().join(",") : "";

  // Resultados
  const snapshotResultados = await get(ref(db, `respuestasEstudiantes/${selectExamen.value}`));
  if (snapshotResultados.exists()) {
    snapshotResultados.forEach(est => {
      const data = est.val();
      resultadosActuales.push({
        nombre: data.nombreEstudiante,
        curso: data.curso,
        puntaje: data.puntaje,
        correctas: data.respuestasCorrectas,
        incorrectas: data.respuestasIncorrectas
      });

      tablaResultados.innerHTML += `
        <tr>
          <td>${data.nombreEstudiante}</td>
          <td>${data.curso}</td>
          <td>${data.puntaje}</td>
          <td>${data.respuestasCorrectas}</td>
          <td>${data.respuestasIncorrectas}</td>
        </tr>
      `;
    });
  }
});

// 3️⃣ Guardar nueva clave
formClave.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectExamen.value) {
    msg.style.color = "red";
    msg.textContent = "Debes seleccionar un examen";
    return;
  }

  const claveArray = inputClave.value.split(",").map(r => r.trim().toUpperCase());

  await update(ref(db, `examenes/${selectExamen.value}`), {
    respuestasCorrectas: claveArray
  });

  msg.style.color = "green";
  msg.textContent = "Clave actualizada correctamente ✅";
});

// 4️⃣ Exportar a Excel
btnExportar.addEventListener("click", () => {
  if (resultadosActuales.length === 0) {
    alert("No hay resultados para exportar");
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(resultadosActuales);
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, `Resultados_${selectExamen.value}.xlsx`);
});

cargarExamenes();

