/* ============================
   DATA STORAGE
============================ */

let utilities = JSON.parse(localStorage.getItem("utilities")) || [];
let insurance = JSON.parse(localStorage.getItem("insurance")) || [];
let quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
let savedAccent = localStorage.getItem("accent") || null;

/* Save all data */
function save() {
  localStorage.setItem("utilities", JSON.stringify(utilities));
  localStorage.setItem("insurance", JSON.stringify(insurance));
  localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
  localStorage.setItem("vehicles", JSON.stringify(vehicles));
  render();
}

/* ============================
   CALENDAR EVENT CREATION
============================ */

function addToCalendar(title, date, link, category = "Home Admin") {
  const start = new Date(date);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

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

/* ============================
   UTILITIES
============================ */

function addUtility() {
  const name = prompt("Utility name:");
  const date = prompt("Next payment date (DD-MM-YYYY):");
  const link = prompt("Account URL:");

  if (!name || !date) return;

  utilities.push({ name, date, link });
  save();
}

function editUtility(i) {
  const u = utilities[i];
  const name = prompt("Utility name:", u.name);
  const date = prompt("Next payment date (DD-MM-YYYY):", u.date);
  const link = prompt("Account URL:", u.link);

  if (!name || !date) return;

  utilities[i] = { name, date, link };
  save();
}

function deleteUtility(i) {
  if (confirm("Delete this utility?")) {
    utilities.splice(i, 1);
    save();
  }
}

/* ============================
   INSURANCE
============================ */

function addInsurance() {
  const type = prompt("Insurance type (e.g., Car, Home):");
  const date = prompt("Renewal date (DD-MM-YYYY):");
  const link = prompt("Account URL:");

  if (!type || !date) return;

  insurance.push({ type, date, link });
  save();
}

function editInsurance(i) {
  const p = insurance[i];
  const type = prompt("Insurance type:", p.type);
  const date = prompt("Renewal date (DD-MM-YYYY):", p.date);
  const link = prompt("Account URL:", p.link);

  if (!type || !date) return;

  insurance[i] = { type, date, link };
  save();
}

function deleteInsurance(i) {
  if (confirm("Delete this insurance?")) {
    insurance.splice(i, 1);
    save();
  }
}

/* ============================
   VEHICLES (MOT + ROAD TAX)
============================ */

function addVehicle() {
  const name = prompt("Vehicle name (e.g., Ford Fiesta):");
  const mot = prompt("MOT date (DD-MM-YYYY):");
  const tax = prompt("Road Tax date (DD-MM-YYYY):");

  if (!name || !mot || !tax) return;

  vehicles.push({
    name,
    mot,
    tax,
    motLink: "https://www.gov.uk/check-mot-status",
    taxLink: "https://www.gov.uk/vehicle-tax"
  });

  save();
}

function editVehicle(i) {
  const v = vehicles[i];

  const name = prompt("Vehicle name:", v.name);
  const mot = prompt("MOT date (DD-MM-YYYY):", v.mot);
  const tax = prompt("Road Tax date (DD-MM-YYYY):", v.tax);

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

/* ============================
   QUICK LINKS
============================ */

function addQuickLink() {
  const name = prompt("Link name:");
  const url = prompt("URL:");

  if (!name || !url) return;

  quickLinks.push({ name, url });
  save();
}

function editQuickLink(i) {
  const q = quickLinks[i];
  const name = prompt("Link name:", q.name);
  const url = prompt("URL:", q.url);

  if (!name || !url) return;

  quickLinks[i] = { name, url };
  save();
}

function deleteQuickLink(i) {
  if (confirm("Delete this link?")) {
    quickLinks.splice(i, 1);
    save();
  }
}

/* ============================
   UPCOMING DASHBOARD
============================ */

function getUpcomingItems() {
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

  const vehicleItems = vehicles.flatMap(v => [
    { name: `${v.name} MOT`, date: v.mot, link: v.motLink, type: "Vehicle" },
    { name: `${v.name} Road Tax`, date: v.tax, link: v.taxLink, type: "Vehicle" }
  ]);

  const all = [...utilItems, ...insItems, ...vehicleItems].filter(item =>
    item.date && !isNaN(new Date(item.date))
  );

  all.sort((a, b) => new Date(a.date) - new Date(b.date));

  return all;
}

/* ============================
   RENDER FUNCTION
============================ */

function render() {
  /* UPCOMING */
  const upcomingList = document.getElementById("upcoming-list");
  const items = getUpcomingItems();

  upcomingList.innerHTML = items.map((item, idx) => {
    const overdue = new Date(item.date) < new Date() ? "overdue" : "";
    return `
      <div class="card ${overdue} card-animate" style="animation-delay:${idx * 40}ms">
        <strong>${item.name}</strong><br>
        Due: ${item.date}<br><br>
        <button onclick="addToCalendar('${item.name}', '${item.date}', '${item.link}', '${item.type}')">
          Add to Calendar
        </button>
      </div>
    `;
  }).join("");

  /* UTILITIES */
  const utilitiesList = document.getElementById("utilities-list");
  utilitiesList.innerHTML = utilities.map((u, i) => `
    <div class="card card-animate" style="animation-delay:${i * 40}ms">
      <strong>${u.name}</strong><br>
      Next payment: ${u.date}<br>
      <a href="${u.link}" target="_blank">Open account</a><br><br>

      <button onclick="addToCalendar('${u.name}', '${u.date}', '${u.link}', 'Utility')">
        Add to Calendar
      </button>

      <button onclick="editUtility(${i})" class="secondary">Edit</button>
      <button onclick="deleteUtility(${i})" class="danger">Delete</button>
    </div>
  `).join("");

  /* INSURANCE */
  const insuranceList = document.getElementById("insurance-list");
  insuranceList.innerHTML = insurance.map((p, i) => `
    <div class="card card-animate" style="animation-delay:${i * 40}ms">
      <strong>${p.type}</strong><br>
      Renewal: ${p.date}<br>
      <a href="${p.link}" target="_blank">Open account</a><br><br>

      <button onclick="addToCalendar('${p.type}', '${p.date}', '${p.link}', 'Insurance')">
        Add to Calendar
      </button>

      <button onclick="editInsurance(${i})" class="secondary">Edit</button>
      <button onclick="deleteInsurance(${i})" class="danger">Delete</button>
    </div>
  `).join("");

  /* VEHICLES */
  const vehicleList = document.getElementById("vehicle-list");
  vehicleList.innerHTML = vehicles.map((v, i) => `
    <div class="card card-animate" style="animation-delay:${i * 40}ms">
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

      <button onclick="editVehicle(${i})" class="secondary">Edit</button>
      <button onclick="deleteVehicle(${i})" class="danger">Delete</button>
    </div>
  `).join("");

  /* QUICK LINKS */
  const quickLinksList = document.getElementById("quick-links-list");
  quickLinksList.innerHTML = quickLinks.map((q, i) => `
    <div class="card card-animate" style="animation-delay:${i * 40}ms">
      <div class="card-title">
        <strong>${q.name}</strong>
        <span>${q.url}</span>
      </div>
      <div>
        <button onclick="window.open('${q.url}', '_blank')">Open</button>
        <button onclick="editQuickLink(${i})" class="secondary">Edit</button>
        <button onclick="deleteQuickLink(${i})" class="danger">Delete</button>
      </div>
    </div>
  `).join("");
}

/* ============================
   THEME & ACCENT HANDLING
============================ */

const themeToggle = document.getElementById("theme-toggle");
const accentSelect = document.getElementById("accent-select");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

/* Accent colour */
function applyAccent(colour) {
  document.documentElement.style.setProperty("--accent", colour);
}

if (savedAccent) {
  applyAccent(savedAccent);
  if (accentSelect) accentSelect.value = savedAccent;
}

if (accentSelect) {
  accentSelect.addEventListener("change", () => {
    const val = accentSelect.value;
    applyAccent(val);
    localStorage.setItem("accent", val);
  });
}

/* Load saved theme (manual override) */
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light Mode";
} else if (savedTheme === "light") {
  document.body.classList.remove("dark");
  themeToggle.textContent = "Dark Mode";
}

/* Optional OLED tweak for dark + standalone */
if (window.matchMedia("(display-mode: standalone)").matches && savedTheme === "dark") {
  document.body.classList.add("oled");
}

/* Apply system theme if no manual override */
function applySystemTheme() {
  if (!localStorage.getItem("theme")) {
    if (systemPrefersDark.matches) {
      document.body.classList.add("dark");
      themeToggle.textContent = "Light Mode";
    } else {
      document.body.classList.remove("dark");
      themeToggle.textContent = "Dark Mode";
    }

    document.body.classList.add("theme-fade");
    setTimeout(() => document.body.classList.remove("theme-fade"), 350);
  }
}

/* Run on load */
applySystemTheme();

/* Listen for system theme changes */
systemPrefersDark.addEventListener("change", applySystemTheme);

/* Manual toggle */
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");

  themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");

  document.body.classList.add("theme-fade");
  setTimeout(() => document.body.classList.remove("theme-fade"), 350);
});

