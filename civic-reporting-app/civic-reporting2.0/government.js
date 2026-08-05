function signupGovernment() {
  const email = document.getElementById("govEmail").value;
  const password = document.getElementById("govPassword").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
      alert("Government officer signed up!");
    })
    .catch(err => alert(err.message));
}

function loginGovernment() {
  const email = document.getElementById("govEmail").value;
  const password = document.getElementById("govPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("governmentDashboard").style.display = "block";
      loadAllReports();
    })
    .catch(err => alert(err.message));
}

function loadAllReports() {
  db.ref("issues").on("value", snapshot => {
    const list = document.getElementById("allReports");
    list.innerHTML = "";
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val();
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${data.title}</b> - ${data.status} <br>
        ${data.desc} (${data.category}) <br>
        <i>${data.location}</i> <br>
        <button onclick="updateStatus('${key}', 'In Progress')">In Progress</button>
        <button onclick="updateStatus('${key}', 'Resolved')">Resolved</button>
        <hr>`;
      list.appendChild(li);
    });
  });
}

function updateStatus(issueId, status) {
  db.ref("issues/" + issueId).update({ status });
}
