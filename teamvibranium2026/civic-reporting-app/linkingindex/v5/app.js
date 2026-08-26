import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Complaints Reference
const complaintsRef = ref(db, "complaints");
const tableBody = document.getElementById("complaints-table");

// Render Table
onValue(complaintsRef, (snapshot) => {
  tableBody.innerHTML = "";
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    // Media Preview (Photo or Video Thumbnail)
    let mediaPreview = "No Media";
    if (data.photo) {
      mediaPreview = `<img src="${data.photo}" width="80" height="60" style="object-fit:cover;">`;
    } else if (data.video) {
      mediaPreview = `<video src="${data.video}" width="100" height="60"></video>`;
    }

    // Dropdown for Actions
    const actionDropdown = `
      <select onchange="updateComplaintStatus('${id}', this.value)">
        <option value="Pending" ${data.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="In Progress" ${data.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Resolved" ${data.status === "Resolved" ? "selected" : ""}>Resolved</option>
      </select>
    `;

    const row = `
      <tr>
        <td>${id}</td>
        <td>${data.issue || "-"}</td>
        <td>${data.officerAssigned || "Not Assigned"}</td>
        <td id="status-${id}">${data.status || "Pending"}</td>
        <td>${data.location || "-"}</td>
        <td>${data.date || "-"}</td>
        <td>${mediaPreview}</td>
        <td>${actionDropdown}</td>
        <td><a href="report.html?id=${id}">View</a></td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
});

// ✅ Update Status in Firebase
window.updateComplaintStatus = function (complaintId, newStatus) {
  const complaintRef = ref(db, "complaints/" + complaintId);
  update(complaintRef, { status: newStatus })
    .then(() => {
      document.getElementById("status-" + complaintId).innerText = newStatus;
      alert("Status updated to " + newStatus);
    })
    .catch((err) => console.error("Error updating status:", err));
};
