// ══════════════════════════════════════════════════
// SESI / ABSENSI MODULE
// ══════════════════════════════════════════════════

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

  if(!sL.length) return '<div class="empty">'+(Object.keys(sesiData).length?'Tidak ada sesi yang cocok.':'Belum ada sesi absensi.')+'</div>';

  var aktif = activeMembers();
  var html='';
  var lastSection='';

  sL.forEach(function(t){
    var label = sesiLabel(t);
    var ket   = sesiKet[t]||'';
    var sesi  = sesiData[t]||{};
    var h=0,iz=0,al=0,blm=0;
    aktif.forEach(function(m){
      var v=(sesi[m.nama]||{}).status||'';
      if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++; else blm++;
    });

    if(!q&&!fBln&&!fThn){
      var d   = new Date(tglDate(t)+'T00:00:00');
      var sec = BULAN[d.getMonth()+1]+' '+d.getFullYear();
      if(sec!==lastSection){ lastSection=sec; html+='<div class="db-section-hd">'+sec+'</div>'; }
    }

    html+='<div class="swipe-row" data-key="'+t+'">'+
      '<div class="swipe-reveal"><span>🗑 Hapus</span></div>'+
      '<div class="swipe-content db-item" onclick="editSesi(\''+t+'\')" style="cursor:pointer">'+
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
      '</div>'+
    '</div>';
  });
  return html;
}

function renderDb(){
  var el = document.getElementById('dbList');
  if(el){
    el.innerHTML = dbHtml('');
    initSwipeRows(el, function(r){ return r.getAttribute('data-key'); }, function(k){ hapusSesi(k); });
  }
}

function renderDbMob(){
  var el = document.getElementById('dbListM');
  if(el){
    el.innerHTML = dbHtml('M');
    initSwipeRows(el, function(r){ return r.getAttribute('data-key'); }, function(k){ hapusSesi(k); });
  }
}

function hapusSesi(tgl){
  var label = sesiLabel(tgl);
  appConfirm('Hapus sesi '+label+'?\nSemua data kehadiran akan terhapus permanen.', function(){
    function doDelete(){
      logActivity('sesi', 'Hapus '+label);
      delete sesiData[tgl];
      delete sesiKet[tgl];
      fbDelSesi(tgl);
      renderDb(); renderDbMob();
      try { renderRekap('pc'); } catch(e){}
      try { renderRekap('mob'); } catch(e){}
      try { renderDashboard(); } catch(e){}
    }
    var rows = document.querySelectorAll('.swipe-row[data-key="'+tgl+'"]');
    if(rows.length){
      var n = rows.length;
      rows.forEach(function(r){ animateRemove(r, function(){ if(--n===0) doDelete(); }); });
    } else doDelete();
  }, {title:'Hapus Sesi', icon:'trash', color:'red'});
}

function editSesi(tgl){
  var d      = new Date(tglDate(tgl)+'T00:00:00');
  absenTgl = tgl;
  absenBulan = d.getMonth()+1;
  absenTahun = d.getFullYear();
  absenKet   = sesiKet[tgl]||'';
  _absenDirty = false;
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
  openPop('editsesi-overlay','editsesi-popup');
  setTimeout(function(){ if(ketEl) ketEl.focus(); }, 80);
}

function closeEditSesiPopup(){
  closePop('editsesi-overlay','editsesi-popup');
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
  _absenDirty = true;
  closeEditSesiPopup();
  if(mob()){ renderAbsenMob(); } else { renderAbsenPc(); }
  syncRekapFilter();
  renderDb(); renderDbMob();
  try { renderRekap('pc'); } catch(e){}
  try { renderRekap('mob'); } catch(e){}
  try { renderDashboard(); } catch(e){}
}
