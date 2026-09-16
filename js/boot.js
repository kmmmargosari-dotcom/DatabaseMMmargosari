// ══════════════════════════════════════════════════
// BOOT — DOMContentLoaded + auto-login via Firebase Auth
// ══════════════════════════════════════════════════

if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('pg-login').style.display = 'none';
  document.getElementById('pg-app').style.display   = 'none';

  // Animasi logo butuh ~2 detik: kunci durasi minimal loading supaya
  // sempat terlihat. Kalau Firebase lama, tidak menambah tunggu.
  var _bootStart = Date.now();
  var LS_MIN = 2300;
  function lsDelay(){
    return Math.max(400, LS_MIN - (Date.now() - _bootStart));
  }

  function removeLoader(){
    var l = document.getElementById('loading-screen');
    if(l && l.parentNode) l.parentNode.removeChild(l);
  }

  function showLogin(){
    var ls = document.getElementById('loading-screen');
    if(ls){ ls.classList.add('fade-out'); setTimeout(removeLoader, 900); }
    setTimeout(function(){
      document.getElementById('pg-login').style.display = '';
      // Isi username dari localStorage bila ada
      var savedU = localStorage.getItem('saved_user');
      if(savedU){
        var uEl = document.getElementById('loginUser');
        if(uEl) uEl.value = savedU;
      }
    }, lsDelay());
  }

  function showApp(fbUser){
    var ls = document.getElementById('loading-screen');
    if(ls){ ls.classList.add('fade-out'); setTimeout(removeLoader, 900); }
    setTimeout(function(){
      // Tentukan username dari email Firebase
      var savedU = localStorage.getItem('saved_user') || 'admin';
      currentUser = { username: savedU, nama: 'Administrator' };
      masukApp();
    }, lsDelay());
  }

  function startAppWithFirebase(){
    fbInit();
    var waited = 0;
    var timer = setInterval(function(){
      waited += 100;
      var fsReady = (_fbUnsubSesi !== null) || waited >= 8000;
      if(fsReady){
        clearInterval(timer);
        window._fbAuthStateChanged(window._auth, function(fbUser){
          if(fbUser){
            showApp(fbUser);
          } else {
            // Firebase Auth aktif dan memastikan TIDAK ada sesi login.
            // Jangan bypass ke masukApp() hanya karena ada cache localStorage —
            // arahkan ke halaman login. Cache tetap tersimpan untuk dipakai
            // otomatis setelah login berhasil.
            showLogin();
          }
        });
      }
    }, 100);
    // Fallback jika Firebase timeout
    setTimeout(function(){
      if(!_fbReady){
        console.warn('Firebase timeout.');
        setSyncStatus('off');
        var savedU = localStorage.getItem('saved_user');
        if(savedU && localStorage.getItem('_members')){
          restoreData();
          currentUser = { username: savedU, nama: 'Administrator' };
          masukApp();
        } else {
          showLogin();
        }
      }
    }, 5000);
  }

  function waitForFirebase(){
    if(window._firebaseReady){
      startAppWithFirebase();
    } else {
      document.addEventListener('firebase-ready', function(){
        startAppWithFirebase();
      }, {once:true});
    }
  }

  window.addEventListener('online',  function(){ setPendingCount(getPendingCount()); });
  window.addEventListener('offline', function(){ setPendingCount(getPendingCount()); });

  setTimeout(waitForFirebase, 800);
});
