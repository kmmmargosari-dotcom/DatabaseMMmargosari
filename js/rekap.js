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
  var _rsAvgClr = _rsAvg>=80?'#2e7d52':_rsAvg>=60?'#c09000':'#b33030';
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
          rsItem(_rsH,'Hadir','#2e7d52')+
          rsItem(_rsI,'Izin','#c09000')+
          rsItem(_rsA,'Alfa','#b33030')+
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
    return { label: sesiKet[t] ? sesiKet[t].substring(0,6) : t.slice(5), h: h, iz: iz, al: al };
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
      el.style.cssText = 'margin-top:16px;background:var(--bg);border-radius:12px;padding:14px 16px;border:1px solid var(--border)';
      var ref = document.getElementById(i===0?'rekapStats':'rekapStatsM');
      if(ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling);
    }
    el.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:8px">Grafik Kehadiran per Pertemuan</div>'+svg;
  });
}

function buildDonutSvg(h, iz, al, blm){
  var size=110, cx=55, cy=55, r=36, sw=16;
  var total=h+iz+al+blm;
  var pct = total ? Math.round(h/total*100) : 0;
  if(total===0){
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#e4d9c4" stroke-width="'+sw+'"/>'+
      '<text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" font-size="13" fill="#b0a078">—</text>'+
      '</svg>';
  }
  var colors=['#2e7d52','#c09000','#b33030','#c8b89a'];
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
    '<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#1a1510">'+pct+'%</text>'+
    '</svg>';
}

