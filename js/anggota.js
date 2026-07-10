// ══════════════════════════════════════════════════
// ANGGOTA MODULE
// ══════════════════════════════════════════════════

// ── List Render ──
function anggotaHtml(listId, searchId){
  var search = (document.getElementById(searchId)||{}).value||'';
  var list   = members.filter(function(m){
    return m.nama.toLowerCase().includes(search.toLowerCase());
  });
  var P = list.filter(function(m){ return m.gender==='P'; });
  var L = list.filter(function(m){ return m.gender==='L'; });
  function grp(label, arr){
    if(!arr.length) return '';
    var s = '<div class="sec-title">'+label+' ('+arr.length+')</div>';
    arr.forEach(function(m){
      var avc = m.gender==='P'?'av-p':'av-l';
      s += '<div class="mem-item" onclick="openMemberDetail(\''+m.nama.replace(/'/g,"\\'")+'\')" style="cursor:pointer">'+
        '<div class="avatar '+avc+'" style="width:34px;height:34px;font-size:11px">'+initials(m.nama)+'</div>'+
        '<div class="mem-info"><div class="mem-name">'+m.nama+'</div>'+
        '<div class="mem-gender">'+glabel(m.gender)+'</div></div>'+
        '<span style="color:var(--text3);font-size:16px">›</span>'+
      '</div>';
    });
    return s;
  }
  return (grp('Perempuan',P)+grp('Laki-laki',L))||'<div class="empty">Tidak ada anggota.</div>';
}

function renderAnggota(){
  var el = document.getElementById('anggotaList');
  if(el){ el.innerHTML=skeletonHtml(4); setTimeout(function(){ el.innerHTML=anggotaHtml('anggotaList','srchA'); },120); }
}

function renderAnggotaMob(){
  var el = document.getElementById('anggotaListM');
  if(el){ el.innerHTML=skeletonHtml(4); setTimeout(function(){ el.innerHTML=anggotaHtml('anggotaListM','srchAM'); },120); }
}

function tambahAnggota(suf){
  suf = suf||'';
  var nm = document.getElementById('iNama'+suf).value.trim().toUpperCase();
  var gd = document.getElementById('iGender'+suf).value;
  if(!nm) return;
  if(members.find(function(m){ return m.nama===nm; })){ alert('Nama sudah ada!'); return; }
  members.push({nama:nm, gender:gd});
  members.sort(function(a,b){
    if(a.gender===b.gender) return a.nama.localeCompare(b.nama);
    return a.gender==='P' ? -1 : 1;
  });
  fbSaveAnggota();
  document.getElementById('iNama'+suf).value='';
  if(suf==='M') renderAnggotaMob(); else renderAnggota();
}

function ubahGender(i, g, lid, sid){
  members[i].gender = g;
  fbSaveAnggota();
  var el = document.getElementById(lid);
  if(el) el.innerHTML = anggotaHtml(lid, sid);
}

function hapusAnggota(i, lid, sid){
  var m = members[i];
  if(!m) return;
  if(confirm('Hapus '+m.nama+' dari daftar anggota aktif?\n\nData absensi pada sesi yang sudah ada tetap tersimpan.')){
    logActivity('anggota', 'Hapus '+m.nama);
    members.splice(i,1);
    fbSaveAnggota();
    var el = document.getElementById(lid);
    if(el) el.innerHTML = anggotaHtml(lid, sid);
  }
}

function toggleAddForm(id){ var el=document.getElementById(id); if(el) el.classList.toggle('open'); }

function openAddAnggotaPopup(){
  document.getElementById('iNama').value   = '';
  document.getElementById('iGender').value = 'P';
  document.getElementById('add-anggota-overlay').classList.add('show');
  document.getElementById('add-anggota-popup').classList.add('show');
  setTimeout(function(){ var el=document.getElementById('iNama'); if(el) el.focus(); }, 80);
}

function closeAddAnggotaPopup(){
  document.getElementById('add-anggota-overlay').classList.remove('show');
  document.getElementById('add-anggota-popup').classList.remove('show');
}

function submitAddAnggota(){
  var nm = document.getElementById('iNama').value.trim().toUpperCase();
  var gd = document.getElementById('iGender').value;
  if(!nm) return;
  if(members.find(function(m){ return m.nama===nm; })){ alert('Nama sudah ada!'); return; }
  members.push({nama:nm, gender:gd});
  members.sort(function(a,b){
    if(a.gender===b.gender) return a.nama.localeCompare(b.nama);
    return a.gender==='P' ? -1 : 1;
  });
  logActivity('anggota', 'Tambah '+nm+' ('+(gd==='P'?'Perempuan':'Laki-laki')+')');
  fbSaveAnggota();
  closeAddAnggotaPopup();
  renderAnggota(); renderAnggotaMob();
}

// ══════════════════════════════════════════════════
// MEMBER DETAIL MODAL
// ══════════════════════════════════════════════════

var _mdetNama       = '';
var _mdetRows       = [];
var _mdetSortAsc    = true;
var _mdetActiveStatus = {H:true,I:true,A:true,X:true};

function hapusAnggotaFromDetail(){
  if(!_mdetNama) return;
  var idx = members.findIndex(function(m){ return m.nama === _mdetNama; });
  if(idx < 0) return;
  if(!confirm('Hapus '+_mdetNama+' dari daftar anggota aktif?\n\nData absensi pada sesi yang sudah ada tetap tersimpan.')) return;
  logActivity('anggota', 'Hapus '+_mdetNama);
  members.splice(idx, 1);
  fbSaveAnggota();
  closeMemberDetail();
  renderAnggota(); renderAnggotaMob();
}

function getMemberSessions(nama){
  var allKeys = Object.keys(sesiData).sort();
  var rows = [];
  allKeys.forEach(function(t){
    var d       = new Date(tglDate(t)+'T00:00:00');
    var tglLabel= HARI[d.getDay()]+', '+d.getDate()+' '+BULAN[d.getMonth()+1]+' '+d.getFullYear();
    var rec     = (sesiData[t]||{})[nama]||{};
    rows.push({
      t:        t,
      dateKey:  tglDate(t),
      yearKey:  tglDate(t).slice(0,4),
      monthKey: tglDate(t).slice(5,7),
      tgl:      tglLabel,
      kegiatan: sesiKet[t]||'',
      status:   rec.status||'',
      catatan:  rec.catatan||''
    });
  });
  return rows;
}

function openMemberDetail(nama){
  _mdetNama = nama;
  _mdetSortAsc = true;
  _mdetActiveStatus = {H:true,I:true,A:true,X:true};
  var m = members.find(function(x){ return x.nama===nama; });
  if(!m) return;
  _mdetRows = getMemberSessions(nama);

  document.getElementById('mdet-f-tahun').value = '';
  document.getElementById('mdet-f-bulan').value = '';
  var sb = document.getElementById('mdet-sort-btn');
  if(sb){ sb.textContent='↑ A→Z'; sb.classList.remove('desc'); }
  ['H','I','A','X'].forEach(function(s){
    var el=document.getElementById('mdsf-'+s);
    if(el) el.classList.add('on');
  });

  var avc = m.gender==='P'?'av-p':'av-l';
  var av  = document.getElementById('mdet-avatar');
  av.className = 'avatar '+avc;
  av.style.cssText = 'width:42px;height:42px;font-size:14px;flex-shrink:0';
  av.textContent = initials(nama);
  document.getElementById('mdet-name').textContent   = nama;
  document.getElementById('mdet-gender').textContent = glabel(m.gender);
  renderMdetTable();
  document.getElementById('mdet-overlay').classList.add('show');
  document.getElementById('mdet-modal').classList.add('show');
}

function closeMemberDetail(){
  document.getElementById('mdet-overlay').classList.remove('show');
  document.getElementById('mdet-modal').classList.remove('show');
  _mdetNama = '';
}

function applyMdetFilter(){ renderMdetTable(); }

function toggleMdetSort(){
  _mdetSortAsc = !_mdetSortAsc;
  var btn = document.getElementById('mdet-sort-btn');
  if(_mdetSortAsc){ btn.textContent='↑ A→Z'; btn.classList.remove('desc'); }
  else             { btn.textContent='↓ Z→A'; btn.classList.add('desc'); }
  renderMdetTable();
}

function toggleMdetStatus(s){
  _mdetActiveStatus[s] = !_mdetActiveStatus[s];
  var btn = document.getElementById('mdsf-'+s);
  if(btn) btn.classList.toggle('on', _mdetActiveStatus[s]);
  renderMdetTable();
}

function resetMdetStatus(){
  ['H','I','A','X'].forEach(function(s){
    _mdetActiveStatus[s] = true;
    var el = document.getElementById('mdsf-'+s);
    if(el) el.classList.add('on');
  });
  renderMdetTable();
}

function renderMdetTable(){
  var fYear  = (document.getElementById('mdet-f-tahun')||{}).value||'';
  var fMonth = (document.getElementById('mdet-f-bulan')||{}).value||'';

  var filtered = _mdetRows.filter(function(r){
    if(fYear  && r.yearKey !==fYear)  return false;
    if(fMonth && r.monthKey!==fMonth) return false;
    var sKey = r.status||'X';
    if(!_mdetActiveStatus[sKey]) return false;
    return true;
  });

  filtered.sort(function(a,b){
    var cmp = a.t<b.t?-1:a.t>b.t?1:0;
    return _mdetSortAsc ? cmp : -cmp;
  });

  var countEl = document.getElementById('mdet-count');
  if(countEl) countEl.textContent = filtered.length?'('+filtered.length+' sesi)':'';

  var fh=0,fiz=0,fal=0;
  filtered.forEach(function(r){
    if(r.status==='H')fh++; else if(r.status==='I')fiz++; else if(r.status==='A')fal++;
  });
  var ftot=filtered.length, fpct=ftot?Math.round(fh/ftot*100):0;
  var fpc=fpct>=80?'var(--green)':fpct>=60?'var(--amber)':'var(--red)';
  var statsEl = document.getElementById('mdet-stats');
  if(statsEl){
    statsEl.innerHTML =
      mdetStat(ftot,       'Sesi',     '')+
      mdetStat(fh,         'Hadir',    'var(--green)')+
      mdetStat(fiz,        'Izin',     'var(--amber)')+
      mdetStat(fal,        'Alfa',     'var(--red)')+
      mdetStat(fpct+'%',   'Kehadiran',fpc);
  }
  renderMdetDonut(fh, fiz, fal, ftot);

  var tbody='';
  if(!filtered.length){
    var msg = _mdetRows.length?'Tidak ada data untuk filter ini.':'Belum ada data sesi.';
    tbody = '<tr><td colspan="5" class="mdet-empty">'+msg+'</td></tr>';
  } else {
    filtered.forEach(function(r,i){
      var stBadge='';
      if(r.status==='H')      stBadge='<span class="badge bh">Hadir</span>';
      else if(r.status==='I') stBadge='<span class="badge bi">Izin</span>';
      else if(r.status==='A') stBadge='<span class="badge ba">Alfa</span>';
      else                    stBadge='<span style="color:var(--text3)">—</span>';
      var ket = r.catatan?'<em style="color:var(--amber)">'+r.catatan+'</em>':'<span style="color:var(--text3)">—</span>';
      tbody += '<tr>'+
        '<td style="color:var(--text3);font-size:11px">'+(i+1)+'</td>'+
        '<td style="font-size:11px;white-space:nowrap">'+r.tgl+'</td>'+
        '<td style="font-size:11px;color:var(--gold-dk)">'+r.kegiatan+'</td>'+
        '<td>'+stBadge+'</td>'+
        '<td>'+ket+'</td>'+
      '</tr>';
    });
  }
  document.getElementById('mdet-tbody').innerHTML = tbody;
}

function renderMdetDonut(h, iz, al, tot){
  var arcEl = document.getElementById('mdet-donut-arcs');
  var pctEl = document.getElementById('mdet-donut-pct');
  var legEl = document.getElementById('mdet-donut-legend');
  if(!arcEl) return;
  var R=28, CX=40, CY=40, SW=14;
  var circ = 2*Math.PI*R;
  function arc(val, offset, color){
    if(!val||!tot) return '';
    var dash=(val/tot)*circ;
    return '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+color+'"'+
      ' stroke-width="'+SW+'" stroke-dasharray="'+dash.toFixed(2)+' '+circ.toFixed(2)+'"'+
      ' stroke-dashoffset="'+(-offset).toFixed(2)+'" transform="rotate(-90 '+CX+' '+CY+')"'+
      ' style="transition:stroke-dasharray .4s ease"/>';
  }
  var belum=tot-h-iz-al;
  var offH=0, offI=offH+(h/tot||0)*circ, offA=offI+(iz/tot||0)*circ, offX=offA+(al/tot||0)*circ;
  arcEl.innerHTML = arc(h,offH,'var(--green)')+arc(iz,offI,'var(--amber)')+arc(al,offA,'var(--red)')+arc(belum,offX,'var(--border)');
  var pct = tot?Math.round(h/tot*100):0;
  pctEl.textContent = tot?pct+'%':'—';
  pctEl.setAttribute('fill', pct>=80?'var(--green)':pct>=60?'var(--amber)':'var(--red)');
  function leg(lbl,val,color){
    if(!tot) return '';
    return '<div style="display:flex;align-items:center;gap:6px">'+
      '<span style="width:10px;height:10px;border-radius:2px;background:'+color+';flex-shrink:0"></span>'+
      '<span style="color:var(--text2)">'+lbl+'</span>'+
      '<span style="font-weight:600;margin-left:auto;padding-left:10px">'+val+
        ' <span style="color:var(--text3);font-weight:400;font-size:11px">('+
        (tot?Math.round(val/tot*100):0)+'%)</span></span>'+
    '</div>';
  }
  legEl.innerHTML = tot
    ? leg('Hadir',h,'var(--green)')+leg('Izin',iz,'var(--amber)')+leg('Alfa',al,'var(--red)')+(belum?leg('Belum',belum,'var(--border)'):'')
    : '<span style="color:var(--text3)">Belum ada data</span>';
}

function mdetStat(val, lbl, color){
  return '<div class="mdet-stat">'+
    '<div class="mdet-stat-val"'+(color?' style="color:'+color+'"':'')+'>'+val+'</div>'+
    '<div class="mdet-stat-lbl">'+lbl+'</div>'+
  '</div>';
}

function getFilteredMdetRows(){
  var fYear  = (document.getElementById('mdet-f-tahun')||{}).value||'';
  var fMonth = (document.getElementById('mdet-f-bulan')||{}).value||'';
  var filtered = _mdetRows.filter(function(r){
    if(fYear  && r.yearKey !==fYear)  return false;
    if(fMonth && r.monthKey!==fMonth) return false;
    var sKey = r.status||'X';
    if(!_mdetActiveStatus[sKey]) return false;
    return true;
  });
  filtered.sort(function(a,b){
    var cmp=a.t<b.t?-1:a.t>b.t?1:0;
    return _mdetSortAsc?cmp:-cmp;
  });
  return filtered;
}

function getMemberExportRows(nama){
  var m      = members.find(function(x){ return x.nama===nama; });
  var gender = m?(m.gender==='P'?'Perempuan':'Laki-laki'):'';
  var rows   = getFilteredMdetRows();
  var h=0,iz=0,al=0;
  rows.forEach(function(r){ if(r.status==='H')h++; else if(r.status==='I')iz++; else if(r.status==='A')al++; });
  var tot=rows.length, pct=tot?Math.round(h/tot*100):0;
  var fYear  = (document.getElementById('mdet-f-tahun')||{}).value||'Semua Tahun';
  var fBulanEl=document.getElementById('mdet-f-bulan');
  var fBulan = fBulanEl&&fBulanEl.selectedIndex>0?fBulanEl.options[fBulanEl.selectedIndex].text:'Semua Bulan';
  var activeS=['H','I','A','X'].filter(function(s){return _mdetActiveStatus[s];}).map(function(s){return s==='H'?'Hadir':s==='I'?'Izin':s==='A'?'Alfa':'Belum';}).join(', ');
  var sortInfo=_mdetSortAsc?'A→Z (lama ke baru)':'Z→A (baru ke lama)';
  var header=[
    ['Rekap Kehadiran: '+nama],
    ['Gender: '+gender],
    ['Filter: '+fYear+' | '+fBulan+' | Status: '+activeS+' | Urutan: '+sortInfo],
    ['Tampil '+tot+' sesi — Hadir: '+h+', Izin: '+iz+', Alfa: '+al+(tot?', % Hadir: '+pct+'%':'')],
    []
  ];
  var colHeader=[['No','Tanggal','Kegiatan','Status','Keterangan']];
  var dataRows=rows.map(function(r,i){
    var st=r.status==='H'?'Hadir':r.status==='I'?'Izin':r.status==='A'?'Alfa':'Belum';
    return [i+1,r.tgl,r.kegiatan,st,r.catatan||''];
  });
  return header.concat(colHeader).concat(dataRows);
}

function exportMemberExcel(){
  if(!_mdetNama){alert('Tidak ada anggota dipilih.');return;}
  var rows=getMemberExportRows(_mdetNama);
  var wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Detail');
  XLSX.writeFile(wb,'Detail_'+_mdetNama.replace(/\s+/g,'_')+'.xlsx');
}

function exportMemberCSV(){
  if(!_mdetNama){alert('Tidak ada anggota dipilih.');return;}
  var rows=getMemberExportRows(_mdetNama);
  var csv=rows.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"'; }).join(','); }).join('\n');
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download='Detail_'+_mdetNama.replace(/\s+/g,'_')+'.csv';
  a.click();
}

function exportMemberPrint(){
  if(!_mdetNama) return;
  var m=members.find(function(x){return x.nama===_mdetNama;});
  var gender=m?glabel(m.gender):'';
  var rows=getFilteredMdetRows();
  var h=0,iz=0,al=0;
  rows.forEach(function(r){if(r.status==='H')h++;else if(r.status==='I')iz++;else if(r.status==='A')al++;});
  var tot=rows.length,pct=tot?Math.round(h/tot*100):0;
  var fYear=(document.getElementById('mdet-f-tahun')||{}).value||'Semua Tahun';
  var fBulanEl=document.getElementById('mdet-f-bulan');
  var fBulan=fBulanEl&&fBulanEl.selectedIndex>0?fBulanEl.options[fBulanEl.selectedIndex].text:'Semua Bulan';
  var activeS=['H','I','A','X'].filter(function(s){return _mdetActiveStatus[s];}).map(function(s){return s==='H'?'Hadir':s==='I'?'Izin':s==='A'?'Alfa':'Belum';}).join(', ');
  var sortInfo=_mdetSortAsc?'A→Z':'Z→A';
  var filterDesc=fYear+' · '+fBulan+' · '+activeS+' · Urutan: '+sortInfo;
  var tableRows=rows.map(function(r,i){
    var st=r.status==='H'?'<span style="color:#1a6040;font-weight:600">Hadir</span>':r.status==='I'?'<span style="color:#8a5e10">Izin</span>':r.status==='A'?'<span style="color:#8b3530">Alfa</span>':'<span style="color:#aaa">Belum</span>';
    return '<tr><td>'+(i+1)+'</td><td>'+r.tgl+'</td><td>'+r.kegiatan+'</td><td>'+st+'</td><td>'+(r.catatan||'—')+'</td></tr>';
  }).join('');
  var circ=2*Math.PI*28;
  function pArc(val,offset,color){
    if(!val||!tot) return '';
    var dash=(val/tot)*circ;
    return '<circle cx="60" cy="60" r="28" fill="none" stroke="'+color+'" stroke-width="14"'+' stroke-dasharray="'+dash.toFixed(2)+' '+circ.toFixed(2)+'"'+' stroke-dashoffset="'+(-offset).toFixed(2)+'" transform="rotate(-90 60 60)"/>';
  }
  var belum=tot-h-iz-al;
  var oH=0,oI=oH+(h/tot||0)*circ,oA=oI+(iz/tot||0)*circ,oX=oA+(al/tot||0)*circ;
  var pColor=pct>=80?'#1a6040':pct>=60?'#8a5e10':'#8b3530';
  var donutSvg=tot?'<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="28" fill="none" stroke="#e0d8cc" stroke-width="14"/>'+pArc(h,oH,'#1a6040')+pArc(iz,oI,'#c9a040')+pArc(al,oA,'#b03030')+pArc(belum,oX,'#e0d8cc')+'<text x="60" y="65" text-anchor="middle" font-size="14" font-weight="700" fill="'+pColor+'">'+pct+'%</text></svg>':'';
  var legendHtml=tot?'<div style="display:flex;flex-direction:column;gap:5px;font-size:12px;justify-content:center">'+
    '<div><span style="display:inline-block;width:10px;height:10px;background:#1a6040;border-radius:2px;margin-right:6px"></span>Hadir: <b>'+h+'</b> ('+Math.round(h/tot*100)+'%)</div>'+
    '<div><span style="display:inline-block;width:10px;height:10px;background:#c9a040;border-radius:2px;margin-right:6px"></span>Izin: <b>'+iz+'</b> ('+Math.round(iz/tot*100)+'%)</div>'+
    '<div><span style="display:inline-block;width:10px;height:10px;background:#b03030;border-radius:2px;margin-right:6px"></span>Alfa: <b>'+al+'</b> ('+Math.round(al/tot*100)+'%)</div>'+
    (belum?'<div><span style="display:inline-block;width:10px;height:10px;background:#e0d8cc;border-radius:2px;margin-right:6px"></span>Belum: <b>'+belum+'</b> ('+Math.round(belum/tot*100)+'%)</div>':'')+
    '</div>':'';
  _printWithIframe('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Detail '+_mdetNama+'</title>'+
    '<style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#222}'+
    'h2{font-size:16px;margin:0 0 4px}p{margin:0 0 4px;color:#666;font-size:11px}.filter-info{font-size:10px;color:#999;margin-bottom:14px;padding:6px 10px;background:#f9f6f0;border-radius:4px}'+
    '.summary{display:flex;align-items:center;gap:24px;background:#f5eedf;padding:14px 18px;border-radius:8px;margin-bottom:20px}'+
    '.stats{display:flex;gap:20px;flex-wrap:wrap;align-items:center}'+
    '.stat{text-align:center}.stat-val{font-size:18px;font-weight:700}.stat-lbl{font-size:10px;color:#888;text-transform:uppercase}'+
    'table{width:100%;border-collapse:collapse;font-size:11px}'+
    'th,td{border:1px solid #ddd;padding:6px 9px;text-align:left}th{background:#f5f5f5;font-weight:600}'+
    '@media print{body{padding:8px}}</style></head><body>'+
    '<h2>Detail Kehadiran: '+_mdetNama+'</h2><p>'+gender+'</p>'+
    '<div class="filter-info">Filter: '+filterDesc+' &nbsp;·&nbsp; '+tot+' sesi ditampilkan</div>'+
    '<div class="summary">'+donutSvg+'<div>'+legendHtml+'</div>'+
    '<div class="stats" style="margin-left:auto">'+
      '<div class="stat"><div class="stat-val">'+tot+'</div><div class="stat-lbl">Total Sesi</div></div>'+
      '<div class="stat"><div class="stat-val" style="color:'+pColor+'">'+pct+'%</div><div class="stat-lbl">Kehadiran</div></div>'+
    '</div></div>'+
    '<table><thead><tr><th>No</th><th>Tanggal</th><th>Kegiatan</th><th>Status</th><th>Keterangan</th></tr></thead>'+
    '<tbody>'+tableRows+'</tbody></table>'+
    '</body></html>');
}

// ══════════════════════════════════════════════════
// EXPORT ANGGOTA MULTI (expang)
// ══════════════════════════════════════════════════

function openExpAng(){
  var listEl = document.getElementById('expang-list');
  listEl.innerHTML = members.map(function(m){
    var avc = m.gender==='P'?'av-p':'av-l';
    return '<label class="exp-check-row">'+
      '<input type="checkbox" class="expang-cb" value="'+m.nama+'" checked> '+
      '<span class="avatar '+avc+'" style="width:22px;height:22px;font-size:9px;flex-shrink:0">'+initials(m.nama)+'</span> '+
      m.nama+' <span style="color:var(--text3);font-size:11px">('+glabel(m.gender)+')</span></label>';
  }).join('');
  document.getElementById('expang-overlay').classList.add('show');
  document.getElementById('expang-popup').classList.add('show');
}

function closeExpAng(){
  document.getElementById('expang-overlay').classList.remove('show');
  document.getElementById('expang-popup').classList.remove('show');
}

function expangSelAll(val){
  document.querySelectorAll('.expang-cb').forEach(function(cb){ cb.checked = val; });
}

function getExpAngSelected(){
  var sel = [];
  document.querySelectorAll('.expang-cb:checked').forEach(function(cb){ sel.push(cb.value); });
  return sel;
}

function _getMemberData(nama, fBln, fThn){
  var rows = getMemberSessions(nama);
  if(fThn) rows = rows.filter(function(r){ return r.yearKey === fThn; });
  if(fBln) rows = rows.filter(function(r){ return r.monthKey === fBln; });
  var h=0,iz=0,al=0;
  rows.forEach(function(r){ if(r.status==='H')h++; else if(r.status==='I')iz++; else if(r.status==='A')al++; });
  return {rows:rows,h:h,iz:iz,al:al,tot:rows.length};
}

function doExpAng(type){
  var sel = getExpAngSelected();
  if(!sel.length){ alert('Pilih minimal satu anggota.'); return; }
  var fBln = (document.getElementById('expang-bulan')||{}).value||'';
  var fThn = (document.getElementById('expang-tahun')||{}).value||'';
  var bulanLabel = fBln ? (BULAN[parseInt(fBln)]||fBln) : 'Semua Bulan';
  var filterDesc = (fThn||'Semua Tahun')+' · '+bulanLabel;

  if(type==='print'){
    if(typeof JSZip==='undefined'||typeof jspdf==='undefined'){
      alert('Library belum dimuat, coba refresh halaman.'); return;
    }
    var jsPDF = jspdf.jsPDF;
    closeExpAng();
    showToast('⏳ Membuat PDF... mohon tunggu', 30000);
    var zip    = new JSZip();
    var folder = zip.folder('Absensi_Anggota'+(fThn?'_'+fThn:'')+(fBln?'_Bln'+fBln:''));
    var cGreen=[26,96,69],cAmber=[138,94,16],cRed=[139,53,48],cGray=[120,120,120],cBorder=[220,216,204],cBg=[245,238,223];
    sel.forEach(function(nama){
      var m=members.find(function(x){return x.nama===nama;})||{gender:'L'};
      var data=_getMemberData(nama,fBln,fThn);
      var tot=data.tot,h=data.h,iz=data.iz,al=data.al;
      var pct=tot?Math.round(h/tot*100):0;
      var pColor=pct>=80?cGreen:pct>=60?cAmber:cRed;
      var doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait'});
      var W=doc.internal.pageSize.getWidth(),margin=14,y=margin;
      doc.setFontSize(16);doc.setTextColor(cGreen[0],cGreen[1],cGreen[2]);doc.setFont('helvetica','bold');
      doc.text(nama,margin,y);y+=6;
      doc.setFontSize(10);doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.setFont('helvetica','normal');
      doc.text(glabel(m.gender)+'   |   '+filterDesc,margin,y);y+=8;
      doc.setFillColor(cBg[0],cBg[1],cBg[2]);doc.roundedRect(margin,y,W-margin*2,22,3,3,'F');
      var sx=margin+6;
      doc.setFontSize(9);doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.text('Total Sesi',sx,y+6);
      doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(50,50,50);doc.text(String(tot),sx,y+14);
      sx+=28;doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.text('Hadir',sx,y+6);
      doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(cGreen[0],cGreen[1],cGreen[2]);doc.text(String(h),sx,y+14);
      sx+=22;doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.text('Izin',sx,y+6);
      doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(cAmber[0],cAmber[1],cAmber[2]);doc.text(String(iz),sx,y+14);
      sx+=22;doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.text('Alfa',sx,y+6);
      doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(cRed[0],cRed[1],cRed[2]);doc.text(String(al),sx,y+14);
      sx+=22;doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(cGray[0],cGray[1],cGray[2]);doc.text('Kehadiran',sx,y+6);
      doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(pColor[0],pColor[1],pColor[2]);doc.text(pct+'%',sx,y+14);
      y+=28;
      var cols=['No','Tanggal','Kegiatan','Status','Keterangan'];
      var colW=[10,42,50,18,W-margin*2-10-42-50-18];
      doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setFillColor(200,230,215);doc.rect(margin,y,W-margin*2,7,'F');
      doc.setTextColor(26,96,69);var cx=margin+2;
      cols.forEach(function(h2,i){doc.text(h2,cx+1,y+5);cx+=colW[i];});y+=7;
      doc.setFont('helvetica','normal');doc.setFontSize(8);
      data.rows.forEach(function(r,i){
        var rowH=7;
        if(y+rowH>doc.internal.pageSize.getHeight()-margin){doc.addPage();y=margin;}
        if(i%2===0){doc.setFillColor(248,248,248);doc.rect(margin,y,W-margin*2,rowH,'F');}
        doc.setDrawColor(cBorder[0],cBorder[1],cBorder[2]);doc.line(margin,y+rowH,margin+W-margin*2,y+rowH);
        var sv=r.status==='H'?'Hadir':r.status==='I'?'Izin':r.status==='A'?'Alfa':'Belum';
        var sc=r.status==='H'?cGreen:r.status==='I'?cAmber:r.status==='A'?cRed:cGray;
        var vals=[String(i+1),r.tgl,r.kegiatan,sv,r.catatan||'—'];
        cx=margin+2;
        vals.forEach(function(v,ci){
          if(ci===3){doc.setTextColor(sc[0],sc[1],sc[2]);doc.setFont('helvetica','bold');}
          else{doc.setTextColor(50,50,50);doc.setFont('helvetica','normal');}
          var maxW=colW[ci]-3;
          var txt=doc.splitTextToSize(v,maxW)[0]||'';
          doc.text(txt,cx+1,y+5);cx+=colW[ci];
        });
        y+=rowH;
      });
      var fname='Absensi_'+nama.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf';
      folder.file(fname,doc.output('blob'));
    });
    zip.generateAsync({type:'blob'}).then(function(blob){
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download='Absensi_Anggota'+(fThn?'_'+fThn:'')+(fBln?'_Bln'+fBln:'')+'.zip';a.click();
      showToast('✅ ZIP berhasil diunduh!');
      setTimeout(function(){URL.revokeObjectURL(url);},3000);
    });
    return;
  }
  if(type==='excel'){
    var wb=XLSX.utils.book_new();
    sel.forEach(function(nama){
      var data=_getMemberData(nama,fBln,fThn);
      var rows=[['No','Tanggal','Kegiatan','Status','Keterangan']];
      data.rows.forEach(function(r,i){
        rows.push([i+1,r.tgl,r.kegiatan,r.status==='H'?'Hadir':r.status==='I'?'Izin':r.status==='A'?'Alfa':'Belum',r.catatan||'']);
      });
      rows.push([]);rows.push(['','','Hadir',data.h,'']);rows.push(['','','Izin',data.iz,'']);rows.push(['','','Alfa',data.al,'']);
      rows.push(['','','% Hadir',data.tot?Math.round(data.h/data.tot*100)+'%':'—','']);
      var sheetName=nama.slice(0,28).replace(/[:\/?*\[\]]/g,'');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),sheetName);
    });
    XLSX.writeFile(wb,'Anggota_Multi.xlsx');
    closeExpAng(); return;
  }
  if(type==='csv'){
    var allCSV=[];
    sel.forEach(function(nama){
      var data=_getMemberData(nama,fBln,fThn);
      allCSV.push('=== '+nama+' ('+filterDesc+') ===');
      allCSV.push('"No","Tanggal","Kegiatan","Status","Keterangan"');
      data.rows.forEach(function(r,i){
        var sv=r.status==='H'?'Hadir':r.status==='I'?'Izin':r.status==='A'?'Alfa':'Belum';
        allCSV.push('"'+(i+1)+'","'+r.tgl+'","'+r.kegiatan+'","'+sv+'","'+(r.catatan||'')+'"');
      });
      allCSV.push('"","","Hadir","'+data.h+'"');
      allCSV.push('"","","Izin","'+data.iz+'"');
      allCSV.push('"","","Alfa","'+data.al+'"');
      allCSV.push('');
    });
    var a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(allCSV.join('\n'));
    a.download='Anggota_Multi.csv';a.click();
    closeExpAng();
  }
}
