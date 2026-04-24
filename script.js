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
        if(loginPage) loginPage.style.display = "none";
        if(app) app.style.display = "flex";
        
        // Initial Renders
        renderVehicles();
        renderServices();
        renderDashboard();
        initCharts();
    }
}

// NAVIGATION
function showSection(id) {
    // Hide all sections
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    // Show target section
    const target = document.getElementById(id);
    if(target) target.classList.add("active");

    // Update nav states
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(nav-${id});
    if(activeBtn) activeBtn.classList.add("active");

    // Close mobile sidebar if open (for smaller screens)
    if (window.innerWidth <= 1024) {
        document.getElementById("sidebar").classList.remove("show");
    }
}

// MODALS
function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

// VEHICLE LOGIC
function saveVehicle() {
    const vName = document.getElementById("vName");
    const vPlate = document.getElementById("vPlate");
    const vReg = document.getElementById("vReg");
    const vPUC = document.getElementById("vPUC");
    const vInsurance = document.getElementById("vInsurance");
    const vOdo = document.getElementById("vOdo");

    const newVehicle = {
        id: Date.now(),
        name: vName.value || "Untitled Vehicle",
        plate: vPlate.value || "N/A",
        reg: vReg.value || "N/A",
        puc: vPUC.value || "N/A",
        insurance: vInsurance.value || "N/A",
        odo: vOdo.value || "0"
    };

    vehicles.push(newVehicle);
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    
    // Clear inputs
    vName.value = ""; vPlate.value = ""; vReg.value = ""; 
    vPUC.value = ""; vInsurance.value = ""; vOdo.value = "";

    closeModal("vehicleModal");
    renderVehicles();
    renderDashboard();
    updateCharts();
}

function renderVehicles() {
    const vehicleList = document.getElementById("vehicleList");
    if(!vehicleList) return;

    if (vehicles.length === 0) {
        vehicleList.innerHTML = <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No vehicles found. Add your first vehicle to get started.</div>;
        return;
    }

    vehicleList.innerHTML = vehicles.map(v => `
        <div class="vehicle-card">
            <h3><i data-lucide="car"></i> ${v.name}</h3>
            <div class="vehicle-info-item">
                <span class="info-label">Plate Number</span>
                <span class="info-value">${v.plate}</span>
            </div>
            <div class="vehicle-info-item">
                <span class="info-label">Registration</span>
                <span class="info-value">${v.reg}</span>
            </div>
            <div class="vehicle-info-item">
                <span class="info-label">PUC Expiry</span>
                <span class="info-value">${v.puc}</span>
            </div>
            <div class="vehicle-info-item">
                <span class="info-label">Insurance</span>
                <span class="info-value">${v.insurance}</span>
            </div>
            <div class="vehicle-info-item" style="margin-top: 1rem; border-top: 1px dashed var(--border); padding-top: 0.5rem;">
                <span class="info-label">Odometer</span>
                <span class="info-value" style="color: var(--primary); font-weight: 700;">${v.odo} km</span>
            </div>
        </div>
    `).join("");

    lucide.createIcons({ attrs: { 'stroke-width': 2.5 } });
}

// SERVICE LOGIC
function openService() {
    if (vehicles.length === 0) {
        alert("Please add a vehicle first.");
        showSection('vehicles');
        return;
    }

    const sVehicle = document.getElementById("sVehicle");
    sVehicle.innerHTML = vehicles.map(v =>
        <option value="${v.id}">${v.name} (${v.plate})</option>
    ).join("");

    openModal("serviceModal");
}

function saveService() {
    const vId = document.getElementById("sVehicle").value;
    const sType = document.getElementById("sType");
    const sDate = document.getElementById("sDate");
    const sCost = document.getElementById("sCost");

    const vehicle = vehicles.find(v => v.id == vId);
    
    services.push({
        vehicleId: vId,
        vehicle: vehicle.name,
        type: sType.value || "General Service",
        date: sDate.value || new Date().toISOString().split('T')[0],
        cost: sCost.value || "0"
    });

    localStorage.setItem("services", JSON.stringify(services));
    
    // Clear inputs
    sType.value = ""; sDate.value = ""; sCost.value = "";

    closeModal("serviceModal");
    renderServices();
    renderDashboard();
    updateCharts();
}

