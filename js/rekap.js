// ══════════════════════════════════════════════════
// REKAP MODULE
// ══════════════════════════════════════════════════

function renderRekap(source){
  var bEl, tEl, gEl;
  if(source==='mob'){
    bEl = document.getElementById('rBulanM');
    tEl = document.getElementById('rTahunM');
    gEl = document.getElementById('rGenderM');
    var bPc=document.getElementById('rBulan');   if(bPc) bPc.value=bEl.value;
    var tPc=document.getElementById('rTahun');   if(tPc) tPc.value=tEl.value;
    var gPc=document.getElementById('rGender');  if(gPc) gPc.value=gEl?gEl.value:'S';
  } else {
    bEl = document.getElementById('rBulan');
    tEl = document.getElementById('rTahun');
    gEl = document.getElementById('rGender');
    var bMob=document.getElementById('rBulanM'); if(bMob) bMob.value=bEl.value;
    var tMob=document.getElementById('rTahunM'); if(tMob) tMob.value=tEl.value;
    var gMob=document.getElementById('rGenderM');if(gMob) gMob.value=gEl?gEl.value:'S';
  }
  if(!bEl||!tEl) return;
  var bulan=parseInt(bEl.value), tahun=parseInt(tEl.value), rg=gEl?gEl.value:'S';

  var prefix = tahun+'-'+String(bulan).padStart(2,'0');
  var sL     = Object.keys(sesiData).filter(function(t){ return t.startsWith(prefix); }).sort();

  var mP   = members.filter(function(m){ return m.gender==='P'; });
  var mL   = members.filter(function(m){ return m.gender==='L'; });
  var mAll = rg==='S'?members:(rg==='P'?mP:mL);

  // Stats + Donut panel
  var _rsH=0,_rsI=0,_rsA=0,_rsTot=mAll.length*sL.length;
  mAll.forEach(function(m){ sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')_rsH++; else if(v==='I')_rsI++; else if(v==='A')_rsA++;
  });});
  var _rsAvg    = _rsTot ? Math.round(_rsH/_rsTot*100) : 0;
  var _rsAvgClr = _rsAvg>=80?'#2e7d55':_rsAvg>=60?'#b07b1f':'#a83a33';
  ['rekapStats','rekapStatsM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    if(!sL.length){ el.innerHTML=''; return; }
    el.innerHTML=
      '<div class="rs-panel">'+
        '<div class="rs-donut-area">'+
          '<div class="rs-donut-lbl">Distribusi</div>'+
          buildDonutSvg(_rsH,_rsI,_rsA,_rsTot-(_rsH+_rsI+_rsA))+
        '</div>'+
        '<div class="rs-divider"></div>'+
        '<div class="rs-stats">'+
          rsItem(sL.length,'Pertemuan','var(--text)')+
          rsItem(_rsH,'Hadir','#2e7d55')+
          rsItem(_rsI,'Izin','#b07b1f')+
          rsItem(_rsA,'Alfa','#a83a33')+
          rsItem(_rsAvg+'%','Rata-rata',_rsAvgClr)+
        '</div>'+
      '</div>';
  });

  // Table header
  ['theadRekap','theadRekapM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    if(!sL.length){ el.innerHTML=''; return; }
    var hd='<tr><th>No</th><th style="text-align:left;min-width:110px">Nama</th>';
    sL.forEach(function(t){
      var d=new Date(tglDate(t)+'T00:00:00');
      hd+='<th style="line-height:1.3"><div>'+d.getDate()+'/'+bulan+'</div><div style="font-size:9px;font-weight:400;color:var(--text3);letter-spacing:.2px">'+HARI[d.getDay()]+'</div></th>';
    });
    hd+='<th>H</th><th>I</th><th>A</th><th>%</th></tr>';
    var kg='<tr style="background:var(--gold-xlt)"><td style="font-size:9px;color:var(--text3);font-weight:500;letter-spacing:.3px;text-transform:uppercase">Keg.</td><td style="text-align:left;font-size:9px;color:var(--text3)">—</td>';
    sL.forEach(function(t){
      var ket=sesiKet[t]||'';
      kg+='<td style="font-size:9px;color:var(--gold-dk);font-weight:500;max-width:80px;overflow:hidden;text-overflow:ellipsis" title="'+ket.replace(/"/g,'&quot;')+'">'+
        (ket.length>8?ket.substring(0,7)+'…':ket||'—')+'</td>';
    });
    kg+='<td colspan="4" style="background:var(--gold-xlt)"></td></tr>';
    el.innerHTML=hd+kg;
  });

  // Table body
  ['tbodyRekap','tbodyRekapM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    if(!sL.length){ el.innerHTML='<tr><td colspan="'+(6+sL.length)+'" class="empty">Belum ada data.</td></tr>'; return; }
    var bd='';
    var noCount=0;

    function renderRows(arr, genderLabel, sepClass){
      if(!arr.length) return;
      if(rg==='S'){
        bd+='<tr class="gender-sep '+sepClass+'"><td colspan="'+(6+sL.length)+'">'+
          (genderLabel==='P'?'♀ Perempuan':'♂ Laki-laki')+'</td></tr>';
      }
      arr.forEach(function(m){
        noCount++;
        var h=0,iz=0,al=0,cells='';
        sL.forEach(function(t){
          var v=((sesiData[t]||{})[m.nama]||{}).status||'';
          if(v==='H'){     cells+='<td><span class="badge bh">H</span></td>'; h++;  }
          else if(v==='I'){cells+='<td><span class="badge bi">I</span></td>'; iz++; }
          else if(v==='A'){cells+='<td><span class="badge ba">A</span></td>'; al++; }
          else cells+='<td style="color:var(--border)">—</td>';
        });
        var pct=sL.length?Math.round(h/sL.length*100):0;
        var pc=pct>=80?'var(--green)':pct>=60?'var(--amber)':'var(--red)';
        bd+='<tr><td>'+noCount+'</td><td class="tl">'+m.nama+'</td>'+cells+
          '<td style="color:var(--green);font-weight:500">'+h+'</td>'+
          '<td style="color:var(--amber)">'+iz+'</td><td style="color:var(--red)">'+al+'</td>'+
          '<td style="color:'+pc+';font-weight:500">'+pct+'%</td></tr>';
      });
    }

    if(rg==='S'){
      renderRows(mP,'P','gender-sep-p');
      renderRows(mL,'L','gender-sep-l');
    } else {
      renderRows(mAll, rg, rg==='P'?'gender-sep-p':'gender-sep-l');
    }
    el.innerHTML=bd;
  });

  // Chart
  renderRekapChart(sL, mAll, bulan, tahun);

  // Izin Sheet v3
  ['izinSheet','izinSheetM'].forEach(function(id){
    var el = document.getElementById(id); if(!el) return;
    var cards=[];
    sL.forEach(function(t){
      var d=new Date(tglDate(t)+'T00:00:00');
      var tglLabel=HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[d.getMonth()+1]+' '+d.getFullYear();
      var ket=sesiKet[t]||'—';
      mAll.forEach(function(m){
        var rec=(sesiData[t]||{})[m.nama]||{};
        if(rec.status==='I') cards.push({nama:m.nama,kegiatan:ket,tgl:tglLabel,catatan:rec.catatan||''});
      });
    });
    if(!cards.length){ el.innerHTML=''; return; }

    function iz3Color(cat){
      var c=(cat||'').toLowerCase();
      if(/kerja|dinas|shift/.test(c))       return {bg:'#dbeafe',col:'#1d4ed8'};
      if(/kuliah|ujian|sekolah|kampus/.test(c)) return {bg:'#ede9fe',col:'#6d28d9'};
      if(/sakit|demam|rawat/.test(c))       return {bg:'#fee2e2',col:'#b91c1c'};
      if(/keluarga/.test(c))                return {bg:'#ffedd5',col:'#c2410c'};
      return {bg:'#ebebeb',col:'#666'};
    }

    var h='<div class="iz3-header">'+
      '<span class="iz3-title">Keterangan Izin</span>'+
      '<span class="iz3-total">'+cards.length+' izin</span>'+
      '</div>'+
      '<div class="iz3-grid">';
    cards.forEach(function(c){
      var rc  = iz3Color(c.catatan);
      var tag = c.catatan
        ? '<span class="iz3-tag" style="background:'+rc.bg+';color:'+rc.col+'">'+c.catatan+'</span>'
        : '';
      h+='<div class="iz3-card" style="border-left:3px solid '+rc.col+'">'+
        '<div class="iz3-nama">'+c.nama+'</div>'+
        '<div class="iz3-kg-row">'+
          '<span class="iz3-kegiatan">'+c.kegiatan+'</span>'+
          tag+
        '</div>'+
        '<div class="iz3-tgl">'+c.tgl+'</div>'+
        '</div>';
    });
    h+='</div>';
    el.innerHTML=h;
  });
}

