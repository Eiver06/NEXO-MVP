const places={"Mi ubicación":[10.491,-66.902],"Centro de Caracas":[10.506,-66.914],"Plaza Venezuela":[10.494,-66.879],"Chacao":[10.486,-66.853],"Altamira":[10.497,-66.849],"Sabana Grande":[10.493,-66.873]};
const demoRoutes=[{name:"Ruta NEXO Express",mode:"🚌",minutes:27,walk:5,price:1.2,note:"Modo demostración"},{name:"Ruta económica",mode:"🚍",minutes:42,walk:8,price:.75,note:"Modo demostración"},{name:"Ruta con menos caminata",mode:"🚶",minutes:35,walk:2,price:1.5,note:"Modo demostración"},{name:"Ruta combinada",mode:"🚌🚶",minutes:31,walk:6,price:1.1,note:"Modo demostración"}];
let map,markers=[],lastResults=[];
const $=id=>document.getElementById(id); const money=n=>`$${n.toFixed(2)}`;
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function initMap(){map=L.map('map').setView([10.491,-66.88],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map)}
function coords(name){return places[name]||places["Mi ubicación"]}
function renderRoutes(routes){lastResults=routes;$("routeCards").innerHTML=routes.map((r,i)=>`<article class="route card ${i===0?'recommended':''}" data-i="${i}"><div><div class="route-title"><strong>${r.mode||"🚗"} ${r.name}</strong>${i===0?'<span class="tag">PRINCIPAL</span>':''}</div><div class="route-meta"><span>⏱️ ${r.minutes} min</span><span>📏 ${r.distanceKm? r.distanceKm.toFixed(1)+" km":"—"}</span><span>🚶 ${r.walk} min caminando</span><span>🛣️ ${r.note}</span></div></div><div><div class="route-price">${money(r.price)}</div><div class="route-arrow">›</div></div></article>`).join('');document.querySelectorAll('.route').forEach(el=>el.onclick=()=>selectRoute(lastResults[+el.dataset.i]))}
function selectRoute(r){toast(`NEXO: ${r.name} seleccionada · ${r.minutes} min`);$("mapStatus").textContent=`Ruta seleccionada · ${r.minutes} min · ${r.distanceKm?r.distanceKm.toFixed(1)+" km":""}`;window.location.hash='results'}
function clearMap(){markers.forEach(m=>map.removeLayer(m));markers=[]}
function addEndpoints(o,d){markers.push(L.marker(o).addTo(map).bindPopup('Origen').openPopup());markers.push(L.marker(d).addTo(map).bindPopup('Destino'))}
function drawFallback(){clearMap();const o=coords($("origin").value.trim()),d=coords($("destination").value.trim());if(!d){toast('Elige un destino primero');return}addEndpoints(o,d);map.fitBounds([o,d],{padding:[30,30]});}
function decodePolyline6(str){
  let index=0,lat=0,lng=0,out=[],factor=1e6;
  while(index<str.length){
    let result=0,shift=0,byte;
    do{byte=str.charCodeAt(index++)-63;result|=(byte&31)<<shift;shift+=5}while(byte>=32);
    lat += (result&1)?~(result>>1):(result>>1);
    result=0;shift=0;
    do{byte=str.charCodeAt(index++)-63;result|=(byte&31)<<shift;shift+=5}while(byte>=32);
    lng += (result&1)?~(result>>1):(result>>1);
    out.push([lat/factor,lng/factor]);
  }
  return out;
}
function valhallaRouteToLeaflet(trip){
  const leg=trip?.trip?.legs?.[0];
  if(!leg) throw new Error("Valhalla: respuesta sin tramo");
  let coordsLL;
  if(leg.shape_format==="geojson" && leg.shape?.coordinates){
    coordsLL=leg.shape.coordinates.map(([lng,lat])=>[lat,lng]);
  }else if(typeof leg.shape==="string"){
    coordsLL=decodePolyline6(leg.shape);
  }else{
    throw new Error("Valhalla: geometría no disponible");
  }
  if(coordsLL.length<2) throw new Error("Valhalla: geometría insuficiente");
  const s=trip.trip.summary||{};
  return {coords:coordsLL,distanceKm:(s.length||0)/1000,minutes:Math.max(1,Math.round((s.time||0)/60))};
}
async function valhallaRoutes(o,d){
  const body={locations:[{lat:o[0],lon:o[1]},{lat:d[0],lon:d[1]}],costing:"auto",units:"kilometers",shape_format:"geojson",alternates:2};
  const res=await fetch("https://valhalla1.openstreetmap.de/route",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Client-Id":"nexo-mvp-github"},
    body:JSON.stringify(body)
  });
  if(!res.ok) throw new Error("Valhalla HTTP "+res.status);
  const data=await res.json();
  const main=valhallaRouteToLeaflet(data);
  clearMap(); addEndpoints(o,d);
  const line=L.polyline(main.coords,{weight:6,opacity:.95}).addTo(map); markers.push(line);
  map.fitBounds(main.coords,{padding:[30,30]});
  return [{name:"Ruta por calles",mode:"🚗",minutes:main.minutes,walk:0,price:Math.max(.5,Math.round(main.distanceKm*.22*100)/100),distanceKm:main.distanceKm,note:"Calles reales · Valhalla"}];
}
async function osrmRoute(o,d){
  const url=`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?alternatives=3&overview=full&geometries=geojson`;
  const res=await fetch(url);
  if(!res.ok) throw new Error("OSRM HTTP "+res.status);
  const data=await res.json();
  if(data.code!=="Ok"||!data.routes?.length) throw new Error("OSRM NoRoute");
  clearMap(); addEndpoints(o,d);
  const routes=data.routes.map((r,i)=>{
    const minutes=Math.max(1,Math.round(r.duration/60));
    const distanceKm=r.distance/1000;
    const line=L.geoJSON(r.geometry,{style:{weight:i===0?6:4,opacity:i===0?.95:.55}}).addTo(map);
    markers.push(line);
    return {name:i===0?"Ruta por calles":"Alternativa vial "+(i+1),mode:"🚗",minutes,walk:0,price:Math.max(.5,Math.round(distanceKm*.22*100)/100),distanceKm,note:"Calles reales · OSRM"};
  });
  const all=data.routes.flatMap(r=>r.geometry.coordinates.map(([lng,lat])=>[lat,lng]));
  map.fitBounds(all,{padding:[30,30]});
  return routes;
}
async function realRoadRoutes(o,d){
  try{return await valhallaRoutes(o,d)}
  catch(valhallaError){
    console.warn("Valhalla no disponible",valhallaError);
    try{return await osrmRoute(o,d)}
    catch(osrmError){
      console.warn("OSRM no disponible",osrmError);
      throw new Error("No fue posible consultar ningún motor vial");
    }
  }
}
async function search(){
  const dest=$("destination").value.trim();
  if(!dest){toast('Escribe o selecciona un destino');$("destination").focus();return}
  const o=coords($("origin").value.trim()),d=coords(dest);
  $("mapStatus").textContent="Calculando por la red real de calles…";
  try{
    const routes=await realRoadRoutes(o,d);
    renderRoutes(routes);
    $("aiText").textContent=`Ruta calculada sobre la red real de calles para ${dest}.`;
    $("results").classList.remove('hidden');
    document.getElementById('results').scrollIntoView({behavior:'smooth'});
    toast("Ruta por calles calculada");
  }catch(e){
    console.error(e);
    clearMap(); addEndpoints(o,d); map.fitBounds([o,d],{padding:[30,30]});
    $("results").classList.add('hidden');
    $("mapStatus").textContent="Motor de rutas no disponible. No se dibujó una línea falsa.";
    $("aiText").textContent="NEXO no pudo consultar el motor de rutas en este momento. Prueba de nuevo con conexión a internet.";
    toast("No se pudo calcular la ruta por calles");
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
