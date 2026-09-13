const KEY="nexo_mvp_v1";

const seed = {
  users:[
    {id:"u1",name:"Administrador",email:"admin@nexo.test",password:"admin123",role:"admin",ref:"NEXO-ADMIN",parent:null},
    {id:"u2",name:"Carlos",email:"carlos@nexo.test",password:"123456",role:"user",ref:"NEXO-CARLOS",parent:"u1"},
    {id:"u3",name:"Ana",email:"ana@nexo.test",password:"123456",role:"user",ref:"NEXO-ANA",parent:"u2"},
    {id:"u4",name:"Pedro",email:"pedro@nexo.test",password:"123456",role:"user",ref:"NEXO-PEDRO",parent:"u2"}
  ],
  products:[
    {id:"p1",name:"Producto NEXO 1",price:20},
    {id:"p2",name:"Producto NEXO 2",price:50},
    {id:"p3",name:"Producto NEXO 3",price:100}
  ],
  sales:[
    {id:"s1",product:"p2",amount:50,buyer:"Cliente demo",seller:"u3",date:"2026-09-03T12:00:00Z"}
  ],
  commissions:[]
};

function load(){
  let d=localStorage.getItem(KEY);
  if(!d){ localStorage.setItem(KEY,JSON.stringify(seed)); d=JSON.stringify(seed); }
  return JSON.parse(d);
}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
let db=load(), currentId=null, mode="login";

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n||0);
const uid=()=>crypto.randomUUID ? crypto.randomUUID() : "id-"+Date.now()+"-"+Math.random();
function user(){return db.users.find(u=>u.id===currentId)}
function directChildren(id){return db.users.filter(u=>u.parent===id)}
function allDownline(id){
  const out=[]; const q=[id];
  while(q.length){const x=q.shift(); const c=directChildren(x); out.push(...c); q.push(...c.map(u=>u.id))}
  return out;
}
function commissionsFor(userId){
  return db.commissions.filter(c=>c.userId===userId).reduce((s,c)=>s+c.amount,0);
}
function saleCommission(sale){
  const seller=db.users.find(u=>u.id===sale.seller);
  if(!seller) return [];
  const rates=[.05,.02,.01], out=[];
  let node=seller;
  rates.forEach((rate,i)=>{
    if(node){
      const parent=db.users.find(u=>u.id===node.parent);
      if(parent){
        out.push({id:uid(),saleId:sale.id,userId:parent.id,level:i+1,rate,amount:+(sale.amount*rate).toFixed(2),date:new Date().toISOString()});
        node=parent;
      }
    }
  });
  return out;
}

function setMode(m){
  mode=m;
  $("nameField").classList.toggle("hidden",m!=="register");
  $("refField").classList.toggle("hidden",m!=="register");
  $("authSubmit").textContent=m==="register"?"Crear cuenta":"Entrar";
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.mode===m));
  $("authMsg").textContent="";
}
document.querySelectorAll(".tab").forEach(x=>x.onclick=()=>setMode(x.dataset.mode));

$("authForm").onsubmit=e=>{
  e.preventDefault(); db=load();
  const email=$("email").value.trim().toLowerCase(), password=$("password").value;
  if(mode==="login"){
    const u=db.users.find(x=>x.email.toLowerCase()===email && x.password===password);
    if(!u){$("authMsg").textContent="Correo o contraseña incorrectos.";return}
    currentId=u.id; render();
  }else{
    const name=$("name").value.trim(), ref=$("referral").value.trim().toUpperCase();
    if(!name){$("authMsg").textContent="Escribe tu nombre.";return}
    if(db.users.some(x=>x.email.toLowerCase()===email)){ $("authMsg").textContent="Ese correo ya existe.";return}
    const parent=db.users.find(x=>x.ref===ref);
    const u={id:uid(),name,email,password,role:"user",ref:"NEXO-"+name.toUpperCase().replace(/[^A-Z0-9]+/g,"").slice(0,12)+"-"+Math.floor(Math.random()*900+100),parent:parent?.id||null};
    db.users.push(u); save(db); currentId=u.id; render();
  }
};

$("logoutBtn").onclick=()=>{currentId=null;$("appView").classList.add("hidden");$("authView").classList.remove("hidden");$("logoutBtn").classList.add("hidden")};

$("copyBtn").onclick=async()=>{
  const text=$("refCode").textContent;
  try{await navigator.clipboard.writeText(text);$("copyMsg").textContent="Código copiado."}
  catch{$("copyMsg").textContent="Selecciona y copia el código manualmente."}
};

$("saleForm").onsubmit=e=>{
  e.preventDefault(); const amount=Number($("amount").value), seller=$("seller").value, product=$("product").value;
  if(!(amount>0)){ $("saleMsg").textContent="Monto inválido."; return}
  const sale={id:uid(),product,amount,buyer:"Cliente demo",seller,date:new Date().toISOString()};
  db.sales.push(sale); db.commissions.push(...saleCommission(sale)); save(db);
  $("saleMsg").textContent="Venta confirmada y comisiones calculadas sobre la venta.";
  $("amount").value=""; render();
};

function render(){
  db=load(); const u=user(); if(!u)return;
  $("authView").classList.add("hidden");$("appView").classList.remove("hidden");$("logoutBtn").classList.remove("hidden");
  $("userName").textContent=u.name; $("roleBadge").textContent=u.role==="admin"?"ADMIN":"MIEMBRO";
  $("refCode").textContent=u.ref;
  const mySales=db.sales.filter(s=>s.seller===u.id);
  $("sales").textContent=money(mySales.reduce((s,x)=>s+x.amount,0));
  $("commissions").textContent=money(commissionsFor(u.id));
  $("referralsCount").textContent=directChildren(u.id).length;
  $("balance").textContent=money(commissionsFor(u.id));
  $("product").innerHTML=db.products.map(p=>`<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join("");
  $("seller").innerHTML=db.users.map(x=>`<option value="${x.id}" ${x.id===u.id?"selected":""}>${x.name}</option>`).join("");
  $("teamList").innerHTML=directChildren(u.id).map(x=>`<div class="item"><span>${x.name}</span><small>${x.ref}</small></div>`).join("")||'<p class="muted">Aún no tienes referidos directos.</p>';
  $("salesList").innerHTML=db.sales.slice(-8).reverse().map(s=>{
    const who=db.users.find(x=>x.id===s.seller)?.name||"—";
    const p=db.products.find(x=>x.id===s.product)?.name||"Venta";
    return `<div class="item"><span>${p}<br><small>${who}</small></span><strong>${money(s.amount)}</strong></div>`;
  }).join("");
  if(u.role==="admin"){$("adminPanel").classList.remove("hidden");$("adminList").innerHTML=db.users.map(x=>`<div class="item"><span>${x.name}<br><small>${x.email}</small></span><span>${money(commissionsFor(x.id))}</span></div>`).join("")}
  else $("adminPanel").classList.add("hidden");
}
render();
