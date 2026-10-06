// Generator ERD (crow's foot + PK/FK) - Sistem Pengelolaan Perusahaan Developer Perumahan
// Sumber skema: D:\backend-developer-perumahan\prisma\schema.prisma
// Tata letak: A4 landscape (297x210 mm), skala 10 unit = 1 mm, margin 15 mm.
// PERUSAHAAN di pojok kiri atas; alur entitas mengalir ke kanan.
// Semua garis ortogonal, memakai kanal: bus atas (relasi PERUSAHAAN),
// bus bawah (relasi PENGGUNA), dan kanal vertikal di sela antar kolom.
// Jalankan: node erd.gen.mjs   -> menghasilkan erd.svg
import fs from 'fs';

const HEADER_H = 58, ROW_H = 38, PAD_B = 16, W = 380;
const h = n => HEADER_H + ROW_H * n + PAD_B;

const F_TITLE = 30, F_ATTR = 26, F_KEY = 22, F_REL = 26, F_CARD = 28;

// ['PK'|'FK'|'', nama_kolom]  -- isi TIDAK diubah dari versi sebelumnya
const E = {
  PERUSAHAAN: { x: 150, y: 440, attrs: [
    ['PK','id_perusahaan'],['','nama_perusahaan'],['','kode_perusahaan'],['','alamat'],['','email'] ]},
  PENGGUNA: { x: 150, y: 774, attrs: [
    ['PK','id_pengguna'],['','nama'],['','email'],['','peran'],['','status_aktif'],['FK','id_perusahaan'] ]},
  LOGAKTIVITAS: { x: 150, y: 1146, label:'LOG AKTIVITAS', attrs: [
    ['PK','id_log'],['','aksi'],['','detail'],['FK','id_pengguna'] ]},

  AKUN: { x: 720, y: 440, attrs: [
    ['PK','id_akun'],['','kode_akun'],['','nama_akun'],['','jenis_akun'],['FK','id_perusahaan'],['FK','id_akun_induk'] ]},
  SALDOAKUN: { x: 720, y: 880, label:'SALDO AKUN', attrs: [
    ['PK','id_saldo'],['','periode'],['','jenis_periode'],['','saldo_awal'],['','saldo_akhir'],
    ['FK','id_perusahaan'],['FK','id_akun'] ]},

  TRANSAKSI: { x: 1290, y: 440, attrs: [
    ['PK','id_transaksi'],['','kode_transaksi'],['','tanggal_transaksi'],['','jumlah'],['','status'],
    ['FK','id_perusahaan'],['FK','id_pengguna'],['FK','id_akun_debit'],['FK','id_akun_kredit'],['FK','id_penyetuju'] ]},
  JURNAL: { x: 1290, y: 944, attrs: [
    ['PK','id_jurnal'],['','nomor_jurnal'],['','tanggal_jurnal'],['','deskripsi'],['','status_posting'],
    ['FK','id_perusahaan'],['FK','id_pengguna'],['FK','id_transaksi'],['FK','id_penyetuju'] ]},
  BARISJURNAL: { x: 1290, y: 1410, label:'BARIS JURNAL', attrs: [
    ['PK','id_baris_jurnal'],['','debit'],['','kredit'],['','keterangan'],['FK','id_jurnal'],['FK','id_akun'] ]},

  LAPORAN: { x: 1860, y: 440, label:'LAPORAN KEUANGAN', attrs: [
    ['PK','id_laporan'],['','jenis_laporan'],['','periode_awal'],['','periode_akhir'],['','status'],
    ['FK','id_perusahaan'],['FK','id_pembuat'],['FK','id_pemfinalisasi'] ]},
  ITEMNERACA: { x: 1860, y: 888, label:'ITEM NERACA', attrs: [
    ['PK','id_item_neraca'],['','kode_akun'],['','nama_akun'],['','saldo'],['','urutan'],
    ['FK','id_laporan'],['FK','id_item_induk'] ]},
  ITEMLABARUGI: { x: 1860, y: 1298, label:'ITEM LABA RUGI', attrs: [
    ['PK','id_item_laba_rugi'],['','kode_akun'],['','nama_akun'],['','saldo'],['','urutan'],
    ['FK','id_laporan'],['FK','id_item_induk'] ]},

  PENGAJUAN: { x: 2430, y: 440, label:'PENGAJUAN BARANG', attrs: [
    ['PK','id_pengajuan'],['','kode_pengajuan'],['','nama_barang'],['','nilai_pengajuan'],['','status'],
    ['FK','id_perusahaan'],['FK','id_pengaju'] ]},
};
for (const k of Object.keys(E)) {
  const e = E[k];
  e.w = W; e.h = h(e.attrs.length); e.label = e.label || k;
  e.cx = e.x + W/2; e.right = e.x + W; e.bottom = e.y + e.h;
}

