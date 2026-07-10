// ══════════════════════════════════════════════════
// DATA — shared state & constants
// ══════════════════════════════════════════════════

var members = [
  {nama:'ARISKA NURVINAHARI',gender:'P'},{nama:'ENI ISWANTI',gender:'P'},
  {nama:'FITRI NURASTUTI',gender:'P'},{nama:'ILMA WULAN RAMADHANI',gender:'P'},
  {nama:'INA OKTAVIANI',gender:'P'},{nama:'NAZHWA ALIYA PUTRI',gender:'P'},
  {nama:'RISTYANINGSIH',gender:'P'},{nama:'USWATUN HASANAH',gender:'P'},
  {nama:'WENI SALATSUL HUSNA',gender:'P'},{nama:'ALVIANA',gender:'P'},
  {nama:'ANISA FEBRIYANTI',gender:'P'},{nama:'LUTFI NUR AFIFAH',gender:'P'},
  {nama:'IDA NURLATIFAH',gender:'P'},{nama:'BIENDA PRATIKASIWI',gender:'P'},
  {nama:'EVI RYSKA AFRIYANI',gender:'P'},{nama:'OKTAFIA CESAR LARASATI',gender:'P'},
  {nama:'SOFA NISABELA ANDINI',gender:'P'},{nama:'SYAHNAZ AULIA NURJANNAH',gender:'P'},
  {nama:'SYEIKHA AULIA NURRAHMAH',gender:'P'},{nama:'UKHTA IZZA AFIFAH',gender:'P'},
  {nama:'ALAM PILAROSE',gender:'L'},{nama:'ARLIS DWI MAHENDRA',gender:'L'},
  {nama:'BAYU SEPTIANTO',gender:'L'},{nama:'FIRSTA DARUL SALAM',gender:'L'},
  {nama:'NUR FAHRUDIN',gender:'L'},{nama:'SAIFUL ABIDIN',gender:'L'},
  {nama:'ZULFAN ARI SENA',gender:'L'}
];

// sesiData[tgl][nama] = {status:'H'|'I'|'A', catatan:''}
var sesiData = {};
// sesiKet[tgl] = kegiatan string
var sesiKet  = {};

var BULAN = ['','Januari','Februari','Maret','April','Mei','Juni',
             'Juli','Agustus','September','Oktober','November','Desember'];
var HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
var BULAN_ID = ['','Januari','Februari','Maret','April','Mei','Juni',
                'Juli','Agustus','September','Oktober','November','Desember'];

// Absensi state
var absenTgl    = '';
var absenBulan  = 0;
var absenTahun  = 0;
var absenKet    = '';
var absenGender = 'S';
var openPanel   = null;

// Kas data
var kasTransaksi  = [];
var kasSaldoAwal  = parseFloat(localStorage.getItem('kas_saldo_awal')) || 0;

// ── Activity Log ──
var _activityLogs = [];
var _logListeners = [];

function logActivity(aksi, detail){
  var entry = {
    id: 'log-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
    waktu: Date.now(),
    user: (currentUser&&currentUser.username)||'admin',
    aksi: aksi,
    detail: detail
  };
  _activityLogs.unshift(entry);
  if(_activityLogs.length > 500) _activityLogs.length = 500;
  try { localStorage.setItem('_activityLogs', JSON.stringify(_activityLogs)); } catch(e){}
  _logListeners.forEach(function(fn){ fn(entry); });
  if(window._fbReady) fbSaveLog(entry);
}

