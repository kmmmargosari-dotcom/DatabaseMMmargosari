// ══════════════════════════════════════════════════
// BOOT — DOMContentLoaded + auto-login via Firebase Auth
// ══════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('pg-login').style.display = 'none';
  document.getElementById('pg-app').style.display   = 'none';

  function showLogin(){
    var ls = document.getElementById('loading-screen');
    if(ls) ls.classList.add('fade-out');
    setTimeout(function(){
      document.getElementById('pg-login').style.display = '';
      // Isi username dari localStorage bila ada
      var savedU = localStorage.getItem('saved_user');
      if(savedU){
        var uEl = document.getElementById('loginUser');
        if(uEl) uEl.value = savedU;
      }
    }, 420);
  }

  function showApp(fbUser){
    var ls = document.getElementById('loading-screen');
    if(ls) ls.classList.add('fade-out');
    setTimeout(function(){
      // Tentukan username dari email Firebase
      var savedU = localStorage.getItem('saved_user') || 'admin';
      currentUser = { username: savedU, nama: 'Administrator' };
      masukApp();
    }, 420);
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
          } else if(localStorage.getItem('_members')){
            var savedU = localStorage.getItem('saved_user') || 'admin';
            currentUser = { username: savedU, nama: 'Administrator' };
            masukApp();
          } else {
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
