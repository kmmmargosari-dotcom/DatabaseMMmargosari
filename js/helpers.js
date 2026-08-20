// ══════════════════════════════════════════════════
// HELPERS — utility functions shared across modules
// ══════════════════════════════════════════════════

function initials(nama){
  return nama.split(' ').slice(0,2).map(function(w){ return w[0]; }).join('');
}
function eid(nama){ return nama.replace(/[^a-zA-Z0-9]/g,'_'); }
function glabel(g){ return g==='P'?'Perempuan':'Laki-laki'; }

function filteredM(g){
  if(!g||g==='S') return activeMembers();
  return activeMembers().filter(function(m){ return m.gender===g; });
}

function setText(id, val){
  var el = document.getElementById(id);
  if(el) el.textContent = val;
}

function escHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// Aman dipakai untuk menyisipkan string ke dalam onclick="...('...')":
// escape dulu untuk konteks string JS (kutip tunggal + backslash),
// baru escape untuk konteks atribut HTML.
function escJsAttr(s){
  var js = String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  return escHtml(js);
}

function showToast(msg, duration){
  var t = document.getElementById('app-toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.remove('toast-hide');
  void t.offsetWidth;
  t.style.display = 'flex';
  if(window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function(){
    t.classList.add('toast-hide');
    setTimeout(function(){ if(t.classList.contains('toast-hide')) t.style.display = 'none'; }, 220);
  }, duration||2200);
}

function _printWithIframe(html){
  var old = document.getElementById('_print_frame');
  if(old) old.remove();
  var f = document.createElement('iframe');
  f.id = '_print_frame';
  f.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none';
  document.body.appendChild(f);
  f.contentDocument.open();
  f.contentDocument.write(html);
  f.contentDocument.close();
  f.contentWindow.focus();
  setTimeout(function(){ f.contentWindow.print(); }, 900);
}

function fmtRp(n){
  return 'Rp\u202f'+Math.round(n||0).toLocaleString('id-ID');
}

function fmtTgl(tgl){
  if(!tgl) return '—';
  var parts = tgl.split('-');
  if(parts.length<3) return tgl;
  return parts[2]+'/'+parts[1]+'/'+parts[0];
}

function fmtTglShort(tgl){
  if(!tgl) return '—';
  var parts = tgl.split('-');
  if(parts.length<3) return tgl;
  var MBLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return parts[2]+' '+(MBLN[parseInt(parts[1],10)-1]||'')+'\''+String(parts[0]).slice(2);
}

// ── App Popup — pengganti alert()/confirm()/prompt() bawaan browser ──
// Dipakai supaya semua konfirmasi/isian pakai tampilan popup aplikasi sendiri
// (bukan popup native browser), dan tidak memblokir/mereset layar.
var _apOnOk    = null;
var _apType    = 'confirm';
var _apColors  = {
  red:   {bg:'var(--red-lt)',   fg:'var(--red)'},
  amber: {bg:'var(--amber-lt)', fg:'var(--amber)'},
  green: {bg:'var(--green-lt)', fg:'var(--green)'},
  gold:  {bg:'var(--gold-xlt)', fg:'var(--gold-dk)'}
};

function _showAppPopup(cfg){
  _apOnOk = cfg.onOk || null;
  _apType = cfg.type;
  var col = _apColors[cfg.color||'amber'] || _apColors.amber;
  var icoEl  = document.getElementById('app-popup-icon');
  var useEl  = document.getElementById('app-popup-icon-use');
  var titleEl= document.getElementById('app-popup-title');
  var msgEl  = document.getElementById('app-popup-msg');
  var inputEl= document.getElementById('app-popup-input');
  var okEl   = document.getElementById('app-popup-ok');
  var cancelEl=document.getElementById('app-popup-cancel');
  if(icoEl){ icoEl.style.background = col.bg; icoEl.style.color = col.fg; }
  if(useEl) useEl.setAttribute('href', '#ico-'+(cfg.icon||'q'));
  if(titleEl){ titleEl.textContent = cfg.title||'Konfirmasi'; titleEl.style.color = col.fg; }
  if(msgEl) msgEl.textContent = cfg.message||'';
  if(inputEl){
    if(cfg.type==='prompt'){
      inputEl.style.display = 'block';
      inputEl.value = cfg.defaultValue||'';
      inputEl.placeholder = cfg.placeholder||'';
    } else {
      inputEl.style.display = 'none';
      inputEl.value = '';
    }
  }
  if(okEl){ okEl.textContent = cfg.okText||'Ya, Lanjutkan'; okEl.style.background = (cfg.color==='red')?'var(--red)':''; okEl.style.borderColor = (cfg.color==='red')?'var(--red-dk)':''; }
  if(cancelEl) cancelEl.style.display = (cfg.type==='alert') ? 'none' : '';
  showPopup('app-popup-overlay','app-popup');
  if(cfg.type==='prompt') setTimeout(function(){ inputEl.focus(); inputEl.select(); }, 80);
}

function closeAppPopup(){
  hidePopup('app-popup-overlay','app-popup');
  _apOnOk = null;
}

function _appPopupSubmit(){
  var type = _apType, cb = _apOnOk;
  if(type==='prompt'){
    var val = document.getElementById('app-popup-input').value;
    closeAppPopup();
    if(cb) cb(val);
  } else {
    closeAppPopup();
    if(cb) cb();
  }
}

// Pengganti alert(msg) — popup informasi dengan satu tombol OK.
function appAlert(message, opts){
  opts = opts || {};
  _showAppPopup({
    type: 'alert', icon: opts.icon||'q', color: opts.color||'amber',
    title: opts.title||'Pemberitahuan', message: message,
    okText: opts.okText||'OK', onOk: opts.onOk||null
  });
}

// Pengganti confirm(msg) — onConfirm dipanggil hanya jika user menekan tombol Ya/lanjut.
function appConfirm(message, onConfirm, opts){
  opts = opts || {};
  _showAppPopup({
    type: 'confirm', icon: opts.icon||'q', color: opts.color||'red',
    title: opts.title||'Konfirmasi', message: message,
    okText: opts.okText||'Ya, Lanjutkan', onOk: onConfirm
  });
}

// Pengganti prompt(msg, def) — onSubmit(value) dipanggil hanya jika user menekan Simpan.
function appPrompt(message, defaultValue, onSubmit, opts){
  opts = opts || {};
  _showAppPopup({
    type: 'prompt', icon: opts.icon||'edit', color: opts.color||'gold',
    title: opts.title||'Isi Data', message: message, defaultValue: defaultValue||'',
    placeholder: opts.placeholder||'', okText: opts.okText||'Simpan', onOk: onSubmit
  });
}

var _popTimers = {};

// Buka popup dengan animasi masuk (fade + scale kecil). Aman dipanggil
// berulang — timer tutup yang masih berjalan dibatalkan.
function openPop(ovId, popId){
  if(_popTimers[popId]){ clearTimeout(_popTimers[popId]); delete _popTimers[popId]; }
  var ov = document.getElementById(ovId);
  var pp = document.getElementById(popId);
  if(ov){ ov.classList.remove('pop-closing'); ov.classList.add('show'); }
  if(pp){
    pp.classList.remove('pop-closing');
    pp.style.display = '';
    void pp.offsetWidth;
    pp.classList.add('show');
  }
}

// Tutup popup dengan fade-out singkat (~150ms). Selama fade, pointer-events
// dimatikan supaya tidak ada aksi ganda (mis. klik ganda tombol Simpan).
function closePop(ovId, popId){
  if(_popTimers[popId]) clearTimeout(_popTimers[popId]);
  var ov = document.getElementById(ovId);
  var pp = document.getElementById(popId);
  if(ov) ov.classList.add('pop-closing');
  if(pp) pp.classList.add('pop-closing');
  _popTimers[popId] = setTimeout(function(){
    if(ov) ov.classList.remove('show','pop-closing');
    if(pp){ pp.classList.remove('show','pop-closing'); pp.style.display='none'; }
    delete _popTimers[popId];
  }, 150);
}

function showPopup(ovId, popId){ openPop(ovId, popId); }

function hidePopup(ovId, popId){ closePop(ovId, popId); }

// Busy state untuk tombol — mencegah double-click dan memberi feedback.
function setBtnBusy(btn, busy, busyText){
  if(!btn) return;
  if(busy){
    if(btn.dataset._origHtml === undefined) btn.dataset._origHtml = btn.innerHTML;
    btn.disabled = true;
    if(busyText) btn.innerHTML = busyText+' <span class="btn-spinner"></span>';
    btn.classList.add('is-busy');
  } else {
    btn.disabled = false;
    if(btn.dataset._origHtml !== undefined) btn.innerHTML = btn.dataset._origHtml;
    btn.classList.remove('is-busy');
  }
}

// ── UPDATE NOTIFICATION ──
// Popup ini hanya muncul jika memang ada pembaruan aplikasi yang membutuhkan
// refresh. Hubungkan showUpdateNotification() ke mekanisme pengecekan update
// yang dimiliki project (mis. membandingkan versi cache vs server, atau
// metadata di service worker). Jangan dipanggil di setiap pembukaan halaman.
function showUpdateNotification(){
  showPopup('update-overlay','update-popup');
}

function closeUpdateNotification(){
  hidePopup('update-overlay','update-popup');
}

// Reload halaman — data lokal (indexedDB / cache) tidak hilang.
function refreshNow(){
  location.reload();
}

// Titik sambung untuk mekanisme pengecekan update.
// Implementasikan pemanggilan showUpdateNotification() di sini ketika update
// terdeteksi, mis. setelah membandingkan nomor build/versi.
function appCheckForUpdate(){
  if(typeof window._appUpdateCheck === 'function'){
    window._appUpdateCheck(showUpdateNotification);
  }
}

function skeletonHtml(count){
  var h='';
  for(var i=0;i<(count||5);i++){
    h+='<div class="sk-item">'+
      '<div class="sk-av"></div>'+
      '<div class="sk-lines">'+
        '<div class="sk-line"></div>'+
        '<div class="sk-line short"></div>'+
      '</div>'+
      '<div class="sk-badge"></div>'+
    '</div>';
  }
  return h;
}

function showSkeleton(elId, count){
  var el = document.getElementById(elId);
  if(el) el.innerHTML = skeletonHtml(count||5);
}

// Buat path SVG garis halus (Catmull-Rom -> Bezier) dari array titik [x,y]
function smoothLinePath(pts){
  if(!pts || pts.length < 2) return '';
  if(pts.length === 2){
    return 'M '+pts[0][0]+' '+pts[0][1]+' L '+pts[1][0]+' '+pts[1][1];
  }
  var d = 'M '+pts[0][0].toFixed(2)+' '+pts[0][1].toFixed(2)+' ';
  for(var i=0;i<pts.length-1;i++){
    var p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(pts.length-1,i+2)];
    var c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
    var c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    d+='C '+c1x.toFixed(2)+' '+c1y.toFixed(2)+', '+c2x.toFixed(2)+' '+c2y.toFixed(2)+', '+
       p2[0].toFixed(2)+' '+p2[1].toFixed(2)+' ';
  }
  return d;
}

