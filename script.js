// LOGIN
function login(){
  let user = "user_" + Math.floor(Math.random()*10000);
  localStorage.setItem("user", user);
  loadApp();
}

function logout(){
  localStorage.removeItem("user");
  location.reload();
}

function loadApp(){
  if(localStorage.getItem("user")){
    loginPage.style.display="none";
    app.style.display="block";
  }
}

// DATA
let vehicles = JSON.parse(localStorage.getItem("vehicles"))||[];
let services = JSON.parse(localStorage.getItem("services"))||[];

// NAV
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// MODAL
function openModal(id){ document.getElementById(id).classList.add("show"); }
function closeModal(id){ document.getElementById(id).classList.remove("show"); }

// VEHICLE
function saveVehicle(){
  vehicles.push({
    id:Date.now(),
    name:vName.value,
    plate:vPlate.value,
    reg:vReg.value,
    puc:vPUC.value,
    insurance:vInsurance.value,
    odo:vOdo.value
  });
  localStorage.setItem("vehicles",JSON.stringify(vehicles));
  closeModal("vehicleModal");
  renderVehicles(); renderDashboard();
}

function renderVehicles(){
  vehicleList.innerHTML = vehicles.map(v=>`
    <div class="vehicle">
      <b>${v.name}</b><br>
      Plate: ${v.plate}<br>
      Reg: ${v.reg}<br>
      PUC: ${v.puc}<br>
      Insurance: ${v.insurance}<br>
      ODO: ${v.odo}
    </div>
  `).join("");
}

// SERVICE
function openService(){
  if(vehicles.length===0) return alert("Add vehicle first");

  sVehicle.innerHTML = vehicles.map(v=>
    `<option value="${v.id}">${v.name}</option>`
  ).join("");

  openModal("serviceModal");
}

function saveService(){
  let vId=sVehicle.value;
  let name=vehicles.find(v=>v.id==vId).name;

  services.push({
    vehicle:name,
    type:sType.value,
    date:sDate.value,
    cost:sCost.value
  });

  localStorage.setItem("services",JSON.stringify(services));
  closeModal("serviceModal");
  renderServices(); renderDashboard();
}

function renderServices(){
  serviceTable.innerHTML = services.map((s,i)=>`
    <tr>
      <td>${s.vehicle}</td>
      <td>${s.type}</td>
      <td>${s.date}</td>
      <td>₹${s.cost}</td>
      <td><button onclick="deleteService(${i})">Delete</button></td>
    </tr>
  `).join("");
}

function deleteService(i){
  services.splice(i,1);
  localStorage.setItem("services",JSON.stringify(services));
  renderServices(); renderDashboard();
}

// DASHBOARD
function renderDashboard(){
  statV.innerText=vehicles.length;
  statS.innerText=services.length;
  statC.innerText="₹"+services.reduce((a,b)=>a+Number(b.cost),0);

  recentList.innerHTML = services.slice(-5).map(s=>
    `<li>${s.vehicle} - ${s.type}</li>`
  ).join("");
}

// INIT
loadApp();
renderVehicles();
renderServices();
renderDashboard();