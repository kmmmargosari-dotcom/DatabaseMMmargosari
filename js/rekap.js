// ══════════════════════════════════════════════════
// REKAP MODULE
// ══════════════════════════════════════════════════

// Toggle panel filter & urutan Rekap (PC / mobile)
function toggleRekapFilter(which){
  var up = which === 'pc' ? 'Pc' : 'M';
  toggleFilterRow('rekapFilterRow'+up, 'rekapFilterArrow'+up);
}

function renderRekap(source){
  var bEl, tEl, gEl;
  if(source==='mob'){
    bEl = document.getElementById('rBulanM');
    tEl = document.getElementById('rTahunM');
    gEl = document.getElementById('rGenderM');
    var bPc=document.getElementById('rBulan');   if(bPc) bPc.value=bEl.value;
    var tPc=document.getElementById('rTahun');   if(tPc) tPc.value=tEl.value;
    var gPc=document.getElementById('rGender');  if(gPc) gPc.value=gEl?gEl.value:'S';
    var sPc=document.getElementById('rSort');    if(sPc) sPc.value=(document.getElementById('rSortM')||{}).value||'asc';
  } else {
    bEl = document.getElementById('rBulan');
    tEl = document.getElementById('rTahun');
    gEl = document.getElementById('rGender');
    var bMob=document.getElementById('rBulanM'); if(bMob) bMob.value=bEl.value;
    var tMob=document.getElementById('rTahunM'); if(tMob) tMob.value=tEl.value;
    var gMob=document.getElementById('rGenderM');if(gMob) gMob.value=gEl?gEl.value:'S';
    var sMob=document.getElementById('rSortM');  if(sMob) sMob.value=(document.getElementById('rSort')||{}).value||'asc';
  }
  if(!bEl||!tEl) return;
  var bulan=parseInt(bEl.value), tahun=parseInt(tEl.value), rg=gEl?gEl.value:'S';

  var sortVal = source==='mob'
    ? ((document.getElementById('rSortM')||{}).value||'asc')
    : ((document.getElementById('rSort')||{}).value||'asc');

  var prefix = tahun+'-'+String(bulan).padStart(2,'0');
  var sL     = Object.keys(sesiData).filter(function(t){ return t.startsWith(prefix); }).sort();
  // Fallback: bila periode terpilih kosong, pakai periode terakhir yang ADA datanya
  // supaya 5 kartu tidak kosong — filter ikut disesuaikan.
  if(!sL.length){
    var allKeys = Object.keys(sesiData).sort();
    if(allKeys.length){
      var lk = allKeys[allKeys.length-1].split('_')[0].split('-');
      tahun = parseInt(lk[0],10); bulan = parseInt(lk[1],10);
      prefix = tahun+'-'+String(bulan).padStart(2,'0');
      sL = Object.keys(sesiData).filter(function(t){ return t.startsWith(prefix); }).sort();
      ['rBulan','rBulanM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=bulan; });
      ['rTahun','rTahunM'].forEach(function(id){ var el=document.getElementById(id); if(el){ var o=el.querySelector('option[value="'+tahun+'"]'); if(o) el.value=tahun; } });
    }
  }
  if(sortVal==='desc') sL.reverse();

  // Daftar anggota dari roster snapshot + entri sesi (anti join ke
  // koleksi terkini): arsip/hapus/ubah-gender tak mengubah rekap lama.
  var _rr  = rekapRoster(sL);
  var mP   = _rr.P;
  var mL   = _rr.L;
  var mX   = _rr.X;
  var mAll = rg==='S' ? mP.concat(mL).concat(mX) : (rg==='P' ? mP : mL);

  // Stats dihitung dari SELURUH roster (tidak ikut filter cari)
  var _rsH=0,_rsI=0,_rsA=0,_rsTot=mAll.length*sL.length;
  mAll.forEach(function(m){ sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')_rsH++; else if(v==='I')_rsI++; else if(v==='A')_rsA++;
  });});
  var _rsAvg    = _rsTot ? Math.round(_rsH/_rsTot*100) : 0;

  // Search filter (nama generus) — hanya untuk tabel matriks.
  // Kartu statistik & grafik tetap memakai roster penuh.
  var mFull = mAll;
  var qEl = document.getElementById(source==='mob'?'rSearchM':'rSearch');
  var q = qEl ? qEl.value.trim().toLowerCase() : '';
  if(q) mAll = mAll.filter(function(m){ return m.nama.toLowerCase().indexOf(q)>=0; });
  // ── Insight: trend vs bulan lalu (roster penuh) ──
  var _insight = buildRekapInsight(bulan, tahun, sL, mFull);
  var bulanLbl = BULAN[bulan]+' '+tahun;
  [{id:'rekapStats',mob:false},{id:'rekapStatsM',mob:true}].forEach(function(o){
    var el = document.getElementById(o.id); if(!el) return;
    if(!sL.length){ el.innerHTML='<div class="ndash-empty">Belum ada sesi absensi sama sekali.</div>'; return; }
    el.innerHTML = rekapCardsHtml(_rsAvg, sL.length, _rsH, _rsI, _rsA, bulanLbl, o.mob) + _insight.html;
  });

  // Label periode + pil sesi + footer matriks
  var perEl = document.getElementById('rekap-periode-lbl');
  if(perEl) perEl.textContent = sL.length ? ('Bulan '+BULAN[bulan]+' - Berjalan') : 'Belum Ada Data';
  ['rekap-sesi-pill','rekap-sesi-pill-m'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent = sL.length+' Sesi';
  });
  var footTxt = sL.length ? ('Menampilkan <b>'+mAll.length+'</b> Generus Terdaftar') : 'Belum ada data pada periode ini';
  var fp=document.getElementById('rekap-foot-pc'); if(fp) fp.innerHTML=footTxt;
  var fm=document.getElementById('rekap-foot-m');
  if(fm) fm.innerHTML = sL.length
    ? '<span>← geser untuk lihat kolom lainnya →</span><span class="rekap-tag rekap-tag-grey">Menampilkan <b>'+mAll.length+'</b> Generus</span>'
    : footTxt;
  // Sinkron segmen gender + sort visible
  syncRekapSeg(rg);
  var sv=document.getElementById('rSortV'); if(sv) sv.value=sortVal;

  // Table header + body — dibangun dari builder murni (sumber tunggal
  // dengan exportPrint) sehingga selalu sinkron dengan sL/mAll yang dipakai.
  ['theadRekap','theadRekapM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    el.innerHTML = sL.length ? rekapTheadHtml(sL) : '';
  });
  ['tbodyRekap','tbodyRekapM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    el.innerHTML = rekapTbodyHtml(sL, mAll, rg);
  });

  // Chart (roster penuh, tidak ikut filter cari)
  renderRekapChart(sL, mFull, bulan, tahun);

  // Section Keterangan Izin dihapus — alasan izin tampil inline di sel
  // tabel (di bawah badge kuning). Container dikosongkan (CSS :empty
  // menyembunyikannya otomatis).
  ['izinSheet','izinSheetM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    el.innerHTML = '';
  });
}

