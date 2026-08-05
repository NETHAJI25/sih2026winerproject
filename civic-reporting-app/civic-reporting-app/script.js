// sample data
const categories = [
  { id: 'roads', label: 'Roads & Infrastructure', icon: 'engineering' },
  { id: 'waste', label: 'Waste Management', icon: 'delete' },
  { id: 'lights', label: 'Street Lights', icon: 'lightbulb' },
  { id: 'parks', label: 'Parks & Gardens', icon: 'park' },
  { id: 'water', label: 'Water Supply', icon: 'water_drop' },
  { id: 'other', label: 'Other Issues', icon: 'article' }
];

const reports = [
  { id: 'R-1001', title: 'Pothole on main road', desc: 'Large pothole near bus stop', category: 'roads', status: 'Pending', priority: 'Medium', date: daysAgo(2), location: 'Location (13.0152, 80.1922)', img: '', reporter: 'User A' },
  { id: 'R-1002', title: 'Overflowing bin', desc: 'Garbage overflowing near market', category: 'waste', status: 'Resolved', priority: 'Medium', date: daysAgo(5), location: 'Unknown Location', img: '', reporter: 'User B' },
  { id: 'R-1003', title: 'Street light broken', desc: 'Light not working for 2 nights', category: 'lights', status: 'Pending', priority: 'Medium', date: daysAgo(1), location: 'Location (13.0336, 80.1803)', img: '', reporter: 'User C' },
  { id: 'R-1004', title: 'Park fencing broken', desc: 'Fence is damaged', category: 'parks', status: 'Resolved', priority: 'Low', date: daysAgo(8), location: 'Location (13.0328, 80.1803)', img: '', reporter: 'User D' },
  { id: 'R-1005', title: 'Tap leaking', desc: 'Community tap leaking', category: 'water', status: 'In Progress', priority: 'High', date: daysAgo(3), location: 'Location (13.0335, 80.1803)', img: '', reporter: 'User E' }
];

function daysAgo(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString();
}

/* DOM references */
const categoryGrid = document.getElementById('categoryGrid');
const reportsGrid = document.getElementById('reportsGrid');
const pendingCount = document.getElementById('pendingCount');
const inprogressCount = document.getElementById('inprogressCount');
const resolvedCount = document.getElementById('resolvedCount');

const searchInput = document.getElementById('searchInput');
const tabs = document.querySelectorAll('.tab');
const fab = document.getElementById('fab');
const reportBtn = document.getElementById('reportBtn');

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

/* init */
renderCategories();
renderReports(reports);
updateSummaryCounts(reports);

/* categories */
function renderCategories(){
  categoryGrid.innerHTML = '';
  categories.forEach(c => {
    const el = document.createElement('div');
    el.className = 'category-card';
    el.innerHTML = `<span class="material-icons">${c.icon}</span><span>${c.label}</span>`;
    el.addEventListener('click', () => {
      applyFilter({ category: c.id });
    });
    categoryGrid.appendChild(el);
  });
}

/* reports */
function renderReports(list){
  reportsGrid.innerHTML = '';
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'report';
    const statusClass = r.status.toLowerCase().includes('resolve') ? 'resolved' : (r.status.toLowerCase().includes('pending') ? 'pending' : '');
    card.innerHTML = `
      <div class="tags">
        <div class="tag ${statusClass}">${r.status}</div>
        <div class="tag medium">${r.priority}</div>
      </div>
      <h4>${r.title}</h4>
      <p>${r.desc}</p>
      <div class="meta">
        <div><span class="material-icons" style="font-size:16px">calendar_today</span>&nbsp;${r.date}</div>
        <div><span class="material-icons" style="font-size:16px">place</span>&nbsp;${r.location}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
        <img class="thumb" src="https://via.placeholder.com/80x80.png?text=Img" alt="thumb">
        <button class="view-btn" data-id="${r.id}"><span class="material-icons">visibility</span> View Details</button>
      </div>
    `;
    reportsGrid.appendChild(card);
  });

  // attach view listeners
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openReportModal(id);
    });
  });
}

/* summary */
function updateSummaryCounts(list){
  pendingCount.textContent = list.filter(r => r.status.toLowerCase() === 'pending').length;
  inprogressCount.textContent = list.filter(r => r.status.toLowerCase() === 'in progress').length;
  resolvedCount.textContent = list.filter(r => r.status.toLowerCase() === 'resolved').length;
}

