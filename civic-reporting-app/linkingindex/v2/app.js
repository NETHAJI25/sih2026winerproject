// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔹 Use your Firebase Config here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "blogapp-bd46d.firebaseapp.com",
  databaseURL: "https://blogapp-bd46d-default-rtdb.firebaseio.com/",
  projectId: "blogapp-bd46d",
  storageBucket: "blogapp-bd46d.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to your complaints node (blogs/reports)
const reportsRef = ref(db, "blogs/reports");
const tableBody = document.getElementById("complaints-table");

// Fetch data in real time
onValue(reportsRef, (snapshot) => {
  tableBody.innerHTML = ""; // reset table
  if (!snapshot.exists()) {
    tableBody.innerHTML = `<tr><td colspan="8">No complaints found</td></tr>`;
    return;
  }

  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    const row = `
      <tr>
        <td>${id}</td>
        <td>${data.description || "No issue"}</td>
        <td>${data.username || "Unknown"}</td>
        <td>${data.status || "Pending"}</td>
        <td>${data.location || "N/A"}</td>
        <td>${data.submitDate || "N/A"}</td>
        <td><button onclick="alert('Update feature coming soon!')">Update</button></td>
        <td><a href="report.html?id=${id}">View</a></td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
});
