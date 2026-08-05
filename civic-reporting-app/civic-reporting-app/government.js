// Reuse the same sample data for demo (would normally be fetched from API)
const govReports = [
  { id: 'R-1001', title: 'Pothole on main road', category: 'Roads & Infrastructure', status: 'Pending', priority: 'Medium', date: '2025-09-20', location: '13.0152,80.1922' },
  { id: 'R-1002', title: 'Overflowing bin', category: 'Waste Management', status: 'Resolved', priority: 'Medium', date: '2025-09-18', location: 'Unknown' },
  { id: 'R-1003', title: 'Street light broken', category: 'Street Lights', status: 'Pending', priority: 'Medium', date: '2025-09-21', location: '13.0336,80.1803' },
  { id: 'R-1004', title: 'Park fencing broken', category: 'Parks & Gardens', status: 'Resolved', priority: 'Low', date: '2025-09-15', location: '13.0328,80.1803' },
  { id: 'R-1005', title: 'Tap leaking', category: 'Water Supply', status: 'In Progress', priority: 'High', date: '2025-09-19', location: '13.0335,80.1803' },
  { id: 'R-1006', title: 'Graffiti', category: 'Other Issues', status: 'Closed', priority: 'Low', date: '2025-09-10', location: 'Unknown' },
  { id: 'R-1007', title: 'Illegal dumping', category: 'Waste Management', status: 'Pending', priority: 'High', date: '2025-09-20', location: '13.0329,80.1801' }
];

const govTotal = document.getElementById('govTotal');
const govPending = document.getElementById('govPending');
const govInProgress = document.getElementById('govInProgress');
const govResolved = document.getElementById('govResolved');
const govReportsGrid = document.getElementById('govReportsGrid');

function updateGovCounts(list){
  govTotal.textContent = list.length;
  govPending.textContent = list.filter(r => r.status.toLowerCase() === 'pending').length;
  govInProgress.textContent = list.filter(r => r.status.toLowerCase() === 'in progress').length;
  govResolved.textContent = list.filter(r => r.status.toLowerCase() === 'resolved').length;
}

function renderGovReports(list){
  govReportsGrid.innerHTML = '';
  list.forEach(r => {
    const el = document.createElement('div');
    el.className = 'report';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;gap:12px;align-items:center">
          <div style="font-weight:700">${r.title}</div>
          <div style="color:var(--muted);font-size:13px">${r.category}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div class="tag ${r.status.toLowerCase().includes('resolve') ? 'resolved' : r.status.toLowerCase().includes('pending') ? 'pending' : ''}">${r.status}</div>
          <button class="view-btn" data-id="${r.id}">View</button>
        </div>
      </div>
      <div class="meta">
        <div><span class="material-icons" style="font-size:16px">calendar_today</span>&nbsp;${r.date}</div>
        <div><span class="material-icons" style="font-size:16px">place</span>&nbsp;${r.location}</div>
      </div>
    `;
    govReportsGrid.appendChild(el);
  });
}

// Chart data preparation
function categoryCounts(list){
  const map = {};
  list.forEach(r => {
    map[r.category] = (map[r.category] || 0) + 1;
  });
  return map;
}
function statusCounts(list){
  const map = {};
  list.forEach(r => {
    map[r.status] = (map[r.status] || 0) + 1;
  });
  return map;
}

function drawCharts(list){
  const catMap = categoryCounts(list);
  const catLabels = Object.keys(catMap);
  const catValues = Object.values(catMap);

  const statusMap = statusCounts(list);
  const statusLabels = Object.keys(statusMap);
  const statusValues = Object.values(statusMap);

  // Bar chart: categories
  const barCtx = document.getElementById('barChart').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'Reports',
        data: catValues,
        backgroundColor: ['rgba(43,123,228,0.9)','rgba(241,163,60,0.9)','rgba(37,168,107,0.9)','rgba(130,90,200,0.9)'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins:{
        legend:{display:false}
      }
    }
  });

  // Donut chart: status
  const donutCtx = document.getElementById('donutChart').getContext('2d');
  new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusValues,
        backgroundColor: ['#f1a33c','#2b7be4','#25a86b','#9aa2ac']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

/* init gov page */
updateGovCounts(govReports);
renderGovReports(govReports);
drawCharts(govReports);
