// ══════════════════════════════════════════════════
// NAVIGATION & INIT
// ══════════════════════════════════════════════════

function mob(){ return window.innerWidth <= 768; }

function goPc(name){
  document.querySelectorAll('.pane').forEach(function(p){ p.classList.remove('on','fade-in'); });
  document.querySelectorAll('.si').forEach(function(b){ b.classList.remove('on'); });
  var pane = document.getElementById('pc-'+name);
  if(pane){ pane.classList.add('on'); void pane.offsetWidth; pane.classList.add('fade-in'); }
  var si = document.getElementById('si-'+name);
  if(si) si.classList.add('on');
  if(name==='home')     renderDashboard();
  if(name==='rekap')    renderRekap('pc');
  if(name==='database') renderDb();
  if(name==='anggota')  renderAnggota();
  if(name==='absen')    showAbsenSetup();
  if(name==='kas')      renderKas();
}

function goMob(name){
  document.querySelectorAll('.mob-page').forEach(function(p){ p.classList.remove('on','fade-in'); });
  document.querySelectorAll('.mob-nav-item').forEach(function(b){ b.classList.remove('on'); });
  var pg = document.getElementById('mob-'+name);
  if(pg){ pg.classList.add('on'); void pg.offsetWidth; pg.classList.add('fade-in'); }
  var bnId = name==='absen-list'?'absen-setup':name;
  var bn = document.getElementById('bn-'+bnId);
  if(bn) bn.classList.add('on');
  window.scrollTo(0,0);
  if(name==='home')     renderDashboard();
  if(name==='rekap')    renderRekap('mob');
  if(name==='database') renderDbMob();
  if(name==='anggota')  renderAnggotaMob();
  if(name==='kas')      renderKas();
}

function initApp(){
  var today = new Date();
  var ds = today.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.querySelectorAll('.js-date').forEach(function(el){ el.textContent = ds; });
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yy = today.getFullYear();
  ['sTgl','sTglM'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.value = yy+'-'+mm+'-'+dd;
  });
  ['rBulan','rBulanM'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.value = today.getMonth()+1;
  });
  ['kasBulan','kasBulanM'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.value = String(today.getMonth()+1).padStart(2,'0');
  });
  ['kasTahun','kasTahunM'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.value = String(today.getFullYear());
  });
  renderDashboard();
  if(mob()) goMob('home'); else goPc('home');
}
