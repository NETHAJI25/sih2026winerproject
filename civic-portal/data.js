/* ============================================================
   INNOINDIA CIVIC REPORTING — DATA LAYER (offline, localStorage)
   SIH 2026 | Team Vibranium
   Public API (use ONLY these):
     CivicData.getSession()           -> {uid,name,email,role,dept} | null
     CivicData.login(email,pass)      -> {ok:true,user} | {ok:false,error}
     CivicData.register(data)         -> {ok:true,user} | {ok:false,error}
     CivicData.logout()
     CivicData.getUsers()
     CivicData.getReports()
     CivicData.getReport(id)
     CivicData.addReport(data)
     CivicData.updateStatus(id,status,note)
     CivicData.addUpdate(id,note)
     CivicData.vote(id)
     CivicData.getStats()
     CivicData.getCategories()
     CivicData.categoryLabel(id)
     CivicData.statusClass(status)    -> css badge class
     CivicData.autoCategorize(title)  -> AI-ish suggestion
     CivicData.processImage(file)     -> Promise(base64) compressed
     CivicData.uid()
     CivicData.now()
     CivicData.formatDate(ts)
     CivicData.resetDemo()
   ============================================================ */
(function (global) {
  const K = {
    users: 'inno_civic_users',
    reports: 'inno_civic_reports',
    session: 'inno_civic_session'
  };
  const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
  const CATEGORIES = [
    { id: 'roads', label: 'Roads & Infrastructure' },
    { id: 'waste', label: 'Waste Management' },
    { id: 'lights', label: 'Street Lights' },
    { id: 'water', label: 'Water Supply' },
    { id: 'sanitation', label: 'Sanitation' },
    { id: 'trees', label: 'Parks & Green' },
    { id: 'power', label: 'Electricity' },
    { id: 'other', label: 'Other' }
  ];

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function uid() { return 'IN' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100); }
  function now() { return Date.now(); }
  function formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  function statusClass(s) {
    if (s === 'In Progress') return 'badge-progress';
    if (s === 'Resolved') return 'badge-resolved';
    if (s === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
  }
  function categoryLabel(id) {
    const c = CATEGORIES.find(x => x.id === id);
    return c ? c.label : 'Other';
  }

  /* ---------- seed demo data ---------- */
  function seedIfEmpty() {
    if (read(K.users, null)) return;
    const users = [
      { uid: 'U-CITIZEN', name: 'R. Nethaji', email: 'nethaji@srmist.edu.in', phone: '9876543210', password: 'demo123', role: 'citizen' },
      { uid: 'U-OFFICER', name: 'Municipal Officer', email: 'officer@srmist.edu.in', phone: '9000000000', password: 'demo123', role: 'govt', dept: 'Corporation' }
    ];
    const mk = (id, title, desc, cat, prio, status, reporter, lat, lng, days, note) => ({
      id, title, desc, category: cat, priority: prio, status,
      location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng,
      image: '', votes: Math.floor(Math.random() * 8) + 1,
      reporterId: 'U-CITIZEN', reporterName: reporter,
      createdAt: now() - days * 86400000,
      dept: 'Corporation',
      updates: [
        { status: 'Pending', note: 'Report submitted by citizen', by: reporter, at: now() - days * 86400000 }
      ],
      remark: ''
    });
    const reports = [
      mk('R1001', 'Large pothole near bus stop', 'A deep pothole on the main road near the bus stop causing accidents, especially for two-wheelers at night.', 'roads', 'High', 'Pending', 'Nethaji', 13.0152, 80.1922, 2, ''),
      mk('R1002', 'Overflowing garbage bin', 'Municipal garbage bin overflowing for a week near the market, attracting stray animals and spreading foul smell.', 'waste', 'Medium', 'In Progress', 'Priya', 13.0336, 80.1803, 5, 'Team deployed for cleaning'),
      mk('R1003', 'Street light not working', 'Street light in lane 3 has not worked for over 2 nights, making the street unsafe after dark.', 'lights', 'Medium', 'Pending', 'Arjun', 13.0288, 80.1866, 1, ''),
      mk('R1004', 'Broken park fence', 'The fence around the children\'s park is broken and exposed wires are visible. Safety hazard for kids.', 'trees', 'Low', 'Resolved', 'Meena', 13.0328, 80.1803, 8, 'Fence repaired by civic works dept'),
      mk('R1005', 'Community tap leaking', 'The common tap near the temple has been leaking continuously, wasting water and creating a puddle on the road.', 'water', 'High', 'In Progress', 'Rahul', 13.0335, 80.1803, 3, 'Plumbing team assigned'),
      mk('R1006', 'Drainage blocked near school', 'Storm drain blocked with waste near the school gate; waterlogging after every rain.', 'sanitation', 'Urgent', 'Pending', 'Sneha', 13.0210, 80.1901, 1, ''),
      mk('R1007', 'Power fluctuation in sector', 'Frequent voltage fluctuations affecting homes and small shops in the sector for the past week.', 'power', 'High', 'Resolved', 'Vikram', 13.0401, 80.1750, 6, 'Transformer maintenance completed'),
      mk('R1008', 'Illegal dumping near river bank', 'Construction debris and waste being illegally dumped near the river bank, polluting the water.', 'waste', 'Urgent', 'Pending', 'Lakshmi', 13.0105, 80.1952, 1, ''),
      mk('R1009', 'Broken footpath tiles', 'Footpath tiles broken and uneven near the metro station, a tripping hazard for pedestrians.', 'roads', 'Low', 'Pending', 'Karthik', 13.0250, 80.1840, 4, ''),
      mk('R1010', 'Stray dogs menace', 'Pack of stray dogs near the park making it difficult for residents to walk in the evening.', 'other', 'Medium', 'Rejected', 'Divya', 13.0302, 80.1821, 7, 'Out of civic scope — forwarded to animal welfare')
    ];
    write(K.users, users);
    write(K.reports, reports);
  }

  /* ---------- auth ---------- */
  function getUsers() { return read(K.users, []); }
  function getSession() { return read(K.session, null); }
  function login(email, pass) {
    const u = getUsers().find(x => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u) return { ok: false, error: 'No account found with this email.' };
    if (u.password !== pass) return { ok: false, error: 'Incorrect password.' };
    write(K.session, { uid: u.uid, name: u.name, email: u.email, role: u.role, dept: u.dept || '' });
    return { ok: true, user: u };
  }
  function register(data) {
    const users = getUsers();
    if (users.some(x => x.email.toLowerCase() === String(data.email).toLowerCase()))
      return { ok: false, error: 'An account with this email already exists.' };
    const u = { uid: uid(), name: data.name, email: data.email, phone: data.phone || '', password: data.password, role: data.role || 'citizen', dept: data.dept || '' };
    users.push(u);
    write(K.users, users);
    write(K.session, { uid: u.uid, name: u.name, email: u.email, role: u.role, dept: u.dept });
    return { ok: true, user: u };
  }
  function logout() { localStorage.removeItem(K.session); }

  /* ---------- reports ---------- */
  function getReports() {
    return read(K.reports, []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  function getReport(id) { return getReports().find(r => r.id === id) || null; }
  function persist(list) { write(K.reports, list); }
  function addReport(d) {
    const list = getReports();
    const rep = {
      id: uid(), title: d.title, desc: d.desc || '',
      category: d.category || 'other', priority: d.priority || 'Medium',
      status: 'Pending', location: d.location || 'Not provided',
      lat: d.lat || null, lng: d.lng || null, image: d.image || '',
      votes: 1, reporterId: d.reporterId || '', reporterName: d.reporterName || 'Citizen',
      createdAt: now(), dept: d.dept || 'Not assigned',
      updates: [{ status: 'Pending', note: 'Report submitted by citizen', by: d.reporterName || 'Citizen', at: now() }],
      remark: ''
    };
    list.unshift(rep);
    persist(list);
    return rep;
  }
  function updateStatus(id, status, note) {
    const list = getReports();
    const r = list.find(x => x.id === id);
    if (!r) return null;
    r.status = status;
    r.remark = note || '';
    r.updates.push({ status, note: note || 'Status updated', by: 'Municipal Officer', at: now() });
    persist(list);
    return r;
  }
  function addUpdate(id, note) {
    const list = getReports();
    const r = list.find(x => x.id === id);
    if (!r) return null;
    r.updates.push({ status: r.status, note: note || 'Update added', by: 'Municipal Officer', at: now() });
    persist(list);
    return r;
  }
  function vote(id) {
    const list = getReports();
    const r = list.find(x => x.id === id);
    if (!r) return null;
    r.votes = (r.votes || 0) + 1;
    persist(list);
    return r.votes;
  }
  function getStats() {
    const rs = getReports();
    const s = { total: rs.length, pending: 0, progress: 0, resolved: 0, rejected: 0, votes: 0 };
    rs.forEach(r => {
      if (r.status === 'Pending') s.pending++;
      else if (r.status === 'In Progress') s.progress++;
      else if (r.status === 'Resolved') s.resolved++;
      else if (r.status === 'Rejected') s.rejected++;
      s.votes += (r.votes || 0);
    });
    return s;
  }

  /* ---------- AI-ish auto categorization (offline heuristic) ---------- */
  function autoCategorize(text) {
    const t = (text || '').toLowerCase();
    const rules = [
      { id: 'roads', k: ['pothole', 'road', 'speed breaker', 'footpath', 'bridge'] },
      { id: 'waste', k: ['garbage', 'waste', 'bin', 'dumping', 'trash', 'litter'] },
      { id: 'lights', k: ['street light', 'lamp', 'light not', 'dark', 'lighting'] },
      { id: 'water', k: ['water', 'tap', 'leak', 'pipe', 'supply'] },
      { id: 'sanitation', k: ['drain', 'sewage', 'sanitation', 'toilet', 'waterlog'] },
      { id: 'trees', k: ['park', 'tree', 'fence', 'garden', 'plant'] },
      { id: 'power', k: ['electric', 'power', 'voltage', 'transformer', 'current'] }
    ];
    let best = { id: 'other', score: 0 };
    rules.forEach(r => {
      let score = 0;
      r.k.forEach(kw => { if (t.includes(kw)) score++; });
      if (score > best.score) best = { id: r.id, score };
    });
    return best.id;
  }

  /* ---------- image compression (FileReader -> canvas -> base64) ---------- */
  function processImage(file, maxW = 700, quality = 0.72) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return resolve('');
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          try { resolve(c.toDataURL('image/jpeg', quality)); }
          catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error('Invalid image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Read failed'));
      reader.readAsDataURL(file);
    });
  }

  function resetDemo() {
    localStorage.removeItem(K.users);
    localStorage.removeItem(K.reports);
    localStorage.removeItem(K.session);
    seedIfEmpty();
  }

  /* ---------- expose ---------- */
  seedIfEmpty();
  const api = {
    getSession, login, register, logout, getUsers,
    getReports, getReport, addReport, updateStatus, addUpdate, vote,
    getStats, getCategories: () => CATEGORIES, categoryLabel, statusClass,
    autoCategorize, processImage,
    STATUSES, uid, now, formatDate, resetDemo
  };
  global.CivicData = api;
  global.InnoCivic = api; // alias
})(window);