// Ambil alasan izin anggota di satu sesi ('' bila tidak ada / sama dengan
// nama kegiatan — sama aturan mainnya dengan section izin yang lama).
function rekapNote(nama, t){
  var rec = ((sesiData[t]||{})[nama]||{});
  var note = rec.catatan || '';
  if(note === (sesiKet[t]||'')) note = '';
  return note;
}

// ── BUILDER TABEL & IZIN (sumber tunggal layar + print) ──
// Fungsi murni dari (sL, mAll, rg): dipakai renderRekap untuk layar dan
// exportPrint untuk cetak, sehingga hasil print selalu sinkron dengan
// periode yang dipilih di Export (bukan filter halaman Rekap).
function rekapTheadHtml(sL){
  if(!sL.length) return '';
  var hd='<tr><th class="rx-no">No</th><th class="rx-nama">Nama</th>';
  sL.forEach(function(t){
    var d=new Date(tglDate(t)+'T00:00:00');
    var tip=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' • '+HARI[d.getDay()]+(sesiKet[t]?' • '+sesiKet[t]:'');
    hd+='<th title="'+escHtml(tip)+'">'+d.getDate()+'</th>';
  });
  hd+='<th>H</th><th>I</th><th>A</th><th>%</th></tr>';
  var kg='<tr style="background:var(--gold-xlt)"><td style="font-size:9px;color:var(--text3);font-weight:500;letter-spacing:.3px;text-transform:uppercase">Keg.</td><td style="text-align:left;font-size:9px;color:var(--text3)">—</td>';
  sL.forEach(function(t){
    var ket=sesiKet[t]||'';
    kg+='<td style="font-size:9px;color:var(--gold-dk);font-weight:500;max-width:80px;overflow:hidden;text-overflow:ellipsis" title="'+ket.replace(/"/g,'&quot;')+'">'+
      (ket.length>8?ket.substring(0,7)+'…':ket||'—')+'</td>';
  });
  kg+='<td colspan="4" style="background:var(--gold-xlt)"></td></tr>';
  return hd+kg;
}

function rekapTbodyHtml(sL, mAll, rg){
  if(!sL.length) return '<tr><td colspan="'+(6+sL.length)+'" class="empty">Belum ada data.</td></tr>';
  var bd='';
  var noCount=0;
  function renderRows(arr, genderLabel, sepClass){
    if(!arr.length) return;
    if(rg==='S'){
      var _sepLbl = genderLabel==='P' ? 'Perempuan' : genderLabel==='L' ? 'Laki-laki' : 'Data Lama';
      bd+='<tr class="gender-sep '+sepClass+'"><td colspan="'+(6+sL.length)+'">'+_sepLbl+'</td></tr>';
    }
    arr.forEach(function(m){
      noCount++;
      var h=0,iz=0,al=0,cells='';
      sL.forEach(function(t){
        var v=((sesiData[t]||{})[m.nama]||{}).status||'';
        if(v==='H'){     cells+='<td><span class="badge bh">H</span></td>'; h++;  }
        else if(v==='I'){
          var _nt=rekapNote(m.nama, t);
          cells+='<td><span class="badge bi">I</span>'+
            (_nt?'<div class="iz-alasan" title="'+escHtml(_nt)+'">'+escHtml(_nt)+'</div>':'')+'</td>';
          iz++;
        }
        else if(v==='A'){cells+='<td><span class="badge ba">A</span></td>'; al++; }
        else cells+='<td style="color:var(--border)">—</td>';
      });
      var pct=sL.length?Math.round(h/sL.length*100):0;
      var pc=pct>=80?'var(--green)':pct>=60?'var(--amber)':'var(--red)';
      bd+='<tr><td>'+noCount+'</td><td class="tl">'+escHtml(m.nama)+'</td>'+cells+
        '<td style="color:var(--green);font-weight:500">'+h+'</td>'+
        '<td style="color:var(--amber)">'+iz+'</td><td style="color:var(--red)">'+al+'</td>'+
        '<td style="color:'+pc+';font-weight:500">'+pct+'%</td></tr>';
    });
  }
  if(rg==='S'){
    renderRows(mAll.filter(function(m){return m.gender==='P';}),'P','gender-sep-p');
    renderRows(mAll.filter(function(m){return m.gender==='L';}),'L','gender-sep-l');
    renderRows(mAll.filter(function(m){return m.gender!=='P'&&m.gender!=='L';}),'X','gender-sep-x');
  } else {
    renderRows(mAll, rg, rg==='P'?'gender-sep-p':'gender-sep-l');
  }
  return bd;
}

// ── INSIGHT STATISTIK ──
// Daftar anggota untuk satu rentang sesi TANPA join ke koleksi terkini:
// gabungan roster snapshot sesi + nama-nama entri (arsip/hapus/ubah-gender
// tetap muncul apa adanya). Gender: roster > snapshot entri > anggota kini.
function rekapRoster(sL){
  var map = {};
  function put(nama, gender){ if(nama && !map[nama]) map[nama] = gender || '?'; }
  sL.forEach(function(t){
    (sesiRoster[t]||[]).forEach(function(r){ put(r.nama, r.gender); });
    var s = sesiData[t]||{};
    Object.keys(s).forEach(function(nm){ put(nm, (s[nm]||{}).gender || memberGenderNow(nm)); });
  });
  function arr(g){
    return Object.keys(map).filter(function(n){ return map[n]===g; })
      .sort(function(a,b){ return a.localeCompare(b); })
      .map(function(n){ return {nama:n, gender:g}; });
  }
  return {P:arr('P'), L:arr('L'), X:arr('?')};
}

// Rata-rata kehadiran satu bulan (prefix 'YYYY-MM') untuk trend vs bulan lalu.
// Roster bulan itu dibangun sendiri (anti join) — tidak memakai mAll bulan lain.
function calcMonthAvg(prefix){
  var keys = Object.keys(sesiData).filter(function(t){ return t.startsWith(prefix); });
  var rr = rekapRoster(keys);
  var mAll = rr.P.concat(rr.L).concat(rr.X);
  if(!keys.length || !mAll.length) return {avg:0, h:0, tot:0, nSesi:keys.length};
  var h=0, tot=mAll.length*keys.length;
  mAll.forEach(function(m){ keys.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H') h++;
  });});
  return {avg: tot?Math.round(h/tot*100):0, h:h, tot:tot, nSesi:keys.length};
}

