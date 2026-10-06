# KONTEKS PROYEK — untuk diberikan ke asisten AI

Blok di bawah ini adalah ringkasan fakta yang sudah diverifikasi terhadap riwayat kode.
Salin seluruhnya sebagai konteks awal saat meminta bantuan menulis Bab IV.

---

## IDENTITAS PENELITIAN

- Judul: Rancang Bangun Aplikasi Pengelolaan Perusahaan Developer Perumahan Berbasis Web dengan Metode Simple Additive Weighting
- Peneliti: Hizkia Polii (220211060081)
- Nama sistem: Bumi Residence Housing Finance System
- Objek penelitian: Bumi Residence (developer perumahan)
- Metode pengembangan: Prototyping, 4 iterasi (v0.1–v0.4)
- Zona waktu operasional perusahaan: WITA

## ARSITEKTUR SISTEM

Dua aplikasi terpisah yang berkomunikasi lewat REST API (JSON) dengan JWT Bearer token:

- Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- Backend: Express.js v5 + Prisma + PostgreSQL

Pola pemanggilan API bersifat hibrida:
1. Route sensitif (login, verify, users) diproksi lewat Next.js Route Handler (`src/app/api/...`), yang kemudian memanggil backend Express dari sisi server.
2. Route lain (transaksi, chart of accounts, dashboard, laporan) dipanggil langsung dari peramban ke Express lewat `src/services/api-client.ts`.

Token JWT disimpan di `localStorage`, bukan httpOnly cookie — konsekuensi arsitektur lintas-origin, dan merupakan keterbatasan keamanan yang diketahui.

## BATAS VERSI (hasil penelusuran riwayat git, tidak ada tag git sama sekali)

| Versi | Commit frontend | Commit backend | Tanggal |
|---|---|---|---|
| v0.1 | 74192e6 | 6adffdf | 29 April 2026 |
| v0.2 | d722d48 | 6adffdf (tidak ada commit backend baru) | 5 Juni 2026 |
| v0.3 | bbf58ce (substansi pada dad1bb1) | b322238 | 29 Juni 2026 |
| v0.4 | eef582a | bfd4da5 | 18 Juli 2026 |

Dasar penentuan batas v0.2→v0.3: jumlah berkas yang memuat `localStorage` turun dari 9 (71c5054) ke 6 berisi data usaha (d722d48), lalu ke 3 yang hanya berisi token/sesi (dad1bb1).

## ISI TIAP VERSI

### v0.1 — Fondasi (29 April 2026)
- Autentikasi JWT, manajemen pengguna oleh Admin, activity log
- Modul unit properti dan booking — DIHAPUS pada commit ini, diganti kerangka halaman transaksi dan laporan
- Basis data: 4 model (User, Unit, Booking, ActivityLog)
- 4 peran: Admin, Marketing, Manager, Owner
- Isi halaman transaksi dan laporan masih data contoh (dummy) di dalam berkas halaman
- Pengamanan hanya authMiddleware, belum ada pemeriksaan peran

