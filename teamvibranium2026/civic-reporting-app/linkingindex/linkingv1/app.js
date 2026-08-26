// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your Firebase Config (replace with your project details)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to complaints
const complaintsRef = ref(db, "complaints");
const tableBody = document.getElementById("complaints-table");

// Fetch complaints from Firebase in real-time
onValue(complaintsRef, (snapshot) => {
  tableBody.innerHTML = ""; // Clear old data
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    // Create row
    const row = `
      <tr>
        <td>${id}</td>
        <td>${data.issue || "-"}</td>
        <td>${data.officerAssigned || "Not Assigned"}</td>
        <td>${data.status || "Pending"}</td>
        <td>${data.location || "-"}</td>
        <td>${data.date || "-"}</td>
        <td><button onclick="alert('Update feature coming soon!')">Update</button></td>
        <td><a href="report.html?id=${id}">View</a></td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
});