function prevMonthPrefix(bulan, tahun){
  var b=bulan-1, t=tahun;
  if(b<1){ b=12; t--; }
  return {prefix: t+'-'+String(b).padStart(2,'0'), bulan:b, tahun:t};
}

function buildRekapInsight(bulan, tahun, sL, mAll){
  if(!sL.length || !mAll.length) return {html:'', trend:null, avg:0};
  var tot=mAll.length*sL.length, hTot=0;
  mAll.forEach(function(m){ sL.forEach(function(t){
    if((((sesiData[t]||{})[m.nama]||{}).status||'')==='H') hTot++;
  });});
  var avg=tot?Math.round(hTot/tot*100):0;
  var pm=prevMonthPrefix(bulan, tahun);
  var prev=calcMonthAvg(pm.prefix);
  var trend=null;
  if(prev.nSesi>0){
    var delta=avg-prev.avg;
    trend={avg:prev.avg, delta:delta, dir:delta>0?'naik':delta<0?'turun':'stabil'};
  }
  return {html: insightHtml(trend, pm, avg, BULAN[bulan]), trend:trend, avg:avg};
}

function trendBadgeHtml(trend, pm){
  if(!trend) return '<span class="rs-trend-badge rs-trend-none">Bulan lalu: belum ada data</span>';
  var lbl = BULAN[pm.bulan]+' '+pm.tahun;
  if(trend.dir==='naik')
    return '<span class="rs-trend-badge rs-trend-up">▲ +'+trend.delta+'% vs '+lbl+' ('+trend.avg+'% → naik)</span>';
  if(trend.dir==='turun')
    return '<span class="rs-trend-badge rs-trend-down">▼ '+trend.delta+'% vs '+lbl+' ('+trend.avg+'% → turun)</span>';
  return '<span class="rs-trend-badge rs-trend-flat">＝ Stabil vs '+lbl+' ('+trend.avg+'%)</span>';
}

// 5 kartu statistik ala screenshot (aksen kiri hijau/kuning/merah).
// Mobile: 2+2 + kartu Alfa full-width horizontal.
function rekapCardsHtml(avg, nSesi, h, iz, al, bulanLbl, isMob){
  function card(acc, icon, iconBg, iconFg, tag, tagCls, num, numCls, lbl, sub){
    return '<div class="rekap-card'+(acc?' '+acc:'')+'">'+
      '<div class="rekap-card-top"><span class="rekap-ic" style="background:'+iconBg+';color:'+iconFg+'"><span class="msym" style="font-size:20px">'+icon+'</span></span>'+
      '<span class="rekap-tag '+tagCls+'">'+tag+'</span></div>'+
      '<div class="rekap-num'+(numCls?' '+numCls:'')+'">'+num+'</div>'+
      '<div class="rekap-lbl">'+lbl+'</div>'+
      '<div class="rekap-sub">'+sub+'</div></div>';
  }
  return '<div class="rekap-cards">'+
    card('', 'autorenew', '#ecfdf5', '#047857', '<span>'+avg+'%</span>TERCAPAI', 'rekap-tag-green rekap-tag-stack', avg+'%', '',
      'Rasio Kehadiran', '<b>Target: 70%</b> • Bulan '+escHtml(bulanLbl.split(' ')[0]))+
    card('', 'calendar_month', '#fafaf9', '#57534e', nSesi+' Sesi', 'rekap-tag-grey', nSesi, '',
      'Total Pertemuan', 'Kegiatan Terlaksana')+
    card('acc-green', 'check', '#ecfdf5', '#047857', h+' Hadir', 'rekap-tag-green', h, 'green',
      'Total Hadir (H)', 'Orang-Sesi Generus')+
    card('acc-amber', 'info', '#fef3c7', '#b45309', iz+' Izin', 'rekap-tag-amber', iz, 'amber',
      'Total Izin (I)', 'Kerja, Sakit, Acara')+
    (isMob
      ? '<div class="rekap-card rekap-alfa-mob">'+
        '<div class="rekap-alfa-left"><span class="rekap-ic" style="background:#fef2f2;color:#e11d48"><span class="msym" style="font-size:20px">close</span></span>'+
        '<span><span class="rekap-num red">'+al+'</span>'+
        '<span class="rekap-lbl">Total Alfa (A)</span></span></div>'+
        '<div class="rekap-alfa-right"><span class="rekap-tag rekap-tag-red">'+al+' Alfa</span>'+
        '<span class="rekap-sub">Tanpa Keterangan</span></div></div>'
      : card('acc-red', 'close', '#fee2e2', '#b91c1c', al+' Alfa', 'rekap-tag-red', al, 'red',
        'Total Alfa (A)', 'Tanpa Keterangan'))+
  '</div>';
}

