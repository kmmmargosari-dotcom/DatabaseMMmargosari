// ══════════════════════════════════════════════════
// KAS / KEUANGAN MODULE
// ══════════════════════════════════════════════════

var _KAS_SEED = [
  {id:'seed-apr-01',jenis:'pengeluaran',nominal:50000,  tanggal:'2026-04-12',keterangan:'Snack Bontotan',     createdAt:1001},
  {id:'seed-apr-02',jenis:'pemasukan',  nominal:22000,  tanggal:'2026-04-14',keterangan:'Shodaqoh Ngaji',     createdAt:1002},
  {id:'seed-apr-03',jenis:'pengeluaran',nominal:26000,  tanggal:'2026-04-14',keterangan:'Snack Ngaji',        createdAt:1003},
  {id:'seed-apr-04',jenis:'pemasukan',  nominal:55000,  tanggal:'2026-04-17',keterangan:'shodaqoh absen',     createdAt:1004},
  {id:'seed-apr-05',jenis:'pengeluaran',nominal:217000, tanggal:'2026-04-21',keterangan:'Keakraban Grill',    createdAt:1005},
  {id:'seed-apr-06',jenis:'pemasukan',  nominal:200000, tanggal:'2026-04-21',keterangan:'Subsidi Kelompok',   createdAt:1006},
  {id:'seed-apr-07',jenis:'pengeluaran',nominal:200000, tanggal:'2026-04-28',keterangan:'Kado Nezza',         createdAt:1007},
  {id:'seed-apr-08',jenis:'pemasukan',  nominal:6000,   tanggal:'2026-04-27',keterangan:'Shodaqoh Ngaji',     createdAt:1008},
  {id:'seed-apr-09',jenis:'pemasukan',  nominal:29000,  tanggal:'2026-04-28',keterangan:'Shodaqoh Ngaji',     createdAt:1009},
  {id:'seed-mei-01',jenis:'pemasukan',  nominal:18000,  tanggal:'2026-05-04',keterangan:'Shodaqoh',           createdAt:2001},
  {id:'seed-mei-02',jenis:'pemasukan',  nominal:22000,  tanggal:'2026-05-12',keterangan:'Shodaqoh',           createdAt:2002},
  {id:'seed-mei-03',jenis:'pemasukan',  nominal:11000,  tanggal:'2026-05-18',keterangan:'Shodaqoh',           createdAt:2003},
  {id:'seed-mei-04',jenis:'pemasukan',  nominal:26000,  tanggal:'2026-05-19',keterangan:'Shodaqoh',           createdAt:2004},
  {id:'seed-mei-05',jenis:'pemasukan',  nominal:53000,  tanggal:'2026-05-22',keterangan:'Shodaqoh',           createdAt:2005},
  {id:'seed-mei-06',jenis:'pengeluaran',nominal:67000,  tanggal:'2026-05-22',keterangan:'Snack Ngaji',        createdAt:2006},
  {id:'seed-mei-07',jenis:'pengeluaran',nominal:30500,  tanggal:'2026-05-26',keterangan:'Snack takbiran',     createdAt:2007},
  {id:'seed-mei-08',jenis:'pengeluaran',nominal:46000,  tanggal:'2026-05-26',keterangan:'Snack Takbiaran',    createdAt:2008},
  {id:'seed-mei-09',jenis:'pengeluaran',nominal:50000,  tanggal:'2026-05-26',keterangan:'Snack Bontotan',     createdAt:2009},
  {id:'seed-mei-10',jenis:'pengeluaran',nominal:58000,  tanggal:'2026-05-31',keterangan:'bakar2',             createdAt:2010},
  {id:'seed-jun-01',jenis:'pemasukan',  nominal:32500,  tanggal:'2026-06-02',keterangan:'Shodaqoh Ngaji',     createdAt:3001},
  {id:'seed-jun-02',jenis:'pengeluaran',nominal:300000, tanggal:'2026-06-07',keterangan:'kado resti',         createdAt:3002},
  {id:'seed-jun-03',jenis:'pengeluaran',nominal:245000, tanggal:'2026-06-07',keterangan:'bakso',              createdAt:3003},
  {id:'seed-jun-04',jenis:'pengeluaran',nominal:43500,  tanggal:'2026-06-14',keterangan:'bontotan',           createdAt:3004},
  {id:'seed-jun-05',jenis:'pemasukan',  nominal:15000,  tanggal:'2026-06-09',keterangan:'Shodaqoh Ngaji',     createdAt:3005},
  {id:'seed-jun-06',jenis:'pemasukan',  nominal:24000,  tanggal:'2026-06-16',keterangan:'Shodaqoh Ngaji',     createdAt:3006},
  {id:'seed-jun-07',jenis:'pemasukan',  nominal:52000,  tanggal:'2026-06-16',keterangan:'Sisa keakraban',     createdAt:3007},
  {id:'seed-jun-08',jenis:'pengeluaran',nominal:120000, tanggal:'2026-06-16',keterangan:'Beli Hadist',        createdAt:3008}
];

function seedKasData(){
  if(!_fbReady) return;
  if(kasTransaksi.length > 0) return;
  if(!localStorage.getItem('kas_saldo_awal')){
    kasSaldoAwal = 1045700;
    localStorage.setItem('kas_saldo_awal','1045700');
  }
  _KAS_SEED.forEach(function(trx){
    var exists = kasTransaksi.find(function(k){ return k.id===trx.id; });
    if(!exists){
      kasTransaksi.push(trx);
      fbSaveKas(trx.id,{jenis:trx.jenis,nominal:trx.nominal,tanggal:trx.tanggal,keterangan:trx.keterangan,createdAt:trx.createdAt});
    }
  });
  renderKas();
  showToast('✅ Data kas April–Juni 2026 dimuat');
}

