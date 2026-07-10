// ══════════════════════════════════════════════════
// FIREBASE HELPERS
// ══════════════════════════════════════════════════

var _fbReady        = false;
var _fbUnsubSesi    = null;
var _fbUnsubAnggota = null;
var _fbUnsubKas     = null;
var _fbUnsubLog     = null;

function fsDb(){ return window._db; }

// ── SYNC STATUS BADGE ──
var _syncTimer = null;
function setSyncStatus(state){
  if(state === 'ok'){
    document.querySelectorAll('.sync-badge').forEach(function(el){
      el.className = 'sync-badge sync-ok';
      el.textContent = '🟢 Online';
    });
  } else if(state === 'off'){
    setPendingCount(getPendingCount());
  } else if(state === 'save'){
    document.querySelectorAll('.sync-badge').forEach(function(el){
      el.className = 'sync-badge sync-save';
      el.textContent = '🔄 Syncing...';
    });
  }
}

function _syncWrite(promise){
  setPendingCount(getPendingCount() + 1);
  if(_syncTimer) clearTimeout(_syncTimer);
  return promise.then(function(){
    setPendingCount(Math.max(0, getPendingCount() - 1));
    updateSyncFromOnline();
  }).catch(function(e){
    console.error('Firebase write error', e);
    updateSyncFromOnline();
  });
}

function updateSyncFromOnline(){
  setPendingCount(getPendingCount());
  _syncTimer = setTimeout(function(){
    if(navigator.onLine && getPendingCount() === 0){
      document.querySelectorAll('.sync-badge').forEach(function(el){
        el.className = 'sync-badge sync-ok';
        el.textContent = '🟢 Online';
      });
    }
  }, 4000);
}

// Simpan satu sesi ke Firestore
function fbSaveSesi(key){
  if(!_fbReady) return;
  var data = { kegiatan: sesiKet[key]||'', absensi: sesiData[key]||{} };
  _syncWrite(window._fsSet(window._fsDoc(fsDb(),'sesi',key), data));
}

// Hapus satu sesi dari Firestore
function fbDelSesi(key){
  if(!_fbReady) return;
  _syncWrite(window._fsDel(window._fsDoc(fsDb(),'sesi',key)));
}

// Simpan seluruh array members ke Firestore
function fbSaveAnggota(){
  if(!_fbReady) return;
  _syncWrite(window._fsSet(window._fsDoc(fsDb(),'anggota','list'), { members: members }));
}

// Simpan satu transaksi kas ke Firestore
function fbSaveKas(id, data){
  if(!_fbReady) return;
  _syncWrite(window._fsSet(window._fsDoc(fsDb(),'kas',id), data));
}

// Hapus satu transaksi kas dari Firestore
function fbDelKas(id){
  if(!_fbReady) return;
  _syncWrite(window._fsDel(window._fsDoc(fsDb(),'kas',id)));
}

// Simpan activity log ke Firestore
function fbSaveLog(entry){
  if(!_fbReady) return;
  _syncWrite(window._fsSet(window._fsDoc(fsDb(),'log',entry.id), {
    waktu: entry.waktu,
    user: entry.user,
    aksi: entry.aksi,
    detail: entry.detail
  }));
}

// Mulai listen realtime Firestore
function fbStartListeners(){
  // --- Sesi ---
  _fbUnsubSesi = window._fsSnap(window._fsCol(fsDb(),'sesi'), function(snap){
    sesiData = {};
    sesiKet  = {};
    snap.forEach(function(d){
      var dat = d.data();
      sesiData[d.id] = dat.absensi || {};
      sesiKet[d.id]  = dat.kegiatan || '';
    });
    backupData();
    try { renderRekap('pc'); } catch(e){}
    try { renderRekap('mob'); } catch(e){}
    try { renderDb(); renderDbMob(); } catch(e){}
    try { renderDashboard(); } catch(e){}
  }, function(e){ console.error('fbSnap sesi',e); });

  // --- Kas ---
  _fbUnsubKas = window._fsSnap(window._fsCol(fsDb(),'kas'), function(snap){
    kasTransaksi = [];
    snap.forEach(function(d){
      var dat = d.data();
      kasTransaksi.push({
        id: d.id,
        jenis: dat.jenis||'pemasukan',
        nominal: dat.nominal||0,
        tanggal: dat.tanggal||'',
        keterangan: dat.keterangan||'',
        createdAt: dat.createdAt||0
      });
    });
    backupData();
    if(kasTransaksi.length === 0) seedKasData();
    try { renderKas(); } catch(e){ console.error('renderKas',e); }
  }, function(e){ console.error('fbSnap kas',e); });

  // --- Anggota ---
  _fbUnsubAnggota = window._fsSnap(window._fsDoc(fsDb(),'anggota','list'), function(snap){
    if(snap.exists()){
      var dat = snap.data();
      if(dat.members && dat.members.length){ members = dat.members; }
    }
    backupData();
    try { renderAnggota(); } catch(e){}
    try { renderAnggotaMob(); } catch(e){}
    try { renderDashboard(); } catch(e){}
  }, function(e){ console.error('fbSnap anggota',e); });

  // --- Activity Log (hanya ambil dari user lain) ---
  _fbUnsubLog = window._fsSnap(window._fsCol(fsDb(),'log'), function(snap){
    var myName = (currentUser&&currentUser.username)||'';
    snap.docChanges().forEach(function(change){
      if(change.type==='added'){
        var dat = change.doc.data();
        if(dat.user !== myName){
          var exists = _activityLogs.some(function(e){ return e.id===change.doc.id; });
          if(!exists){
            _activityLogs.unshift({
              id: change.doc.id,
              waktu: dat.waktu||0,
              user: dat.user||'',
              aksi: dat.aksi||'',
              detail: dat.detail||''
            });
            if(_activityLogs.length > 500) _activityLogs.length = 500;
          }
        }
      }
    });
    _activityLogs.sort(function(a,b){ return b.waktu - a.waktu; });
    if(_activityLogs.length > 500) _activityLogs.length = 500;
    backupData();
  }, function(e){ console.error('fbSnap log',e); });
}

// Inisialisasi Firebase
function fbInit(){
  if(!window._db){ console.warn('Firebase DB belum siap'); return; }
  _fbReady = true;
  setSyncStatus('save');

  window._fsGetDocs(window._fsCol(fsDb(),'anggota')).then(function(aSnap){
    aSnap.forEach(function(d){
      if(d.id==='list' && d.data().members && d.data().members.length){
        members = d.data().members;
      }
    });
    return window._fsGetDocs(window._fsCol(fsDb(),'sesi'));
  }).then(function(sSnap){
    sesiData = {}; sesiKet = {};
    sSnap.forEach(function(d){
      var dat = d.data();
      sesiData[d.id] = dat.absensi || {};
      sesiKet[d.id]  = dat.kegiatan || '';
    });
    backupData();
    fbStartListeners();
    setSyncStatus('ok');
  }).catch(function(e){
    console.error('fbInit load error', e);
    // Coba restore dari localStorage
    restoreData();
    fbStartListeners();
    setPendingCount(0);
  });
}