/* filtering and search */
function applyFilter({ category=null, status=null } = {}){
  let filtered = [...reports];
  const q = searchInput.value.trim().toLowerCase();
  if(category){
    filtered = filtered.filter(r => r.category === category);
  }
  if(status){
    filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }
  if(q){
    filtered = filtered.filter(r => (r.title + ' ' + r.desc + ' ' + r.category).toLowerCase().includes(q));
  }
  renderReports(filtered);
  updateSummaryCounts(filtered);
}

/* search */
searchInput.addEventListener('input', () => applyFilter());

/* tabs */
tabs.forEach(t => {
  t.addEventListener('click', (ev) => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    // simple behavior: my reports tab will just filter by reporter 'User A' in demo
    if(t.dataset.tab === 'my'){
      renderReports(reports.filter(r => r.reporter === 'User A'));
      updateSummaryCounts(reports.filter(r => r.reporter === 'User A'));
    } else {
      renderReports(reports);
      updateSummaryCounts(reports);
    }
  });
});

/* modal */
function openReportModal(id){
  const r = reports.find(x => x.id === id);
  if(!r) return;
  modalContent.innerHTML = `
    <h3>${r.title} <small style="font-weight:600;color:var(--muted);">(${r.id})</small></h3>
    <div style="margin:8px 0"><span class="tag ${r.status.toLowerCase().includes('resolve') ? 'resolved' : 'pending'}">${r.status}</span> <span class="tag medium">${r.priority}</span></div>
    <p>${r.desc}</p>
    <div class="meta">
      <div><span class="material-icons" style="font-size:16px">calendar_today</span>&nbsp;${r.date}</div>
      <div><span class="material-icons" style="font-size:16px">place</span>&nbsp;${r.location}</div>
    </div>
    <div style="margin-top:12px">
      <button id="closeDetail" class="view-btn"><span class="material-icons">arrow_back</span> Close</button>
    </div>
  `;
  modal.classList.remove('hidden');
  // close button inside content
  document.getElementById('closeDetail').addEventListener('click', closeModalHandler);
}

function closeModalHandler(){
  modal.classList.add('hidden');
  modalContent.innerHTML = '';
}
document.getElementById('closeModal').addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => { if(e.target === modal) closeModalHandler(); });

/* FAB & Report New Issue button */
[fab, reportBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    openCreateModal();
  });
});

function openCreateModal(){
  modalContent.innerHTML = `
    <h3>Report New Issue</h3>
    <form id="createForm" style="display:flex;flex-direction:column;gap:8px">
      <label>Title<input name="title" required placeholder="Short title" /></label>
      <label>Description<textarea name="desc" required placeholder="Describe the issue"></textarea></label>
      <label>Category
        <select name="category">
          ${categories.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
      </label>
      <div style="display:flex;gap:8px">
        <button type="submit" class="primary-btn">Submit</button>
        <button type="button" id="cancelCreate" class="outline-btn">Cancel</button>
      </div>
    </form>
  `;
  modal.classList.remove('hidden');

  document.getElementById('cancelCreate').addEventListener('click', closeModalHandler);
  document.getElementById('createForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const newReport = {
      id: 'R-' + (1000 + (reports.length + 1)),
      title: data.get('title'),
      desc: data.get('desc'),
      category: data.get('category'),
      status: 'Pending',
      priority: 'Medium',
      date: new Date().toLocaleDateString(),
      location: 'Unknown Location',
      img: '',
      reporter: 'User A'
    };
    reports.unshift(newReport);
    renderReports(reports);
    updateSummaryCounts(reports);
    closeModalHandler();
    // update My Reports tab count
    const myTab = document.querySelector('.tab[data-tab="my"]');
    const myCount = reports.filter(r => r.reporter === 'User A').length;
    myTab.textContent = `My Reports (${myCount})`;
  });
}

/* initial my tab count */
(function initMyCount(){
  const myTab = document.querySelector('.tab[data-tab="my"]');
  const myCount = reports.filter(r => r.reporter === 'User A').length;
  myTab.textContent = `My Reports (${myCount})`;
})();
