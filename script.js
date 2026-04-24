// GLOBALS & STATE
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];
let expenseChart = null;
let serviceChart = null;

// AUTH & APP LOAD
function login() {
    let user = "user_" + Math.floor(Math.random() * 10000);
    localStorage.setItem("user", user);
    loadApp();
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

function loadApp() {
    if (localStorage.getItem("user")) {
        const loginPage = document.getElementById("loginPage");
        const app = document.getElementById("app");

        if (loginPage) loginPage.style.display = "none";
        if (app) app.style.display = "flex";

        renderVehicles();
        renderServices();
        renderDashboard();
        initCharts();
    }
}

// NAVIGATION
function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`nav-${id}`)?.classList.add("active");

    if (window.innerWidth <= 1024) {
        document.getElementById("sidebar")?.classList.remove("show");
    }
}

// MODALS
function openModal(id) {
    document.getElementById(id)?.classList.add("show");
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove("show");
}

// VEHICLE LOGIC
function saveVehicle() {
    const newVehicle = {
        id: Date.now(),
        name: document.getElementById("vName").value || "Untitled Vehicle",
        plate: document.getElementById("vPlate").value || "N/A",
        reg: document.getElementById("vReg").value || "N/A",
        puc: document.getElementById("vPUC").value || "N/A",
        insurance: document.getElementById("vInsurance").value || "N/A",
        odo: document.getElementById("vOdo").value || "0"
    };

    vehicles.push(newVehicle);
    localStorage.setItem("vehicles", JSON.stringify(vehicles));

    document.getElementById("vName").value = "";
    document.getElementById("vPlate").value = "";
    document.getElementById("vReg").value = "";
    document.getElementById("vPUC").value = "";
    document.getElementById("vInsurance").value = "";
    document.getElementById("vOdo").value = "";

    closeModal("vehicleModal");
    renderVehicles();
    renderDashboard();
    updateCharts();
}

function renderVehicles() {
    const vehicleList = document.getElementById("vehicleList");
    if (!vehicleList) return;

    if (vehicles.length === 0) {
        vehicleList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                No vehicles found. Add your first vehicle to get started.
            </div>
        `;
        return;
    }

    vehicleList.innerHTML = vehicles.map(v => `
        <div class="vehicle-card">
            <h3><i data-lucide="car"></i> ${v.name}</h3>
            <div class="vehicle-info-item"><span>Plate:</span> ${v.plate}</div>
            <div class="vehicle-info-item"><span>Reg:</span> ${v.reg}</div>
            <div class="vehicle-info-item"><span>PUC:</span> ${v.puc}</div>
            <div class="vehicle-info-item"><span>Insurance:</span> ${v.insurance}</div>
            <div class="vehicle-info-item"><strong>${v.odo} km</strong></div>
        </div>
    `).join("");

    lucide.createIcons();
}

// SERVICE LOGIC
function openService() {
    if (vehicles.length === 0) {
        alert("Please add a vehicle first.");
        showSection('vehicles');
        return;
    }

    const sVehicle = document.getElementById("sVehicle");
    sVehicle.innerHTML = vehicles.map(v => `
        <option value="${v.id}">${v.name} (${v.plate})</option>
    `).join("");

    openModal("serviceModal");
}

function saveService() {
    const vId = document.getElementById("sVehicle").value;
    const vehicle = vehicles.find(v => v.id == vId);

    services.push({
        vehicleId: vId,
        vehicle: vehicle?.name || "Unknown",
        type: document.getElementById("sType").value || "General",
        date: document.getElementById("sDate").value || new Date().toISOString().split('T')[0],
        cost: Number(document.getElementById("sCost").value) || 0
    });

    localStorage.setItem("services", JSON.stringify(services));

    document.getElementById("sType").value = "";
    document.getElementById("sDate").value = "";
    document.getElementById("sCost").value = "";

    closeModal("serviceModal");
    renderServices();
    renderDashboard();
    updateCharts();
}

function renderServices() {
    const table = document.getElementById("serviceTable");
    if (!table) return;

    table.innerHTML = services.map((s, i) => `
        <tr>
            <td>${s.vehicle}</td>
            <td>${s.type}</td>
            <td>${s.date}</td>
            <td>₹${s.cost}</td>
            <td>
                <button onclick="deleteService(${i})">Delete</button>
            </td>
        </tr>
    `).join("");

    lucide.createIcons();
}

function deleteService(i) {
    if (confirm("Delete this record?")) {
        services.splice(i, 1);
        localStorage.setItem("services", JSON.stringify(services));
        renderServices();
        renderDashboard();
        updateCharts();
    }
}

// DASHBOARD
function renderDashboard() {
    document.getElementById("statV").innerText = vehicles.length;
    document.getElementById("statS").innerText = services.length;

    const total = services.reduce((a, b) => a + b.cost, 0);
    document.getElementById("statC").innerText = "₹" + total;

    const recentList = document.getElementById("recentList");

    if (services.length === 0) {
        recentList.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">No recent services</td>
            </tr>
        `;
        return;
    }

    recentList.innerHTML = services.slice(-5).reverse().map(s => `
        <tr>
            <td>${s.vehicle}</td>
            <td>${s.type}</td>
            <td>Completed</td>
        </tr>
    `).join("");
}

// CHARTS
function initCharts() {
    const ctx1 = document.getElementById("expenseChart");
    const ctx2 = document.getElementById("serviceChart");

    if (!ctx1 || !ctx2) return;

    const data = getChartData();

    expenseChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels: data.months,
            datasets: [{ label: "Cost", data: data.costs }]
        }
    });

    serviceChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: data.types,
            datasets: [{ data: data.typeCounts }]
        }
    });
}

function updateCharts() {
    if (!expenseChart || !serviceChart) return;

    const data = getChartData();

    expenseChart.data.labels = data.months;
    expenseChart.data.datasets[0].data = data.costs;
    expenseChart.update();

    serviceChart.data.labels = data.types;
    serviceChart.data.datasets[0].data = data.typeCounts;
    serviceChart.update();
}

function getChartData() {
    if (services.length === 0) {
        return {
            months: ["Jan", "Feb", "Mar"],
            costs: [1000, 2000, 1500],
            types: ["General"],
            typeCounts: [1]
        };
    }

    const months = [...new Set(services.map(s => s.date.slice(0, 7)))];

    const costs = months.map(m =>
        services
            .filter(s => s.date.startsWith(m))
            .reduce((a, b) => a + b.cost, 0)
    );

    const types = [...new Set(services.map(s => s.type))];
    const counts = types.map(t => services.filter(s => s.type === t).length);

    return { months, costs, types, typeCounts: counts };
}

// INIT
document.addEventListener("DOMContentLoaded", loadApp);