// lane bus atas (relasi PERUSAHAAN) & bus bawah (relasi PENGGUNA)
// aturan anti-silang: target makin ke kanan -> lane makin atas (bus atas)
//                     target makin ke kanan -> lane makin bawah (bus bawah)
const rels = [
  // --- PERUSAHAAN ---
  { a:'PERUSAHAAN', b:'PENGGUNA',  name:'memiliki', lab:[275,745,'start'],
    path:[[250,704],[250,774]] },
  { a:'PERUSAHAAN', b:'AKUN',      name:'memiliki', lab:[625,486,'middle'],
    path:[[530,500],[720,500]] },
  { a:'PERUSAHAAN', b:'SALDOAKUN', name:'memiliki', lab:[615,585,'middle'],
    path:[[530,600],[700,600],[700,960],[720,960]] },
  { a:'PERUSAHAAN', b:'TRANSAKSI', name:'memiliki', lab:[1150,390,'middle'],
    path:[[400,440],[400,390],[1400,390],[1400,440]] },
  { a:'PERUSAHAAN', b:'JURNAL',    name:'memiliki', lab:[1440,350,'middle'],
    cN:[1665,908,'start'],
    path:[[350,440],[350,350],[1700,350],[1700,919],[1640,919],[1640,944]] },
  { a:'PERUSAHAAN', b:'LAPORAN',   name:'memiliki', lab:[1790,310,'middle'],
    path:[[300,440],[300,310],[1950,310],[1950,440]] },
  { a:'PERUSAHAAN', b:'PENGAJUAN', name:'memiliki', lab:[2210,270,'middle'],
    path:[[250,440],[250,270],[2520,270],[2520,440]] },

  // --- PENGGUNA (bus bawah) ---
  { a:'PENGGUNA', b:'LOGAKTIVITAS', name:'melakukan', lab:[275,1117,'start'],
    path:[[250,1076],[250,1146]] },
  { a:'PENGGUNA', b:'JURNAL',    name:'membuat',    lab:[1060,1742,'middle'],
    path:[[530,800],[680,800],[680,1742],[1730,1742],[1730,1130],[1670,1130]] },
  { a:'PENGGUNA', b:'JURNAL',    name:'menyetujui', lab:[1380,1774,'middle'],
    path:[[530,830],[660,830],[660,1774],[1760,1774],[1760,1190],[1670,1190]] },
  { a:'PENGGUNA', b:'TRANSAKSI', name:'menginput',  lab:[900,1806,'middle'],
    path:[[530,860],[640,860],[640,1806],[1810,1806],[1810,500],[1670,500]] },
  { a:'PENGGUNA', b:'TRANSAKSI', name:'menyetujui', lab:[1450,1838,'middle'],
    path:[[530,890],[620,890],[620,1838],[1840,1838],[1840,560],[1670,560]] },
  { a:'PENGGUNA', b:'LAPORAN',   name:'membuat',    lab:[1150,1870,'middle'],
    path:[[530,920],[600,920],[600,1870],[2280,1870],[2280,620],[2240,620]] },
  { a:'PENGGUNA', b:'LAPORAN', name:'memfinalisasi', lab:[1700,1902,'middle'],
    path:[[530,950],[580,950],[580,1902],[2320,1902],[2320,680],[2240,680]] },
  { a:'PENGGUNA', b:'PENGAJUAN', name:'mengajukan', lab:[2150,1934,'middle'],
    path:[[530,980],[560,980],[560,1934],[2600,1934],[2600,780]] },

  // --- AKUN ---
  { a:'AKUN', b:'TRANSAKSI',   name:'didebit pada',  lab:[1195,606,'middle'],
    path:[[1100,620],[1290,620]] },
  { a:'AKUN', b:'TRANSAKSI',   name:'dikredit pada', lab:[1195,666,'middle'],
    path:[[1100,680],[1290,680]] },
  { a:'AKUN', b:'BARISJURNAL', name:'dipakai pada',  lab:[1185,1250,'end'],
    path:[[1100,720],[1200,720],[1200,1500],[1290,1500]] },
  { a:'AKUN', b:'SALDOAKUN',   name:'memiliki',      lab:[1000,830,'middle'],
    c1:[1110,790,'start'], cN:[1110,860,'start'],
    path:[[1090,742],[1090,880]] },

  // --- TRANSAKSI / JURNAL ---
  // 1:1 -- JournalEntry.transactionId Int? @unique (tanpa kaki gagak, "1" di kedua ujung)
  { a:'TRANSAKSI', b:'JURNAL', name:'menghasilkan', oneone:true, lab:[1450,924,'end'],
    c1:[1480,914,'end'], cN:[1520,940,'start'],
    path:[[1500,894],[1500,944]] },
  { a:'JURNAL', b:'BARISJURNAL', name:'terdiri dari', lab:[1525,1390,'start'],
    path:[[1500,1360],[1500,1410]] },

  // --- LAPORAN ---
  { a:'LAPORAN', b:'ITEMNERACA',   name:'memiliki', lab:[1975,858,'start'],
    path:[[1950,818],[1950,888]] },
  { a:'LAPORAN', b:'ITEMLABARUGI', name:'memiliki', lab:[2405,1000,'start'],
    path:[[2240,560],[2380,560],[2380,1330],[2240,1330]] },
];