// ── Sort & Running Saldo ──
function kasSorted(){
  return kasTransaksi.slice().sort(function(a,b){
    if(a.tanggal<b.tanggal) return -1;
    if(a.tanggal>b.tanggal) return  1;
    return (a.createdAt||0)-(b.createdAt||0);
  });
}

function kasCalcRunning(){
  var sorted = kasSorted();
  var saldo  = kasSaldoAwal;
  return sorted.map(function(trx){
    if(trx.jenis==='pemasukan') saldo += trx.nominal;
    else                        saldo -= trx.nominal;
    return {trx:trx, saldo:saldo};
  });
}

// ── Filter Helpers ──
function kasGetBulan(){
  if(mob()){
    var elM = document.getElementById('kasBulanM');
    if(elM) return elM.value;
  }
  var el = document.getElementById('kasBulan');
  return el ? el.value : String(new Date().getMonth()+1).padStart(2,'0');
}

function kasGetTahun(){
  if(mob()){
    var elM = document.getElementById('kasTahunM');
    if(elM) return elM.value;
  }
  var el = document.getElementById('kasTahun');
  return el ? el.value : String(new Date().getFullYear());
}

// ── Main Render ──
function renderKas(){
  var bulan = kasGetBulan();
  var tahun = kasGetTahun();
  ['kasBulan','kasBulanM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=bulan; });
  ['kasTahun','kasTahunM'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=tahun; });

  var bulanNum = parseInt(bulan,10);
  var tahunNum = parseInt(tahun,10);
  var prefix   = tahun+'-'+bulan;
  var allRun   = kasCalcRunning();

  var saldoAwal = kasSaldoAwal;
  for(var i=0;i<allRun.length;i++){
    var t  = allRun[i].trx.tanggal;
    var tp = t.split('-');
    if(tp[0]<tahun||(tp[0]===tahun&&parseInt(tp[1])<bulanNum)){
      saldoAwal = allRun[i].saldo;
    }
  }

  var periodItems = allRun.filter(function(item){ return item.trx.tanggal.startsWith(prefix); });
  var totalMasuk=0, totalKeluar=0;
  periodItems.forEach(function(item){
    if(item.trx.jenis==='pemasukan') totalMasuk  += item.trx.nominal;
    else                             totalKeluar += item.trx.nominal;
  });
  var selisih    = totalMasuk - totalKeluar;
  var saldoAkhir = saldoAwal + selisih;
  var saldoTotal = allRun.length>0 ? allRun[allRun.length-1].saldo : kasSaldoAwal;

  var now        = new Date();
  var nowBulan   = String(now.getMonth()+1).padStart(2,'0');
  var nowTahun   = String(now.getFullYear());
  var isCurrent  = (bulan===nowBulan && tahun===nowTahun);
  var periodeLabel= BULAN_ID[bulanNum]+' '+tahun;
  var subLabel   = isCurrent?'Bulan Ini':periodeLabel;

  setText('ks-saldo',  fmtRp(saldoTotal));
  setText('ks-masuk',  fmtRp(totalMasuk));
  setText('ks-keluar', fmtRp(totalKeluar));
  var selVal = document.getElementById('ks-selisih');
  if(selVal){ selVal.textContent=fmtRp(Math.abs(selisih)); selVal.style.color=selisih>=0?'var(--green)':'var(--red)'; }
  setText('ks-masuk-sub',  subLabel);
  setText('ks-keluar-sub', subLabel);
  var selSub = document.getElementById('ks-selisih-sub');
  if(selSub){ selSub.textContent=selisih>=0?'Surplus':'Defisit'; selSub.style.color=selisih>=0?'var(--amber)':'var(--red)'; }

  setText('cf-saldo-awal',   fmtRp(saldoAwal));
  setText('cf-pemasukan',    fmtRp(totalMasuk));
  setText('cf-pengeluaran',  fmtRp(totalKeluar));
  var cfSel = document.getElementById('cf-selisih');
  if(cfSel){ cfSel.textContent=(selisih<0?'-':'')+fmtRp(Math.abs(selisih)); cfSel.style.color=selisih>=0?'var(--green)':'var(--red)'; }
  setText('cf-saldo-akhir', fmtRp(saldoAkhir));
  setText('kasCfPeriodeLabel',  periodeLabel);
  setText('kasCfPeriodeLabelM', periodeLabel);
  setText('riwayatSaldoAwalDisplay', fmtRp(kasSaldoAwal));

  var titleEl = document.getElementById('kasTblTitle');
  if(titleEl) titleEl.textContent = 'TRANSAKSI PERIODE '+BULAN_ID[bulanNum].toUpperCase()+' '+tahun;
  setText('kasTblSaldoAwalVal', fmtRp(saldoAwal));

  var tbody = document.getElementById('kasTblBody');
  if(tbody){
    var html='';
    if(periodItems.length===0){
      html+='<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:24px;font-style:italic">Belum ada transaksi periode ini.</td></tr>';
    } else {
      periodItems.forEach(function(item){
        var trx=item.trx;
        var masukStr  = trx.jenis==='pemasukan'   ?'<span class="kas-masuk">'+fmtRp(trx.nominal)+'</span>':'<span style="color:var(--text3)">—</span>';
        var keluarStr = trx.jenis==='pengeluaran' ?'<span class="kas-keluar">'+fmtRp(trx.nominal)+'</span>':'<span style="color:var(--text3)">—</span>';
        html+='<tr>';
        html+='<td style="white-space:nowrap;color:var(--text2);font-size:11.5px">'+fmtTglShort(trx.tanggal)+'</td>';
        html+='<td>'+escHtml(trx.keterangan||'')+'</td>';
        html+='<td class="r">'+masukStr+'</td>';
        html+='<td class="r">'+keluarStr+'</td>';
        html+='<td class="r" style="font-weight:600">'+fmtRp(item.saldo)+'</td>';
        html+='</tr>';
      });
    }
    html+='<tr class="kas-total-row">';
    html+='<td colspan="2" style="text-align:left;letter-spacing:.3px">TOTAL</td>';
    html+='<td class="r kas-masuk">'+fmtRp(totalMasuk)+'</td>';
    html+='<td class="r kas-keluar">'+fmtRp(totalKeluar)+'</td>';
    html+='<td class="r" style="color:var(--brown)">'+fmtRp(saldoAkhir)+'</td>';
    html+='</tr>';
    tbody.innerHTML='<tr class="kas-tbl-saldo-awal-row" id="kasTblSaldoAwalRow"><td style="color:var(--text3);font-size:11px">—</td><td style="font-style:italic;color:var(--text2);font-size:12px">Saldo Awal Periode</td><td class="r">—</td><td class="r">—</td><td class="r kas-saldo-awal-val" id="kasTblSaldoAwalVal" style="font-weight:700;color:var(--amber)">'+fmtRp(saldoAwal)+'</td></tr>'+html;
  }

  setText('mks-saldo',  fmtRp(saldoTotal));
  setText('mks-masuk',  fmtRp(totalMasuk));
  setText('mks-keluar', fmtRp(totalKeluar));
  var mSelVal = document.getElementById('mks-selisih');
  if(mSelVal){ mSelVal.textContent=fmtRp(Math.abs(selisih)); mSelVal.style.color=selisih>=0?'var(--green)':'var(--red)'; }
  setText('mks-masuk-sub',  subLabel);
  setText('mks-keluar-sub', subLabel);
  var mSelSub = document.getElementById('mks-selisih-sub');
  if(mSelSub){ mSelSub.textContent=selisih>=0?'Surplus':'Defisit'; mSelSub.style.color=selisih>=0?'var(--amber)':'var(--red)'; }

  setText('mcf-saldo-awal',  fmtRp(saldoAwal));
  setText('mcf-pemasukan',   fmtRp(totalMasuk));
  setText('mcf-pengeluaran', fmtRp(totalKeluar));
  var mcfSel = document.getElementById('mcf-selisih');
  if(mcfSel){ mcfSel.textContent=(selisih<0?'-':'')+fmtRp(Math.abs(selisih)); mcfSel.style.color=selisih>=0?'var(--green)':'var(--red)'; }
  setText('mcf-saldo-akhir', fmtRp(saldoAkhir));

  var mTitle = document.getElementById('kasMobTblTitle');
  if(mTitle) mTitle.textContent='TRANSAKSI PERIODE '+BULAN_ID[bulanNum].toUpperCase()+' '+tahun;
  var mBody = document.getElementById('kasMobTblBody');
  if(mBody){
    if(periodItems.length===0){
      mBody.innerHTML='<div class="empty">Belum ada transaksi periode ini.</div>';
    } else {
      var mHtml='<div class="kas-mob-trx-card">';
      periodItems.forEach(function(item){
        var trx=item.trx;
        var isPemasukan=trx.jenis==='pemasukan';
        var dotColor=isPemasukan?'var(--green)':'var(--red)';
        var nominalStr=(isPemasukan?'+':'-')+fmtRp(trx.nominal);
        var nominalColor=isPemasukan?'var(--green)':'var(--red)';
        mHtml+='<div class="kas-mob-trx-item">';
        mHtml+='<div class="kas-mob-trx-dot" style="background:'+dotColor+'"></div>';
        mHtml+='<div class="kas-mob-trx-info"><div class="kas-mob-trx-date">'+fmtTglShort(trx.tanggal)+'</div><div class="kas-mob-trx-ket">'+escHtml(trx.keterangan||'')+'</div></div>';
        mHtml+='<div class="kas-mob-trx-right"><div class="kas-mob-trx-nominal" style="color:'+nominalColor+'">'+nominalStr+'</div><div class="kas-mob-trx-saldo">'+fmtRp(item.saldo)+'</div></div>';
        mHtml+='</div>';
      });
      mHtml+='</div>';
      mHtml+='<div class="kas-mob-total-row" style="margin-top:8px;border-radius:var(--rl)">';
      mHtml+='<span class="kas-mob-total-lbl">Masuk: <span class="kas-masuk">'+fmtRp(totalMasuk)+'</span> &nbsp;·&nbsp; Keluar: <span class="kas-keluar">'+fmtRp(totalKeluar)+'</span></span>';
      mHtml+='<span class="kas-mob-total-val" style="color:var(--brown)">'+fmtRp(saldoAkhir)+'</span>';
      mHtml+='</div>';
      mBody.innerHTML = mHtml;
    }
  }

  renderKasDonut(totalMasuk, totalKeluar);
  renderKasLineChart(tahun);
}

