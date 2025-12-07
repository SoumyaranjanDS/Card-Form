const LS_KEY = "profile_cards_v1";

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const plusBtn = $("#plus");
const cardStack = $("#cardStack");
const form = $("#cardForm");
const cancelBtn = $("#cancelBtn");
const createBtn = $("#createBtn");
const searchBar = $("#searchBar");
const filterBtns = $$(".filter");

const modal = $("#modal");
const modalClose = $("#modalClose");
const modalImg = $("#modalImg");
const modalName = $("#modalName");
const modalTown = $("#modalTown");
const modalPurpose = $("#modalPurpose");
const modalCategory = $("#modalCategory");

const inputImg = $("#imgUrl");
const inputName = $("#fullName");
const inputTown = $("#hometown");
const inputPurpose = $("#purpose");
const categoryField = $("#categoryField");

const formError = $("#formError");
const siteLoader = $("#siteLoader");

let cards = [];
let currentFilter = "All";
let searchQuery = "";

// CARD COLORS
const categoryColors = {
  "Emergency": "cat-emergency",
  "Important": "cat-important",
  "Urgent": "cat-urgent",
  "No Rush": "cat-norush"
};

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}

// ------------ LOADER ------------
function showLoader(){siteLoader.classList.remove("hidden");}
function hideLoader(){siteLoader.classList.add("hidden");}

// ------------ FORM TOGGLE ------------
function showForm(){
  form.classList.remove("hidden");
}
function hideForm(){
  form.classList.add("hidden");
  formError.textContent = "";
}
plusBtn.onclick = showForm;
cancelBtn.onclick = () => { form.reset(); hideForm(); };

// ------------ VALIDATION ------------
function validateForm(){
  if(!inputImg.value.trim() || !inputName.value.trim() || !inputTown.value.trim() || !inputPurpose.value.trim()){
    formError.textContent="Please fill all fields.";
    return false;
  }
  try{new URL(inputImg.value.trim())}catch{return formError.textContent="Invalid URL"};
  if(!categoryField.querySelector("input:checked")){formError.textContent="Select category";return false;}
  return true;
}

// ------------ CREATE CARD ------------
form.addEventListener("submit", e=>{
  e.preventDefault();
  if(!validateForm()) return;

  const cat = categoryField.querySelector("input:checked").value;
  cards.unshift({
    id:uid(),
    img:inputImg.value.trim(),
    name:inputName.value.trim(),
    town:inputTown.value.trim(),
    purpose:inputPurpose.value.trim(),
    category:cat
  });
  save();
  render();
  form.reset();
  hideForm();
});

// ------------ STORAGE ------------
function load(){cards = JSON.parse(localStorage.getItem(LS_KEY)||"[]");}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(cards));}

// ------------ FILTER + SEARCH ------------
filterBtns.forEach(btn=>{
  btn.onclick = ()=>{
    filterBtns.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  };
});
searchBar.oninput = e=>{
  searchQuery = e.target.value.toLowerCase();
  render();
};

// ------------ RENDER ------------
function getFiltered(){
  let list = cards.slice();
  if(currentFilter!=="All") list=list.filter(c=>c.category===currentFilter);
  if(searchQuery) list=list.filter(c=>c.name.toLowerCase().includes(searchQuery));
  return list;
}

function render(){
  cardStack.innerHTML="";
  let list = getFiltered();

  if(list.length===0){
    let el=document.createElement("div");
    el.className="card visible";
    el.style.position="relative";
    el.innerHTML=`<div style="padding:18px;color:#ccc;">No cards found.</div>`;
    cardStack.appendChild(el);
    return;
  }

  list.slice(0,3).forEach((card,idx)=>{
    let el=document.createElement("div");
    el.className="card";
    el.dataset.id=card.id;

    el.innerHTML=`
      <div>
        <img src="${card.img}" class="profile-img" />
      </div>
      <div class="content">
        <h2>${card.name}</h2>
        <div class="info">
          <div><p>Home town</p><h4>${card.town}</h4></div>
          <div><p>Purpose</p><h4>${card.purpose}</h4></div>
        </div>
        <div class="btns">
          <button class="call">Call</button>
          <button class="msg">Message</button>
        </div>
      </div>
      <div class="card-actions">
        <button class="view" data-id="${card.id}"><i class="ri-eye-line"></i></button>
        <button class="delete" data-id="${card.id}"><i class="ri-delete-bin-line"></i></button>
      </div>
    `;

    // correct stacking
    if(idx===0){el.style.top="0";}
    if(idx===1){el.style.top="18px";}
    if(idx===2){el.style.top="36px";}

    cardStack.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("visible"));

    el.querySelector(".delete").onclick = del;
    el.querySelector(".view").onclick = view;
  });
}

// ------------ DELETE ------------
function del(e){
  let id=e.currentTarget.dataset.id;
  cards = cards.filter(c=>c.id!==id);
  save();
  render();
}

// ------------ VIEW / MODAL ------------
function view(e){
  let id=e.currentTarget.dataset.id;
  let c = cards.find(c=>c.id===id);
  modalImg.src = c.img;
  modalName.textContent = c.name;
  modalTown.textContent = c.town;
  modalPurpose.textContent = c.purpose;
  modalCategory.textContent = c.category;
  modal.classList.remove("hidden");
}

modalClose.onclick = ()=>modal.classList.add("hidden");
modal.onclick = e=>{if(e.target===modal) modal.classList.add("hidden");}

// ------------ ROTATE ------------
$("#upBtn").onclick = ()=>{
  if(cards.length>1){
    const item = cards.pop();
    cards.unshift(item);
    save();
    render();
  }
};
$("#downBtn").onclick = ()=>{
  if(cards.length>1){
    const item = cards.shift();
    cards.push(item);
    save();
    render();
  }
};

// ------------ INIT ------------
function seed(){
  load();
  if(cards.length===0){
    cards=[
      {id:uid(),img:"https://i.pravatar.cc/150?img=12",name:"Fatima Uma",town:"Singapore",purpose:"Booking",category:"Important"},
      {id:uid(),img:"https://i.pravatar.cc/150?img=55",name:"Ravi Kumar",town:"Pune",purpose:"Urgent Call",category:"Urgent"},
      {id:uid(),img:"https://i.pravatar.cc/150?img=32",name:"Anita Shah",town:"Mumbai",purpose:"Quick Call",category:"No Rush"}
    ];
    save();
  }
}

function init(){
  showLoader();
  setTimeout(()=>{
    seed();
    render();
    hideLoader();
  },500);
}
init();