function insightHtml(trend, pm, avg, curLbl){
  var right, mid;
  if(!trend){
    mid = 'Belum ada data bulan lalu untuk perbandingan.';
    right = '';
  } else {
    var naik = trend.dir==='naik', turun = trend.dir==='turun';
    var dlbl = (trend.delta>0?'+':'')+trend.delta+'%';
    var dic = naik?'trending_up':turun?'trending_down':'remove';
    mid = 'Rasio Kehadiran generus '+(naik?'naik':turun?'turun':'stabil')+' dibanding bulan lalu: '+
      '<span class="rekap-delta'+(turun?' down':'')+'">↓ '+dlbl+'</span>';
    right = BULAN[pm.bulan]+': <b>'+trend.avg+'%</b> → '+escHtml(curLbl)+': <b>'+avg+'%</b>';
  }
  var ic = (!trend||trend.dir==='turun') ? 'trending_down' : (trend.dir==='naik' ? 'trending_up' : 'remove');
  var icBg = (!trend||trend.dir==='turun') ? '#fee2e2' : '#dcfce7';
  var icFg = (!trend||trend.dir==='turun') ? '#b91c1c' : '#047857';
  return '<div class="rekap-insight">'+
    '<span class="rekap-insight-ic" style="background:'+icBg+';color:'+icFg+'"><span class="msym" style="font-size:17px">'+ic+'</span></span>'+
    '<span class="rekap-insight-title">Insight Bulan Ini</span>'+
    '<span>'+mid+'</span>'+
    (right?'<span class="rekap-prev">'+right+'</span>':'')+
  '</div>';
}

// Segmen gender (tombol) <-> select tersembunyi.
function rekapSetGender(which, g){
  var id = which==='mob' ? 'rGenderM' : 'rGender';
  var el = document.getElementById(id);
  if(el) el.value = g;
  renderRekap(which);
}
function syncRekapSeg(rg){
  ['rSegPc','rSegM'].forEach(function(id){
    var seg = document.getElementById(id); if(!seg) return;
    var btns = seg.querySelectorAll('button');
    btns.forEach(function(b){
      if(b.classList) b.classList.toggle('on', b.getAttribute('data-g')===rg);
    });
  });
}

function rsItem(v, l, c){
  return '<div class="rs-item">'+
    '<div class="rs-val"'+(c?' style="color:'+c+'"':'')+'>'+v+'</div>'+
    '<div class="rs-lbl">'+l+'</div>'+
    '</div>';
}

function renderRekapChart(sL, mAll, bulan, tahun){
  var perSesi = buildPerSesi(sL, mAll);
  if(!perSesi.length){
    ['rekapChart','rekapChartM'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.innerHTML = '';
    });
    return;
  }
  var svg = buildBarSvg(perSesi, mAll.length);
  ['rekapChart','rekapChartM'].forEach(function(id,i){
    var el = document.getElementById(id);
    if(!el){
      el = document.createElement('div');
      el.id = id;
      el.className = 'rekap-chart-card-lux';
      var ref = document.getElementById(i===0?'rekapStats':'rekapStatsM');
      if(ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling);
    }
    el.className = 'rekap-chart-card-lux';
    el.innerHTML = '<div class="rekap-chart-hd-lux"><div><h3>GRAFIK KEHADIRAN PER PERTEMUAN</h3>'+
      '<p>Komparasi jumlah Hadir, Izin, dan Alfa pada '+perSesi.length+' sesi kegiatan bulan '+BULAN[bulan]+'</p></div>'+
      '<div class="rekap-legend-pills"><span><i style="background:#2e7d55"></i>Hadir</span><span><i style="background:#b07b1f"></i>Izin</span><span><i style="background:#a83a33"></i>Alfa</span></div></div>'+
      '<div class="rekap-chart-body" style="padding:14px 16px 6px;overflow-x:auto">'+svg+'</div>'+
      '<div class="rc-legend-row" style="padding:8px 16px 14px;border-top:1px solid #eee9db;margin-top:4px">'+
        '<span class="rc-axis">↑ Jumlah Presensi Generus</span>'+
        '<span class="rc-axis" style="margin-left:auto">→ Tanggal Pertemuan Kegiatan ('+BULAN[bulan]+' '+tahun+')</span>'+
      '</div>';
  });
}

// Baris keterangan grafik (arah sumbu + warna) — satu baris rapi di BAWAH grafik,
// dipakai bareng oleh tampilan layar (renderRekapChart) & cetak (exportPrint).
function chartLegendHtml(){
  return '<div class="rc-legend-row">'+
    '<span class="rc-axis">↑ Jumlah</span>'+
    '<span class="rc-axis">→ Tanggal Kegiatan</span>'+
    '<span class="rc-legend">'+
      '<span class="rc-dot" style="background:#2e7d55"></span>Hadir'+
      '<span class="rc-dot" style="background:#b07b1f"></span>Izin'+
      '<span class="rc-dot" style="background:#a83a33"></span>Alfa'+
    '</span>'+
  '</div>';
}

// Hitung data per-sesi (jumlah Hadir/Izin/Alfa tiap pertemuan) untuk grafik.
// Dipakai bareng oleh tampilan layar (renderRekapChart) & cetak (exportPrint).
function buildPerSesi(sL, mAll){
  return sL.map(function(t){
    var h = 0, iz = 0, al = 0;
    mAll.forEach(function(m){
      var v = ((sesiData[t]||{})[m.nama]||{}).status||'';
      if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++;
    });
    var dt = tglDate(t).split('-');
    var day = parseInt(dt[2],10) || 0;
    var ket = sesiKet[t]||'';
    return { day:day, ket:ket, label: ket ? ket.substring(0,8) : String(day), h:h, iz:iz, al:al };
  });
}