function sc(l, v, c){
  return '<div class="stat"><div class="stat-lbl">'+l+'</div>'+
    '<div class="stat-val"'+(c?' style="color:'+c+'"':'')+'>'+v+'</div></div>';
}

function rsItem(v, l, c){
  return '<div class="rs-item">'+
    '<div class="rs-val"'+(c?' style="color:'+c+'"':'')+'>'+v+'</div>'+
    '<div class="rs-lbl">'+l+'</div>'+
    '</div>';
}

function renderRekapChart(sL, mAll, bulan, tahun){
  var perSesi = sL.map(function(t){
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
      el.className = 'rekap-chart-card';
      var ref = document.getElementById(i===0?'rekapStats':'rekapStatsM');
      if(ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling);
    }
    el.innerHTML = '<div class="rekap-chart-hd"><span class="rekap-chart-title">Grafik Kehadiran per Pertemuan</span>'+
      '<span class="rc-legend"><span class="rc-dot" style="background:#2e7d55"></span>Hadir<span class="rc-dot" style="background:#b07b1f"></span>Izin<span class="rc-dot" style="background:#a83a33"></span>Alfa</span></div>'+
      '<div class="rekap-chart-body">'+svg+'</div>';
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
  var padL=32, padR=12, padT=18, padB=34;
  var W=padL+n*groupW+padR;
  var H=158;
  var chartH=H-padT-padB;
  var maxVal=Math.max(1, totalMembers);
  perSesi.forEach(function(s){ maxVal=Math.max(maxVal, s.h, s.iz, s.al); });

  var yLines='', bars='', labels='', lg='';
  [0,0.25,0.5,0.75,1].forEach(function(f){
    var y=padT+chartH*(1-f);
    var val=Math.round(f*maxVal);
    yLines+='<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="#e4d9c4" stroke-width="0.8" stroke-dasharray="2 3"/>';
    yLines+='<text x="'+(padL-5)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" font-size="8" fill="#7c8a6c">'+val+'</text>';
  });
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
    labels+='<text x="'+cx.toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="9" fill="#525f48">'+
      '<title>'+(s.ket?escHtml(s.ket):('Sesi '+(i+1)))+' · '+s.day+'</title>'+(s.day? s.day : 'P'+ (i+1))+'</text>';
  });
  lg='<g font-family="sans-serif" font-size="8.5" fill="#5f6d52">'+
    '<rect x="'+padL+'" y="5" width="9" height="9" rx="2" fill="#2e7d55"/><text x="'+(padL+12)+'" y="13">Hadir</text>'+
    '<rect x="'+(padL+52)+'" y="5" width="9" height="9" rx="2" fill="#b07b1f"/><text x="'+(padL+64)+'" y="13">Izin</text>'+
    '<rect x="'+(padL+96)+'" y="5" width="9" height="9" rx="2" fill="#a83a33"/><text x="'+(padL+108)+'" y="13">Alfa</text>'+
    '</g>';
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="display:block;min-width:100%" role="img">'+
    lg+yLines+bars+labels+'</svg>';
}

