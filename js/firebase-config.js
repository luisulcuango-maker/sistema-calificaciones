// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
// js/firebase-config.js
 const firebaseConfig = {
    apiKey: "AIzaSyDwas8q5hlFKi_vqgEA8gkgxrPZvHjGRnk",
    authDomain: "chat1701-7b51d.firebaseapp.com",
    databaseURL: "https://chat1701-7b51d-default-rtdb.firebaseio.com",
    projectId: "chat1701-7b51d",
    storageBucket: "chat1701-7b51d.appspot.com",
    messagingSenderId: "349156613084",
    appId: "1:349156613084:web:20b2f7998688a94e7bcd19",
    measurementId: "G-H6CQC60YNT"
  };

 // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  export { auth, db };