### v0.2 — Modul keuangan berbasis localStorage (5 Juni 2026)
- Seluruh route diganti ke bahasa Indonesia (/transaksi, /laporan/*, /master-akun)
- Mesin akuntansi `src/lib/accounting.ts` dengan pencatatan berpasangan dan hierarki akun
- 4 laporan keuangan: Neraca, Laba Rugi, Arus Kas, Perubahan Modal — semuanya dihasilkan fungsi `buildReports()` dari satu sumber data
- Halaman Master Akun (masih berbasis localStorage)
- Pengajuan pembelian bertingkat lewat `approval-service.ts` (localStorage)
- Lapisan penghubung API sudah dibangun (api-client.ts, useApi.ts, useApiEndpoints.ts, types/financial-system.ts) walau backend-nya belum ada
- Kunci localStorage: prodev_accounts, prodev_transactions, purchaseRequests, purchaseRequestCounter, token, user, loginTime
- 4 peran: Admin, Manager, Owner, Staf (Marketing hilang, Staf masuk)
- Backend TIDAK berubah dari v0.1 sepanjang iterasi ini

### v0.3 — Basis data terpusat, RBAC, dua alur persetujuan (29 Juni 2026)
- Seluruh data usaha pindah ke PostgreSQL; localStorage tinggal token/sesi
- Skema Prisma menjadi 12 model: Company, User, ActivityLog, ChartOfAccounts, Transaction, JournalEntry, JournalEntryLine, AccountBalance, FinancialReport, BalanceSheetItem, IncomeStatementItem, PurchaseRequest
- Model Unit dan Booking dihapus
- Berkas baru `src/middleware/role.ts` — RBAC ditegakkan di server, mengembalikan HTTP 403
- Halaman baru: /jurnal-umum dan /transaksi/approval
- 5 peran: Admin, Teller, Manager, Owner, Staf
- Identitas perusahaan masuk: title "Bumi Residence — Housing Finance System", aset logo-br.png dan bg-login.jpeg

### v0.4 — Analisis Kinerja Keuangan / SAW (18 Juli 2026)
- Halaman baru /laporan/analisis-kinerja
- Endpoint baru GET /api/spk/analisis-kinerja (roleMiddleware manager, owner)
- Perubahan skema Prisma hanya satu: penambahan field `isFixedAsset` pada ChartOfAccounts
- Pengujian otomatis ditambahkan (Vitest) di kedua repo
- Tidak ada modul yang dihapus

## DUA ALUR PERSETUJUAN — JANGAN DICAMPUR

### 1. Approval Transaksi
- Teller menginput transaksi (POST /api/transactions, roleMiddleware "teller")
- Manager menyetujui atau menolak (POST /:id/approve, /:id/reject, roleMiddleware "manager")
- Saat disetujui, dalam satu transaksi basis data (prisma.$transaction) sistem membuat entri Jurnal Umum bernomor JE/<companyId>/<stempel waktu> beserta dua baris jurnal, lalu mengubah status transaksi menjadi POSTED
- Penolakan WAJIB mengisi alasan (rejectionReason)
- Transaksi REJECTED dapat diperbaiki Teller dan otomatis kembali ke PENDING
- Ada pemeriksaan periode terkunci: transaksi tidak dapat disetujui bila periode laporannya sudah difinalisasi

### 2. Approval Pengadaan Barang
- Staf mengajukan, nomor otomatis PR-TAHUN-NNN, status Pending
- Manager menyetujui tingkat 1 (POST /:id/approve-manager) → status ACC Manager, sistem menerbitkan nomor nota
- Owner/Direktur menyetujui akhir (POST /:id/approve-owner) → status ACC Final
- Penolakan TIDAK memakai input alasan di antarmuka (langsung dialog konfirmasi)

## TAHAP KOMUNIKASI TIAP ITERASI

Penanda sumber: [K] terbukti dari kode · [C] dari catatan diskusi (sumber sekunder) · [K+C] keduanya · [?] tidak dapat dipastikan

### Komunikasi v0.1 — sumber: peneliti
- Autentikasi dan sesi aman [K]
- Manajemen pengguna oleh Admin [K]
- Jejak audit aktivitas [K]
- Pengelolaan unit properti dan booking [K]
- Persetujuan berjenjang Pending → ACC Manager → ACC Final → Tolak [K]
- Perubahan arah dari booking ke pengelolaan keuangan [K+C]
- [?] Tidak dapat dipastikan apakah sudah ada pertemuan formal dengan perusahaan

TEMUAN PENTING: struktur persetujuan berjenjang (Manager lalu Direktur) sudah ada sejak v0.1,
tetapi objeknya masih booking unit rumah. Pada v0.2 status yang sama dipakai ulang untuk
pengajuan pembelian barang. Jadi hierarki persetujuan adalah kebutuhan organisasi yang paling
awal terkomunikasikan, dan bertahan sampai versi akhir.

### Komunikasi v0.2 — sumber: peneliti + kaidah akuntansi, BELUM dikonfirmasi ke perusahaan
- Empat laporan keuangan standar yang saling terhubung dari satu sumber transaksi [K+C]
- Master akun berjenjang yang dapat dikelola perusahaan [K]
- Pencatatan berpasangan debit–kredit [K]
- Neraca dapat diperiksa keseimbangannya [K]
- Alur persetujuan berjenjang dialihkan ke pengajuan pembelian barang [K]
- Manager menerbitkan nomor nota saat menyetujui [K]
- Persetujuan akhir di tangan Direktur [K]
- Admin tidak boleh melihat laporan keuangan [K+C]
- Antarmuka berbahasa Indonesia [K]

CATATAN: penggunaan localStorage adalah KEPUTUSAN TEKNIS PENELITI (menguji kebenaran logika
akuntansi lebih dulu sebelum membangun backend), BUKAN kebutuhan pengguna. Jangan ditulis
sebagai kebutuhan pengguna.

### Komunikasi v0.3 — sumber: PIHAK PERUSAHAAN (Owner), awal Juni 2026
Ini SATU-SATUNYA iterasi yang memiliki bukti keterlibatan langsung pengguna.
- Lima peran: Admin, Manager, Owner, Staf, Teller [K+C]
- Sebutan "Staf" dipakai, menggantikan usulan "Lapangan" [K+C]
- Pemisahan tugas: Teller menginput, Manager menyetujui [K+C]
- Transaksi ditolak dapat diperbaiki dan diajukan ulang Teller [K]
- Transaksi disetujui otomatis masuk Jurnal Umum [K]
- Owner tidak menyentuh operasional: tidak kelola master akun, tidak input transaksi [K+C]
- Activity Log hanya Admin dan Owner, tidak Manager [K+C]
- Admin tidak mengajukan pembelian barang [K+C]
- RBAC ditegakkan di sisi server, tidak cukup menyembunyikan menu [K+C]
- Data harus terpusat agar semua pengguna melihat data yang sama [K+C]
- Dashboard dibedakan per peran [K+C]
- Metode End of Day: laporan ditutup dan dikunci setiap hari [K+C]
- Periode terkunci tidak menerima transaksi baru [K]
- Sistem memakai identitas perusahaan [K+C]

PERUBAHAN KEBUTUHAN DI TENGAH ITERASI: End of Day awalnya otomatis pukul 18.00 WITA
(Senin–Jumat, zona Asia/Makassar), lalu diputuskan MANUAL karena banyak kendala.
Bukti kode: eodService.ts beserta cron-nya tetap ada di repo, tetapi fungsi startEODScheduler
HANYA di-import dan TIDAK PERNAH dipanggil di src/index.ts — pada b322238, 45e6acb, maupun
bfd4da5. Penguncian dijalankan lewat POST /reports/:id/finalize (roleMiddleware manager).

### Komunikasi v0.4 — sumber: kebutuhan penelitian + kondisi perusahaan
- Penilaian kinerja keuangan yang objektif dan dapat dibandingkan antarperiode [K]
- Penilaian dilakukan per bulan [K]
- Hanya memakai transaksi berstatus POSTED [K]
- Empat kriteria: laba bersih, pertumbuhan pendapatan, efisiensi beban, likuiditas kas [K]
- Hasil berupa skor, peringkat, dan kategori yang mudah dibaca [K]
- Hanya untuk Manager dan Owner [K]
- Perhitungan uang perlu diuji otomatis [K]
- Perusahaan BELUM memiliki metode penilaian kinerja keuangan apa pun, sehingga penyusunan
  kriteria dan bobot diserahkan kepada peneliti [C]

### Pola antar-iterasi
Kebutuhan awal disusun peneliti, dikoreksi pengguna pada iterasi ketiga, dan koreksi itu
bertahan sampai versi akhir. Tidak satu pun keputusan hasil pertemuan Juni 2026 yang dibatalkan
pada v0.4. Bukti bahwa iterasi berguna: peran Marketing yang diasumsikan peneliti dihapus,
peran Teller yang tidak terpikir justru muncul, dan pemisahan tugas pencatatan–persetujuan baru
terbentuk setelah bertemu pengguna.

## METODE SAW — DETAIL FINAL (JANGAN DIUBAH)

Alternatif: setiap bulan aktif dalam rentang periode terpilih (bulan yang punya transaksi
pendapatan atau beban). Sumber data: hanya transaksi berstatus POSTED.

| Kode | Kriteria | Jenis | Bobot | Rumus |
|---|---|---|---|---|
| C1 | Rasio Laba Bersih | Benefit | 0,35 | Laba Bersih ÷ Pendapatan × 100% |
| C2 | Pertumbuhan Pendapatan | Benefit | 0,30 | (Pendapatan bulan ini − bulan lalu) ÷ bulan lalu × 100% |
| C3 | Rasio Efisiensi Beban | Cost | 0,20 | Total Beban ÷ Pendapatan × 100% |
| C4 | Rasio Likuiditas Kas | Benefit | 0,15 | Saldo Kas ÷ Total Beban |

Langkah: (1) hitung nilai mentah per bulan; (2) tentukan max C1, max C2, min C3, max C4;
(3) normalisasi — benefit R = nilai/max, cost R = min/nilai — lalu
Skor = 0,35·R1 + 0,30·R2 + 0,20·R3 + 0,15·R4; (4) urutkan peringkat dari skor tertinggi.

Kategori: ≥0,80 Sangat Baik · ≥0,60 Baik · ≥0,40 Cukup · ≥0,20 Kurang · sisanya Sangat Kurang.

KEPUTUSAN FINAL: metode tetap SAW, kriteria tetap C1–C4, bobot tetap 35/30/20/15.
Jangan usulkan perubahan metode, kriteria, bobot, atau rumus.

Dua isu matematis yang DIKETAHUI dan SENGAJA DIBIARKAN:
1. Bulan pertama dalam rentang tidak punya pembanding, sehingga C2 null dan R2 dipaksa 0,
   tetapi bobot 30% tetap terpakai — skor maksimum bulan pertama terpotong.
2. R3 dapat kolaps ke 0 untuk banyak bulan bila ada satu bulan dengan beban Rp0.
Keduanya disampaikan sebagai keterbatasan penelitian, bukan diperbaiki.

## TABEL RBAC v0.3 YANG BENAR (menurut kode)

| Fitur | Admin | Teller | Manager | Owner | Staf |
|---|---|---|---|---|---|
| Dashboard | ya | ya | ya | ya | ya |
| Input/ubah/hapus transaksi | tidak | YA | tidak | tidak | tidak |
| Lihat transaksi | tidak | ya | ya | ya | tidak |
| Approval transaksi | tidak | tidak | YA | tidak | tidak |
| Jurnal umum (lihat) | tidak | ya | ya | ya | tidak |
| Master akun / COA | tidak | YA | tidak | tidak | tidak |
| Laporan keuangan (4 jenis) | tidak | ya | ya | ya | tidak |
| Arsip laporan (lihat) | tidak | ya | ya | ya | tidak |
| Kunci/finalisasi laporan | tidak | tidak | YA | tidak | tidak |
| Approval pengadaan | tidak | tidak | ya (L1) | ya (final) | ya (ajukan) |
| Manajemen user | YA | tidak | tidak | tidak | tidak |
| Activity log | YA | tidak | tidak | YA | tidak |
| Analisis kinerja keuangan | tidak | tidak | ya | ya | tidak |

CATATAN PERUBAHAN SETELAH v0.4 (revisi September 2026, belum di-commit):
akses tulis Master Akun dipindahkan dari Teller ke MANAGER. Akses baca tetap untuk
teller, manager, owner — karena form input transaksi butuh daftar akun untuk dropdown.

## HAL YANG TIDAK BOLEH DIKLAIM

1. JANGAN menulis bahwa PostgreSQL + Prisma baru dipakai di v0.3. Keduanya sudah ada sejak
   commit backend pertama (5ff5a6c, 27 April 2026, migrasi 20260426090043_init). Yang pindah
   di v0.3 adalah FRONTEND-nya, dari localStorage ke API.
2. JANGAN menulis bahwa Master Akun baru ada di v0.3. Halamannya sudah ada di v0.2
   (d722d48), hanya saja masih berbasis localStorage.
3. JANGAN menulis "RBAC 5 peran" untuk v0.1 atau v0.2. v0.1 punya 4 peran termasuk Marketing;
   v0.2 punya 4 peran tanpa Teller. Lima peran baru ada di v0.3.
4. JANGAN menulis bahwa Manager dapat menginput transaksi. Manager hanya menyetujui, menolak,
   dan mem-posting.
5. JANGAN menulis bahwa Teller tidak dapat mengakses Laporan atau Arsip Laporan. Teller dapat
   mengaksesnya; yang khusus Manager hanyalah mengunci/finalisasi laporan.
6. JANGAN menulis bahwa bobot SAW berasal dari perusahaan. Tidak ada bukti apa pun — baik di
   riwayat kode maupun catatan percakapan — bahwa pihak perusahaan menyebut atau menyetujui
   bobot 35/30/20/15.
7. JANGAN menulis bahwa keempat iterasi diawali wawancara dengan pengguna. Hanya v0.3 yang
   memiliki bukti keterlibatan langsung pengguna.
8. JANGAN mengarang referensi literatur. Bila dibutuhkan rujukan, berikan kata kunci pencarian
   saja, biarkan peneliti mencari sendiri.

## KETERBATASAN YANG DIKETAHUI (sebut sebagai keterbatasan, jangan diperbaiki)

- Endpoint POST /api/purchase-requests masih mengizinkan peran admin di backend, padahal
  frontend sudah menutup halaman /approval untuk Admin. Ketidaksesuaian penegakan RBAC
  antar-lapisan.
- Token JWT disimpan di localStorage, rentan XSS.
- C4 (Saldo Kas ÷ Total Beban) bukan rasio likuiditas baku akuntansi (Cash Ratio standar
  memakai Liabilitas Lancar), karena sistem tidak mencatat liabilitas lancar secara terpisah.
- C2 dihitung month-over-month, bukan year-over-year, sehingga fluktuatif untuk bisnis
  developer perumahan yang penjualannya musiman.
- Admin hanya dapat mengaktifkan/menonaktifkan pengguna, belum dapat mengubah nama/email/peran.

## PREFERENSI PENULISAN

- Sebut fitur sebagai "Analisis Kinerja Keuangan", BUKAN "Analisis Kinerja SAW". SAW disebut
  sebagai metode yang digunakan DI DALAM penjelasan, bukan sebagai nama fitur.
  Benar: "Halaman Analisis Kinerja Keuangan menerapkan metode SAW..."
  Salah: "Fitur Analisis Kinerja SAW..."
- Bahasa Indonesia baku untuk seluruh isi laporan.
- Bila suatu hal tidak dapat dipastikan, tulis "tidak dapat dipastikan". Jangan menebak.

## DIAGRAM YANG SUDAH TERSEDIA

Di `docs/diagrams/prototipe/` — format PlantUML, hitam-putih, dpi 300:
- v01_struktur_halaman — sitemap v0.1
- v01_arsitektur — arsitektur frontend–backend v0.1
- v02_struktur_data_localstorage — struktur data localStorage v0.2
- v02_alur_laporan — flowchart perhitungan 4 laporan v0.2
- v03_struktur_basis_data — ERD 12 model v0.3
- v03_alur_approval_transaksi — activity diagram beralur peran v0.3
- v03_alur_pengajuan_pembelian — state machine pengajuan v0.3

Diagram lain yang sudah ada di luar folder itu: ERD final (docs/diagrams/erd.png),
activity diagram login (docs/diagrams/activity-diagram-login-autentikasi.puml),
use case diagram (use-case-diagram.html).

Yang BELUM dibuat: Sequence Diagram, Class Diagram.
