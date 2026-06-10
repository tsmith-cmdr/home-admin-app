// Load saved data
let utilities = JSON.parse(localStorage.getItem("utilities")) || [];
let insurance = JSON.parse(localStorage.getItem("insurance")) || [];
let quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

// Track what is being edited
let editingType = null; // "utility", "insurance", "quicklink"
let editingIndex = null;

// Save to localStorage
function save() {
  localStorage.setItem("utilities", JSON.stringify(utilities));
  localStorage.setItem("insurance", JSON.stringify(insurance));
  localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
  localStorage.setItem("vehicles", JSON.stringify(vehicles));
  render();
}

// Render UI
function render() {
  // Upcoming Payments Dashboard
const upcomingList = document.getElementById("upcoming-list");
const upcoming = getUpcomingItems();

const today = new Date();

upcomingList.innerHTML = upcoming.map(item => {
  const itemDate = new Date(item.date);
  const isOverdue = itemDate < today;

  return `
    <div class="card ${isOverdue ? 'overdue' : ''}">
      <strong>${item.name}</strong> (${item.type})<br>
      ${isOverdue ? `<span style="color:#d70015;font-weight:bold;">OVERDUE</span><br>` : ''}
      Due: ${item.date}<br>
      <a href="${item.link}" target="_blank">Account</a><br><br>

      <button onclick="addToCalendar('${item.name}', '${item.date}', '${item.link}', '${item.type}')">
  Add to Calendar
</button>

      ${isOverdue ? `
        <button onclick="addToCalendar('${item.name} (OVERDUE)', '${item.date}', '${item.link}', '${item.type}')"
        style="background:#d70015;">
  Add to Calendar Now
</button>
      ` : ''}
    </div>
  `;
}).join("");
  
  // Utilities
  const utilList = document.getElementById("utilities-list");
  utilList.innerHTML = utilities.map((u, i) => `
    <div class="card">
  <strong>${u.name}</strong><br>
  Payment: ${u.date}<br>
  <a href="${u.link}" target="_blank">Account</a><br><br>

  <button onclick="editUtility(${i})">Edit</button>
  <button onclick="deleteUtility(${i})" style="background:#ff3b30">Delete</button>
  <button onclick="addToCalendar('${u.name}', '${u.date}', '${u.link}', 'Utilities')">
  Add to Calendar
</button>
</div>
  `).join("");

  // Insurance
  const insList = document.getElementById("insurance-list");
  insList.innerHTML = insurance.map((p, i) => `
    <div class="card">
  <strong>${p.type}</strong><br>
  Renewal: ${p.date}<br>
  <a href="${p.link}" target="_blank">Account</a><br><br>

  <button onclick="editInsurance(${i})">Edit</button>
  <button onclick="deleteInsurance(${i})" style="background:#ff3b30">Delete</button>
  <button onclick="addToCalendar('${p.type}', '${p.date}', '${p.link}', 'Insurance')">
  Add to Calendar
</button>
</div>
  `).join("");
  
  // Vehicle Admin
const vehicleList = document.getElementById("vehicle-list");

vehicleList.innerHTML = vehicles.map((v, i) => `
  <div class="card">
    <strong>${v.name}</strong><br>
    MOT: ${v.mot}<br>
    Road Tax: ${v.tax}<br><br>

    <a href="${v.motLink}" target="_blank">Check MOT</a><br>
    <a href="${v.taxLink}" target="_blank">Renew Tax</a><br><br>

    <button onclick="addToCalendar('${v.name} MOT', '${v.mot}', '${v.motLink}', 'Vehicle')">
      MOT to Calendar
    </button>

    <button onclick="addToCalendar('${v.name} Road Tax', '${v.tax}', '${v.taxLink}', 'Vehicle')">
      Tax to Calendar
    </button><br><br>

    <button onclick="editVehicle(${i})">Edit</button>
    <button onclick="deleteVehicle(${i})" style="background:#ff3b30">Delete</button>
  </div>
`).join("");

  // Quick Links
  const linksGrid = document.getElementById("links-grid");
  linksGrid.innerHTML = quickLinks.map((l, i) => `
    <div>
      <a class="link-button" href="${l.link}" target="_blank">${l.name}</a>
      <button onclick="editQuickLink(${i})">Edit</button>
      <button onclick="deleteQuickLink(${i})" style="background:#ff3b30">Delete</button>
    </div>
  `).join("");
}

  // Add to Calendar