const selfRels = [
  { e:'AKUN', name:'membawahi', lab:[850,845,'middle'], m1:[785,730,'end'], mN:[912,730,'start'],
    path:[[800,742],[800,810],[900,810],[900,742]] },
  { e:'ITEMNERACA', name:'membawahi', lab:[2115,1272,'start'], m1:[1938,1222,'end'], mN:[2112,1222,'start'],
    path:[[1950,1228],[1950,1263],[2100,1263],[2100,1228]] },
  { e:'ITEMLABARUGI', name:'membawahi', lab:[2115,1689,'start'], m1:[1938,1632,'end'], mN:[2112,1632,'start'],
    path:[[1950,1638],[1950,1680],[2100,1680],[2100,1638]] },
];

const pathD = p => 'M' + p.map(q => q.join(',')).join(' L');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const out = [];

out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2970 2100" font-family="Arial, Helvetica, sans-serif">`);
out.push(`<defs><marker id="crow" markerWidth="26" markerHeight="24" refX="24" refY="12" orient="auto" markerUnits="userSpaceOnUse">
<path d="M24,12 L2,3 M24,12 L2,12 M24,12 L2,21" stroke="#222" stroke-width="2.6" fill="none"/></marker></defs>`);
out.push(`<rect x="0" y="0" width="2970" height="2100" fill="#ffffff"/>`);
out.push(`<text x="1485" y="72" font-size="44" font-weight="bold" text-anchor="middle" fill="#111">ENTITY RELATIONSHIP DIAGRAM</text>`);
out.push(`<text x="1485" y="118" font-size="28" text-anchor="middle" fill="#333">Sistem Pengelolaan Perusahaan Developer Perumahan</text>`);

// penanda kardinalitas di dekat ujung garis
function card(near, away, txt) {
  const dx = away[0]-near[0], dy = away[1]-near[1];
  const L = Math.hypot(dx,dy) || 1, ux = dx/L, uy = dy/L;
  const x = near[0] + ux*44 + (-uy)*20, y = near[1] + uy*44 + ux*20 + 9;
  out.push(`<rect x="${(x-15).toFixed(0)}" y="${(y-27).toFixed(0)}" width="30" height="34" fill="#fff" opacity="0.95"/>`);
  out.push(`<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="${F_CARD}" font-weight="bold" text-anchor="middle" fill="#111">${txt}</text>`);
}
function relLabel(lab, name) {
  const [x, y, anchor] = lab;
  const w = name.length * 13 + 16;
  const bx = anchor === 'middle' ? x - w/2 : anchor === 'end' ? x - w : x;
  out.push(`<rect x="${bx.toFixed(0)}" y="${(y-22).toFixed(0)}" width="${w.toFixed(0)}" height="28" fill="#fff" opacity="0.97"/>`);
  out.push(`<text x="${x}" y="${y}" font-size="${F_REL}" text-anchor="${anchor}" fill="#111">${esc(name)}</text>`);
}

for (const r of rels) {
  const end = r.oneone ? '' : `marker-end="url(#crow)"`;
  out.push(`<path d="${pathD(r.path)}" fill="none" stroke="#222" stroke-width="3" ${end}/>`);
  const p = r.path;
  const fixed = (m, t) => out.push(`<text x="${m[0]}" y="${m[1]}" font-size="${F_CARD}" font-weight="bold" text-anchor="${m[2]}" fill="#111">${t}</text>`);
  if (r.c1) fixed(r.c1, '1'); else card(p[0], p[1], '1');
  if (r.cN) fixed(r.cN, r.oneone ? '1' : 'N'); else card(p[p.length-1], p[p.length-2], r.oneone ? '1' : 'N');
}
for (const r of selfRels) {
  out.push(`<path d="${pathD(r.path)}" fill="none" stroke="#222" stroke-width="3" marker-end="url(#crow)"/>`);
  for (const [m, t] of [[r.m1,'1'], [r.mN,'N']]) {
    out.push(`<text x="${m[0]}" y="${m[1]}" font-size="${F_CARD}" font-weight="bold" text-anchor="${m[2]}" fill="#111">${t}</text>`);
  }
}