function buildDonutSvg(h, iz, al, blm){
  var size=110, cx=55, cy=55, r=36, sw=16;
  var total=h+iz+al+blm;
  var pct = total ? Math.round(h/total*100) : 0;
  if(total===0){
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#e4d9c4" stroke-width="'+sw+'"/>'+
      '<text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" font-size="13" fill="#8b987c">—</text>'+
      '</svg>';
  }
  var colors=['#2e7d55','#b07b1f','#a83a33','#c8b89a'];
  var vals=[h,iz,al,blm];
  var circ=2*Math.PI*r;
  var cumFrac=0, paths='';
  vals.forEach(function(v,i){
    if(!v) return;
    var frac=v/total;
    var dash=frac*circ;
    var gap=circ-dash;
    var rot=cumFrac*360-90;
    paths+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none"'+
      ' stroke="'+colors[i]+'" stroke-width="'+sw+'"'+
      ' stroke-dasharray="'+dash.toFixed(2)+' '+gap.toFixed(2)+'"'+
      ' transform="rotate('+rot.toFixed(1)+' '+cx+' '+cy+')"/>';
    cumFrac+=frac;
  });
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#f0e8d8" stroke-width="'+sw+'"/>'+
    paths+
    '<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#28322a">'+pct+'%</text>'+
    '</svg>';
}

function buildBarSvg(perSesi, totalMembers){
  var n=perSesi.length;
  var barW=16, gap=3, groupGap=26;
  var groupW=barW*3+gap*2+groupGap;
  var padL=30, padR=12, padT=16, padB=30;
  var W=padL+n*groupW+padR;
  var H=padT+90+padB;
  var chartH=H-padT-padB;
  var rawMax=Math.max(1, totalMembers);
  perSesi.forEach(function(s){ rawMax=Math.max(rawMax, s.h, s.iz, s.al); });

  // Sumbu jumlah (atas) hanya pakai kelipatan 5 (0, 5, 10, 15, ...)
  var step=5;
  var maxVal=Math.ceil(rawMax/step)*step || step;
  while(maxVal/step > 6){ step+=5; maxVal=Math.ceil(rawMax/step)*step; }

  var yLines='', bars='', labels='';
  for(var v=0; v<=maxVal; v+=step){
    var y=padT+chartH*(1-v/maxVal);
    yLines+='<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="#e4d9c4" stroke-width="0.8" stroke-dasharray="2 3"/>';
    yLines+='<text x="'+(padL-5)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" font-size="8" fill="#7c8a6c">'+v+'</text>';
  }
  perSesi.forEach(function(s,i){
    var gx=padL+i*groupW;
    var cx=gx+groupW/2;
    var vals=[s.h,s.iz,s.al];
    var cols=['#2e7d55','#b07b1f','#a83a33'];
    var totalBarW=barW*3+gap*2;
    var startX=gx+(groupW-totalBarW)/2;
    vals.forEach(function(v,ki){
      if(!v) return;
      var bh=Math.max(3,(v/maxVal)*chartH);
      var by=padT+chartH-bh;
      var bx=startX+ki*(barW+gap);
      bars+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+barW+'" height="'+bh.toFixed(1)+'" fill="'+cols[ki]+'" rx="3"/>';
      bars+='<text x="'+(bx+barW/2).toFixed(1)+'" y="'+(by-4).toFixed(1)+'" text-anchor="middle" font-size="8" fill="'+cols[ki]+'" font-weight="600">'+v+'</text>';
    });
    labels+='<text x="'+cx.toFixed(1)+'" y="'+(H-9)+'" text-anchor="middle" font-size="9" fill="#525f48">'+
      '<title>'+(s.ket?escHtml(s.ket):('Sesi '+(i+1)))+' · '+s.day+'</title>'+(s.day? s.day : 'P'+ (i+1))+'</text>';
  });
  // Ukuran fiks (bukan diregangkan ke lebar container) & mulai dari kiri,
  // supaya rapi walau datanya sedikit (mis. cuma 3 pertemuan).
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="display:block">'+
    yLines+bars+labels+'</svg>';
}

function getExportData(){
  var gEl=document.getElementById('rGender')||document.getElementById('rGenderM');
  var rg=gEl?gEl.value:'S';
  var _rg=(typeof resolveExRange==='function')?resolveExRange('rekap')
    :{dari:_exVal('exRekapDari','exRekapDariM'),sampai:_exVal('exRekapSampai','exRekapSampaiM')};
  var cDari=_rg.dari||'', cSampai=_rg.sampai||'';
  var dariDate=cDari?cDari:'0000-01-01';
  var sampaiDate=cSampai?cSampai:'9999-12-31';
  if(dariDate>sampaiDate){ var tmp=dariDate;dariDate=sampaiDate;sampaiDate=tmp; }
  var sL=Object.keys(sesiData).filter(function(t){
    var dk=tglDate(t);
    return dk>=dariDate && dk<=sampaiDate;
  }).sort();
  var sVal=((document.getElementById('rSort')||{}).value||'' ) || ((document.getElementById('rSortM')||{}).value||'asc');
  if(sVal==='desc') sL.reverse();
  var _rr=rekapRoster(sL);
  var mAll=rg==='S'?_rr.P.concat(_rr.L).concat(_rr.X):(rg==='P'?_rr.P:_rr.L);
  return {sL:sL,mAll:mAll,rg:rg,customDari:cDari,customSampai:cSampai};
}

function buildRekapRows(sL, mAll){
  var ketRow=['','Kegiatan',''].concat(sL.map(function(t){ return sesiKet[t]||''; })).concat(['','','','']);
  var hdrs=['No','Nama','Gender'].concat(sL.map(function(t){
    var d=new Date(tglDate(t)+'T00:00:00');
    return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  })).concat(['Hadir','Izin','Alfa','% Hadir']);
  var rows=[ketRow,hdrs];
  mAll.forEach(function(m,i){
    var h=0,iz=0,al=0;
    var cells=sL.map(function(t){
      var v=((sesiData[t]||{})[m.nama]||{}).status||'';
      if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++;
      if(v==='I'){
        var _nt=rekapNote(m.nama, t);
        return _nt?('I ('+_nt+')'):'I';
      }
      return v||'-';
    });
    var pct=sL.length?Math.round(h/sL.length*100):0;
    rows.push([i+1,m.nama,m.gender==='P'?'Perempuan':m.gender==='L'?'Laki-laki':'Riwayat'].concat(cells).concat([h,iz,al,pct+'%']));
  });
  return rows;
}

