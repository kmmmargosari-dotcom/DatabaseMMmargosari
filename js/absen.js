// ══════════════════════════════════════════════════
// ABSENSI MODULE
// ══════════════════════════════════════════════════

// ── State ──
var _smNama = '', _smCtx = '';
var _izinNama = '', _izinCtx = '';

// ── Setup / Body toggle ──
function showAbsenSetup(){
  var setup = document.getElementById('pc-absen-setup');
  var body  = document.getElementById('pc-absen-body');
  var btnS  = document.getElementById('pc-btn-selesai');
  if(setup) setup.style.display = 'flex';
  if(body)  { body.style.display = 'none'; body.style.flexDirection = ''; }
  if(btnS)  btnS.style.display = 'none';
}

function showAbsenBody(){
  var setup = document.getElementById('pc-absen-setup');
  var body  = document.getElementById('pc-absen-body');
  var btnS  = document.getElementById('pc-btn-selesai');
  if(setup) setup.style.display = 'none';
  if(body)  { body.style.display = 'flex'; body.style.flexDirection = 'column'; }
  if(btnS)  btnS.style.display = '';
}

function resetAbsenForm(){
  ['sTgl','sTglM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  ['sKet','sKetM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
}

function selesaiAbsensi(){
  if(absenTgl){ sesiKet[absenTgl] = absenKet; fbSaveSesi(absenTgl); }
  syncRekapFilter();
  resetAbsenForm();
  showAbsenSetup();
}

function selesaiAbsensiMob(){
  if(absenTgl){ sesiKet[absenTgl] = absenKet; fbSaveSesi(absenTgl); }
  syncRekapFilter();
  resetAbsenForm();
  goMob('absen-setup');
}

function syncRekapFilter(){
  if(!absenTgl) return;
  var parts = tglDate(absenTgl).split('-');
  var th = parts[0], bl = String(parseInt(parts[1]));
  ['rBulan','rBulanM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=bl; });
  ['rTahun','rTahunM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=th; });
}

// ── Setup helpers ──
function tglDate(key){ return key.split('_')[0]; }
function sesiLabel(key){
  var d    = new Date(tglDate(key)+'T00:00:00');
  var base = HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[d.getMonth()+1]+' '+d.getFullYear();
  var parts= key.split('_');
  return parts.length>1 ? base+' (Sesi '+parts[1]+')' : base;
}

function mulaiAbsensi(isMob){
  var suf = isMob ? 'M' : '';
  var tgl = document.getElementById('sTgl'+suf).value;
  if(!tgl){ alert('Pilih tanggal dulu!'); return; }
  var parts  = tgl.split('-');
  var tahun  = parseInt(parts[0]);
  var bulan  = parseInt(parts[1]);
  var ket    = document.getElementById('sKet'+suf).value.trim();
  var sessionKey = tgl;
  if(sesiData[tgl]){
    var existingKet = sesiKet[tgl]||'(tanpa nama)';
    var lanjut = confirm('Tanggal ini sudah ada sesi:\n"'+existingKet+'"\n\nBuat sesi BARU untuk hari yang sama?');
    if(!lanjut) return;
    var n=2;
    while(sesiData[tgl+'_'+n]) n++;
    sessionKey = tgl+'_'+n;
  }
  absenTgl=sessionKey; absenBulan=bulan; absenTahun=tahun; absenKet=ket;
  if(!sesiData[sessionKey]) sesiData[sessionKey]={};
  sesiKet[sessionKey] = ket;
  fbSaveSesi(sessionKey);
  absenGender='S'; openPanel=null;
  if(mob()){
    goMob('absen-page');
    renderAbsenMob();
  } else {
    showAbsenBody();
    renderAbsenPc();
  }
}

// ── Build ──
function selesaiInfo(){
  var sesi = sesiData[absenTgl]||{};
  var h=0, tot=members.length, blm=0;
  members.forEach(function(m){
    var v = (sesi[m.nama]||{}).status||'';
    if(v==='H') h++; else if(!v) blm++;
  });
  if(blm===0) return '<span style="color:var(--green);font-weight:500">✓ Semua terisi</span>';
  return '<span style="color:var(--text2)">'+blm+' belum diisi dari '+tot+' anggota</span>';
}

function counterHtml(){
  var sesi = sesiData[absenTgl]||{};
  var h=0,iz=0,al=0,blm=0;
  members.forEach(function(m){
    var v = (sesi[m.nama]||{}).status||'';
    if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++; else blm++;
  });
  return '<span class="ci"><span class="dot dh"></span><span style="color:var(--green)">'+h+' Hadir</span></span>'+
    '<span class="ci"><span class="dot di"></span><span style="color:var(--amber)">'+iz+' Izin</span></span>'+
    '<span class="ci"><span class="dot da"></span><span style="color:var(--red)">'+al+' Alfa</span></span>'+
    '<span class="ci"><span class="dot dx"></span><span style="color:var(--text3)">'+blm+' Belum</span></span>';
}

function pillHtml(nama, ctx){
  var v = ((sesiData[absenTgl]||{})[nama]||{}).status||'';
  if(v==='H') return '<button class="sp sp-h" onclick="openStatusMenu(this,\''+nama+'\',\''+ctx+'\')">✓ Hadir</button>';
  if(v==='I') return '<button class="sp sp-i" onclick="openStatusMenu(this,\''+nama+'\',\''+ctx+'\')">? Izin</button>';
  if(v==='A') return '<button class="sp sp-a" onclick="openStatusMenu(this,\''+nama+'\',\''+ctx+'\')">✕ Alfa</button>';
  return '<button class="sp sp-x" onclick="openStatusMenu(this,\''+nama+'\',\''+ctx+'\')">Isi status</button>';
}

function buildItem(m, ctx){
  var key  = eid(m.nama);
  var rec  = (sesiData[absenTgl]||{})[m.nama]||{};
  var note = rec.catatan||'';
  var avc  = m.gender==='P'?'av-p':'av-l';
  var html = '<div class="ab-item" id="abitem-'+ctx+'-'+key+'">';
  html += '<div class="ab-row">';
  html += '<div class="avatar '+avc+'">'+initials(m.nama)+'</div>';
  html += '<div class="ab-info"><div class="ab-name">'+m.nama+'</div>';
  var subTxt = (rec.status==='I' && note) ? '<em style="color:var(--amber)">✎ '+note+'</em>' : '&nbsp;';
  html += '<div class="ab-sub">'+subTxt+'</div></div>';
  html += '<div class="ab-right">'+pillHtml(m.nama,ctx);
  html += '<button class="more-btn" onclick="openStatusMenu(this,\''+m.nama+'\',\''+ctx+'\')">···</button>';
  html += '</div></div>';
  html += '</div>';
  return html;
}

// ── Floating Status Menu ──
function openStatusMenu(btn, nama, ctx){
  _smNama = nama; _smCtx = ctx;
  var rec = (sesiData[absenTgl]||{})[nama]||{};
  var s   = rec.status||'';
  var items = '';
  if(s!=='H') items += smBtn('✓','ig','Hadir','smSet(\'H\')');
  if(s!=='I') items += smBtn('?','iamb','Izin','smIzin()');
  if(s!=='A') items += smBtn('✕','ir','Alfa (Tanpa Ket.)','smSet(\'A\')');
  if(s){
    items += '<div class="sm-sep"></div>';
    items += smBtn('↺','igr','Hapus Status','smClear()');
  }
  document.getElementById('status-menu-items').innerHTML = items;
  var menu = document.getElementById('status-menu');
  menu.style.display = 'block';
  menu.classList.remove('show');
  var r   = btn.getBoundingClientRect();
  var mw  = 200;
  var left= r.right - mw;
  if(left < 6) left = 6;
  var top = r.bottom + 4;
  if(top + 200 > window.innerHeight) top = r.top - 4 - menu.offsetHeight;
  menu.style.left = left+'px';
  menu.style.top  = top+'px';
  void menu.offsetWidth;
  menu.classList.add('show');
  document.getElementById('status-menu-overlay').classList.add('show');
}

function smBtn(icon, ic, label, action){
  return '<button class="sm-btn" onclick="'+action+'">'+
    '<span class="sm-icon '+ic+'">'+icon+'</span>'+label+'</button>';
}

function closeStatusMenu(){
  document.getElementById('status-menu').classList.remove('show');
  document.getElementById('status-menu-overlay').classList.remove('show');
  setTimeout(function(){ document.getElementById('status-menu').style.display=''; }, 150);
  _smNama=''; _smCtx='';
}

function smSet(s){ var nama=_smNama, ctx=_smCtx; closeStatusMenu(); setStatus(nama,s,ctx); }
function smIzin(){ var nama=_smNama, ctx=_smCtx; closeStatusMenu(); openIzinPopup(nama,ctx); }
function smClear(){ var nama=_smNama, ctx=_smCtx; closeStatusMenu(); clearStatus(nama,ctx); }

// ── Izin Popup ──
function openIzinPopup(nama, ctx){
  _izinNama = nama; _izinCtx = ctx;
  openPanel = null; redraw(ctx);
  var rec = (sesiData[absenTgl]||{})[nama]||{};
  document.getElementById('izin-popup-name').textContent = nama;
  var noteEl = document.getElementById('izin-popup-note');
  noteEl.value = rec.catatan||'';
  document.getElementById('izin-overlay').classList.add('show');
  document.getElementById('izin-popup').classList.add('show');
  setTimeout(function(){ noteEl.focus(); }, 80);
}

function closeIzinPopup(){
  document.getElementById('izin-overlay').classList.remove('show');
  document.getElementById('izin-popup').classList.remove('show');
  _izinNama = ''; _izinCtx = '';
}

function fillIzinPopup(val){
  var el = document.getElementById('izin-popup-note');
  if(el){ el.value = val; el.focus(); }
}

function saveIzinPopup(){
  if(!_izinNama) return;
  var val = document.getElementById('izin-popup-note').value.trim();
  if(!sesiData[absenTgl]) sesiData[absenTgl]={};
  if(!sesiData[absenTgl][_izinNama]) sesiData[absenTgl][_izinNama]={};
  sesiData[absenTgl][_izinNama].status  = 'I';
  sesiData[absenTgl][_izinNama].catatan = val;
  fbSaveSesi(absenTgl);
  var ctx = _izinCtx;
  closeIzinPopup();
  redraw(ctx);
}

function ipBtn(ic, svgId, label, action){
  return '<button class="ip-btn" onclick="'+action+'">'+
    '<span class="ip-icon '+ic+'"><svg class="ico" style="width:13px;height:13px"><use href="#ico-'+svgId+'"></use></svg></span>'+label+'</button>';
}

// ── Panel Control ──
function togglePanel(key, ctx){ openPanel = (openPanel===key) ? null : key; redraw(ctx); }
function openNote(nama, ctx){ openPanel = eid(nama)+'|note'; redraw(ctx); }
function closePanel(ctx){ openPanel=null; redraw(ctx); }

// ── Status Mutation ──
function setStatus(nama, s, ctx){
  if(!sesiData[absenTgl]) sesiData[absenTgl]={};
  if(!sesiData[absenTgl][nama]) sesiData[absenTgl][nama]={};
  sesiData[absenTgl][nama].status = s;
  if(s!=='I') delete sesiData[absenTgl][nama].catatan;
  fbSaveSesi(absenTgl);
  openPanel=null; redraw(ctx);
  setTimeout(function(){
    var key     = eid(nama);
    var wrapper = document.getElementById('abitem-'+ctx+'-'+key);
    if(wrapper){
      var btn = wrapper.querySelector('.sp');
      if(btn){ btn.classList.remove('sp-pop'); void btn.offsetWidth; btn.classList.add('sp-pop'); }
    }
  }, 30);
}

function setStatusIzin(nama, ctx){
  if(!sesiData[absenTgl]) sesiData[absenTgl]={};
  if(!sesiData[absenTgl][nama]) sesiData[absenTgl][nama]={};
  sesiData[absenTgl][nama].status = 'I';
  fbSaveSesi(absenTgl);
  openPanel = eid(nama)+'|note';
  redraw(ctx);
}

function clearStatus(nama, ctx){
  if(sesiData[absenTgl]&&sesiData[absenTgl][nama]){
    delete sesiData[absenTgl][nama].status;
    delete sesiData[absenTgl][nama].catatan;
  }
  fbSaveSesi(absenTgl);
  openPanel=null; redraw(ctx);
}

function saveNote(nama, ctx){
  var key = eid(nama);
  var val = document.getElementById('fNote-'+ctx+'-'+key).value.trim();
  if(!sesiData[absenTgl]) sesiData[absenTgl]={};
  if(!sesiData[absenTgl][nama]) sesiData[absenTgl][nama]={};
  sesiData[absenTgl][nama].catatan = val;
  fbSaveSesi(absenTgl);
  openPanel=null; redraw(ctx);
}

function fillNote(ctx, key, val){
  var el = document.getElementById('fNote-'+ctx+'-'+key);
  if(el){ el.value = val; el.focus(); }
}

function redraw(ctx){
  if(ctx==='mob'||ctx==='mob-p'||ctx==='mob-l') renderAbsenMob();
  else renderAbsenPc();
}

// ── PC render ──
function renderAbsenPc(){
  var d = new Date(tglDate(absenTgl)+'T00:00:00');
  var s = HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[absenBulan]+' '+absenTahun;
  if(absenKet) s += ' · '+absenKet;
  var dateEl = document.getElementById('pc-absen-date'); if(dateEl) dateEl.textContent=s;
  var cEl    = document.getElementById('pc-absen-ctr');  if(cEl)    cEl.innerHTML=counterHtml();
  var siEl   = document.getElementById('pc-selesai-info'); if(siEl) siEl.innerHTML=selesaiInfo();

  var P = members.filter(function(m){ return m.gender==='P'; });
  var L = members.filter(function(m){ return m.gender==='L'; });
  var hp=''; P.forEach(function(m){ hp+=buildItem(m,'pc-p'); });
  var hl=''; L.forEach(function(m){ hl+=buildItem(m,'pc-l'); });
  var cp = document.getElementById('pc-col-p'); if(cp) cp.innerHTML=hp||'<div class="empty">-</div>';
  var cl = document.getElementById('pc-col-l'); if(cl) cl.innerHTML=hl||'<div class="empty">-</div>';
}

// ── Mobile render ──
function setAbsenGender(g){
  absenGender=g; openPanel=null;
  document.querySelectorAll('.mseg').forEach(function(b){ b.classList.remove('on'); });
  var el = document.getElementById('mseg-'+g); if(el) el.classList.add('on');
  renderAbsenMob();
}

function renderAbsenMob(){
  var listEl = document.getElementById('mob-absen-list');
  if(listEl && !listEl.dataset.loaded){ listEl.innerHTML=skeletonHtml(6); }
  if(listEl) listEl.dataset.loaded='1';
  var cEl   = document.getElementById('mob-absen-ctr');   if(cEl)   cEl.innerHTML=counterHtml();
  var d     = new Date(tglDate(absenTgl)+'T00:00:00');
  var s     = HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[absenBulan]+' '+absenTahun;
  if(absenKet) s += ' · '+absenKet;
  var dEl   = document.getElementById('mob-absen-date');  if(dEl)   dEl.textContent=s;
  var titleEl=document.getElementById('mob-absen-title'); if(titleEl) titleEl.textContent=absenKet||'Absensi';
  var siEl  = document.getElementById('mob-selesai-info'); if(siEl)  siEl.innerHTML=selesaiInfo();
  var list  = filteredM(absenGender);
  var html  = '';
  if(absenGender==='S'){
    var P = list.filter(function(m){ return m.gender==='P'; });
    var L = list.filter(function(m){ return m.gender==='L'; });
    if(P.length){ html+='<div class="sec-title">'+glabel('P')+'</div>'; P.forEach(function(m){ html+=buildItem(m,'mob'); }); }
    if(L.length){ html+='<div class="sec-title">'+glabel('L')+'</div>'; L.forEach(function(m){ html+=buildItem(m,'mob'); }); }
  } else {
    if(list.length) html+='<div class="sec-title">'+glabel(absenGender)+'</div>';
    list.forEach(function(m){ html+=buildItem(m,'mob'); });
  }
  var el = document.getElementById('mob-absen-list');
  if(el) el.innerHTML=html||'<div class="empty">Tidak ada.</div>';
}