// ══════════════════════════════════════════════════
// SWIPE TO DELETE
// Struktur item: <div class="swipe-row" data-key="...">
//   <div class="swipe-reveal">🗑 Hapus</div>
//   <div class="swipe-content" onclick="...">...</div>
// </div>
// Geser kiri sampai penuh → panggil onConfirm() (biasanya membuka konfirmasi
// hapus). Geser sebagian → kembali tertutup. Tap biasa tetap berjalan.
// ══════════════════════════════════════════════════
function attachSwipeDelete(el, onConfirm){
  if(!el || el._swipeBound) return;
  el._swipeBound = true;
  var content = el.querySelector('.swipe-content');
  var reveal  = el.querySelector('.swipe-reveal');
  var openW = (reveal && reveal.offsetWidth) || 84;
  var startX=0, curX=0, dragging=false, pointerId=null, suppressed=false;

  function setX(x){ if(content) content.style.transform='translateX('+x+'px)'; }
  function closeAnim(){
    if(content){ content.style.transition='transform .22s ease'; setX(0); setTimeout(function(){ if(content) content.style.transition=''; },240); }
  }

  el.addEventListener('pointerdown', function(e){
    if(e.pointerType==='mouse' && e.button!==0) return;
    pointerId = e.pointerId;
    startX = e.clientX; curX=0; dragging=true; suppressed=false;
    if(content) content.style.transition='';
    if(e.pointerType!=='touch' && el.setPointerCapture){ try{ el.setPointerCapture(pointerId); }catch(err){} }
  });
  el.addEventListener('pointermove', function(e){
    if(!dragging || e.pointerId!==pointerId) return;
    var dx = e.clientX - startX;
    if(dx > 0) dx = 0; // hanya geser ke kiri
    curX = dx;
    setX(dx);
    if(dx < -6) suppressed = true;
  });
  function endDrag(e){
    if(!dragging || (e && e.pointerId!==pointerId)) return;
    dragging=false; pointerId=null;
    if(curX <= -openW){
      setX(0);
      suppressed = true;
      setTimeout(function(){ if(onConfirm) onConfirm(); }, 140);
    } else {
      closeAnim();
    }
  }
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('click', function(e){
    if(suppressed){ suppressed=false; e.preventDefault(); e.stopPropagation(); return; }
    // Dengan pointer capture (mouse), klik ditargetkan ke baris, bukan ke
    // .swipe-content — teruskan ke onclick konten agar tetap jalan.
    var c = el.querySelector('.swipe-content');
    if(c && !c.contains(e.target) && typeof c.onclick === 'function'){
      c.onclick.call(c, e);
    }
  }, true);
}

// Bind swipe ke semua .swipe-row di dalam container. keyFn(row) membaca data-key.
function initSwipeRows(container, keyFn, onConfirm){
  if(!container) return;
  container.querySelectorAll('.swipe-row').forEach(function(row){
    if(row._swipeRowInit) return;
    row._swipeRowInit = true;
    attachSwipeDelete(row, function(){ onConfirm(keyFn(row)); });
  });
}
