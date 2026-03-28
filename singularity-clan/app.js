const USER = "ReyyHandalKoding";
const REPO = "singularity-clan";
const FILE = "data.json";

// token split biar ga terlalu keliatan 😹
const TOKEN = "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";

const ADMIN_HASH = "482c811da5d5b4bc6d497ffa98491e38";

let members = [];
let sha = "";
let role = "guest";

// login
function login() {
  const key = prompt("Key:");
  if (CryptoJS.MD5(key).toString() === ADMIN_HASH) {
    role = "admin";
    alert("admin 😈");
  } else {
    role = "member";
  }
  document.getElementById("role").innerText = role;
}

// load
async function loadData() {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE}`, {
    headers: { Authorization: "token " + TOKEN }
  });

  const data = await res.json();
  sha = data.sha;

  const parsed = JSON.parse(atob(data.content));
  members = parsed.members;
  document.getElementById("last").innerText = parsed.updated;

  render();
}

// save
async function saveData() {
  const payload = {
    members,
    updated: new Date().toLocaleString()
  };

  const content = btoa(JSON.stringify(payload, null, 2));

  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE}`, {
    method: "PUT",
    headers: {
      Authorization: "token " + TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "update data",
      content,
      sha
    })
  });

  const data = await res.json();
  sha = data.content.sha;

  loadData();
}

// UI
function render() {
  document.getElementById("total").innerText = members.length;

  document.getElementById("members").innerHTML =
    members.map(m => `
      <div class="member">
        ${m.name} | ${m.score}
        ${role === "admin" ? `
          <br>
          <button onclick="editScore('${m.name}')">Edit</button>
          <button onclick="deleteMember('${m.name}')">Hapus</button>
        ` : ""}
      </div>
    `).join("");

  const sorted = [...members].sort((a,b)=>b.score-a.score);
  document.getElementById("board").innerHTML =
    sorted.map((m,i)=>`<div>#${i+1} ${m.name} - ${m.score}</div>`).join("");
}

// action
function joinClan() {
  const name = prompt("Nama:");
  if (!name) return;

  if (members.find(m => m.name === name)) {
    return alert("udah ada 😹");
  }

  members.push({ name, score: 0 });
  saveData();
}

function addScore() {
  const name = prompt("Nama:");
  const m = members.find(x => x.name === name);

  if (!m) return alert("ga ada 😹");

  m.score += 10;
  saveData();
}

function editScore(name) {
  if (role !== "admin") return;

  const m = members.find(x => x.name === name);
  const val = prompt("Score:", m.score);

  m.score = parseInt(val) || 0;
  saveData();
}

function deleteMember(name) {
  if (role !== "admin") return;

  members = members.filter(m => m.name !== name);
  saveData();
}

loadData();
