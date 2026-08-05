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

// ================== Complaints ==================
const reportsRef = ref(db, "blogs/reports");
const complaintsTable = document.getElementById("complaints-table");

onValue(reportsRef, (snapshot) => {
  complaintsTable.innerHTML = ""; // reset
  if (!snapshot.exists()) {
    complaintsTable.innerHTML = `<tr><td colspan="8">No complaints found</td></tr>`;
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
        <td><a href="report.html?id=${id}" target="_blank">View</a></td>
      </tr>
    `;
    complaintsTable.innerHTML += row;
  });
});

// ================== Users ==================
const usersRef = ref(db, "users");
const usersTable = document.getElementById("users-table");

onValue(usersRef, (snapshot) => {
  usersTable.innerHTML = ""; // reset
  if (!snapshot.exists()) {
    usersTable.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
    return;
  }

  snapshot.forEach((childSnapshot) => {
    const user = childSnapshot.val();
    const id = childSnapshot.key;

    const row = `
      <tr>
        <td>${id}</td>
        <td>${user.name || "Unknown"}</td>
        <td>${user.email || "N/A"}</td>
        <td>${user.phone || "N/A"}</td>
        <td>${user.registeredDate || "N/A"}</td>
        <td><a href="userReports.html?userId=${id}" target="_blank">View Reports</a></td>
      </tr>
    `;
    usersTable.innerHTML += row;
  });
});
