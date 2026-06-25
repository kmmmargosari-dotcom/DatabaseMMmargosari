// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════

function renderDashboard(){
  var now      = new Date();
  var curMonth = String(now.getMonth()+1).padStart(2,'0');
  var curYear  = String(now.getFullYear());
  var prefix   = curYear+'-'+curMonth;

  var monthKeys = Object.keys(sesiData).filter(function(k){ return k.startsWith(prefix); }).sort();

  var totalGenerus     = members.length;
  var kegiatanBulanIni = monthKeys.length;
  var totalHadir=0, totalIzin=0, totalAlpa=0;

  var sesiStats = [];
  monthKeys.forEach(function(key){
    var ab = sesiData[key]||{};
    var sH=0,sI=0,sA=0;
    Object.keys(ab).forEach(function(mid){
      var rec = ab[mid];
      var s   = (rec && typeof rec==='object') ? (rec.status||'') : (rec||'');
      if(s==='H'){ totalHadir++; sH++; }
      else if(s==='I'){ totalIzin++; sI++; }
      else if(s==='A'){ totalAlpa++; sA++; }
    });
    var datePart = key.split('_')[0];
    var day  = parseInt((datePart.split('-')[2])||'1', 10);
    var ket  = sesiKet[key]||String(day);
    sesiStats.push({label:ket, H:sH, I:sI, A:sA});
  });

  var totalPossible = kegiatanBulanIni * (totalGenerus||1);
  var persen = kegiatanBulanIni>0 ? Math.round((totalHadir/totalPossible)*100) : 0;

  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  setTxt('dash-generus-pc',  totalGenerus);
  setTxt('dash-kegiatan-pc', kegiatanBulanIni);
  setTxt('dash-persen-pc',   persen+'%');
  setTxt('dash-hadir-pc',    totalHadir);
  setTxt('dash-generus-mob', totalGenerus);
  setTxt('dash-kegiatan-mob',kegiatanBulanIni);
  setTxt('dash-persen-mob',  persen+'%');
  setTxt('dash-hadir-mob',   totalHadir);

  var chartSvg = buildDashChart(sesiStats);
  ['dash-chart-pc','dash-chart-mob'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.innerHTML = chartSvg;
  });

  var recentHtml = '';
  var recentKeys = monthKeys.slice().reverse().slice(0,3);
  var MBLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  if(!recentKeys.length){
    recentHtml = '<div class="ndash-empty">Belum ada kegiatan bulan ini</div>';
  } else {
    recentKeys.forEach(function(key){
      var dp   = key.split('_')[0];
      var ket  = sesiKet[key]||key.split('_').slice(1).join(' ')||'—';
      var parts= dp.split('-');
      var fDate= parts[2]+' '+(MBLN[parseInt(parts[1],10)-1]||'')+' '+parts[0];
      var ab   = sesiData[key]||{};
      var h=0,i=0,a=0;
      Object.keys(ab).forEach(function(mid){
        var rec = ab[mid];
        var s   = (rec && typeof rec==='object') ? (rec.status||'') : (rec||'');
        if(s==='H') h++; else if(s==='I') i++; else if(s==='A') a++;
      });
      recentHtml +=
        '<div class="ndash-recent-item">'+
        '<div class="ndash-recent-icon"><svg class="ico" style="width:16px;height:16px"><use href="#ico-clipboard"/></svg></div>'+
        '<div class="ndash-recent-info">'+
          '<div class="ndash-recent-name">'+ket+'</div>'+
          '<div class="ndash-recent-date">'+fDate+'</div>'+
        '</div>'+
        '<div class="ndash-recent-stats">'+
          '<span class="ndash-rs-h">'+h+' Hadir</span>'+
          '<span class="ndash-rs-i">'+i+' Izin</span>'+
          '<span class="ndash-rs-a">'+a+' Alpa</span>'+
        '</div>'+
        '</div>';
    });
  }
  ['dash-recent-pc','dash-recent-mob'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.innerHTML = recentHtml;
  });
}

function buildDashChart(sesiStats){
  if(!sesiStats||!sesiStats.length){
    return '<div style="overflow-x:auto"><svg viewBox="0 0 500 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;min-width:300px;height:auto;display:block">'+
      '<text x="250" y="100" text-anchor="middle" font-size="12" fill="#b0a078">Belum ada sesi bulan ini</text></svg></div>';
  }
  var H_arr = sesiStats.map(function(s){ return s.H; });
  var I_arr = sesiStats.map(function(s){ return s.I; });
  var A_arr = sesiStats.map(function(s){ return s.A; });
  var n     = sesiStats.length;
  var maxV  = 50;

  var pL=38,pR=20,pT=16,pB=18;
  var minSpacing = 18;
  var cW = Math.max(500-pL-pR, n*minSpacing);
  var W  = cW+pL+pR;
  var H_ = 190, cH = H_-pT-pB;

  function tx(i){ return n===1 ? pL+cW/2 : pL+(i/(n-1))*cW; }
  function ty(v){ return pT+cH-(Math.min(v,maxV)/maxV)*cH; }

  function polyline(vals,color){
    if(vals.length<2) return dots(vals,color);
    var pts = vals.map(function(v,i){ return tx(i).toFixed(1)+','+ty(v).toFixed(1); }).join(' ');
    return '<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function dots(vals,color){
    return vals.map(function(v,i){
      return '<circle cx="'+tx(i).toFixed(1)+'" cy="'+ty(v).toFixed(1)+'" r="3" fill="'+color+'" stroke="#fff" stroke-width="1.5"/>';
    }).join('');
  }

  var grid = '';
  [0,10,20,30,40,50].forEach(function(val){
    var yy = ty(val);
    grid += '<line x1="'+pL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-pR)+'" y2="'+yy.toFixed(1)+'" stroke="#e4d9c4" stroke-width="0.7"/>';
    grid += '<text x="'+(pL-4)+'" y="'+(yy+3).toFixed(1)+'" text-anchor="end" font-size="8" fill="#b0a078">'+val+'</text>';
  });

  var xlbls = sesiStats.map(function(s,i){
    var x = tx(i).toFixed(1);
    return '<text x="'+x+'" y="'+(H_-6)+'" text-anchor="middle" font-size="8" fill="#b0a078">'+s.label+'</text>';
  }).join('');

  return '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">'+
    '<svg viewBox="0 0 '+W+' '+H_+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'+
    grid+xlbls+
    polyline(H_arr,'#22c55e')+polyline(I_arr,'#f97316')+polyline(A_arr,'#ef4444')+
    dots(H_arr,'#22c55e')+dots(I_arr,'#f97316')+dots(A_arr,'#ef4444')+
    '</svg></div>';
}