function toggleExp(){
  var isMb = mob();
  var menuId = isMb ? 'expMenuM' : 'expMenu';
  var otherId = isMb ? 'expMenu' : 'expMenuM';
  var el = document.getElementById(menuId);
  var other = document.getElementById(otherId);
  if(other) other.classList.remove('open');
  if(!el) return;
  var opening = !el.classList.contains('open');
  el.classList.toggle('open', opening);
  if(opening){
    if(window._expOutsideClick) document.removeEventListener('click', window._expOutsideClick);
    window._expOutsideClick = function _expHandler(e){
      el.classList.remove('open');
      document.removeEventListener('click', window._expOutsideClick);
      window._expOutsideClick = null;
    };
    setTimeout(function(){ document.addEventListener('click', window._expOutsideClick); }, 0);
  } else if(window._expOutsideClick){
    document.removeEventListener('click', window._expOutsideClick);
    window._expOutsideClick = null;
  }
}

function getExportData(){
  var bEl=document.getElementById('rBulan')||document.getElementById('rBulanM');
  var tEl=document.getElementById('rTahun')||document.getElementById('rTahunM');
  var gEl=document.getElementById('rGender')||document.getElementById('rGenderM');
  var bulan=parseInt(bEl.value), tahun=parseInt(tEl.value), rg=gEl?gEl.value:'S';
  var prefix=tahun+'-'+String(bulan).padStart(2,'0');
  var sL=Object.keys(sesiData).filter(function(t){ return t.startsWith(prefix); }).sort();
  var mAll=rg==='S'?members:members.filter(function(m){ return m.gender===rg; });
  return {bulan:bulan,tahun:tahun,sL:sL,mAll:mAll};
}