function renderActivityLogFor(filterAksi){
  var q = (document.getElementById('logSearch')||{}).value||'';
  var qLow = q.toLowerCase();
  var fAksi = filterAksi||(document.getElementById('logFilter')||{}).value||'';
  var sortVal = (document.getElementById('logSort')||{}).value||'desc';

  var list = _activityLogs.slice();
  if(fAksi) list = list.filter(function(e){ return e.aksi===fAksi; });
  if(q) list = list.filter(function(e){
    return e.detail.toLowerCase().indexOf(qLow)>=0 || e.user.toLowerCase().indexOf(qLow)>=0;
  });
  if(sortVal==='asc') list.reverse();

  var tbody = document.getElementById('logTbody');
  var empty = document.getElementById('logEmpty');
  if(!tbody) return;
  if(!list.length){
    tbody.innerHTML = '';
    if(empty) empty.style.display = '';
    return;
  }
  if(empty) empty.style.display = 'none';

  var h = '';
  list.forEach(function(e){
    var d = new Date(e.waktu);
    var ts = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    var ico = '';
    if(e.aksi==='absen') ico = '📋';
    else if(e.aksi==='kas') ico = '💰';
    else if(e.aksi==='anggota') ico = '👤';
    else if(e.aksi==='sesi') ico = '📅';
    else ico = '🔧';
    var aksiClass = 'log-badge log-'+e.aksi;
    var aksiLabel = e.aksi.charAt(0).toUpperCase()+e.aksi.slice(1);
    h += '<tr>'+
      '<td style="white-space:nowrap;font-size:11px;color:var(--text2)">'+ts+'</td>'+
      '<td style="white-space:nowrap">'+e.user+'</td>'+
      '<td><span class="'+aksiClass+'">'+ico+' '+aksiLabel+'</span></td>'+
      '<td style="font-size:12px">'+escHtml(e.detail)+'</td>'+
    '</tr>';
  });
  tbody.innerHTML = h;
}

function openActivityLog(){
  var overlay = document.getElementById('log-overlay');
  var popup = document.getElementById('log-popup');
  if(overlay) overlay.classList.add('show');
  if(popup){ popup.style.display='flex'; void popup.offsetWidth; popup.classList.add('show'); }
  renderActivityLogFor('');
}

function closeActivityLog(){
  var overlay = document.getElementById('log-overlay');
  var popup = document.getElementById('log-popup');
  if(overlay) overlay.classList.remove('show');
  if(popup){ popup.classList.remove('show'); popup.style.display='none'; }
}

function logExport(){
  var csv = 'Waktu,User,Aksi,Detail\n';
  _activityLogs.slice().reverse().forEach(function(e){
    var d = new Date(e.waktu);
    var ts = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    csv += '"'+ts+'","'+e.user+'","'+e.aksi+'","'+e.detail.replace(/"/g,'""')+'"\n';
  });
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download = 'Activity_Log.csv';
  a.click();
}

// ── Offline Backup ──
var _pendingCount = 0;

function backupData(){
  try {
    localStorage.setItem('_members', JSON.stringify(members));
    localStorage.setItem('_sesiData', JSON.stringify(sesiData));
    localStorage.setItem('_sesiKet', JSON.stringify(sesiKet));
    localStorage.setItem('_kasTransaksi', JSON.stringify(kasTransaksi));
    localStorage.setItem('_activityLogs', JSON.stringify(_activityLogs));
  } catch(e){ /* localStorage penuh */ }
}

function restoreData(){
  var m = localStorage.getItem('_members');
  var s = localStorage.getItem('_sesiData');
  var k = localStorage.getItem('_sesiKet');
  var t = localStorage.getItem('_kasTransaksi');
  var l = localStorage.getItem('_activityLogs');
  if(m) try { members = JSON.parse(m); } catch(e){}
  if(s) try { sesiData = JSON.parse(s); } catch(e){}
  if(k) try { sesiKet  = JSON.parse(k); } catch(e){}
  if(t) try { kasTransaksi = JSON.parse(t); } catch(e){}
  if(l) try { _activityLogs = JSON.parse(l); } catch(e){}
}

function getPendingCount(){
  return _pendingCount;
}

function setPendingCount(n){
  _pendingCount = n;
  var badges = [
    document.getElementById('pc-sync-badge'),
    document.getElementById('mob-sync-badge')
  ];
  badges.forEach(function(el){
    if(!el) return;
    if(navigator.onLine && n === 0){
      el.className = 'sync-badge sync-ok';
      el.textContent = '🟢 Online';
    } else if(!navigator.onLine){
      el.className = 'sync-badge sync-off';
      el.textContent = '🔴 Offline' + (n > 0 ? ' ('+n+' pending)' : '');
    } else if(n > 0){
      el.className = 'sync-badge sync-save';
      el.textContent = '🟡 ' + n + ' pending';
    }
  });
}