function buildBarSvg(perSesi, totalMembers){
  var n=perSesi.length;
  var barW=18, gap=6, groupGap=10;
  var groupW=(barW*3+gap*2+groupGap);
  var padL=26, padR=10, padT=8, padB=22;
  var W=padL+n*groupW+padR;
  var H=120;
  var chartH=H-padT-padB;
  var maxVal=Math.max(totalMembers,1);

  var yLines='', bars='', labels='';
  [0,0.5,1].forEach(function(f){
    var y=padT+chartH*(1-f);
    var val=Math.round(f*maxVal);
    yLines+='<line x1="'+padL+'" y1="'+y.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y.toFixed(1)+'" stroke="#e4d9c4" stroke-width="0.7"/>';
    yLines+='<text x="'+(padL-4)+'" y="'+(y+3).toFixed(1)+'" text-anchor="end" font-size="7" fill="#b0a078">'+val+'</text>';
  });
  perSesi.forEach(function(s,i){
    var gx=padL+i*groupW;
    var cx=gx+barW*1.5+gap;
    var vals=[s.h,s.iz,s.al];
    var cols=['#2e7d52','#c09000','#b33030'];
    vals.forEach(function(v,ki){
      var bh=Math.max(2,(v/maxVal)*chartH);
      var by=padT+chartH-bh;
      var bx=gx+ki*(barW+gap);
      bars+='<rect x="'+bx.toFixed(1)+'" y="'+by.toFixed(1)+'" width="'+barW+'" height="'+bh.toFixed(1)+'" fill="'+cols[ki]+'" rx="3"/>';
      if(v>0){
        bars+='<text x="'+(bx+barW/2).toFixed(1)+'" y="'+(by-2).toFixed(1)+'" text-anchor="middle" font-size="7" fill="'+cols[ki]+'" font-weight="600">'+v+'</text>';
      }
    });
    labels+='<text x="'+cx.toFixed(1)+'" y="'+(H-4)+'" text-anchor="middle" font-size="7.5" fill="#7a6a50">'+s.label+'</text>';
  });
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="display:block">'+
    yLines+bars+labels+'</svg>';
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
    ? '<table><thead>'+theadEl.innerHTML+'</thead><tbody>'+(tbodyEl?tbodyEl.innerHTML:'')+'</tbody></table>'
    : '';
  var izinHtml=izinEl&&izinEl.innerHTML ? '<h3 style="margin-top:28px;color:#b07d1a">Keterangan Izin</h3>'+izinEl.innerHTML : '';
  var bulanLabel=BULAN[d.bulan]||'';

  var tot=d.mAll.length*d.sL.length, tH=0, tI=0, tA=0;
  d.mAll.forEach(function(m){ d.sL.forEach(function(t){
    var v=((sesiData[t]||{})[m.nama]||{}).status||'';
    if(v==='H')tH++; else if(v==='I')tI++; else if(v==='A')tA++;
  });});
  var avg=tot?Math.round(tH/tot*100):0;
  var avgClr=avg>=80?'#2e7d52':avg>=60?'#c09000':'#b33030';
  var printDonut=buildDonutSvg(tH,tI,tA,tot-(tH+tI+tA));
  var statHtml=
    '<div style="display:flex;align-items:center;padding:14px 18px;border:1px solid #e4d9c4;border-radius:8px;background:#fdfaf5;margin:0 0 18px;page-break-inside:avoid">'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;padding-right:4px">'+
        '<div style="font-size:9px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#b0a078">Distribusi</div>'+
        printDonut+
      '</div>'+
      '<div style="width:1px;background:#e4d9c4;align-self:stretch;margin:0 16px;flex-shrink:0"></div>'+
      '<div style="display:flex;flex:1;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:2px">'+
        _printRsItem(d.sL.length,'Pertemuan','#1a1510')+
        _printRsItem(tH,'Hadir','#2e7d52')+
        _printRsItem(tI,'Izin','#c09000')+
        _printRsItem(tA,'Alfa','#b33030')+
        _printRsItem(avg+'%','Rata-rata',avgClr)+
      '</div>'+
    '</div>';

  _printWithIframe(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">'+
    '<title>Rekap '+bulanLabel+' '+d.tahun+'</title>'+
    '<style>'+
      'body{font-family:Arial,sans-serif;font-size:11px;padding:24px;color:#222}'+
      'h2{font-size:16px;margin:0 0 2px}h3{font-size:13px;margin:20px 0 8px}'+
      'p{margin:0 0 14px;font-size:11px;color:#666}'+
      'table{width:100%;border-collapse:collapse;font-size:10px}'+
      'th,td{border:1px solid #ccc;padding:5px 7px;text-align:center}'+
      'th{background:#f5f5f5;font-weight:600}td.tl{text-align:left}'+
      'tr.gender-sep td{background:#eee;font-weight:600;text-align:left;font-size:9px;letter-spacing:.5px;text-transform:uppercase}'+
      '.badge{display:inline-block;border-radius:3px;padding:1px 5px;font-size:9px;font-weight:700}'+
      '.bh{background:#dcf5e7;color:#1a7a3a}.bi{background:#fff3cd;color:#856404}.ba{background:#fde8e8;color:#a00}'+
      '.iz3-header{display:flex;align-items:center;justify-content:space-between;padding:10px 0 6px;margin-top:16px}'+
      '.iz3-title{font-size:11px;font-weight:700;color:#b07d1a}'+
      '.iz3-total{font-size:9px;color:#888;background:#fffbf0;border:1px solid #e4d9c4;padding:1px 7px;border-radius:99px}'+
      '.iz3-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:0 0 10px}'+
      '.iz3-card{background:#fff;border:1px solid #ece6da;border-radius:8px;padding:7px 9px;display:flex;flex-direction:column;gap:2px;break-inside:avoid;page-break-inside:avoid}'+
      '.iz3-nama{font-size:9.5px;font-weight:700;color:#1a1510;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
      '.iz3-kg-row{display:flex;align-items:center;gap:4px;overflow:hidden}'+
      '.iz3-kegiatan{font-size:8.5px;color:#b07d1a;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;min-width:0}'+
      '.iz3-tag{font-size:8px;font-weight:600;padding:1px 5px;border-radius:4px;white-space:nowrap;flex-shrink:0}'+
      '.iz3-tgl{font-size:8px;color:#999}'+
      '@media print{.iz3-grid{grid-template-columns:repeat(5,1fr)}.iz3-card{break-inside:avoid}}'+
    '</style></head><body>'+
    '<h2>Rekap Absensi Muda-Mudi Margosari</h2>'+
    '<p>'+bulanLabel+' '+d.tahun+'</p>'+
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
    '<div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#b0a078;font-weight:500;margin-top:3px">'+l+'</div>'+
  '</div>';
}