function buildRekapRows(sL, mAll, bulan, tahun){
  var ketRow=['','Kegiatan',''].concat(sL.map(function(t){ return sesiKet[t]||''; })).concat(['','','','']);
  var hdrs=['No','Nama','Gender'].concat(sL.map(function(t){
    var d=new Date(tglDate(t)+'T00:00:00'); return d.getDate()+'/'+bulan+'/'+tahun;
  })).concat(['Hadir','Izin','Alfa','% Hadir']);
  var rows=[ketRow,hdrs];
  mAll.forEach(function(m,i){
    var h=0,iz=0,al=0;
    var cells=sL.map(function(t){
      var v=((sesiData[t]||{})[m.nama]||{}).status||'';
      if(v==='H') h++; else if(v==='I') iz++; else if(v==='A') al++;
      return v||'-';
    });
    var pct=sL.length?Math.round(h/sL.length*100):0;
    rows.push([i+1,m.nama,m.gender==='P'?'Perempuan':'Laki-laki'].concat(cells).concat([h,iz,al,pct+'%']));
  });
  return rows;
}

function buildIzinRows(sL, mAll){
  var rows=[['No','Nama','Gender','Tanggal','Kegiatan','Keterangan']];
  var idx=0;
  sL.forEach(function(t){
    var d=new Date(tglDate(t)+'T00:00:00');
    var tglLabel=HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[d.getMonth()+1]+' '+d.getFullYear();
    var ket=sesiKet[t]||'';
    mAll.forEach(function(m){
      var rec=(sesiData[t]||{})[m.nama]||{};
      if(rec.status==='I'){idx++;rows.push([idx,m.nama,m.gender==='P'?'Perempuan':'Laki-laki',tglLabel,ket,rec.catatan||'']);}
    });
  });
  return rows;
}

