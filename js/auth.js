// ══════════════════════════════════════════════════
// AUTH — login & logout via Firebase Authentication
// Username "admin"  →  kmmmargosari@gmail.com
// ══════════════════════════════════════════════════

var currentUser = null;

// Peta username ke email Firebase
var USERNAME_MAP = {
  'admin': 'kmmmargosari@gmail.com'
};

function doLogin(){
  var username = document.getElementById('loginUser').value.trim().toLowerCase();
  var password = document.getElementById('loginPass').value;
  var err      = document.getElementById('loginErr');

  // Validasi username sebelum menyentuh Firebase
  var email = USERNAME_MAP[username];
  if(!email){
    err.textContent = 'Username tidak ditemukan.';
    document.getElementById('loginPass').value = '';
    var btn = document.querySelector('#pg-login .btn-p');
    if(btn){ btn.classList.add('shake'); setTimeout(function(){ btn.classList.remove('shake'); }, 400); }
    return;
  }

  err.textContent = '';
  var btn = document.querySelector('#pg-login .btn-p');
  if(btn) btn.disabled = true;

  window._fbSignIn(window._auth, email, password)
    .then(function(credential){
      currentUser = { username: username, nama: 'Administrator' };
      var remember = document.getElementById('rememberMe');
      if(remember && remember.checked){
        localStorage.setItem('saved_user', username);
      } else {
        localStorage.removeItem('saved_user');
      }
      document.getElementById('loginPass').value = '';
      masukApp();
    })
    .catch(function(e){
      var msg = 'Username atau password salah.';
      if(e.code === 'auth/network-request-failed') msg = 'Tidak ada koneksi internet.';
      err.textContent = msg;
      document.getElementById('loginPass').value = '';
      if(btn){ btn.classList.add('shake'); setTimeout(function(){ btn.classList.remove('shake'); }, 400); }
    })
    .finally(function(){
      if(btn) btn.disabled = false;
    });
}

function masukApp(){
  document.getElementById('pg-login').style.display = 'none';
  document.getElementById('pg-app').style.display   = '';
  applyRole();
  initApp();
}

function loginEnter(e){ if(e.key==='Enter') doLogin(); }

function doLogout(){
  if(!confirm('Yakin mau keluar?')) return;
  window._fbSignOut(window._auth).then(function(){
    currentUser = null;
    localStorage.removeItem('saved_user');
    document.getElementById('pg-app').style.display   = 'none';
    document.getElementById('pg-login').style.display = '';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').textContent   = '';
  }).catch(function(e){
    console.error('Logout error', e);
  });
}

function applyRole(){
  var nama = currentUser ? currentUser.nama : 'Administrator';
  document.querySelectorAll('.js-uname').forEach(function(el){ el.textContent = nama; });
  document.querySelectorAll('.js-urole').forEach(function(el){ el.textContent = ''; });
  document.querySelectorAll('.js-uinit').forEach(function(el){ el.textContent = nama[0]; });
  // Semua pengguna mendapat akses penuh
  document.querySelectorAll('.need-absen').forEach(function(el){ el.style.display = ''; });
  document.querySelectorAll('.need-admin').forEach(function(el){ el.style.display = ''; });
  window._canDelete = true;
}
