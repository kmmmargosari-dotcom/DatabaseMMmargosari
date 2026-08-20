// ══════════════════════════════════════════════════
// EKSPOR — halaman terpusat (menu Lainnya > Ekspor)
// Reuse fungsi export yang sudah ada di tiap modul tanpa duplikasi logic.
// ══════════════════════════════════════════════════

function renderEkspor(){}
function renderEksporMob(){ renderEkspor(); }

function _exVal(pcId, mobId){
  if(mob()){
    var m = document.getElementById(mobId);
    if(m && m.value) return m.value;
  }
  var p = document.getElementById(pcId);
  if(p && p.value) return p.value;
  var m2 = document.getElementById(mobId);
  if(m2 && m2.value) return m2.value;
  return '';
}

function _exSet(ids, val){
  ids.forEach(function(id){
    var el = document.getElementById(id);
    if(el && val) el.value = val;
  });
}

// Rekap Absensi Bulanan — salin periode pilihan ke filter Rekap lalu export.
function eksporRekap(type){
  _exSet(['rBulan','rBulanM'], _exVal('exRekapBulan','exRekapBulanM'));
  _exSet(['rTahun','rTahunM'], _exVal('exRekapTahun','exRekapTahunM'));
  _exSet(['rGender','rGenderM'], _exVal('exRekapGender','exRekapGenderM'));
  try { renderRekap('pc'); } catch(e){} // isi DOM untuk print rekap
  if(type==='excel') exportExcel();
  else if(type==='csv') exportCSV();
  else exportPrint();
}

// Laporan Kas — salin periode pilihan ke filter Kas lalu export (kasExport).
function eksporKas(type){
  _exSet(['kasBulan','kasBulanM'], _exVal('exKasBulan','exKasBulanM'));
  _exSet(['kasTahun','kasTahunM'], _exVal('exKasTahun','exKasTahunM'));
  kasExport(type);
}