// kotak entitas (digambar di atas garis)
for (const k of Object.keys(E)) {
  const e = E[k];
  out.push(`<rect x="${e.x}" y="${e.y}" width="${W}" height="${e.h}" rx="8" fill="#ffffff" stroke="#222" stroke-width="3"/>`);
  out.push(`<path d="M${e.x},${e.y+8} a8,8 0 0 1 8,-8 h${W-16} a8,8 0 0 1 8,8 v${HEADER_H-8} h${-W} z" fill="#e6e6e6"/>`);
  out.push(`<line x1="${e.x}" y1="${e.y+HEADER_H}" x2="${e.right}" y2="${e.y+HEADER_H}" stroke="#222" stroke-width="2.5"/>`);
  out.push(`<text x="${e.cx}" y="${e.y+40}" font-size="${F_TITLE}" font-weight="bold" text-anchor="middle" fill="#111">${esc(e.label)}</text>`);
  e.attrs.forEach(([kind, nama], i) => {
    const ay = e.y + HEADER_H + 28 + i*ROW_H;
    if (kind) out.push(`<text x="${e.x+18}" y="${ay}" font-size="${F_KEY}" font-weight="bold" fill="#444">${kind}</text>`);
    const dec = kind === 'PK' ? ' text-decoration="underline"' : '';
    out.push(`<text x="${e.x+85}" y="${ay}" font-size="${F_ATTR}" fill="#111"${dec}>${esc(nama)}</text>`);
  });
  const f = e.attrs.findIndex(a => a[0] === 'FK');
  if (f > 0) {
    const sy = e.y + HEADER_H + 8 + f*ROW_H;
    out.push(`<line x1="${e.x+14}" y1="${sy}" x2="${e.right-14}" y2="${sy}" stroke="#999" stroke-width="1.5" stroke-dasharray="7,6"/>`);
  }
}

// label relasi digambar paling akhir agar tidak tertimpa
for (const r of rels) relLabel(r.lab, r.name);
for (const r of selfRels) relLabel(r.lab, r.name);

// legenda: pojok kiri bawah (area kosong, tidak dilewati garis)
const LX = 150, LY = 1450;
out.push(`<rect x="${LX}" y="${LY}" width="380" height="400" rx="8" fill="#fff" stroke="#555" stroke-width="2.5"/>`);
out.push(`<text x="${LX+20}" y="${LY+42}" font-size="28" font-weight="bold" fill="#111">KETERANGAN</text>`);
const items = [
  ['PK','primary key (kunci utama)'],
  ['FK','foreign key (kunci tamu)'],
];
items.forEach(([a,b], i) => {
  out.push(`<text x="${LX+20}" y="${LY+90+i*36}" font-size="${F_KEY}" font-weight="bold" fill="#111">${a}</text>`);
  out.push(`<text x="${LX+70}" y="${LY+90+i*36}" font-size="${F_KEY}" fill="#111">${b}</text>`);
});
out.push(`<line x1="${LX+30}" y1="${LY+190}" x2="${LX+140}" y2="${LY+190}" stroke="#222" stroke-width="3" marker-end="url(#crow)"/>`);
out.push(`<text x="${LX+26}" y="${LY+178}" font-size="${F_KEY}" font-weight="bold" fill="#111">1</text>`);
out.push(`<text x="${LX+140}" y="${LY+178}" font-size="${F_KEY}" font-weight="bold" fill="#111">N</text>`);
out.push(`<text x="${LX+175}" y="${LY+198}" font-size="${F_KEY}" fill="#111">satu ke banyak</text>`);
out.push(`<line x1="${LX+30}" y1="${LY+250}" x2="${LX+140}" y2="${LY+250}" stroke="#222" stroke-width="3"/>`);
out.push(`<text x="${LX+26}" y="${LY+238}" font-size="${F_KEY}" font-weight="bold" fill="#111">1</text>`);
out.push(`<text x="${LX+140}" y="${LY+238}" font-size="${F_KEY}" font-weight="bold" fill="#111">1</text>`);
out.push(`<text x="${LX+175}" y="${LY+258}" font-size="${F_KEY}" fill="#111">satu ke satu</text>`);
out.push(`<text x="${LX+20}" y="${LY+305}" font-size="${F_KEY}" fill="#333">Kaki gagak = sisi "banyak".</text>`);
out.push(`<text x="${LX+20}" y="${LY+337}" font-size="${F_KEY}" fill="#333">"membawahi" = relasi induk-anak.</text>`);
out.push(`<text x="${LX+20}" y="${LY+369}" font-size="${F_KEY}" fill="#333">Sumber: schema.prisma</text>`);

out.push(`</svg>`);
fs.writeFileSync(new URL('./erd.svg', import.meta.url), out.join('\n'));
console.log('OK - erd.svg |', Object.keys(E).length, 'entitas |', rels.length + selfRels.length, 'relasi');
