// ══════════════════════════════════════════════════
// AUTH — login, logout, roles
// ══════════════════════════════════════════════════

var USERS = [
  { username:'admin',    password:'kmm2026',    role:'admin',    nama:'Administrator' },
  { username:'pengurus', password:'pengurus123', role:'pengurus', nama:'Pengurus' },
  { username:'viewer',   password:'viewer123',   role:'viewer',   nama:'Viewer' }
];
var currentUser = null;

function doLogin(){
  var u   = document.getElementById('loginUser').value.trim().toLowerCase();
  var p   = document.getElementById('loginPass').value;
  var err = document.getElementById('loginErr');
  var found = USERS.find(function(x){ return x.username===u && x.password===p; });
  if(!found){
    err.textContent = 'Username atau password salah.';
    document.getElementById('loginPass').value = '';
    var btn = document.querySelector('#pg-login .btn-p');
    if(btn){ btn.classList.add('shake'); setTimeout(function(){ btn.classList.remove('shake'); }, 400); }
    return;
  }
  currentUser = found;
  var remember = document.getElementById('rememberMe');
  if(remember && remember.checked){
    localStorage.setItem('saved_user', found.username);
  } else {
    localStorage.removeItem('saved_user');
  }
  err.textContent = '';
  document.getElementById('loginPass').value = '';
  masukApp();
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
  currentUser = null;
  localStorage.removeItem('saved_user');
  document.getElementById('pg-app').style.display   = 'none';
  document.getElementById('pg-login').style.display = '';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').textContent = '';
}

function applyRole(){
  var isAdmin  = currentUser.role === 'admin';
  var canAbsen = currentUser.role !== 'viewer';
  document.querySelectorAll('.js-uname').forEach(function(el){ el.textContent = currentUser.nama; });
  document.querySelectorAll('.js-urole').forEach(function(el){ el.textContent = currentUser.role; });
  document.querySelectorAll('.js-uinit').forEach(function(el){ el.textContent = currentUser.nama[0]; });
  document.querySelectorAll('.need-absen').forEach(function(el){ el.style.display = canAbsen?'':'none'; });
  document.querySelectorAll('.need-admin').forEach(function(el){ el.style.display = isAdmin?'':'none'; });
  window._canDelete = isAdmin;
}
