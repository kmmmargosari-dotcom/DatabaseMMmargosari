// ══════════════════════════════════════════════════
// SESI / DATABASE MODULE
// ══════════════════════════════════════════════════

var _dbPinned = {};
try { _dbPinned = JSON.parse(localStorage.getItem('db_pinned')||'{}'); } catch(e){}

function togglePin(t){
  if(_dbPinned[t]) delete _dbPinned[t]; else _dbPinned[t]=1;
  try { localStorage.setItem('db_pinned', JSON.stringify(_dbPinned)); } catch(e){}
  fbSavePinned(_dbPinned);
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
        (ket?'<div class="db-ket">'+ket+'</div>':'')+
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
  if(!confirm('Hapus sesi '+label+'?\nSemua data kehadiran akan terhapus permanen.')) return;
  delete sesiData[tgl];
  delete sesiKet[tgl];
  fbDelSesi(tgl);
  renderDb(); renderDbMob();
}

function editSesi(tgl){
  var d    = new Date(tglDate(tgl)+'T00:00:00');
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
