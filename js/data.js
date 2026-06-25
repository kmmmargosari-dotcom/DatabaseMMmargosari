// ══════════════════════════════════════════════════
// DATA — shared state & constants
// ══════════════════════════════════════════════════

var members = [
  {nama:'ARISKA NURVINAHARI',gender:'P'},{nama:'ENI ISWANTI',gender:'P'},
  {nama:'FITRI NURASTUTI',gender:'P'},{nama:'ILMA WULAN RAMADHANI',gender:'P'},
  {nama:'INA OKTAVIANI',gender:'P'},{nama:'NAZHWA ALIYA PUTRI',gender:'P'},
  {nama:'RISTYANINGSIH',gender:'P'},{nama:'USWATUN HASANAH',gender:'P'},
  {nama:'WENI SALATSUL HUSNA',gender:'P'},{nama:'ALVIANA',gender:'P'},
  {nama:'ANISA FEBRIYANTI',gender:'P'},{nama:'LUTFI NUR AFIFAH',gender:'P'},
  {nama:'IDA NURLATIFAH',gender:'P'},{nama:'BIENDA PRATIKASIWI',gender:'P'},
  {nama:'EVI RYSKA AFRIYANI',gender:'P'},{nama:'OKTAFIA CESAR LARASATI',gender:'P'},
  {nama:'SOFA NISABELA ANDINI',gender:'P'},{nama:'SYAHNAZ AULIA NURJANNAH',gender:'P'},
  {nama:'SYEIKHA AULIA NURRAHMAH',gender:'P'},{nama:'UKHTA IZZA AFIFAH',gender:'P'},
  {nama:'ALAM PILAROSE',gender:'L'},{nama:'ARLIS DWI MAHENDRA',gender:'L'},
  {nama:'BAYU SEPTIANTO',gender:'L'},{nama:'FIRSTA DARUL SALAM',gender:'L'},
  {nama:'NUR FAHRUDIN',gender:'L'},{nama:'SAIFUL ABIDIN',gender:'L'},
  {nama:'ZULFAN ARI SENA',gender:'L'}
];

// sesiData[tgl][nama] = {status:'H'|'I'|'A', catatan:''}
var sesiData = {};
// sesiKet[tgl] = kegiatan string
var sesiKet  = {};

var BULAN = ['','Januari','Februari','Maret','April','Mei','Juni',
             'Juli','Agustus','September','Oktober','November','Desember'];
var HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
var BULAN_ID = ['','Januari','Februari','Maret','April','Mei','Juni',
                'Juli','Agustus','September','Oktober','November','Desember'];

// Absensi state
var absenTgl    = '';
var absenBulan  = 0;
var absenTahun  = 0;
var absenKet    = '';
var absenGender = 'S';
var openPanel   = null;

// Kas data
var kasTransaksi  = [];
var kasSaldoAwal  = parseFloat(localStorage.getItem('kas_saldo_awal')) || 0;
