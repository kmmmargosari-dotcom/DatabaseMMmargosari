// ══════════════════════════════════════════════════
// SESI / DATABASE MODULE
// ══════════════════════════════════════════════════

var _dbPinned = {};
try { _dbPinned = JSON.parse(localStorage.getItem('db_pinned')||'{}'); } catch(e){}

function togglePin(t){
  if(_dbPinned[t]) delete _dbPinned[t]; else _dbPinned[t]=1;
  try { localStorage.setItem('db_pinned', JSON.stringify(_dbPinned)); } catch(e){}
  renderDb(); renderDbMob();
}

function dbHtml(suffix){
  suffix = suffix||'';
  var searchEl = document.getElementById('dbSearch'+suffix);
  var bulanEl  = document.getElementById('dbFilterBulan'+suffix);
  var tahunEl  = document.getElementById('dbFilterTahun'+suffix);
  var sortEl   = document.getElementById('dbSort'+suffix);

  var q     = searchEl ? searchEl.value.trim().toLowerCase() : '';
  var fBln  = bulanEl  ? bulanEl.value  : '';
  var fThn  = tahunEl  ? tahunEl.value  : '';
  var sortD = sortEl   ? sortEl.value   : 'desc';

  var sL = Object.keys(sesiData);

  if(fBln||fThn){
    sL = sL.filter(function(t){
      var d     = tglDate(t);
      var parts = d.split('-');
      if(fThn && parts[0]!==fThn) return false;
      if(fBln && parts[1]!==fBln) return false;
      return true;
    });
  }

  if(q){
    sL = sL.filter(function(t){
      var ket = (sesiKet[t]||'').toLowerCase();
      var lbl = sesiLabel(t).toLowerCase();
      return ket.indexOf(q)>=0 || lbl.indexOf(q)>=0;
    });
  }

  sL.sort(function(a,b){ return sortD==='asc' ? (a<b?-1:a>b?1:0) : (a>b?-1:a<b?1:0); });

  var pinned  = sL.filter(function(t){ return _dbPinned[t]; });
  var normal  = sL.filter(function(t){ return !_dbPinned[t]; });
  var ordered = pinned.concat(normal);

  if(!ordered.length) return '<div class="empty">'+(Object.keys(sesiData).length?'Tidak ada sesi yang cocok.':'Belum ada sesi absensi.')+'</div>';

  var html='';
  var lastSection='';

  ordered.forEach(function(t){
    var label    = sesiLabel(t);
    var ket      = sesiKet[t]||'';
    var sesi     = sesiData[t]||{};
    var isPinned = !!_dbPinned[t];
    var h=0,iz=0,al=0,blm=0;
    members.forEach(function(m){
      var v=(sesi[m.nama]||{}).status||'';
      if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++; else blm++;
    });

    if(!q&&!fBln&&!fThn&&!isPinned){
      var d   = new Date(tglDate(t)+'T00:00:00');
      var sec = BULAN[d.getMonth()+1]+' '+d.getFullYear();
      if(sec!==lastSection){ lastSection=sec; html+='<div class="db-section-hd">'+sec+'</div>'; }
    } else if(isPinned&&lastSection!=='__pinned__'){
      lastSection='__pinned__';
      html+='<div class="db-section-hd" style="color:var(--gold-dk)">📌 Disematkan</div>';
    }

    var pinIcon  = isPinned ? '📌' : '📍';
    var pinTitle = isPinned ? 'Lepas pin' : 'Sematkan';
    var pinBtn   = '<button onclick="togglePin(\''+t+'\')" title="'+pinTitle+'" style="font-size:12px;padding:3px 7px;background:none;border:1px solid var(--border);border-radius:5px;cursor:pointer;color:var(--text3)">'+pinIcon+'</button>';
    var delBtn   = window._canDelete
      ? '<button class="btn-danger" onclick="hapusSesi(\''+t+'\')" style="font-size:11px;padding:4px 9px">Hapus</button>'
      : '';

    html+='<div class="db-item"'+(isPinned?' style="border-left:3px solid var(--gold-dk);padding-left:10px"':'')+'>'+
      '<div class="db-info">'+
        '<div class="db-name">'+label+'</div>'+
        (ket?'<div class="db-ket">'+escHtml(ket)+'</div>':'')+
        '<div class="db-sub">'+(h+iz+al)+' diisi &nbsp;·&nbsp; '+blm+' belum</div>'+
      '</div>'+
      '<div class="db-badges">'+
        (h?'<span class="badge bh">'+h+'H</span>':'')+
        (iz?'<span class="badge bi">'+iz+'I</span>':'')+
        (al?'<span class="badge ba">'+al+'A</span>':'')+
      '</div>'+
      '<div class="db-actions">'+
        pinBtn+
        '<button onclick="editSesi(\''+t+'\')" style="font-size:11px;padding:4px 9px">Edit</button>'+
        delBtn+
      '</div>'+
    '</div>';
  });
  return html;
}

function renderDb(){
  var el = document.getElementById('dbList');
  if(el) el.innerHTML = dbHtml('');
}

function renderDbMob(){
  var el = document.getElementById('dbListM');
  if(el) el.innerHTML = dbHtml('M');
}