function exportExcel(){
  var d=getExportData();
  if(!d.sL.length){ alert('Belum ada data bulan ini!'); return; }
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(buildRekapRows(d.sL,d.mAll,d.bulan,d.tahun)),'Rekap');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(buildIzinRows(d.sL,d.mAll)),'Keterangan Izin');
  XLSX.writeFile(wb,'Rekap_'+BULAN[d.bulan]+'_'+d.tahun+'.xlsx');
}

function exportCSV(){
  var d=getExportData();
  if(!d.sL.length){ alert('Belum ada data bulan ini!'); return; }
  function toCSV(rows){
    return rows.map(function(r){
      return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(',');
    }).join('\n');
  }
  var rekapCSV=toCSV(buildRekapRows(d.sL,d.mAll,d.bulan,d.tahun));
  var izinCSV=toCSV(buildIzinRows(d.sL,d.mAll));
  var full=rekapCSV+'\n\n\nKeterangan Izin\n'+izinCSV;
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(full);
  a.download='Rekap_'+BULAN[d.bulan]+'_'+d.tahun+'.csv';
  a.click();
}

function exportPrint(){
  var d=getExportData();
  if(!d.sL.length){ alert('Belum ada data bulan ini!'); return; }
  var theadEl=document.getElementById('theadRekap');
  var tbodyEl=document.getElementById('tbodyRekap');
  var izinEl=document.getElementById('izinSheet');
  var tableHtml=theadEl
    ? '<div class="tbl-card"><table><thead>'+theadEl.innerHTML+'</thead><tbody>'+(tbodyEl?tbodyEl.innerHTML:'')+'</tbody></table></div>'
    : '';
  var izinHtml=izinEl&&izinEl.innerHTML ? '<div class="tbl-card">'+izinEl.innerHTML+'</div>' : '';
  var bulanLabel=BULAN[d.bulan]||'';

  var tot=d.mAll.length*d.sL.length, tH=0, tI=0, tA=0;
  d.mAll.forEach(function(m){ d.sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')tH++; else if(v==='I')tI++; else if(v==='A')tA++;
  });});
  var avg=tot?Math.round(tH/tot*100):0;
  var avgClr=avg>=80?'#2e7d55':avg>=60?'#b07b1f':'#a83a33';
  var printDonut=buildDonutSvg(tH,tI,tA,tot-(tH+tI+tA));
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

  _printWithIframe(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">'+
    '<title>Rekap '+bulanLabel+' '+d.tahun+'</title>'+
    '<link rel="preconnect" href="https://fonts.googleapis.com">'+
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'+
    '<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">'+
    '<style>'+
      '*{box-sizing:border-box}'+
      ':root{--green:#2e7d55;--amber:#b07b1f;--red:#a83a33;--text:#28322a;--text2:#525f48;--text3:#7c8a6c;--gold-dk:#31663d;--gold-lt:#e2efdd;--gold-xlt:#eef5ea;--border:#d9dbc9}'+
      'body{font-family:"Hanken Grotesk",system-ui,sans-serif;font-size:11px;padding:24px;color:#28322a;background:#f7f3e8;-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
      'h2{font-family:"Young Serif",Georgia,serif;font-weight:400;font-size:18px;color:#28322a;margin:0}'+
      '.subtitle{color:#5f6d52;font-size:11px;margin:2px 0 0}'+
      '.print-hd{border-bottom:2px solid #3f8a53;padding-bottom:10px;margin-bottom:16px}'+
      'h3{font-family:"Young Serif",Georgia,serif;font-weight:400;font-size:14px;color:#28322a;margin:22px 0 8px}'+
      '.stat-card{display:flex;align-items:center;padding:14px 18px;background:#fff;border:1px solid #d9dbc9;border-radius:12px;box-shadow:0 1px 3px rgba(40,58,44,.10);margin:0 0 16px;page-break-inside:avoid}'+
      '.stat-donut{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;padding-right:4px}'+
      '.stat-donut-lbl{font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#7c8a6c}'+
      '.stat-divider{width:1px;background:#d9dbc9;align-self:stretch;margin:0 16px;flex-shrink:0}'+
      '.stat-items{display:flex;flex:1;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:2px}'+
      '.rs-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;border-radius:8px}'+
      '.rs-val{font-size:26px;font-weight:300;line-height:1;letter-spacing:-.5px}'+
      '.rs-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#7c8a6c;font-weight:500;margin-top:3px}'+
      '.tbl-card{background:#fff;border:1px solid #d9dbc9;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(40,58,44,.10);margin:0 0 16px;page-break-inside:auto}'+
      'table{width:100%;border-collapse:collapse;font-size:9.5px}'+
      'th,td{border:1px solid #e6e1cb;padding:4px 6px;text-align:center;color:#28322a;overflow-wrap:break-word}'+
      'th{background:#efe9d8;color:#525f48;font-weight:600;font-size:8.5px;letter-spacing:.2px;text-transform:uppercase}'+
      'td.tl{text-align:left}'+
      'tr.gender-sep td{background:#eef4ea;color:#2e7d55;font-weight:700;text-align:left;font-size:9px;letter-spacing:.5px;text-transform:uppercase}'+
      '.badge{display:inline-block;border-radius:99px;padding:1px 6px;font-size:9px;font-weight:700}'+
      '.bh{background:#e2f0e7;color:#2e7d55}.bi{background:#f5ead0;color:#b07b1f}.ba{background:#f6e2df;color:#a83a33}'+
      '.iz3-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 8px}'+
      '.iz3-title{font-size:11px;font-weight:700;color:#b07b1f}'+
      '.iz3-total{font-size:9px;color:#7c8a6c;background:#f5ead0;border:1px solid #e6d9ab;padding:1px 8px;border-radius:99px}'+
      '.iz3-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;padding:0 12px 12px}'+
      '.iz3-card{background:#fff;border:1px solid #d9dbc9;border-radius:8px;padding:7px 9px;display:flex;flex-direction:column;gap:2px;break-inside:avoid;page-break-inside:avoid}'+
      '.iz3-nama{font-size:9.5px;font-weight:700;color:#28322a;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.iz3-kg-row{display:flex;align-items:center;gap:4px;overflow:hidden}'+
      '.iz3-kegiatan{font-size:8.5px;color:#3f8a53;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0}'+
      '.iz3-tag{font-size:8px;font-weight:600;padding:1px 5px;border-radius:4px;white-space:nowrap;flex-shrink:0}'+
      '.iz3-tgl{font-size:8px;color:#7c8a6c}'+
      '@media print{body{background:#fff}.stat-card,.tbl-card{box-shadow:none}}'+
    '</style></head><body>'+
    '<div class="print-hd"><h2>Rekap Absensi Muda-Mudi Margosari</h2><div class="subtitle">'+bulanLabel+' '+d.tahun+'</div></div>'+
    statHtml+tableHtml+izinHtml+
    '</body></html>'
  );
}

function _psc(l, v, c){
  return '<div style="border:1px solid #ddd;border-radius:6px;padding:8px 14px;background:#fffbf5;text-align:center;min-width:70px">'+
    '<div style="font-size:9px;color:#888;font-weight:600;letter-spacing:.4px;text-transform:uppercase">'+l+'</div>'+
    '<div style="font-size:18px;font-weight:700;color:'+c+';margin-top:2px">'+v+'</div>'+
  '</div>';
}

function _printRsItem(v, l, c){
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;border-radius:8px">'+
    '<div style="font-size:26px;font-weight:300;line-height:1;letter-spacing:-.5px;color:'+c+'">'+v+'</div>'+
    '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#7c8a6c;font-weight:500;margin-top:3px">'+l+'</div>'+
  '</div>';
}