// ── Donut Chart ──
function renderKasDonut(totalMasuk, totalKeluar){
  var targets=[{svg:'kasDonutSvg',leg:'kasDonutLegend'},{svg:'kasDonutSvgM',leg:'kasDonutLegendM'}];
  var total=totalMasuk+totalKeluar;
  var selisih=totalMasuk-totalKeluar;
  var cColor=selisih>=0?'#1f6045':'#c0392b';
  targets.forEach(function(t){
    var svgEl=document.getElementById(t.svg);
    var legEl=document.getElementById(t.leg);
    if(!svgEl) return;
    var isMob=t.svg==='kasDonutSvgM';
    var r=50,cx=68,cy=68,W=136,stroke=26;
    if(isMob){r=42;cx=54;cy=54;W=108;stroke=22;}
    var circ=2*Math.PI*r;
    var svgHtml='<svg width="'+W+'" height="'+W+'" viewBox="0 0 '+W+' '+W+'" style="overflow:visible">';
    svgHtml+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--bg2,#f0ece4)" stroke-width="'+stroke+'"/>';
    if(total>0){
      var pM=totalMasuk/total,pK=totalKeluar/total;
      if(totalMasuk>0){
        svgHtml+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#1f6045" stroke-width="'+stroke+'"'+
          ' stroke-dasharray="'+(circ*pM)+' '+(circ*(1-pM))+'"'+
          ' stroke-dashoffset="'+(circ*0.25)+'"'+
          ' style="transition:stroke-dasharray .35s"/>';
      }
      if(totalKeluar>0){
        svgHtml+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#c0392b" stroke-width="'+stroke+'"'+
          ' stroke-dasharray="'+(circ*pK)+' '+(circ*(1-pK))+'"'+
          ' stroke-dashoffset="'+(circ*(0.25-pM))+'"'+
          ' style="transition:stroke-dasharray .35s"/>';
      }
    }
    var fs1=isMob?'8':'9',fs2=isMob?'9.5':'10.5';
    svgHtml+='<text x="'+cx+'" y="'+(cy-7)+'" text-anchor="middle" font-size="'+fs1+'" fill="#aaa" font-family="sans-serif">Selisih</text>';
    svgHtml+='<text x="'+cx+'" y="'+(cy+8)+'" text-anchor="middle" font-size="'+fs2+'" font-weight="700" fill="'+cColor+'" font-family="sans-serif">'+fmtRp(Math.abs(selisih))+'</text>';
    svgHtml+='</svg>';
    svgEl.innerHTML=svgHtml;
    if(legEl){
      if(total===0){
        legEl.innerHTML='<div style="color:var(--text3);font-size:11px;padding:4px 0">Belum ada transaksi</div>';
      } else {
        legEl.innerHTML='<div class="kas-donut-legend">'+
          '<div class="kas-donut-leg-item"><span class="kas-donut-dot" style="background:#1f6045"></span><span class="kas-donut-leg-lbl">Masuk</span><span class="kas-donut-leg-val" style="color:#1f6045">'+fmtRp(totalMasuk)+'</span></div>'+
          '<div class="kas-donut-leg-item"><span class="kas-donut-dot" style="background:#c0392b"></span><span class="kas-donut-leg-lbl">Keluar</span><span class="kas-donut-leg-val" style="color:#c0392b">'+fmtRp(totalKeluar)+'</span></div>'+
          '</div>';
      }
    }
  });
}

