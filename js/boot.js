// ══════════════════════════════════════════════════
// BOOT — DOMContentLoaded + auto-login
// ══════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('pg-login').style.display = 'none';
  document.getElementById('pg-app').style.display   = 'none';

  var savedU = localStorage.getItem('saved_user');
  var found  = savedU ? USERS.find(function(x){ return x.username===savedU; }) : null;

  function showApp(){
    var ls = document.getElementById('loading-screen');
    if(ls) ls.classList.add('fade-out');
    setTimeout(function(){
      if(found){
        currentUser = found;
        masukApp();
      } else {
        document.getElementById('pg-login').style.display = '';
        if(savedU){
          var uEl = document.getElementById('loginUser');
          if(uEl) uEl.value = savedU;
        }
      }
    }, 420);
  }

  function waitForFirebase(){
    if(window._firebaseReady){
      fbInit();
      var waited = 0;
      var timer = setInterval(function(){
        waited += 100;
        if(waited >= 2500){ clearInterval(timer); showApp(); return; }
        if(_fbUnsubSesi !== null){ clearInterval(timer); showApp(); }
      }, 100);
    } else {
      document.addEventListener('firebase-ready', function(){
        fbInit();
        var waited = 0;
        var timer = setInterval(function(){
          waited += 100;
          if(waited >= 2500){ clearInterval(timer); showApp(); return; }
          if(_fbUnsubSesi !== null){ clearInterval(timer); showApp(); }
        }, 100);
      }, {once:true});
      setTimeout(function(){
        if(!_fbReady){ console.warn('Firebase timeout, lanjut tanpa sync.'); setSyncStatus('off'); showApp(); }
      }, 5000);
    }
  }

  window.addEventListener('online',  function(){ setSyncStatus('ok');  });
  window.addEventListener('offline', function(){ setSyncStatus('off'); });

  setTimeout(waitForFirebase, 800);
});
