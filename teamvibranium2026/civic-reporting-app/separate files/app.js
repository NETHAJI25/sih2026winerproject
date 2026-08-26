// app.js
import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// DOM Elements
const tableBody = document.getElementById("complaints-table");
const totalEl = document.getElementById("total-issues");
const pendingEl = document.getElementById("pending-issues");
const resolvedEl = document.getElementById("resolved-issues");
const progressEl = document.getElementById("progress-issues");

let chart;

// Realtime listener for reports
const reportsRef = ref(db, "reports");
onValue(reportsRef, (snapshot) => {
  tableBody.innerHTML = "";
  let total = 0, pending = 0, resolved = 0, progress = 0;

  snapshot.forEach((child) => {
    const r = child.val();
    total++;
    if (r.status === "Pending") pending++;
    else if (r.status === "Resolved") resolved++;
    else if (r.status === "In Progress") progress++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${child.key}</td>
      <td>${r.description || "No issue"}</td>
      <td>${r.username || "Unknown"}</td>
      <td>${r.status || "Submitted"}</td>
      <td>${r.location || "N/A"}</td>
      <td>${r.submitDate || "N/A"}</td>
      <td><a href="report2.html?reportId=${child.key}" target="_blank">View</a></td>
    `;
    tableBody.appendChild(tr);
  });

  // update cards
  totalEl.textContent = total;
  pendingEl.textContent = pending;
  resolvedEl.textContent = resolved;
  progressEl.textContent = progress;

  // update chart
  updateChart(pending, resolved, progress);
});

// Chart update
function updateChart(p, r, g) {
  const ctx = document.getElementById('issuesChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Pending', 'Resolved', 'In Progress'],
      datasets: [{ data: [p, r, g], backgroundColor: ['#FF8042', '#00C49F', '#0088FE'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}