// ── Line Chart Tahunan ──
function renderKasLineChart(tahun){
  var BULAN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
  var masuk=[0,0,0,0,0,0,0,0,0,0,0,0];
  var keluar=[0,0,0,0,0,0,0,0,0,0,0,0];
  kasTransaksi.forEach(function(trx){
    if(!trx.tanggal) return;
    var parts=trx.tanggal.split('-');
    if(parts[0]!==tahun) return;
    var m=parseInt(parts[1],10)-1;
    if(m<0||m>11) return;
    if(trx.jenis==='pemasukan') masuk[m]+=trx.nominal;
    else keluar[m]+=trx.nominal;
  });

  function fmtK(n){
    if(n>=1000000000) return (n/1000000000).toFixed(1).replace(/\.0$/,'')+'M';
    if(n>=1000000)    return (n/1000000).toFixed(1).replace(/\.0$/,'')+'jt';
    if(n>=1000)       return Math.round(n/1000)+'k';
    return String(n);
  }

  function buildSvg(isMob){
    var W=isMob?340:560,H=isMob?130:158;
    var padL=isMob?44:50,padR=14,padT=20,padB=isMob?26:30;
    var cW=W-padL-padR,cH=H-padT-padB;
    var maxVal=Math.max.apply(null,masuk.concat(keluar).concat([1]));
    var mag=Math.pow(10,Math.floor(Math.log10(maxVal)));
    maxVal=Math.ceil(maxVal/mag)*mag;

    function xP(i){ return padL+i*(cW/11); }
    function yP(v){ return padT+cH-(v/maxVal)*cH; }

    var fs=isMob?7.5:9;
    var svg='<svg width="100%" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">';

    // horizontal grid lines
    [0,0.5,1].forEach(function(frac){
      var v=maxVal*frac;
      var y=yP(v).toFixed(1);
      svg+='<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" stroke="var(--border)" stroke-width="0.8" stroke-dasharray="3 3"/>';
      svg+='<text x="'+(padL-5)+'" y="'+(parseFloat(y)+3.5).toFixed(1)+'" text-anchor="end" font-size="'+fs+'" fill="var(--text3)" font-family="sans-serif">'+fmtK(v)+'</text>';
    });

    // vertical lines (subtle)
    for(var i=0;i<12;i++){
      var xv=xP(i).toFixed(1);
      svg+='<line x1="'+xv+'" y1="'+padT+'" x2="'+xv+'" y2="'+(padT+cH)+'" stroke="var(--border)" stroke-width="0.5" opacity="0.5"/>';
    }

    // area fills
    function area(data,color){
      var pts=padL+','+(padT+cH)+' ';
      data.forEach(function(v,i){ pts+=xP(i).toFixed(1)+','+yP(v).toFixed(1)+' '; });
      pts+=(W-padR)+','+(padT+cH);
      return '<polygon points="'+pts+'" fill="'+color+'" opacity="0.07"/>';
    }
    svg+=area(masuk,'#1f6045');
    svg+=area(keluar,'#c0392b');

    // lines
    function line(data,color){
      var d='';
      data.forEach(function(v,i){
        d+=(i===0?'M ':'L ')+xP(i).toFixed(1)+' '+yP(v).toFixed(1)+' ';
      });
      return '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+(isMob?1.8:2.2)+'" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    svg+=line(masuk,'#1f6045');
    svg+=line(keluar,'#c0392b');

    // dots + value labels for non-zero
    function dots(data,color){
      var s='';
      data.forEach(function(v,i){
        var x=xP(i).toFixed(1),y=yP(v).toFixed(1),r=isMob?2.8:3.2;
        s+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'" stroke="var(--bg)" stroke-width="1.5"/>';
        if(v>0){
          var ly=(parseFloat(y)-(isMob?7:9)).toFixed(1);
          s+='<text x="'+x+'" y="'+ly+'" text-anchor="middle" font-size="'+(isMob?7:8)+'" fill="'+color+'" font-family="sans-serif" font-weight="600">'+fmtK(v)+'</text>';
        }
      });
      return s;
    }
    svg+=dots(masuk,'#1f6045');
    svg+=dots(keluar,'#c0392b');

    // x-axis month labels
    BULAN.forEach(function(lbl,i){
      svg+='<text x="'+xP(i).toFixed(1)+'" y="'+(H-4)+'" text-anchor="middle" font-size="'+fs+'" fill="var(--text3)" font-family="sans-serif">'+lbl+'</text>';
    });

    svg+='</svg>';
    return svg;
  }

  // PC
  var elPc=document.getElementById('kasLineChart');
  var elYr=document.getElementById('kasLineYear');
  if(elPc){ elPc.innerHTML=buildSvg(false); }
  if(elYr){ elYr.textContent=tahun; }

  // Mobile
  var elMob=document.getElementById('kasLineChartM');
  var elYrM=document.getElementById('kasLineYearM');
  if(elMob){ elMob.innerHTML=buildSvg(true); }
  if(elYrM){ elYrM.textContent=tahun; }
}

// ── Tambah / Edit Popup ──
function openKasTambah(editData){
  var isEdit=editData&&editData.id;
  setText('kasTambahTitle',isEdit?'Edit Transaksi':'Tambah Transaksi');
  document.getElementById('kasEditId').value = isEdit?editData.id:'';
  setKasJenis(isEdit?editData.jenis:'pemasukan');
  document.getElementById('kasNominal').value    = isEdit?editData.nominal:'';
  document.getElementById('kasTanggal').value    = isEdit?editData.tanggal:kasDefaultTgl();
  document.getElementById('kasKeterangan').value = isEdit?(editData.keterangan||''):'';
  showPopup('kas-tambah-overlay','kas-tambah-popup');
}

function closeKasTambah(){ hidePopup('kas-tambah-overlay','kas-tambah-popup'); }

function kasDefaultTgl(){
  var d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function setKasJenis(jenis){
  document.getElementById('kasJenis').value = jenis;
  document.getElementById('kasJenisP').classList.toggle('on',jenis==='pemasukan');
  document.getElementById('kasJenisK').classList.toggle('on',jenis==='pengeluaran');
}

function submitKasTambah(){
  var jenis  = document.getElementById('kasJenis').value;
  var nominal= parseFloat(document.getElementById('kasNominal').value);
  var tanggal= document.getElementById('kasTanggal').value;
  var ket    = document.getElementById('kasKeterangan').value.trim();
  var editId = document.getElementById('kasEditId').value;
  if(!tanggal){ showToast('Isi tanggal transaksi'); return; }
  if(isNaN(nominal)||nominal<=0){ showToast('Nominal harus lebih dari 0'); return; }
  var id     = editId||('kas-'+Date.now()+'-'+Math.random().toString(36).slice(2,7));
  var record = {id:id,jenis:jenis,nominal:nominal,tanggal:tanggal,keterangan:ket,createdAt:editId?undefined:Date.now()};
  if(!record.createdAt) record.createdAt=Date.now();
  var idx = kasTransaksi.findIndex(function(k){ return k.id===id; });
  if(idx>=0) kasTransaksi[idx]=record; else kasTransaksi.push(record);
  fbSaveKas(id,{jenis:record.jenis,nominal:record.nominal,tanggal:record.tanggal,keterangan:record.keterangan,createdAt:record.createdAt});
  closeKasTambah();
  closeKasRiwayat();
  renderKas();
  renderKasRiwayat();
  showToast(editId?'Transaksi diperbarui':'Transaksi ditambahkan');
}

function kasEditTrx(id){
  var trx=kasTransaksi.find(function(k){return k.id===id;});
  if(trx) openKasTambah(trx);
}

function kasDelTrx(id){
  if(!confirm('Hapus transaksi ini?')) return;
  kasTransaksi=kasTransaksi.filter(function(k){return k.id!==id;});
  fbDelKas(id);
  renderKas();
  renderKasRiwayat();
  showToast('Transaksi dihapus');
}

// ── Saldo Awal ──
function toggleSaldoAwalEdit(){
  openKasRiwayat();
  setTimeout(function(){ toggleRiwayatSaldoEdit(); },150);
}

function saveKasSaldoAwal(){ saveRiwayatSaldoAwal(); }

// ── Export ──
function openKasExport(){ showPopup('kas-export-overlay','kas-export-popup'); }
function closeKasExport(){ hidePopup('kas-export-overlay','kas-export-popup'); }

function kasExport(type){
  closeKasExport();
  var bulan   = kasGetBulan();
  var tahun   = kasGetTahun();
  var bulanNum= parseInt(bulan,10);
  var prefix  = tahun+'-'+bulan;
  var allRun  = kasCalcRunning();
  var saldoAwal=0;
  for(var i=0;i<allRun.length;i++){
    var tp=allRun[i].trx.tanggal.split('-');
    if(tp[0]<tahun||(tp[0]===tahun&&parseInt(tp[1])<bulanNum)) saldoAwal=allRun[i].saldo;
  }
  var periodItems=allRun.filter(function(item){return item.trx.tanggal.startsWith(prefix);});
  var totalMasuk=0,totalKeluar=0;
  periodItems.forEach(function(item){
    if(item.trx.jenis==='pemasukan') totalMasuk+=item.trx.nominal; else totalKeluar+=item.trx.nominal;
  });
  var selisih=totalMasuk-totalKeluar;
  var saldoAkhir=saldoAwal+selisih;
  var periodeLabel=BULAN_ID[bulanNum]+' '+tahun;

  if(type==='print'){
    var donutR=54,donutCx=70,donutCy=70,donutW=14;
    var donutTotal=totalMasuk+totalKeluar;
    var donutSvg='';
    if(donutTotal>0){
      var pctMasuk=totalMasuk/donutTotal,pctKeluar=totalKeluar/donutTotal;
      var circ=2*Math.PI*donutR;
      var dashM=pctMasuk*circ,gapM=circ-dashM,dashK=pctKeluar*circ,gapK=circ-dashK,rotateK=-90+pctMasuk*360;
      donutSvg='<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">'+
        '<circle cx="'+donutCx+'" cy="'+donutCy+'" r="'+donutR+'" fill="none" stroke="#e8e0d0" stroke-width="'+donutW+'"/>'+
        '<circle cx="'+donutCx+'" cy="'+donutCy+'" r="'+donutR+'" fill="none" stroke="#1f6045" stroke-width="'+donutW+'" stroke-dasharray="'+dashM+' '+gapM+'" transform="rotate(-90 '+donutCx+' '+donutCy+')" stroke-linecap="round"/>'+
        (totalKeluar>0?'<circle cx="'+donutCx+'" cy="'+donutCy+'" r="'+donutR+'" fill="none" stroke="#c0392b" stroke-width="'+donutW+'" stroke-dasharray="'+dashK+' '+gapK+'" transform="rotate('+rotateK+' '+donutCx+' '+donutCy+')" stroke-linecap="round"/>':'')+
        '<text x="'+donutCx+'" y="'+(donutCy-5)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#3b2a00">'+Math.round(pctMasuk*100)+'%</text>'+
        '<text x="'+donutCx+'" y="'+(donutCy+10)+'" text-anchor="middle" font-size="9" fill="#888">Masuk</text>'+
        '</svg>';
    } else {
      donutSvg='<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg"><circle cx="70" cy="70" r="54" fill="none" stroke="#e8e0d0" stroke-width="14"/><text x="70" y="75" text-anchor="middle" font-size="11" fill="#aaa">Kosong</text></svg>';
    }
    var rows='',rowNo=1;
    rows+='<tr class="saldo-awal-row"><td colspan="2" style="font-style:italic;color:#888;font-size:10.5px">Saldo Awal Periode</td><td></td><td></td><td class="num bold" style="color:#7a5800">'+fmtRp(saldoAwal)+'</td></tr>';
    periodItems.forEach(function(item){
      var trx=item.trx;
      var masuk =trx.jenis==='pemasukan'   ?fmtRp(trx.nominal):'-';
      var keluar=trx.jenis==='pengeluaran' ?fmtRp(trx.nominal):'-';
      var shade=rowNo%2===0?'background:#fafaf8':'';
      rows+='<tr style="'+shade+'"><td style="white-space:nowrap;font-size:10.5px">'+fmtTglShort(trx.tanggal)+'</td><td style="font-size:10.5px">'+escHtml(trx.keterangan||'')+'</td><td class="num green" style="font-size:10.5px">'+masuk+'</td><td class="num red" style="font-size:10.5px">'+keluar+'</td><td class="num bold" style="font-size:10.5px">'+fmtRp(item.saldo)+'</td></tr>';
      rowNo++;
    });
    var printedAt=new Date().toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'});
    var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'+
      '<title>Laporan Keuangan Muda-Mudi Margosari — '+periodeLabel+'</title>'+
      '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;font-size:11px;color:#222;background:#fff;padding:24px 28px}'+
      '.print-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;margin-bottom:16px;border-bottom:3px solid #c8a44a}'+
      '.ph-left{display:flex;align-items:center;gap:14px}.ph-icon{width:46px;height:46px;background:#f5eedd;border:1.5px solid #c8a44a;border-radius:11px;display:flex;align-items:center;justify-content:center}'+
      '.ph-sub{font-size:9.5px;color:#c8a44a;letter-spacing:.6px;font-weight:700;text-transform:uppercase;margin-bottom:3px}.ph-title{font-size:18px;font-weight:800;color:#3b2a00}'+
      '.ph-right{text-align:right}.ph-period-lbl{font-size:9px;color:#aaa;letter-spacing:.3px;text-transform:uppercase;margin-bottom:3px}.ph-period-val{font-size:15px;font-weight:700;color:#3b2a00}'+
      '.ph-badge{display:inline-block;margin-top:4px;background:#f5eedd;border:1px solid #c8a44a;color:#7a5800;font-size:9px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:.3px}'+
      '.cf-donut-row{display:flex;gap:12px;margin-bottom:14px;align-items:stretch}.cf-box{flex:1;border:1px solid #e8e0d0;border-radius:8px;overflow:hidden}'+
      '.cf-box-title{font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#7a5800;padding:9px 12px;border-bottom:1px solid #f0ece4;background:#f9f6ee}'+
      '.cf-row{display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #f5f0e8;gap:10px;font-size:10.5px}.cf-row:last-child{border-bottom:none}'+
      '.cf-icon{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}.cf-lbl{flex:1;color:#555}.cf-val{font-weight:600}'+
      '.cf-saldo-akhir{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#f9f2dd;border-top:2px solid #c8a44a}.cf-sa-lbl{font-size:11px;font-weight:700;color:#7a5800}.cf-sa-val{font-size:14px;font-weight:700;color:#7a5800}'+
      '.donut-box{width:180px;flex-shrink:0;border:1px solid #e8e0d0;border-radius:8px;display:flex;flex-direction:column;align-items:center;padding:12px;gap:8px}'+
      '.donut-box-title{font-size:9.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#7a5800;align-self:flex-start;margin-bottom:4px}.donut-legend{width:100%;font-size:10px}'+
      '.donut-leg-row{display:flex;align-items:center;gap:6px;margin-bottom:5px}.donut-dot{width:9px;height:9px;border-radius:2px;flex-shrink:0}.donut-leg-lbl{flex:1;color:#555}.donut-leg-val{font-weight:700;font-size:10px}'+
      '.section-title{font-size:9.5px;font-weight:700;color:#3b2a00;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;display:flex;align-items:center;gap:8px}.section-title::after{content:"";flex:1;height:1px;background:#e8e0d0}'+
      'table{width:100%;border-collapse:collapse}thead tr{background:#f0ece4}th{padding:6px 9px;font-size:9.5px;font-weight:700;color:#5a4200;letter-spacing:.3px;text-align:left;border-bottom:2px solid #c8a44a}'+
      'td{padding:5px 9px;border-bottom:1px solid #f0ece4;vertical-align:top}.num{text-align:right}.bold{font-weight:700}.green{color:#1f6045}.red{color:#c0392b}'+
      '.saldo-awal-row td{background:#f9f6ee}.total-row td{background:#f0ece4;font-weight:700;border-top:2px solid #c8a44a}'+
      '.footer{margin-top:14px;padding-top:10px;border-top:1px solid #e8e0d0;display:flex;justify-content:space-between;align-items:flex-end}.footer-left{font-size:9px;color:#999}'+
      '.sign-box{text-align:center;font-size:9.5px}.sign-line{width:130px;border-top:1px solid #555;margin:28px auto 4px}'+
      '@media print{body{padding:12px 16px}.no-print{display:none!important}}'+
      '</style></head><body>'+
      '<div class="print-header"><div class="ph-left"><div class="ph-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8a44a" stroke-width="1.8"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg></div>'+
      '<div><div class="ph-sub">Laporan Keuangan</div><div class="ph-title">Muda-Mudi Margosari</div></div></div>'+
      '<div class="ph-right"><div class="ph-period-lbl">Periode Aktif</div><div class="ph-period-val">'+periodeLabel+'</div><div class="ph-badge">Kas &amp; Keuangan</div></div></div>'+
      '<div class="cf-donut-row"><div class="cf-box"><div class="cf-box-title">📋 Cash Flow Periode</div>'+
      '<div class="cf-row"><div class="cf-icon" style="background:#f5f0e0">💼</div><span class="cf-lbl">Saldo Awal</span><span class="cf-val" style="color:#7a5800">'+fmtRp(saldoAwal)+'</span></div>'+
      '<div class="cf-row"><div class="cf-icon" style="background:#eef8f2">↑</div><span class="cf-lbl">Total Pemasukan</span><span class="cf-val" style="color:#1f6045">'+fmtRp(totalMasuk)+'</span></div>'+
      '<div class="cf-row"><div class="cf-icon" style="background:#fef2f2">↓</div><span class="cf-lbl">Total Pengeluaran</span><span class="cf-val" style="color:#c0392b">'+fmtRp(totalKeluar)+'</span></div>'+
      '<div class="cf-row"><div class="cf-icon" style="background:#fffbee">~</div><span class="cf-lbl">Selisih</span><span class="cf-val" style="color:'+(selisih>=0?'#1f6045':'#c0392b')+'">'+fmtRp(selisih)+'</span></div>'+
      '<div class="cf-saldo-akhir"><span class="cf-sa-lbl">Saldo Akhir</span><span class="cf-sa-val">'+fmtRp(saldoAkhir)+'</span></div></div>'+
      '<div class="donut-box"><div class="donut-box-title">Komposisi</div>'+donutSvg+
      '<div class="donut-legend">'+
      (totalMasuk>0?'<div class="donut-leg-row"><div class="donut-dot" style="background:#1f6045"></div><span class="donut-leg-lbl">Pemasukan</span><span class="donut-leg-val" style="color:#1f6045">'+fmtRp(totalMasuk)+'</span></div>':'')+
      (totalKeluar>0?'<div class="donut-leg-row"><div class="donut-dot" style="background:#c0392b"></div><span class="donut-leg-lbl">Pengeluaran</span><span class="donut-leg-val" style="color:#c0392b">'+fmtRp(totalKeluar)+'</span></div>':'')+
      '</div></div></div>'+
      '<div class="section-title">Detail Transaksi</div>'+
      '<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th style="text-align:right">Masuk (Rp)</th><th style="text-align:right">Keluar (Rp)</th><th style="text-align:right">Saldo (Rp)</th></tr></thead>'+
      '<tbody>'+rows+
      '<tr class="total-row"><td colspan="2">TOTAL PERIODE</td><td class="num green">'+fmtRp(totalMasuk)+'</td><td class="num red">'+fmtRp(totalKeluar)+'</td><td class="num bold">'+fmtRp(saldoAkhir)+'</td></tr>'+
      '</tbody></table>'+
      '<div class="footer"><div class="footer-left">Dicetak: '+printedAt+'<br>Sistem Rekap Absensi Muda-Mudi Margosari</div>'+
      '<div class="sign-box"><div class="sign-line"></div>Bendahara / Penanggung Jawab</div></div>'+
      '</body></html>';
    _printWithIframe(html);
  } else if(type==='excel'){
    var wb=XLSX.utils.book_new();
    var wsData=[['Tanggal','Keterangan','Masuk','Keluar','Saldo']];
    wsData.push(['Saldo Awal','','','',saldoAwal]);
    periodItems.forEach(function(item){
      var trx=item.trx;
      wsData.push([fmtTglShort(trx.tanggal),trx.keterangan||'',trx.jenis==='pemasukan'?trx.nominal:'',trx.jenis==='pengeluaran'?trx.nominal:'',item.saldo]);
    });
    wsData.push(['TOTAL','',totalMasuk,totalKeluar,saldoAkhir]);
    var ws=XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb,ws,'Kas '+periodeLabel);
    XLSX.writeFile(wb,'Laporan_Kas_'+periodeLabel.replace(/\s/,'_')+'.xlsx');
  } else if(type==='csv'){
    var lines=['Tanggal,Keterangan,Masuk,Keluar,Saldo'];
    lines.push('"Saldo Awal","","","",'+saldoAwal);
    periodItems.forEach(function(item){
      var trx=item.trx;
      lines.push('"'+fmtTglShort(trx.tanggal)+'","'+(trx.keterangan||'')+'","'+(trx.jenis==='pemasukan'?trx.nominal:'')+'","'+(trx.jenis==='pengeluaran'?trx.nominal:'')+'",'+item.saldo);
    });
    lines.push('"TOTAL","",'+totalMasuk+','+totalKeluar+','+saldoAkhir);
    var a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(lines.join('\n'));
    a.download='Laporan_Kas_'+periodeLabel.replace(/\s/,'_')+'.csv';
    a.click();
  }
}

// ── Riwayat Popup ──
function openKasRiwayat(){
  var dispEl=document.getElementById('riwayatSaldoAwalDisplay');
  if(dispEl) dispEl.textContent=fmtRp(kasSaldoAwal);
  renderKasRiwayat();
  var overlay=document.getElementById('kas-riwayat-overlay');
  var popup  =document.getElementById('kas-riwayat-popup');
  if(overlay) overlay.classList.add('show');
  if(popup){ popup.style.display='flex'; void popup.offsetWidth; popup.classList.add('show'); }
}

function closeKasRiwayat(){
  var overlay=document.getElementById('kas-riwayat-overlay');
  var popup  =document.getElementById('kas-riwayat-popup');
  if(overlay) overlay.classList.remove('show');
  if(popup){ popup.classList.remove('show'); popup.style.display='none'; }
}

function toggleRiwayatSaldoEdit(){
  var row=document.getElementById('riwayatSaldoAwalEdit');
  var inp=document.getElementById('riwayatSaldoInput');
  if(!row) return;
  var isOpen=row.style.display==='flex';
  if(isOpen){ row.style.display='none'; }
  else { row.style.display='flex'; if(inp){ inp.value=kasSaldoAwal||''; setTimeout(function(){inp.focus();},50); } }
}

function saveRiwayatSaldoAwal(){
  var inp=document.getElementById('riwayatSaldoInput');
  var val=parseFloat(inp?inp.value:0)||0;
  kasSaldoAwal=val;
  localStorage.setItem('kas_saldo_awal',val);
  fbSaveSaldoAwal(val);
  var dispEl=document.getElementById('riwayatSaldoAwalDisplay');
  if(dispEl) dispEl.textContent=fmtRp(kasSaldoAwal);
  var row=document.getElementById('riwayatSaldoAwalEdit');
  if(row) row.style.display='none';
  renderKas();
  showToast('Saldo awal disimpan: '+fmtRp(val));
}

function renderKasRiwayat(){
  var q    =(document.getElementById('kasRiwayatSearch')||{}).value||'';
  var qLow =q.toLowerCase();
  var fBln =(document.getElementById('kasRiwayatBulan')||{}).value||'';
  var fThn =(document.getElementById('kasRiwayatTahun')||{}).value||'';
  var sort =(document.getElementById('kasRiwayatSort') ||{}).value||'desc';
  var allRun=kasCalcRunning();
  var sorted=sort==='asc'?allRun.slice():allRun.slice().reverse();
  var filtered=sorted.filter(function(item){
    var trx=item.trx;
    if(q&&(trx.keterangan||'').toLowerCase().indexOf(qLow)<0&&trx.tanggal.indexOf(q)<0) return false;
    if(fBln&&trx.tanggal.substring(5,7)!==fBln) return false;
    if(fThn&&trx.tanggal.substring(0,4)!==fThn) return false;
    return true;
  });
  var tbody  =document.getElementById('kasRiwayatBody');
  var emptyEl=document.getElementById('kasRiwayatEmpty');
  if(!tbody) return;
  if(filtered.length===0){ tbody.innerHTML=''; if(emptyEl) emptyEl.style.display='block'; return; }
  if(emptyEl) emptyEl.style.display='none';
  var html='';
  filtered.forEach(function(item){
    var trx=item.trx;
    var badge=trx.jenis==='pemasukan'?'<span class="badge bh">⬆️ Masuk</span>':'<span class="badge ba">⬇️ Keluar</span>';
    var nomColor=trx.jenis==='pemasukan'?'var(--green)':'var(--red)';
    html+='<tr>';
    html+='<td style="white-space:nowrap;font-size:11px">'+fmtTglShort(trx.tanggal)+'</td>';
    html+='<td>'+escHtml(trx.keterangan||'')+'</td>';
    html+='<td style="text-align:right;color:'+nomColor+';font-weight:600">'+fmtRp(trx.nominal)+'</td>';
    html+='<td style="text-align:center">'+badge+'</td>';
    html+='<td style="text-align:center;white-space:nowrap"><button onclick="kasEditTrx(\''+trx.id+'\');closeKasRiwayat()" style="font-size:10px;padding:3px 7px;margin-right:3px">✏️</button><button onclick="kasDelTrx(\''+trx.id+'\')" style="font-size:10px;padding:3px 7px" class="btn-danger">🗑</button></td>';
    html+='</tr>';
  });
  tbody.innerHTML=html;
}