function hapusSesi(tgl){
  var label = sesiLabel(tgl);
  appConfirm('Hapus sesi '+label+'?\nSemua data kehadiran akan terhapus permanen.', function(){
    logActivity('sesi', 'Hapus '+label);
    delete sesiData[tgl];
    delete sesiKet[tgl];
    fbDelSesi(tgl);
    renderDb(); renderDbMob();
    try { renderRekap('pc'); } catch(e){}
    try { renderRekap('mob'); } catch(e){}
    try { renderDashboard(); } catch(e){}
  }, {title:'Hapus Sesi', icon:'trash', color:'red'});
}

function editSesi(tgl){
  var d      = new Date(tglDate(tgl)+'T00:00:00');
  absenTgl = tgl;
  absenBulan = d.getMonth()+1;
  absenTahun = d.getFullYear();
  absenKet   = sesiKet[tgl]||'';
  openPanel  = null;
  if(mob()){
    goMob('absen-page');
    renderAbsenMob();
  } else {
    var sTglEl = document.getElementById('sTgl'); if(sTglEl) sTglEl.value = tglDate(tgl);
    var sKetEl = document.getElementById('sKet'); if(sKetEl) sKetEl.value = absenKet;
    goPc('absen');
    showAbsenBody();
    renderAbsenPc();
  }
}

// Ubah nama kegiatan dan/atau tanggal sesi yang sedang dibuka (baik sesi
// baru maupun sesi lama yang dibuka lewat "Edit" dari halaman Sesi).
// Migrasi seluruh data kehadiran ke key sesi yang baru bila tanggal diubah.
function openEditSesiPopup(){
  if(!absenTgl) return;
  var tglEl = document.getElementById('esTgl'); if(tglEl) tglEl.value = tglDate(absenTgl);
  var ketEl = document.getElementById('esKet'); if(ketEl) ketEl.value = absenKet||'';
  var warnEl= document.getElementById('esWarn'); if(warnEl){ warnEl.style.display='none'; warnEl.textContent=''; }
  document.getElementById('editsesi-overlay').classList.add('show');
  document.getElementById('editsesi-popup').classList.add('show');
  setTimeout(function(){ if(ketEl) ketEl.focus(); }, 80);
}

function closeEditSesiPopup(){
  document.getElementById('editsesi-overlay').classList.remove('show');
  document.getElementById('editsesi-popup').classList.remove('show');
}

function submitEditSesiDetail(){
  if(!absenTgl) return;
  var warnEl = document.getElementById('esWarn');
  function warn(msg){ if(warnEl){ warnEl.textContent=msg; warnEl.style.display='block'; } }

  var keyLama = absenTgl;
  var suffix  = keyLama.indexOf('_')>-1 ? keyLama.split('_')[1] : null;

  var tglBaru = (document.getElementById('esTgl').value||'').trim();
  var ketBaru = (document.getElementById('esKet').value||'').trim();

  if(!/^\d{4}-\d{2}-\d{2}$/.test(tglBaru)){
    warn('Tanggal belum valid, silakan pilih tanggal terlebih dahulu.');
    return;
  }

  var keyBaru = suffix ? (tglBaru+'_'+suffix) : tglBaru;

  if(keyBaru !== keyLama){
    if(sesiData[keyBaru]){
      warn('Tanggal tersebut sudah punya sesi lain ("'+(sesiKet[keyBaru]||'tanpa nama')+'"). Pilih tanggal lain, atau edit sesi tersebut langsung dari halaman Sesi.');
      return;
    }
    sesiData[keyBaru] = sesiData[keyLama] || {};
    delete sesiData[keyLama];
    sesiKet[keyBaru] = ketBaru;
    delete sesiKet[keyLama];
    if(_dbPinned[keyLama]){ _dbPinned[keyBaru] = 1; delete _dbPinned[keyLama]; try{ localStorage.setItem('db_pinned', JSON.stringify(_dbPinned)); }catch(e){} }

    fbSaveSesi(keyBaru);
    fbDelSesi(keyLama);
    logActivity('sesi', 'Ubah sesi '+sesiLabel(keyLama)+' → '+sesiLabel(keyBaru));

    var d = new Date(tglBaru+'T00:00:00');
    absenTgl = keyBaru; absenBulan = d.getMonth()+1; absenTahun = d.getFullYear();
  } else if(ketBaru !== absenKet){
    sesiKet[keyLama] = ketBaru;
    fbSaveSesi(keyLama);
    logActivity('sesi', 'Ubah nama kegiatan: '+(absenKet||'(tanpa nama)')+' → '+(ketBaru||'(tanpa nama)'));
  } else {
    closeEditSesiPopup();
    return; // tidak ada perubahan
  }

  absenKet = ketBaru;
  closeEditSesiPopup();
  if(mob()){ renderAbsenMob(); } else { renderAbsenPc(); }
  syncRekapFilter();
  renderDb(); renderDbMob();
  try { renderRekap('pc'); } catch(e){}
  try { renderRekap('mob'); } catch(e){}
  try { renderDashboard(); } catch(e){}
}