/* ============================
   COLLAPSIBLE SECTIONS
============================ */

function initCollapsibles() {
  const sections = document.querySelectorAll("section.collapsible");
  sections.forEach(section => {
    const header = section.querySelector(".collapsible-header");
    const body = section.querySelector(".section-body");
    if (!header || !body) return;

    body.style.maxHeight = body.scrollHeight + "px";

    header.addEventListener("click", () => {
      const isCollapsed = section.classList.toggle("collapsed");
      if (isCollapsed) {
        body.style.maxHeight = "0px";
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}

/* INITIALISE */
render();
initCollapsibles();
```Here’s the full, updated code for all three files with all premium upgrades applied.

---

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Admin</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <div id="app">
    <header class="app-header">
      <div class="header-main">
        <div class="header-text">
          <h1>Home Admin</h1>
          <p>Utilities • Insurance • Vehicles • Quick Links</p>
        </div>
        <div class="header-controls">
          <button id="theme-toggle" class="secondary">Dark Mode</button>
          <select id="accent-select" class="accent-select">
            <option value="#6366f1">Indigo</option>
            <option value="#22c55e">Green</option>
            <option value="#3b82f6">Blue</option>
            <option value="#f97316">Orange</option>
            <option value="#ec4899">Pink</option>
            <option value="#0ea5e9">Cyan</option>
          </select>
        </div>
      </div>
    </header>

    <main>
      <section id="upcoming" class="collapsible">
        <h2 class="collapsible-header">Upcoming Payments</h2>
        <div class="section-body">
          <div id="upcoming-list"></div>
        </div>
      </section>

      <section id="utilities" class="collapsible">
        <h2 class="collapsible-header">Utilities</h2>
        <div class="section-body">
          <div id="utilities-list"></div>
          <div class="section-actions">
            <button onclick="addUtility()">Add Utility</button>
          </div>
        </div>
      </section>

      <section id="insurance" class="collapsible">
        <h2 class="collapsible-header">Insurance</h2>
        <div class="section-body">
          <div id="insurance-list"></div>
          <div class="section-actions">
            <button onclick="addInsurance()">Add Insurance</button>
          </div>
        </div>
      </section>

      <section id="vehicles" class="collapsible">
        <h2 class="collapsible-header">Vehicle Admin</h2>
        <div class="section-body">
          <div id="vehicle-list"></div>
          <div class="section-actions">
            <button onclick="addVehicle()">Add Vehicle</button>
          </div>
        </div>
      </section>

      <section id="quick-links" class="collapsible">
        <h2 class="collapsible-header">Quick Links</h2>
        <div class="section-body">
          <div id="quick-links-list"></div>
          <div class="section-actions">
            <button onclick="addQuickLink()">Add Quick Link</button>
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <span>v2.0 • Personal Admin</span>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>