// ── DATA KAS PER RENTANG (untuk export gabungan rekap+kas) ──
// Menghitung saldo awal/akhir + total masuk/keluar dari kasTransaksi
// memakai rentang tanggal yang sama dengan export rekap.
function getKasPeriodData(dariDate, sampaiDate){
  var run = (typeof kasCalcRunning==='function') ? kasCalcRunning() : [];
  var saldoAwal = (typeof kasSaldoAwal!=='undefined') ? kasSaldoAwal : 0;
  for(var i=0;i<run.length;i++){
    if(run[i].trx.tanggal<dariDate) saldoAwal=run[i].saldo;
  }
  var items = run.filter(function(it){ return it.trx.tanggal>=dariDate && it.trx.tanggal<=sampaiDate; });
  var masuk=0, keluar=0;
  items.forEach(function(it){
    if(it.trx.jenis==='pemasukan') masuk+=it.trx.nominal; else keluar+=it.trx.nominal;
  });
  return {items:items, masuk:masuk, keluar:keluar,
    selisih: masuk-keluar, saldoAwal:saldoAwal, saldoAkhir:saldoAwal+(masuk-keluar)};
}

function buildKasRows(kas){
  var rows=[['Tanggal','Keterangan','Masuk','Keluar','Saldo']];
  rows.push(['Saldo Awal','','','',kas.saldoAwal]);
  kas.items.forEach(function(it){
    var trx=it.trx;
    rows.push([trx.tanggal, trx.keterangan||'',
      trx.jenis==='pemasukan'?trx.nominal:'',
      trx.jenis==='pengeluaran'?trx.nominal:'', it.saldo]);
  });
  rows.push(['TOTAL','',kas.masuk,kas.keluar,kas.saldoAkhir]);
  return rows;
}

// ── BARIS STATISTIK (trend + top3 + <50%) untuk Excel/CSV ──
function buildInsightRows(sL, mAll){
  var rows=[['STATISTIK & INSIGHT']];
  if(!sL.length) return rows;
  var tot=mAll.length*sL.length, h=0, iz=0, al=0;
  mAll.forEach(function(m){ sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')h++; else if(v==='I')iz++; else if(v==='A')al++;
  });});
  var avg=tot?Math.round(h/tot*100):0;
  rows.push(['Pertemuan', sL.length]);
  rows.push(['Hadir', h]);
  rows.push(['Izin', iz]);
  rows.push(['Alfa', al]);
  rows.push(['Rata-rata', avg+'%']);
  // Trend vs bulan pertama di rentang (pakai bulan kalender sebelumnya)
  try{
    var first = sL[0].split('_')[0].split('-');
    var b=parseInt(first[1],10), t=parseInt(first[0],10);
    var pm=prevMonthPrefix(b,t);
  var prev=calcMonthAvg(pm.prefix);
    if(prev.nSesi>0){
      var delta=avg-prev.avg;
      var arah=delta>0?'Meningkat':delta<0?'Menurun':'Stabil';
      rows.push(['Bulan lalu ('+BULAN[pm.bulan]+' '+pm.tahun+')', prev.avg+'%']);
      rows.push(['Selisih vs bulan lalu', (delta>0?'+':'')+delta+'% ('+arah+')']);
    } else {
      rows.push(['Bulan lalu', 'Belum ada data']);
    }
  }catch(e){}
  return rows;
}

function writeRekapExcel(d, o, fname){
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(buildRekapRows(d.sL,d.mAll)),'Rekap');
  if(o.stat)
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(buildInsightRows(d.sL,d.mAll)),'Statistik');
  if(o.kas){
    var dari=d.customDari||'0000-01-01', sampai=d.customSampai||'9999-12-31';
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(buildKasRows(getKasPeriodData(dari,sampai))),'Kas');
    if(d.catatan)
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['CATATAN / HASIL MUSYAWARAH'],[d.catatan]]),'Catatan');
  }
  XLSX.writeFile(wb,fname);
}

function exportExcel(){
  var d=getExportData();
  if(!d.sL.length){ appAlert('Belum ada data untuk rentang ini.'); return; }
  var opts=(typeof getRekapExportOpts==='function')?getRekapExportOpts():{insight:true,izin:true};
  writeRekapExcel(d,{stat:opts.insight,kas:!!opts.kas},
    'Rekap_'+(d.customDari||'Awal')+'_s/d_'+(d.customSampai||'Akhir')+'.xlsx');
}

// Export gabungan Rekap Absensi + Kas (data dari popup, via getGabData).
function gabunganExcel(d){
  writeRekapExcel(d,{stat:true,izin:true,kas:true},
    'Gabungan_'+(d.customDari||'Awal')+'_s/d_'+(d.customSampai||'Akhir')+'.xlsx');
}

