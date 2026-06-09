// Load saved data
let utilities = JSON.parse(localStorage.getItem("utilities")) || [];
let insurance = JSON.parse(localStorage.getItem("insurance")) || [];

// Track what is being edited
let editingType = null; // "utility" or "insurance"
let editingIndex = null;

// Save to localStorage
function save() {
  localStorage.setItem("utilities", JSON.stringify(utilities));
  localStorage.setItem("insurance", JSON.stringify(insurance));
  render();
}

// Render UI
function render() {
  const utilList = document.getElementById("utilities-list");
  utilList.innerHTML = utilities.map((u, i) => `
    <div class="card">
      <strong>${u.name}</strong><br>
      Payment: ${u.date}<br>
      <a href="${u.link}" target="_blank">Account</a><br><br>

      <button onclick="editUtility(${i})">Edit</button>
      <button onclick="deleteUtility(${i})" style="background:#ff3b30">Delete</button>
    </div>
  `).join("");

  const insList = document.getElementById("insurance-list");
  insList.innerHTML = insurance.map((p, i) => `
    <div class="card">
      <strong>${p.type}</strong><br>
      Renewal: ${p.date}<br>
      <a href="${p.link}" target="_blank">Account</a><br><br>

      <button onclick="editInsurance(${i})">Edit</button>
      <button onclick="deleteInsurance(${i})" style="background:#ff3b30">Delete</button>
    </div>
  `).join("");
}

// Add new utility
function addUtility() {
  const name = prompt("Provider name:");
  const date = prompt("Payment date (DD-MM-YYYY):");
  const link = prompt("Account link (URL):");
  if (!name || !date || !link) return;
  utilities.push({ name, date, link });
  save();
}

// Add new insurance policy
function addInsurance() {
  const type = prompt("Policy type:");
  const date = prompt("Renewal date (DD-MM-YYYY):");
  const link = prompt("Account link (URL):");
  if (!type || !date || !link) return;
  insurance.push({ type, date, link });
  save();
}

// Open modal for editing
function openModal(type, index, item) {
  editingType = type;
  editingIndex = index;

  document.getElementById("edit-name").value = item.name || item.type;
  document.getElementById("edit-date").value = item.date;
  document.getElementById("edit-link").value = item.link;

  document.getElementById("edit-modal").style.display = "flex";
}

// Close modal
function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// Edit utility
function editUtility(i) {
  openModal("utility", i, utilities[i]);
}

// Edit insurance
function editInsurance(i) {
  openModal("insurance", i, insurance[i]);
}

// Delete utility
function deleteUtility(i) {
  if (confirm("Delete this utility?")) {
    utilities.splice(i, 1);
    save();
  }
}

// Delete insurance
function deleteInsurance(i) {
  if (confirm("Delete this policy?")) {
    insurance.splice(i, 1);
    save();
  }
}

// Save modal edits
document.getElementById("save-edit").onclick = function () {
  const name = document.getElementById("edit-name").value;
  const date = document.getElementById("edit-date").value;
  const link = document.getElementById("edit-link").value;

  if (editingType === "utility") {
    utilities[editingIndex] = { name, date, link };
  } else {
    insurance[editingIndex] = { type: name, date, link };
  }

  save();
  closeModal();
};

// Cancel modal
document.getElementById("cancel-edit").onclick = closeModal;

// Initial render
render();
