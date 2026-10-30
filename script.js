/* ==========================================
   TableBook - Main JavaScript (script.js)
   ========================================== */

// --- Application State & LocalStorage Initialization ---
let tables = JSON.parse(localStorage.getItem('tb_tables')) || [
  { id: 1, name: "Table A1", capacity: 2, location: "Window", status: "Available", floor: "Ground" },
  { id: 2, name: "Table B2", capacity: 4, location: "Center", status: "Available", floor: "Ground" },
  { id: 3, name: "Table C1", capacity: 6, location: "Private", status: "Reserved", floor: "First" },
  { id: 4, name: "Table D1", capacity: 8, location: "VIP", status: "Occupied", floor: "First" }
];

let bookings = JSON.parse(localStorage.getItem('tb_bookings')) || [
  { id: 1, table_id: 1, customer_name: "John Doe", email: "john@example.com", phone: "9876543210", booking_date: "2026-07-01", booking_time: "7:00 PM", party_size: 2, status: "Confirmed", special_requests: "Window seat preferred" }
];

let customers = JSON.parse(localStorage.getItem('tb_customers')) || [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "9876543210", preferences: "Window seat", total_visits: 3, last_visit: "2026-06-15" }
];

// Save state helper
function saveState() {
  localStorage.setItem('tb_tables', JSON.stringify(tables));
  localStorage.setItem('tb_bookings', JSON.stringify(bookings));
  localStorage.setItem('tb_customers', JSON.stringify(customers));
}

// --- DOM Content Loaded Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateDashboard();
  renderTablesTable();
  renderBookingsTable();
  renderFloorPlan();
  renderCustomersTable();
  renderReports();
});

// --- Navigation Handling ---
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Hide all sections & show targeted section
      const targetId = link.getAttribute('href').substring(1);
      document.querySelectorAll('main section, main > div').forEach(sec => {
        sec.style.display = 'none';
      });
      
      const targetSection = document.getElementById(targetId) || document.getElementById('dashboard');
      if (targetSection) targetSection.style.display = 'block';
    });
  });
}

// --- Dashboard Metrics Updater ---
function updateDashboard() {
  document.getElementById('total-reservations-count').innerText = bookings.length;
  
  const occupiedCount = tables.filter(t => t.status === 'Occupied' || t.status === 'Reserved').length;
  const occupancyRate = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;
  document.getElementById('occupancy-rate').innerText = `${occupancyRate}%`;
  
  const estimatedRevenue = bookings.length * 45; // Simulated average ticket size
  document.getElementById('estimated-revenue').innerText = `$${estimatedRevenue}`;
  
  document.getElementById('active-tables-count').innerText = `${tables.filter(t => t.status === 'Available').length}/${tables.length}`;
}

// --- Table Management (CRUD) ---
function renderTablesTable() {
  const tbody = document.getElementById('tables-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  tables.forEach(table => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${table.name}</strong></td>
      <td>${table.capacity} Persons</td>
      <td>${table.location} (${table.floor} Floor)</td>
      <td><span class="status-badge ${table.status.toLowerCase()}">${table.status}</span></td>
      <td>
        <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="editTable(${table.id})">Edit</button>
        <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem; background-color: #EF4444;" onclick="deleteTable(${table.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addTable(event) {
  event.preventDefault();
  const name = document.getElementById('tableNameInput').value;
  const capacity = parseInt(document.getElementById('tableCapacityInput').value);
  const location = document.getElementById('tableLocationInput').value;
  const floor = document.getElementById('tableFloorInput').value;

  const newTable = {
    id: tables.length > 0 ? tables[tables.length - 1].id + 1 : 1,
    name,
    capacity,
    location,
    floor,
    status: "Available"
  };

  tables.push(newTable);
  saveState();
  renderTablesTable();
  renderFloorPlan();
  updateDashboard();
  event.target.reset();
}

function deleteTable(id) {
  tables = tables.filter(t => t.id !== id);
  saveState();
  renderTablesTable();
  renderFloorPlan();
  updateDashboard();
}

// --- Booking Management (CRUD) ---
function renderBookingsTable() {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  bookings.forEach(booking => {
    const table = tables.find(t => t.id === booking.table_id);
    const tableName = table ? table.name : 'Unassigned';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#BK-${booking.id}</td>
      <td><strong>${booking.customer_name}</strong><br><small>${booking.phone}</small></td>
      <td>${tableName} (${booking.party_size} guests)</td>
      <td>${booking.booking_date} at ${booking.booking_time}</td>
      <td><span class="status-badge reserved">${booking.status}</span></td>
      <td>
        <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="triggerConfirmationEmail(${booking.id})">Email</button>
        <button class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem; background-color: #EF4444;" onclick="cancelBooking(${booking.id})">Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cancelBooking(id) {
  bookings = bookings.filter(b => b.id !== id);
  saveState();
  renderBookingsTable();
  updateDashboard();
}

function triggerConfirmationEmail(id) {
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    alert(`[Automated Confirmation Sent]\nTo: ${booking.email}\nSubject: Reservation Confirmed for ${booking.booking_date} at ${booking.booking_time}!`);
  }
}

// --- Visual Floor Plan Layout ---
function renderFloorPlan() {
  const container = document.getElementById('floor-plan-grid');
  if (!container) return;
  container.innerHTML = '';

  tables.forEach(table => {
    const node = document.createElement('div');
    node.className = `table-node ${table.status.toLowerCase()}`;
    node.innerHTML = `
      <i class="fas fa-chair"></i>
      <span style="margin-top: 6px;">${table.name}</span>
      <small style="color: #6B7280; font-size: 0.7rem;">Cap: ${table.capacity} | ${table.location}</small>
    `;
    node.onclick = () => toggleTableStatus(table.id);
    container.appendChild(node);
  });
}

function toggleTableStatus(id) {
  const table = tables.find(t => t.id === id);
  if (!table) return;

  const statuses = ["Available", "Reserved", "Occupied", "Out of Service"];
  let currentIndex = statuses.indexOf(table.status);
  table.status = statuses[(currentIndex + 1) % statuses.length];

  saveState();
  renderFloorPlan();
  renderTablesTable();
  updateDashboard();
}

// --- Customer Management ---
function renderCustomersTable() {
  const tbody = document.getElementById('customers-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  customers.forEach(cust => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${cust.name}</strong></td>
      <td>${cust.email}</td>
      <td>${cust.phone}</td>
      <td>${cust.total_visits} Visits</td>
      <td>${cust.preferences || 'None'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Reports & Export ---
function renderReports() {
  const reportContainer = document.getElementById('reports-summary-container');
  if (!reportContainer) return;
  reportContainer.innerHTML = `
    <p><strong>Total Active Tables:</strong> ${tables.length}</p>
    <p><strong>Total Lifetime Bookings Logged:</strong> ${bookings.length}</p>
    <p><strong>Registered Customer Profiles:</strong> ${customers.length}</p>
  `;
}

function exportReportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,BookingID,CustomerName,Date,Time,PartySize,Status\n";
  bookings.forEach(b => {
    csvContent += `${b.id},"${b.customer_name}",${b.booking_date},${b.booking_time},${b.party_size},${b.status}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "tablebook_reservations_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}