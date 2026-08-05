// ══════════════════════════════════════════════════
// HELPERS — utility functions shared across modules
// ══════════════════════════════════════════════════

function initials(nama){
  return nama.split(' ').slice(0,2).map(function(w){ return w[0]; }).join('');
}
function eid(nama){ return nama.replace(/[^a-zA-Z0-9]/g,'_'); }
function glabel(g){ return g==='P'?'Perempuan':'Laki-laki'; }

function filteredM(g){
  if(!g||g==='S') return members;
  return members.filter(function(m){ return m.gender===g; });
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

function showToast(msg, duration){
  var t = document.getElementById('app-toast');
  if(!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  if(window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function(){ t.style.display = 'none'; }, duration||2200);
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

function showPopup(ovId, popId){
  var ov = document.getElementById(ovId);
  var pp = document.getElementById(popId);
  if(ov) ov.classList.add('show');
  if(pp){ pp.style.display='block'; void pp.offsetWidth; pp.classList.add('show'); }
}

function hidePopup(ovId, popId){
  var ov = document.getElementById(ovId);
  var pp = document.getElementById(popId);
  if(ov) ov.classList.remove('show');
  if(pp){ pp.classList.remove('show'); pp.style.display='none'; }
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