function addToCalendar(title, date, link, category = "Home Admin") {
  const start = new Date(date);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour event

  function formatICSDate(d) {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
DESCRIPTION:${link}
URL:${link}
CATEGORIES:${category}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  window.location.href = url;
}

  // Upcoming Items
function getUpcomingItems() {
  const today = new Date();

  const utilItems = utilities.map(u => ({
    name: u.name,
    date: u.date,
    link: u.link,
    type: "Utility"
  }));

  const insItems = insurance.map(p => ({
    name: p.type,
    date: p.date,
    link: p.link,
    type: "Insurance"
  }));

  // Add vehicle MOT + Tax items
  const vehicleItems = vehicles.flatMap(v => [
    { name: `${v.name} MOT`, date: v.mot, link: v.motLink, type: "Vehicle" },
    { name: `${v.name} Road Tax`, date: v.tax, link: v.taxLink, type: "Vehicle" }
  ]);

  // Combine everything
  const all = [...utilItems, ...insItems, ...vehicleItems].filter(item => {
    return item.date && !isNaN(new Date(item.date));
  });

  // Sort by date
  all.sort((a, b) => new Date(a.date) - new Date(b.date));

  return all;
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

// Add reminder
function createReminder(title, date, link) {
  const encodedTitle = encodeURIComponent(title);
  const notes = encodeURIComponent(`Due: ${date}\n${link}`);
  const url = `x-apple-reminder://?title=${encodedTitle}&notes=${notes}`;
  window.location.href = url;
}

// Add new quick link
function addQuickLink() {
  const name = prompt("Link label (e.g., 'Octopus Energy'):");
  const link = prompt("URL:");
  if (!name || !link) return;
  quickLinks.push({ name, link });
  save();
}

// Add vehicle
function addVehicle() {
  const name = prompt("Vehicle name (e.g., BMW 3 Series):");
  const mot = prompt("MOT date (YYYY-MM-DD):");
  const tax = prompt("Road Tax date (YYYY-MM-DD):");
  const motLink = "https://www.gov.uk/check-mot-status";
  const taxLink = "https://www.gov.uk/vehicle-tax";

  if (!name || !mot || !tax) return;

  vehicles.push({ name, mot, tax, motLink, taxLink });
  save();
}

function editVehicle(i) {
  const v = vehicles[i];

  const name = prompt("Vehicle name:", v.name);
  const mot = prompt("MOT date (YYYY-MM-DD):", v.mot);
  const tax = prompt("Road Tax date (YYYY-MM-DD):", v.tax);

  if (!name || !mot || !tax) return;

  vehicles[i] = { ...v, name, mot, tax };
  save();
}

function deleteVehicle(i) {
  if (confirm("Delete this vehicle?")) {
    vehicles.splice(i, 1);
    save();
  }
}

// Open modal for editing
function openModal(type, index, item) {
  editingType = type;
  editingIndex = index;

  document.getElementById("edit-name").value = item.name || item.type;
  document.getElementById("edit-date").value = item.date || "";
  document.getElementById("edit-link").value = item.link;

  document.getElementById("edit-modal").style.display = "flex";
}

// Close modal
function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

// Edit functions
function editUtility(i) { openModal("utility", i, utilities[i]); }
function editInsurance(i) { openModal("insurance", i, insurance[i]); }
function editQuickLink(i) { openModal("quicklink", i, quickLinks[i]); }

// Delete functions
function deleteUtility(i) { if (confirm("Delete this utility?")) { utilities.splice(i, 1); save(); } }
function deleteInsurance(i) { if (confirm("Delete this policy?")) { insurance.splice(i, 1); save(); } }
function deleteQuickLink(i) { if (confirm("Delete this link?")) { quickLinks.splice(i, 1); save(); } }

// Save modal edits
document.getElementById("save-edit").onclick = function () {
  const name = document.getElementById("edit-name").value;
  const date = document.getElementById("edit-date").value;
  const link = document.getElementById("edit-link").value;

  if (editingType === "utility") {
    utilities[editingIndex] = { name, date, link };
  } else if (editingType === "insurance") {
    insurance[editingIndex] = { type: name, date, link };
  } else if (editingType === "quicklink") {
    quickLinks[editingIndex] = { name, link };
  }

  save();
  closeModal();
};

// Cancel modal
document.getElementById("cancel-edit").onclick = closeModal;

// Initial render
render();
