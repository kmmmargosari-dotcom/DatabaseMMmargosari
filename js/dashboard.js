// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════

function renderDashboard(){
  var now      = new Date();
  var curMonth = String(now.getMonth()+1).padStart(2,'0');
  var curYear  = String(now.getFullYear());
  var prefix   = curYear+'-'+curMonth;

  var monthKeys = Object.keys(sesiData).filter(function(k){ return k.startsWith(prefix); }).sort();

  var totalGenerus     = activeMembers().length;
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
    var ket  = sesiKet[key]||'';
    // Label sumbu-X memakai tanggal singkat; nama kegiatan lengkap ditampilkan
    // via tooltip (tap/hover titik & label grafik).
    var label = ket ? (ket+' ('+day+')') : String(day);
    sesiStats.push({label:label, day:day, ket:ket, H:sH, I:sI, A:sA});
  });

  var totalPossible = kegiatanBulanIni * (totalGenerus||1);
  var persen = kegiatanBulanIni>0 ? Math.round((totalHadir/totalPossible)*100) : 0;

  // Sapaan welcome card berdasar jam (pagi/siang/sore/malam)
  var jam = new Date().getHours();
  var sapaan = jam<4 ? 'Selamat Malam' : jam<11 ? 'Selamat Pagi' : jam<15 ? 'Selamat Siang' : jam<18 ? 'Selamat Sore' : 'Selamat Malam';
  var emoji = jam<4 ? '🌙' : jam<11 ? '☀️' : jam<15 ? '🌤️' : jam<18 ? '🌇' : '🌙';

  function setTxt(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  setTxt('dash-welcome-greet', sapaan);
  setTxt('dash-welcome-greet-mob', sapaan);
  setTxt('dash-welcome-emoji', emoji);
  setTxt('dash-welcome-emoji-mob', emoji);
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
          '<div class="ndash-recent-name">'+escHtml(ket)+'</div>'+
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

  renderDashKasSummary();
}

// Ringkasan Kas di Dashboard: saldo akhir terkini + pemasukan/pengeluaran bulan berjalan
function renderDashKasSummary(){
  var kasHtml;
  if(typeof kasTransaksi==='undefined' || !kasTransaksi.length){
    kasHtml = '<div class="ndash-empty">Belum ada transaksi kas</div>';
  } else {
    var running    = kasCalcRunning();
    var saldoAkhir = running.length ? running[running.length-1].saldo : kasSaldoAwal;
    var now        = new Date();
    var prefix     = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
    var masukBulan = 0, keluarBulan = 0;
    kasTransaksi.forEach(function(t){
      if((t.tanggal||'').indexOf(prefix)===0){
        if(t.jenis==='pemasukan') masukBulan += t.nominal;
        else                      keluarBulan += t.nominal;
      }
    });
    kasHtml =
      '<div class="ndash-recent-item">'+
        '<div class="ndash-recent-icon"><svg class="ico" style="width:16px;height:16px"><use href="#ico-money"/></svg></div>'+
        '<div class="ndash-recent-info">'+
          '<div class="ndash-recent-name">Saldo Kas Saat Ini</div>'+
          '<div class="ndash-recent-date">Bulan ini: +'+fmtRp(masukBulan)+' / -'+fmtRp(keluarBulan)+'</div>'+
        '</div>'+
        '<div class="ndash-recent-stats"><span class="ndash-rs-h" style="font-size:14px;font-weight:600">'+fmtRp(saldoAkhir)+'</span></div>'+
      '</div>';
  }
  ['dash-kas-pc','dash-kas-mob'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.innerHTML = kasHtml;
  });
}

function buildDashChart(sesiStats){
  if(!sesiStats||!sesiStats.length){
    return '<div style="overflow-x:auto"><svg viewBox="0 0 500 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;min-width:300px;height:auto;display:block">'+
      '<text x="250" y="100" text-anchor="middle" font-size="12" fill="#8b987c">Belum ada sesi bulan ini</text></svg></div>';
  }
  var H_arr = sesiStats.map(function(s){ return s.H; });
  var I_arr = sesiStats.map(function(s){ return s.I; });
  var A_arr = sesiStats.map(function(s){ return s.A; });
  var n     = sesiStats.length;

  // Sumbu Y selalu kelipatan 5 (0,5,10,...) sesuai nilai maksimum.
  var rawMax = 0;
  [H_arr,I_arr,A_arr].forEach(function(arr){
    arr.forEach(function(v){ if(v>rawMax) rawMax=v; });
  });
  var step = 5;
  var maxVal = Math.ceil(rawMax/step)*step || step;
  while(maxVal/step > 6){ step += 5; maxVal = Math.ceil(rawMax/step)*step; }

  var pL=38,pR=20,pT=16,pB=18;
  // Maksimal ~10 kegiatan tampil nyaman; lebih dari itu lebar SVG membesar
  // dan kontainer men-scroll horizontal (tidak mentok / overflow).
  var minSpacing = 24;
  var cW = Math.max(500-pL-pR, n*minSpacing);
  var W  = cW+pL+pR;
  var H_ = 190, cH = H_-pT-pB;

  function tx(i){ return n===1 ? pL+cW/2 : pL+(i/(n-1))*cW; }
  function ty(v){ return pT+cH-(Math.min(v,maxVal)/maxVal)*cH; }

  function polyline(vals,color){
    if(vals.length<2) return dots(vals,color);
    var pts = vals.map(function(v,i){ return [tx(i), ty(Math.min(v,maxVal))]; });
    return '<path d="'+smoothLinePath(pts)+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function fullStatLabel(s){ return s.ket ? (s.ket+(s.day?' ('+s.day+')':'')) : (s.label||''); }

  function dots(vals,color){
    return vals.map(function(v,i){
      return '<circle cx="'+tx(i).toFixed(1)+'" cy="'+ty(v).toFixed(1)+'" r="3.5" fill="'+color+'" stroke="#fff" stroke-width="1.5">'+
        '<title>'+escHtml(fullStatLabel(sesiStats[i]))+'</title></circle>';
    }).join('');
  }

  var grid = '';
  for(var val=0; val<=maxVal; val+=step){
    var yy = ty(val);
    grid += '<line x1="'+pL+'" y1="'+yy.toFixed(1)+'" x2="'+(W-pR)+'" y2="'+yy.toFixed(1)+'" stroke="#d9dbc9" stroke-width="0.7"/>';
    grid += '<text x="'+(pL-4)+'" y="'+(yy+3).toFixed(1)+'" text-anchor="end" font-size="8" fill="#8b987c">'+val+'</text>';
  }

  // Label sumbu-X cukup tanggal singkat; nama kegiatan penuh lewat tooltip.
  var xlbls = sesiStats.map(function(s,i){
    var x = tx(i).toFixed(1);
    var short = s.day ? String(s.day) : String(i+1);
    return '<text x="'+x+'" y="'+(H_-6)+'" text-anchor="middle" font-size="8.5" fill="#8b987c">'+
      '<title>'+escHtml(fullStatLabel(s))+'</title>'+escHtml(short)+'</text>';
  }).join('');

  return '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">'+
    '<svg viewBox="0 0 '+W+' '+H_+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">'+
    grid+xlbls+
    polyline(H_arr,'#2e7d55')+polyline(I_arr,'#b07b1f')+polyline(A_arr,'#a83a33')+
    dots(H_arr,'#2e7d55')+dots(I_arr,'#b07b1f')+dots(A_arr,'#a83a33')+
    '</svg></div>';
}