function buildRekapCSVText(d, o){
  function toCSV(rows){
    return rows.map(function(r){
      return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
  }
  var full=toCSV(buildRekapRows(d.sL,d.mAll));
  if(o.stat) full+='\n\n\nStatistik & Insight\n'+toCSV(buildInsightRows(d.sL,d.mAll));
  if(o.kas){
    var dari=d.customDari||'0000-01-01', sampai=d.customSampai||'9999-12-31';
    full+='\n\n\nRekap Kas ('+(d.customDari||'Awal')+' s/d '+(d.customSampai||'Akhir')+')\n'+toCSV(buildKasRows(getKasPeriodData(dari,sampai)));
    if(d.catatan) full+='\n\n\nCatatan / Hasil Musyawarah\n"'+String(d.catatan).replace(/"/g,'""')+'"';
  }
  return full;
}

function downloadCSVText(full, fname){
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(full);
  a.download=fname;
  a.click();
}

function exportCSV(){
  var d=getExportData();
  if(!d.sL.length){ appAlert('Belum ada data untuk rentang ini.'); return; }
  var opts=(typeof getRekapExportOpts==='function')?getRekapExportOpts():{insight:true,izin:true};
  downloadCSVText(buildRekapCSVText(d,{stat:opts.insight,kas:!!opts.kas}),
    'Rekap_'+(d.customDari||'Awal')+'_s/d_'+(d.customSampai||'Akhir')+'.csv');
}

function gabunganCSV(d){
  downloadCSVText(buildRekapCSVText(d,{stat:true,izin:true,kas:true}),
    'Gabungan_'+(d.customDari||'Awal')+'_s/d_'+(d.customSampai||'Akhir')+'.csv');
}

function exportPrint(){
  var d=getExportData();
  if(!d.sL.length){ appAlert('Belum ada data untuk rentang ini.'); return; }
  var opts=(typeof getRekapExportOpts==='function')?getRekapExportOpts():{insight:true,izin:true};
  printRekapDoc(d,{insight:opts.insight,kas:!!opts.kas});
}

function gabunganPrint(d){
  printRekapDoc(d,{insight:true,izin:true,kas:true});
}

function printRekapDoc(d, o){
  // Tabel & izin DIBANGUN dari data periode export (bukan comot innerHTML
  // layar) supaya sinkron dengan tanggal yang dipilih.
  var tableHtml='<div class="tbl-card"><table><thead>'+rekapTheadHtml(d.sL)+'</thead><tbody>'+rekapTbodyHtml(d.sL,d.mAll,d.rg)+'</tbody></table></div>';
  var periodLabel=(d.customDari||'Awal')+' s/d '+(d.customSampai||'Akhir');

  var tot=d.mAll.length*d.sL.length, tH=0, tI=0, tA=0;
  d.mAll.forEach(function(m){ d.sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')tH++; else if(v==='I')tI++; else if(v==='A')tA++;
  });});
  var avg=tot?Math.round(tH/tot*100):0;
  var avgClr=avg>=80?'#2e7d55':avg>=60?'#b07b1f':'#a83a33';
  var printDonut=buildDonutSvg(tH,tI,tA,tot-(tH+tI+tA));
  var perSesi=buildPerSesi(d.sL, d.mAll);
  var chartHtml=perSesi.length
    ? '<div class="tbl-card chart-card">'+
        '<div class="chart-card-hd">Grafik Kehadiran per Pertemuan</div>'+
        buildBarSvg(perSesi, d.mAll.length)+
        chartLegendHtml()+
      '</div>'
    : '';
  var statHtml=
    '<div class="stat-card">'+
      '<div class="stat-donut">'+
        '<div class="stat-donut-lbl">Distribusi</div>'+
        printDonut+
      '</div>'+
      '<div class="stat-divider"></div>'+
      '<div class="stat-items">'+
        _printRsItem(d.sL.length,'Pertemuan','#28322a')+
        _printRsItem(tH,'Hadir','#2e7d55')+
        _printRsItem(tI,'Izin','#b07b1f')+
        _printRsItem(tA,'Alfa','#a83a33')+
        _printRsItem(avg+'%','Rata-rata',avgClr)+
      '</div>'+
    '</div>';
  // ── Insight print (trend vs bulan lalu) ──
  var insightPrintHtml='';
  if(o.insight){
    try{
      var _f=d.sL[0].split('_')[0].split('-');
      var _pm=prevMonthPrefix(parseInt(_f[1],10),parseInt(_f[0],10));
      var _prev=calcMonthAvg(_pm.prefix);
      if(_prev.nSesi>0){
        var _dl=avg-_prev.avg;
        var _ar=_dl>0?'▲ Meningkat':_dl<0?'▼ Menurun':'＝ Stabil';
        var _cl=_dl>0?'#2e7d55':_dl<0?'#a83a33':'#525f48';
        insightPrintHtml='<div class="tbl-card" style="padding:8px 14px;font-size:10.5px;font-weight:700;color:'+_cl+'">'+_ar+' '+(_dl>0?'+':'')+_dl+'% vs '+BULAN[_pm.bulan]+' '+_pm.tahun+' ('+_prev.avg+'% → '+avg+'%)</div>';
      }
    }catch(e){}
  }
  // ── Rekap kas print (di bawah rekap) — desain sama persis dengan
  // export kas (kasPrintSectionHtml di kas.js). Catatan musyawarah (bila
  // diisi) tampil di samping kanan tabel, bukan di bawahnya.
  var kasPrintHtml='';
  if(o.kas && typeof kasPrintSectionHtml==='function'){
    var _dari=d.customDari||'0000-01-01', _sampai=d.customSampai||'9999-12-31';
    var _kas=getKasPeriodData(_dari,_sampai);
    kasPrintHtml='<div class="kas-print-page"><h3>Rekap Kas ('+periodLabel+')</h3>'+
      kasPrintSectionHtml(_kas.items,_kas.saldoAwal,_kas.masuk,_kas.keluar,_kas.selisih,_kas.saldoAkhir,d.catatan||'')+'</div>';
  }

  _printWithIframe(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">'+
    '<title>Rekap '+periodLabel+'</title>'+
    '<link rel="preconnect" href="https://fonts.googleapis.com">'+
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'+
    '<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">'+
    '<style>'+
      '*{box-sizing:border-box}'+
      ':root{--green:#2e7d55;--amber:#b07b1f;--red:#a83a33;--text:#28322a;--text2:#525f48;--text3:#7c8a6c;--gold-dk:#31663d;--gold-lt:#e2efdd;--gold-xlt:#eef5ea;--border:#d9dbc9}'+
      'body{font-family:"Hanken Grotesk",system-ui,sans-serif;font-size:10.5px;padding:20px;color:#28322a;background:#f7f3e8;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
      'h2{font-family:"Young Serif",Georgia,serif;font-weight:400;font-size:16px;color:#28322a;margin:0}'+
      '.subtitle{color:#5f6d52;font-size:10.5px;margin:2px 0 0}'+
      '.print-hd{border-bottom:2px solid #3f8a53;padding-bottom:8px;margin-bottom:8px}'+
      'h3{font-family:"Young Serif",Georgia,serif;font-weight:400;font-size:13px;color:#28322a;margin:12px 0 5px;break-after:avoid;page-break-after:avoid}'+
      '.stat-card{display:flex;align-items:center;padding:12px 16px;background:#fff;border:1px solid #d9dbc9;border-radius:12px;box-shadow:0 1px 3px rgba(40,58,44,.10);margin:0 0 8px;page-break-inside:avoid}'+
      '.stat-donut{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;padding-right:4px}'+
      '.stat-donut-lbl{font-size:8.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#7c8a6c}'+
      '.stat-divider{width:1px;background:#d9dbc9;align-self:stretch;margin:0 16px;flex-shrink:0}'+
      '.stat-items{display:flex;flex:1;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:2px}'+
      '.rs-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;border-radius:8px}'+
      '.rs-val{font-size:22px;font-weight:300;line-height:1;letter-spacing:-.5px}'+
      '.rs-lbl{font-size:8.5px;text-transform:uppercase;letter-spacing:.5px;color:#7c8a6c;font-weight:500;margin-top:3px}'+
      '.tbl-card{background:#fff;border:1px solid #d9dbc9;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(40,58,44,.10);margin:0 0 8px;page-break-inside:auto}'+
      '.chart-card{padding:8px 14px 2px;page-break-inside:avoid}'+
      '.chart-card-hd{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#525f48;margin-bottom:8px}'+
      '.chart-card svg{display:block;max-width:100%;height:auto}'+
      '.rc-legend-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px 14px;padding:8px 0 10px}'+
      '.rc-axis{font-size:9.5px;color:#7c8a6c;font-weight:500}'+
      '.rc-legend{display:flex;align-items:center;gap:4px;font-size:9.5px;color:#525f48;flex-wrap:wrap;margin-left:auto}'+
      '.rc-legend .rc-dot{width:8px;height:8px;border-radius:2px;display:inline-block;flex-shrink:0;margin-left:8px}'+
      '.rc-legend .rc-dot:first-child{margin-left:0}'+
      '.num{text-align:right}.bold{font-weight:700}.green{color:#2e7d55}.red{color:#a83a33}'+
      '.saldo-awal-row td{background:#eef5e9}.total-row td{background:#efe9d8;font-weight:700;border-top:2px solid #3f8a53}'+
      '.cf-donut-row{display:flex;gap:12px;margin-bottom:10px;align-items:stretch}.cf-box,.donut-box{background:#fff;box-shadow:0 1px 3px rgba(40,58,44,.10)}'+
      '.cf-box{flex:1;border:1px solid #d9dbc9;border-radius:12px;overflow:hidden}'+
      '.cf-box-title{font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#525f48;padding:10px 12px;border-bottom:1px solid #e6e1cb;background:#efe9d8}'+
      '.cf-row{display:flex;align-items:center;padding:9px 12px;border-bottom:1px solid #e6e1cb;gap:10px;font-size:10.5px}.cf-row:last-child{border-bottom:none}'+
      '.cf-icon{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}.cf-lbl{flex:1;color:#5f6d52}.cf-val{font-weight:600}'+
      '.cf-saldo-akhir{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;background:#eef5e9;border-top:2px solid #3f8a53}.cf-sa-lbl{font-size:11px;font-weight:700;color:#31663d}.cf-sa-val{font-size:15px;font-weight:700;color:#31663d}'+
      '.donut-box{width:184px;flex-shrink:0;border:1px solid #d9dbc9;border-radius:12px;display:flex;flex-direction:column;align-items:center;padding:12px;gap:8px}'+
      '.donut-box-title{font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#525f48;align-self:flex-start;margin-bottom:4px}.donut-legend{width:100%;font-size:10px}'+
      '.donut-leg-row{display:flex;align-items:center;gap:6px;margin-bottom:5px}.donut-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0}.donut-leg-lbl{flex:1;color:#5f6d52}.donut-leg-val{font-weight:700;font-size:10px}'+
      '.section-title{font-size:10px;font-weight:700;color:#28322a;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;display:flex;align-items:center;gap:8px}.section-title::after{content:"";flex:1;height:1px;background:#d9dbc9}'+
      '.kas-print-page{page-break-before:always;break-before:page}'+
      '.kas-print-page.no-break{page-break-before:auto;break-before:auto}'+
      '.kas-detail-row{display:flex;gap:12px;align-items:stretch}'+
      '.kas-detail-main{flex:1.45;min-width:0}'+
      '.kas-detail-side{flex:1;min-width:0;display:flex;flex-direction:column}'+
      '.catatan-card-side{padding:12px 14px;flex:1}'+
      '.catatan-text{font-size:10.5px;line-height:1.7}'+
      'table{width:100%;border-collapse:collapse;font-size:8.5px}'+
      'th,td{border:1px solid #e6e1cb;padding:4px 6px;text-align:center;color:#28322a;overflow-wrap:break-word}'+
      'th{background:#efe9d8;color:#525f48;font-weight:600;font-size:8px;letter-spacing:.2px;text-transform:uppercase}'+
      'td.tl{text-align:left}'+
      'tr.gender-sep td{background:#eef4ea;color:#2e7d55;font-weight:700;text-align:left;font-size:9px;letter-spacing:.5px;text-transform:uppercase}'+
      '.badge{display:inline-block;border-radius:99px;padding:1px 6px;font-size:9px;font-weight:700}'+
      '.bh{background:#e2f0e7;color:#2e7d55}.bi{background:#f5ead0;color:#b07b1f}.ba{background:#f6e2df;color:#a83a33}'+
      '.iz-alasan{font-size:7px;color:#b07b1f;line-height:1.25;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:1px auto 0;font-style:italic}'+
      '@page{size:A4 landscape;margin:10mm}'+
      '@media print{body{background:#fff}.stat-card,.tbl-card,.chart-card{box-shadow:none}}'+
    '</style></head><body>'+
    '<div class="print-hd"><h2>Rekap Absensi Muda-Mudi Margosari</h2><div class="subtitle">'+periodLabel+'</div></div>'+
    statHtml+insightPrintHtml+chartHtml+'<h3>Tabel Rekap</h3>'+tableHtml+kasPrintHtml+
    '</body></html>'
  );
}

function _printRsItem(v, l, c){
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;border-radius:8px">'+
    '<div style="font-size:26px;font-weight:300;line-height:1;letter-spacing:-.5px;color:'+c+'">'+v+'</div>'+
    '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#7c8a6c;font-weight:500;margin-top:3px">'+l+'</div>'+
  '</div>';
}
