// ══════════════════════════════════════════════════
// FIREBASE HELPERS
// ══════════════════════════════════════════════════

var _fbReady        = false;
var _fbUnsubSesi    = null;
var _fbUnsubAnggota = null;
var _fbUnsubKas     = null;

function fsDb(){ return window._db; }

// ── SYNC STATUS BADGE ──
var _syncTimer = null;
function setSyncStatus(state){
  var badges = [
    document.getElementById('pc-sync-badge'),
    document.getElementById('mob-sync-badge')
  ];
  var cfg = {
    ok:   { cls:'sync-ok',   text:'🟢 Online' },
    off:  { cls:'sync-off',  text:'🔴 Offline' },
    save: { cls:'sync-save', text:'🔄 Syncing...' }
  };
  var c = cfg[state] || cfg.ok;
  badges.forEach(function(el){
    if(!el) return;
    el.className = 'sync-badge ' + c.cls;
    el.textContent = c.text;
  });
}

function _syncWrite(promise){
  setSyncStatus('save');
  if(_syncTimer) clearTimeout(_syncTimer);
  return promise.then(function(){
    setSyncStatus(navigator.onLine ? 'ok' : 'off');
  }).catch(function(e){
    console.error('Firebase write error', e);
    setSyncStatus('off');
    _syncTimer = setTimeout(function(){
      if(navigator.onLine) setSyncStatus('ok');
    }, 4000);
  });
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
    if(kasTransaksi.length === 0) seedKasData();
    try { renderKas(); } catch(e){ console.error('renderKas',e); }
  }, function(e){ console.error('fbSnap kas',e); });

  // --- Anggota ---
  _fbUnsubAnggota = window._fsSnap(window._fsDoc(fsDb(),'anggota','list'), function(snap){
    if(snap.exists()){
      var dat = snap.data();
      if(dat.members && dat.members.length){ members = dat.members; }
    }
    try { renderAnggota(); } catch(e){}
    try { renderAnggotaMob(); } catch(e){}
    try { renderDashboard(); } catch(e){}
  }, function(e){ console.error('fbSnap anggota',e); });
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
    fbStartListeners();
    setSyncStatus('ok');
  }).catch(function(e){
    console.error('fbInit load error', e);
    setSyncStatus('off');
    fbStartListeners();
  });
}
