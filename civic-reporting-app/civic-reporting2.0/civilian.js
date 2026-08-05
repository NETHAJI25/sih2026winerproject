function signupCivilian() {
  const email = document.getElementById("civilianEmail").value;
  const password = document.getElementById("civilianPassword").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
      alert("Civilian signed up!");
    })
    .catch(err => alert(err.message));
}

function loginCivilian() {
  const email = document.getElementById("civilianEmail").value;
  const password = document.getElementById("civilianPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      document.getElementById("authSection").style.display = "none";
      document.getElementById("civilianDashboard").style.display = "block";
      loadCivilianReports();
    })
    .catch(err => alert(err.message));
}

function submitIssue() {
  const title = document.getElementById("issueTitle").value;
  const desc = document.getElementById("issueDesc").value;
  const category = document.getElementById("issueCategory").value;
  const location = document.getElementById("issueLocation").value;
  const user = auth.currentUser;

  if(user) {
    const issueRef = db.ref("issues").push();
    issueRef.set({
      title, desc, category, location,
      status: "Pending",
      userId: user.uid,
      email: user.email
    });
    alert("Issue submitted!");
  }
}

function loadCivilianReports() {
  const user = auth.currentUser;
  db.ref("issues").orderByChild("userId").equalTo(user.uid).on("value", snapshot => {
    const list = document.getElementById("civilianReports");
    list.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const li = document.createElement("li");
      li.innerText = `${data.title} - ${data.status}`;
      list.appendChild(li);
    });
  });
}
