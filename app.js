// Load saved data
let utilities = JSON.parse(localStorage.getItem("utilities")) || [];
let insurance = JSON.parse(localStorage.getItem("insurance")) || [];

function save() {
  localStorage.setItem("utilities", JSON.stringify(utilities));
  localStorage.setItem("insurance", JSON.stringify(insurance));
  render();
}

function render() {
  const utilList = document.getElementById("utilities-list");
  utilList.innerHTML = utilities.map((u) => `
    <div class="card">
      <strong>${u.name}</strong><br>
      Payment: ${u.date}<br>
      <a href="${u.link}" target="_blank">Account</a><br>
    </div>
  `).join("");

  const insList = document.getElementById("insurance-list");
  insList.innerHTML = insurance.map((p) => `
    <div class="card">
      <strong>${p.type}</strong><br>
      Renewal: ${p.date}<br>
      <a href="${p.link}" target="_blank">Account</a><br>
    </div>
  `).join("");
}

function addUtility() {
  const name = prompt("Provider name:");
  const date = prompt("Payment date (YYYY-MM-DD):");
  const link = prompt("Account link (URL):");
  if (!name || !date || !link) return;
  utilities.push({ name, date, link });
  save();
}

function addInsurance() {
  const type = prompt("Policy type:");
  const date = prompt("Renewal date (YYYY-MM-DD):");
  const link = prompt("Account link (URL):");
  if (!type || !date || !link) return;
  insurance.push({ type, date, link });
  save();
}

render();
