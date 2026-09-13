const places={"Mi ubicación":[10.491,-66.902],"Centro de Caracas":[10.506,-66.914],"Plaza Venezuela":[10.494,-66.879],"Chacao":[10.486,-66.853],"Altamira":[10.497,-66.849],"Sabana Grande":[10.493,-66.873]};
const demoRoutes=[{name:"Ruta NEXO Express",mode:"🚌",minutes:27,walk:5,price:1.2,note:"Modo demostración"},{name:"Ruta económica",mode:"🚍",minutes:42,walk:8,price:.75,note:"Modo demostración"},{name:"Ruta con menos caminata",mode:"🚶",minutes:35,walk:2,price:1.5,note:"Modo demostración"},{name:"Ruta combinada",mode:"🚌🚶",minutes:31,walk:6,price:1.1,note:"Modo demostración"}];
let map,markers=[],lastResults=[];
const $=id=>document.getElementById(id); const money=n=>`$${n.toFixed(2)}`;
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function initMap(){map=L.map('map').setView([10.491,-66.88],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map)}
function coords(name){return places[name]||places["Mi ubicación"]}
function renderRoutes(routes){lastResults=routes;$("routeCards").innerHTML=routes.map((r,i)=>`<article class="route card ${i===0?'recommended':''}" data-i="${i}"><div><div class="route-title"><strong>${r.mode||"🚗"} ${r.name}</strong>${i===0?'<span class="tag">RECOMENDADA</span>':''}</div><div class="route-meta"><span>⏱️ ${r.minutes} min</span><span>📏 ${r.distanceKm? r.distanceKm.toFixed(1)+" km":"—"}</span><span>🚶 ${r.walk} min caminando</span><span>🔄 ${r.note}</span></div></div><div><div class="route-price">${money(r.price)}</div><div class="route-arrow">›</div></div></article>`).join('');document.querySelectorAll('.route').forEach(el=>el.onclick=()=>selectRoute(lastResults[+el.dataset.i]))}
function selectRoute(r){toast(`NEXO: ${r.name} seleccionada · ${r.minutes} min`);$("mapStatus").textContent=`Ruta seleccionada · ${r.minutes} min · ${r.distanceKm?r.distanceKm.toFixed(1)+" km":""}`;window.location.hash='results'}
function clearMap(){markers.forEach(m=>map.removeLayer(m));markers=[]}
function drawFallback(){clearMap();const o=coords($("origin").value.trim()),d=coords($("destination").value.trim());if(!d){toast('Elige un destino primero');return}markers.push(L.marker(o).addTo(map).bindPopup('Origen').openPopup());markers.push(L.marker(d).addTo(map).bindPopup('Destino'));const line=L.polyline([o,d],{weight:5}).addTo(map);markers.push(line);map.fitBounds([o,d],{padding:[30,30]});}
async function realRoadRoutes(o,d){
  const url=`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?alternatives=3&overview=full&geometries=geojson`;
  const res=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!res.ok) throw new Error("OSRM HTTP "+res.status);
  const data=await res.json();
  if(data.code!=="Ok"||!data.routes?.length) throw new Error("NoRoute");
  clearMap();
  markers.push(L.marker(o).addTo(map).bindPopup('Origen').openPopup());
  markers.push(L.marker(d).addTo(map).bindPopup('Destino'));
  const routes=data.routes.map((r,i)=>{
    const minutes=Math.max(1,Math.round(r.duration/60));
    const distanceKm=r.distance/1000;
    const price=Math.max(0.5,Math.round(distanceKm*0.22*100)/100);
    const line=L.geoJSON(r.geometry,{style:{weight:i===0?6:4,opacity:i===0?.95:.55}}).addTo(map);
    markers.push(line);
    return {name:i===0?"Ruta vial NEXO":"Alternativa vial "+(i+1),mode:"🚗",minutes,walk:0,price,distanceKm,note:"Calles reales · OSRM"};
  });
  const all=data.routes.flatMap(r=>r.geometry.coordinates.map(([lng,lat])=>[lat,lng]));
  map.fitBounds(all,{padding:[30,30]});
  return routes;
}
async function search(){
  const dest=$("destination").value.trim();
  if(!dest){toast('Escribe o selecciona un destino');$("destination").focus();return}
  const o=coords($("origin").value.trim()),d=coords(dest);
  $("mapStatus").textContent="Calculando ruta por calles reales…";
  try{
    const routes=await realRoadRoutes(o,d);
    renderRoutes(routes);
    $("aiText").textContent=`Ruta vial calculada para ${dest}. NEXO encontró ${routes.length} alternativa(s) usando la red de calles.`;
    $("results").classList.remove('hidden');
    document.getElementById('results').scrollIntoView({behavior:'smooth'});
    toast("Ruta vial real calculada");
  }catch(e){
    console.warn(e);
    const routes=demoRoutes.map(x=>({...x,minutes:Math.max(12,x.minutes+Math.floor(Math.random()*5)-2)}));
    renderRoutes(routes); drawFallback();
    $("aiText").textContent=`No fue posible consultar el motor vial ahora. NEXO mostró rutas de demostración para ${dest}.`;
    $("results").classList.remove('hidden');
    $("mapStatus").textContent="Modo demostración · sin conexión al motor vial";
    document.getElementById('results').scrollIntoView({behavior:'smooth'});
    toast("Motor vial no disponible; usando demo");
  }
}
$("searchBtn").onclick=search;
$("clearBtn").onclick=()=>{$("results").classList.add('hidden');$("destination").value='';clearMap();toast('Búsqueda limpiada')};
$("swapBtn").onclick=()=>{const a=$("origin").value,b=$("destination").value;$("origin").value=b||'Mi ubicación';$("destination").value=a==='Mi ubicación'?'':a};
document.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>{$("destination").value=b.dataset.dest;search()});
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{const p=b.dataset.ai;let r=[...lastResults];if(!r.length){toast('Primero busca una ruta');return}if(p==='rápido')r.sort((a,b)=>a.minutes-b.minutes);if(p==='barato')r.sort((a,b)=>a.price-b.price);if(p==='caminar')r.sort((a,b)=>a.walk-b.walk);renderRoutes(r);toast(`Priorizando: ${b.textContent.replace(/^.. /,'')}`)});
$("locateBtn").onclick=()=>{if(!navigator.geolocation){toast('Tu navegador no permite GPS');return}toast('Buscando tu ubicación…');navigator.geolocation.getCurrentPosition(pos=>{const c=[pos.coords.latitude,pos.coords.longitude];places['Mi ubicación']=c;$("origin").value='Mi ubicación';map.setView(c,15);L.marker(c).addTo(map).bindPopup('Tu ubicación').openPopup();toast('Ubicación encontrada')},()=>toast('No se pudo obtener la ubicación'))};
$("menuBtn").onclick=()=>$("drawer").classList.remove('hidden');$("closeMenu").onclick=()=>$("drawer").classList.add('hidden');$("resetBtn").onclick=()=>{localStorage.removeItem('nexo2');location.reload()};
try{initMap()}catch(e){$("mapStatus").textContent='Mapa requiere conexión a internet'};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
