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

  function waitForFirebase(){
    if(window._firebaseReady){
      fbInit();
      // Tunggu Firestore selesai load lalu cek auth state
      var waited = 0;
      var timer = setInterval(function(){
        waited += 100;
        var fsReady = (_fbUnsubSesi !== null) || waited >= 2500;
        if(fsReady){
          clearInterval(timer);
          // Periksa session Firebase Auth
          window._fbAuthStateChanged(window._auth, function(fbUser){
            if(fbUser){
              showApp(fbUser);
            } else {
              showLogin();
            }
          });
        }
      }, 100);
    } else {
      document.addEventListener('firebase-ready', function(){
        fbInit();
        var waited = 0;
        var timer = setInterval(function(){
          waited += 100;
          var fsReady = (_fbUnsubSesi !== null) || waited >= 2500;
          if(fsReady){
            clearInterval(timer);
            window._fbAuthStateChanged(window._auth, function(fbUser){
              if(fbUser){
                showApp(fbUser);
              } else {
                showLogin();
              }
            });
          }
        }, 100);
      }, {once:true});
      // Fallback jika Firebase timeout
      setTimeout(function(){
        if(!_fbReady){
          console.warn('Firebase timeout, tampilkan login.');
          setSyncStatus('off');
          showLogin();
        }
      }, 5000);
    }
  }

  window.addEventListener('online',  function(){ setSyncStatus('ok');  });
  window.addEventListener('offline', function(){ setSyncStatus('off'); });

  setTimeout(waitForFirebase, 800);
});