function renderServices() {
    const serviceTable = document.getElementById("serviceTable");
    if(!serviceTable) return;

    serviceTable.innerHTML = services.map((s, i) => `
        <tr>
            <td style="font-weight: 600;">${s.vehicle}</td>
            <td>${s.type}</td>
            <td style="color: var(--text-muted);">${s.date}</td>
            <td style="font-weight: 700;">₹${s.cost}</td>
            <td>
                <button class="btn-outline" style="padding: 4px 8px; color: #ef4444; border-color: #fecaca;" onclick="deleteService(${i})">
                    <i data-lucide="trash-2" size="14"></i>
                </button>
            </td>
        </tr>
    `).join("");


    lucide.createIcons({ attrs: { 'stroke-width': 2.5 } });
}

function deleteService(i) {
    if(confirm("Are you sure you want to delete this service record?")){
        services.splice(i, 1);
        localStorage.setItem("services", JSON.stringify(services));
        renderServices();
        renderDashboard();
        updateCharts();
    }
}

// DASHBOARD LOGIC
function renderDashboard() {
    const statV = document.getElementById("statV");
    const statS = document.getElementById("statS");
    const statC = document.getElementById("statC");
    const recentList = document.getElementById("recentList");

    if(statV) statV.innerText = vehicles.length;
    if(statS) statS.innerText = services.length;
    if(statC) statC.innerText = "₹" + services.reduce((a, b) => a + Number(b.cost), 0).toLocaleString();

    if(recentList) {
        if (services.length === 0) {
            recentList.innerHTML = <tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent services</td></tr>;
        } else {
            recentList.innerHTML = services.slice(-5).reverse().map(s => {
                // Random status badge for visual variety
                const statuses = ['Completed', 'Completed', 'Due Soon', 'Pending'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const badgeClass = status === 'Completed' ? 'badge-success' : (status === 'Due Soon' ? 'badge-warning' : 'badge-danger');
                
                return `
                <tr>
                    <td style="font-weight: 600;">${s.vehicle}</td>
                    <td>${s.type}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                </tr>`;
            }).join("");
        }
    }
}

// CHARTS LOGIC
function initCharts() {
    const expenseCtx = document.getElementById('expenseChart');
    const serviceCtx = document.getElementById('serviceChart');
    
    if(!expenseCtx || !serviceCtx) return;

    // Filter services by last 6 months (dummy data if empty)
    const data = getChartData();

    expenseChart = new Chart(expenseCtx, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: [{
                label: 'Service Cost (₹)',
                data: data.costs,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });

    serviceChart = new Chart(serviceCtx, {
        type: 'doughnut',
        data: {
            labels: data.types,
            datasets: [{
                data: data.typeCounts,
                backgroundColor: ['#2563eb', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

function updateCharts() {
    if(!expenseChart || !serviceChart) return;
    const data = getChartData();
    
    expenseChart.data.labels = data.months;
    expenseChart.data.datasets[0].data = data.costs;
    expenseChart.update();

    serviceChart.data.labels = data.types;
    serviceChart.data.datasets[0].data = data.typeCounts;
    serviceChart.update();
}

function getChartData() {
    // If no data, use some professional-looking dummy trends
    if (services.length === 0) {
        return {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            costs: [2500, 1800, 4200, 2100, 3500, 2800],
            types: ['Maintenance', 'Repair', 'Cleaning', 'Oil Change'],
            typeCounts: [40, 20, 25, 15]
        };
    }

    // Attempt to parse actual data (simple aggregation)
    const months = [...new Set(services.map(s => s.date.split('-')[1]))].sort().slice(-6);
    const monthsMap = { '01':'Jan', '02':'Feb', '03':'Mar', '04':'Apr', '05':'May', '06':'Jun', 
                          '07':'Jul', '08':'Aug', '09':'Sep', '10':'Oct', '11':'Nov', '12':'Dec' };
    
    const costsPerMonth = months.map(m => {
        return services.filter(s => s.date.split('-')[1] === m).reduce((a, b) => a + Number(b.cost), 0);
    });

    const serviceTypes = [...new Set(services.map(s => s.type))];
    const typeCounts = serviceTypes.map(t => services.filter(s => s.type === t).length);

    return {
        months: months.map(m => monthsMap[m] || m),
        costs: costsPerMonth,
        types: serviceTypes.length > 0 ? serviceTypes : ['General'],
        typeCounts: typeCounts.length > 0 ? typeCounts : [1]
    };
}

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    loadApp();
});
