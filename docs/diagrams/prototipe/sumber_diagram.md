# Sumber Pembuktian Diagram — Pegangan Sidang

**Dokumen ini TIDAK dimasukkan ke laporan skripsi.** Isinya untuk pegangan pribadi bila penguji menanyakan dasar pembuatan diagram.

Seluruh diagram disusun dari pembacaan riwayat kode pada dua repositori:

| Repositori | Lokasi |
|---|---|
| Frontend (Next.js) | `d:\Pengelolaan-Perusahaan\pengelolaan-perusahaan` |
| Backend (Express.js) | `D:\backend-developer-perumahan` |

Kedua repositori **tidak memiliki tag Git**, hanya satu branch `main`. Commit di bawah adalah commit akhir tiap versi.

---

## Diagram yang Dimasukkan ke Laporan (versi `_laporan`)

### 1. Struktur Halaman Prototipe v0.1
**Berkas:** `v01_struktur_halaman_laporan.puml` / `.png`

| Keterangan | Isi |
|---|---|
| Commit sumber | `74192e6` (frontend) |
| Tanggal commit | 29 April 2026 |
| Pesan commit | "ubah sistem booking jadi pengelolaan keuangan" |

**Berkas kode yang dibaca:**
- `src/app/**/page.tsx` — daftar halaman diambil dari `git ls-tree -r --name-only 74192e6 -- src/app`
- `src/components/Sidebar.tsx` — keterangan peran tiap halaman diambil dari larik menu, baris 46–53
- `src/app/(dashboard)/transactions/page.tsx` — dasar catatan bahwa isi halaman masih data contoh (larik `transactions` ditulis langsung di dalam berkas)

**Perintah verifikasi:**
```
git show 74192e6:src/components/Sidebar.tsx
git ls-tree -r --name-only 74192e6 -- src/app
```

---

### 2. Alur Perhitungan Laporan Keuangan Prototipe v0.2
**Berkas:** `v02_alur_laporan_laporan.puml` / `.png`

| Keterangan | Isi |
|---|---|
| Commit sumber | `d722d48` (frontend) |
| Tanggal commit | 5 Juni 2026 |
| Pesan commit | "update web baru" |

**Berkas kode yang dibaca:**
- `src/lib/accounting.ts` — fungsi `buildReports()`, baris 189–375. Ketujuh langkah pada diagram mengikuti urutan komentar bernomor di dalam fungsi tersebut
- `src/hooks/useAccountingStore.ts` — alur pemuatan data dan pengisian data awal saat penyimpanan masih kosong

**Rumus yang dipakai di diagram, beserta letaknya di kode:**

| Rumus pada diagram | Letak di kode |
|---|---|
| Aset & Beban: debit menambah, kredit mengurangi | `['aset','beban'].includes(dAcc.type) ? 1 : -1` |
| Laba Bersih = Total Pendapatan − Total Beban | `const labaBersih = totalPendapatan - totalBeban` |
| Ekuitas Akhir = Modal Awal + Laba Bersih − Prive | `const ekuitasAkhir = modalAwal + labaBersih - prive` |
| Total Pasiva = Total Kewajiban + Ekuitas Akhir | `const totalPasiva = totalKewajiban + ekuitasAkhir` |
| Neraca seimbang bila selisih < 1 | `isBalanced: selisih < 1` |

**Pengelompokan arus kas** (catatan pada diagram) berasal dari percabangan `Object.values(counterpartMap).forEach(...)`: jenis `pendapatan` dan `beban` masuk Operasional, `aset` bukan kas dengan penanda aset tetap masuk Investasi, `aset` bukan kas tanpa penanda aset tetap masuk Operasional, `kewajiban` dan `modal` masuk Pendanaan. Transaksi yang kedua akunnya berupa kas dilewati (`if (isDebitCash && isCreditCash) return`).

**Perintah verifikasi:**
```
git show d722d48:src/lib/accounting.ts
git show d722d48:src/hooks/useAccountingStore.ts
```

---

### 3. Struktur Data Prototipe v0.2
**Berkas:** `v02_struktur_data_laporan.puml` / `.png`

| Keterangan | Isi |
|---|---|
| Commit sumber | `d722d48` (frontend) |
| Tanggal commit | 5 Juni 2026 |

**Berkas kode yang dibaca:**
- `src/lib/accounting.ts` — `interface Account` (baris 9–18) dan `interface Transaction` (baris 20–27)
- `src/hooks/useAccountingStore.ts` — kunci penyimpanan `prodev_accounts` dan `prodev_transactions`
- `src/services/approval-service.ts` — `interface PurchaseRequest`, kunci `purchaseRequests`, penomoran `purchaseRequestCounter`, fungsi `getNextId()` dan `generateNotaNumber()`

**Padanan nama atribut** (kode → diagram laporan):

| Nama di kode | Nama di diagram |
|---|---|
| `id` | pengenal / nomor pengajuan |
| `code` | kode |
| `type` | jenis |
| `parentId` | induk akun |
| `isCash` | penanda akun kas |
| `isDrawing` | penanda pengambilan pribadi |
| `isFixedAsset?` | penanda aset tetap (opsional) |
| `debitAccountId` / `creditAccountId` | akun debit / akun kredit |
| `amount` | nominal |
| `requester` / `requesterId` | pemohon / pengenal pemohon |
| `department` | bagian |
| `notaNumber` | nomor nota |
| `approvedByManager` / `approvedByManagerAt` | penyetuju Manager dan waktunya |
| `approvedByOwner` / `approvedByOwnerAt` | penyetuju Owner dan waktunya |
| `rejectedBy` / `rejectedAt` / `rejectionReason` | penolak, waktu penolakan, dan alasannya |

**Catatan mengenai atribut "penanda aset tetap":** atribut ini sempat diragukan keberadaannya. Sudah diperiksa ulang — `interface Account` pada commit `d722d48` memang memuat `isFixedAsset?: boolean` (baris 17), ditulis dengan tanda tanya karena bersifat opsional, berbeda dari `isCash` dan `isDrawing` yang wajib. Atribut ini dipakai pada penyusunan Laporan Arus Kas untuk memisahkan aset tetap (masuk kelompok Investasi) dari aset lancar (masuk kelompok Operasional). Atribut yang sama juga sudah ada pada diagram versi teknis.

**Perintah verifikasi:**
```
git show d722d48:src/services/approval-service.ts
git show d722d48:src/lib/accounting.ts
```

---

### 4. Alur Status Pengajuan Pembelian Prototipe v0.3
**Berkas:** `v03_alur_pengajuan_pembelian_laporan.puml` / `.png`

| Keterangan | Isi |
|---|---|
| Commit sumber | `b322238` (backend) |
| Tanggal commit | 29 Juni 2026 |
| Pesan commit | "update backend sistem" |

**Berkas kode yang dibaca:**
- `src/controllers/purchaseRequestController.ts` — fungsi `createPurchaseRequest`, `approvePurchaseRequestManager` (baris 280 dst.), `approvePurchaseRequestOwner` (baris 379 dst.), `rejectPurchaseRequest`
- `src/routes/purchaseRequests.ts` — daftar endpoint
- `prisma/schema.prisma` — model `PurchaseRequest`, nilai `status`

**Dasar tiap transisi pada diagram:**

| Transisi | Bukti di kode |
|---|---|
| Staf mengajukan → Pending | `status String @default("Pending")` pada model `PurchaseRequest` |
| Nomor pengajuan dibuat otomatis | Pola `prCode` berbentuk `PR-TAHUN-NNN` |
| Manager menyetujui → ACC Manager | `if (request.status !== "Pending")` lalu `status: "ACC Manager"` |
| Nomor nota diterbitkan | `const notaNumber = generateNotaNumber()` dijalankan pada langkah yang sama |
| Owner menyetujui akhir → ACC Final | `if (request.status !== "ACC Manager")` lalu `status: "ACC Final"` |
| Penolakan → Tolak | `rejectPurchaseRequest` menyimpan `rejectedBy`, `rejectedAt`, `rejectionReason` |

**Perintah verifikasi:**
```
git show b322238:src/controllers/purchaseRequestController.ts
git show b322238:src/routes/purchaseRequests.ts
```

---

## PEMBARUAN (25 September 2026) — Use Case Digambar Ulang di draw.io

Ketiga use case diagram (v0.1, v0.2, v0.3) **digambar ulang dengan desain yang sama seperti use case final yang sudah disetujui dosen pembimbing**: aktor figur orang, use case elips, elips **Login di sisi kiri**, tanpa kotak batas sistem, garis lurus, dan setiap use case selain Logout memiliki `<<include>>` ke Login.

**Berkas:** `v01_use_case_laporan.drawio` / `.png`, `v02_...`, `v03_...` — PNG 300 DPI, lebar 2480 px (setara A4 portrait).

Berkas `.drawio` dan PNG dihasilkan dari **satu sumber koordinat yang sama**, sehingga tata letak keduanya identik. `.drawio` dapat dibuka dan disunting di draw.io / diagrams.net.

**Versi v0.4 tidak dipakai.** Berkas `v04_use_case_laporan.*` masih ada di folder ini sebagai arsip, tetapi use case final memakai gambar buatan peneliti yang sudah disetujui.

### Perubahan isi dibandingkan versi PlantUML sebelumnya

| Perubahan | Alasan |
|---|---|
| Elips **"Lihat dashboard" dihapus** | Tidak ada pada gambar final |
| Elips **"Generate nomor nota" dihapus** | Tidak ada pada gambar final |
| Elips **"Edit transaksi" dan "Hapus transaksi" dihapus** | Tidak ada pada gambar final |
| Persetujuan pengadaan **digabung menjadi satu elips** "Setujui Pengajuan pengadaan" yang terhubung ke Manager dan Owner | Mengikuti gambar final |
| Laporan Neraca dan Laba Rugi (v0.1) serta empat laporan (v0.2) **digabung menjadi satu elips** "Lihat laporan keuangan" | Mengikuti penamaan gambar final |
| **"Kunci laporan" DITAMBAHKAN ke v0.2** | Hasil pemeriksaan (b) di bawah — fiturnya memang sudah ada di v0.2 |
| Ditambahkan `<<include>>` dari setiap use case ke **Login** | Mengikuti gambar final |

### Daftar use case per versi (definitif)

**v0.1** — aktor: Admin, Marketing, Manager, Owner

| Use case | Aktor |
|---|---|
| Login | Admin, Marketing, Manager, Owner |
| Logout | Admin, Marketing, Manager, Owner |
| Kelola data pengguna | Admin |
| Activity log | Admin, Manager, Owner |
| Lihat transaksi | Admin, Manager, Owner |
| Lihat laporan keuangan | Admin, Manager, Owner |
| Lihat arsip laporan | Admin, Manager, Owner |
| Lihat pemesanan unit | Manager, Owner |
| Setujui pemesanan unit | Manager, Owner |
| Tolak pemesanan unit | Manager, Owner |

> Marketing hanya terhubung ke Login dan Logout — pada `Sidebar.tsx` baris 46 peran itu hanya diberi akses Dashboard, dan "Lihat dashboard" tidak digambar sesuai konvensi gambar final.

**v0.2** — aktor: Admin, Staf, Manager, Owner

| Use case | Aktor |
|---|---|
| Login · Logout | keempat peran |
| Kelola data pengguna | Admin |
| Activity log | Admin, Owner |
| Input transaksi · Lihat transaksi | Manager |
| Kelola master akun | Manager |
| Lihat laporan keuangan · Lihat arsip laporan | Manager, Owner |
| Kunci laporan `<<extend>>` Lihat laporan keuangan | Manager, Owner |
| Membuat pengajuan barang · Melihat status pengajuan | Staf |
| Lihat pengajuan barang · Setujui Pengajuan pengadaan · Tolak pengajuan barang | Manager, Owner |
| Ekspor pengajuan CSV | Staf, Manager, Owner |

**v0.3** — aktor: Admin, Staf, Teller, Manager, Owner

| Use case | Aktor |
|---|---|
| Login · Logout | kelima peran |
| Kelola data pengguna | Admin |
| Activity log | Admin, Owner |
| Input transaksi · Kelola master akun | Teller |
| Lihat transaksi · Lihat jurnal umum · Lihat laporan keuangan · Lihat arsip laporan | Teller, Manager, Owner |
| Setujui transaksi | Manager |
| Tolak transaksi `<<include>>` Masukkan alasan penolakan | Manager |
| Kunci laporan `<<extend>>` Lihat arsip laporan | Manager |
| Membuat pengajuan barang · Melihat status pengajuan | Staf |
| Lihat pengajuan barang · Setujui Pengajuan pengadaan · Tolak pengajuan barang | Manager, Owner |
| Ekspor pengajuan CSV | Staf, Manager, Owner |

### Pemeriksaan (a) — modul booking pada v0.1

**Tidak ada pertentangan. Tabel Fitur dan penelusuran kode sama-sama benar.**

Tabel Fitur menyebut *"halaman pemesanan unit dan manajemen unit properti dihapus"*. Diperiksa pada commit `74192e6`:

| Berkas | Keadaan |
|---|---|
| `src/app/(dashboard)/booking/page.tsx` | **dihapus** |
| `src/app/(dashboard)/units/page.tsx` | **dihapus** |
| `src/app/(dashboard)/approval/page.tsx` | **masih ada**, memuat 82 kemunculan kata *booking* |

Jadi yang dihapus adalah halaman **pemesanan** dan halaman **manajemen unit**, sedangkan **Halaman Approval tetap ada** dan masih menangani persetujuan pemesanan unit (`type Status = "Pending" | "ACC Manager" | "ACC Final" | "Tolak"`, memanggil `/api/bookings`). Tabel Fitur tidak pernah menyatakan Halaman Approval ikut dihapus.

Karena itu diagram v0.1 tetap memuat **Lihat pemesanan unit**, **Setujui pemesanan unit**, dan **Tolak pemesanan unit**. Bila ingin lebih jelas, Tabel Fitur v0.1 butir 4 dapat ditambahi keterangan: *"Halaman Approval tetap dipertahankan dan masih menangani persetujuan pemesanan unit."*

### Pemeriksaan (b) — finalisasi periode laporan pada v0.2

**Tabel Fitur benar; use case v0.2 versi PlantUML saya yang keliru karena tidak memuat Kunci laporan.**

Saya semula hanya memeriksa halaman Arsip Laporan, dan di sana memang tidak ada aksi mengunci. Ternyata fiturnya berada di **halaman laporan**, bukan di halaman arsip:

| Berkas @ `d722d48` | Bukti |
|---|---|
| `src/app/laporan/laba-rugi/page.tsx` baris 15 | `const { getAll, create, finalize } = useFinancialReports();` |
| baris 115 | `const handleFinalize = async () => {` |
| baris 156 | `await finalize(reportIdNum, userIdNum, "Finalisasi otomatis Laporan Laba Rugi")` |
| baris 168 | pesan: *"Laporan Laba Rugi berhasil difinalisasi dan periode transaksi telah dikunci!"* |
| baris 227–228 | tombol **"Finalisasi Laporan"** |
| `src/app/laporan/neraca/page.tsx` | memuat `handleFinalize` yang setara |

Jadi **Kunci laporan sudah ada pada v0.2**, dijalankan dari halaman Laporan Laba Rugi dan Laporan Neraca, dan dapat diakses Manager serta Owner (aturan rute `/laporan` → `manager`, `owner`).

**Satu perbedaan yang disengaja:** pada v0.2, relasi digambar **Kunci laporan `<<extend>>` Lihat laporan keuangan**, bukan ke *Lihat arsip laporan* seperti pada gambar final. Alasannya tombol finalisasi memang berada di halaman laporan, sedangkan halaman arsip pada v0.2 masih berisi data contoh tanpa aksi apa pun. Pada v0.3 barulah aksi mengunci pindah ke halaman arsip, sehingga v0.3 memakai `<<extend>>` ke *Lihat arsip laporan* sesuai gambar final.

**Catatan penting untuk `useFinancialReports` di v0.2:** endpoint yang dipanggil belum tersedia di backend saat itu (backend masih `6adffdf`). Jadi antarmukanya sudah ada, tetapi pemanggilannya belum dapat berhasil sampai backend dibangun pada 6 Juni 2026. Ini konsisten dengan temuan bahwa lapisan penghubung API pada v0.2 dirancang mendahului backend.

### Pemeriksaan tambahan (c) — klaim yang perlu Anda cek ulang di Tabel Fitur v0.3

Tabel Fitur v0.3 butir 3 menyebut transaksi memiliki *"filter, pencarian, pagination, ekspor data"*. **Tidak ditemukan bukti fitur itu pada `src/app/transaksi/page.tsx` commit `dad1bb1`** — satu-satunya kemunculan kata `export` adalah `export default function`, dan `filter` hanya dipakai untuk menyortir daftar akun (baris 24–25). Tidak ada kotak pencarian, penapis status, maupun pagination.

Empat kata itu sebaiknya dipindahkan ke v0.4 atau dihapus dari Tabel Fitur v0.3, kecuali Anda menemukan buktinya di berkas lain. Sisa butir 3 (double-entry, status Pending/Posted/Rejected) **terbukti** ada di v0.3.

### Kesesuaian Tabel Fitur dengan elips diagram

| Versi | Butir Tabel Fitur yang **tidak** menjadi elips | Alasan |
|---|---|---|
| v0.1 | 4 (Booking & Unit dihapus) | Merupakan penghapusan, bukan fitur |
| v0.2 | 7 (Lapisan Penghubung API) | Komponen teknis internal, tidak memiliki aktor |
| v0.3 | 6 (Dashboard per peran) | Elips "Lihat dashboard" tidak ada pada gambar final |
| v0.3 | 9 (Identitas Sistem Bumi Residence) | Penamaan dan logo, bukan interaksi pengguna |
| v0.3 | 8 (Hak Akses Per Peran) | Tergambar sebagai aktor dan garis, bukan sebagai elips tersendiri |

| Versi | Elips yang **tidak** disebut di Tabel Fitur | Alasan |
|---|---|---|
| v0.1 | Lihat / Setujui / Tolak pemesanan unit | Terbukti di kode; lihat pemeriksaan (a) |
| v0.2, v0.3 | Login, Logout, Kelola data pengguna, Activity log | Fitur lama dari v0.1 yang masih ada — sesuai aturan kumulatif |

### Tata letak final (29 September 2026)

Ketiga diagram digambar ulang mengikuti **tata letak gambar use case final yang sudah disetujui dosen pembimbing**. Isi, aktor, dan relasi **tidak diubah sama sekali** — yang berubah hanya penempatan.

Ciri tata letaknya:

1. **Tanpa judul di dalam gambar** dan **tanpa kotak batas sistem**, sama seperti gambar final.
2. **Login di sisi kiri**, seluruh use case lain dalam satu kolom di tengah dengan urutan mengikuti gambar final (Logout paling atas, lalu Activity log, Lihat pengajuan barang, Tolak pengajuan barang, Lihat transaksi, dan seterusnya).
3. **Kelola data pengguna** di kiri atas dekat Admin; **Kunci laporan** dan **Masukkan alasan penolakan** di antara Login dan kolom tengah; **Membuat pengajuan barang** dan **Melihat status pengajuan** di kiri bawah dekat Staf.
4. **Admin dan Staf di kiri; Owner, Manager, dan Teller di kanan.** Pada v0.1, Marketing menempati posisi Staf.
5. **Seluruh garis lurus tanpa titik belok** — asosiasi aktor ke use case berupa garis penuh, `<<include>>` ke Login berupa garis putus-putus.
6. Elips yang belum ada pada suatu versi dihilangkan, dan elips khas versi itu mengisi slot yang kosong. Contoh pada v0.1: **Lihat pemesanan unit** dan **Tolak pemesanan unit** mengisi slot Lihat/Tolak pengajuan barang, dan **Setujui pemesanan unit** mengisi slot Setujui Pengajuan pengadaan.

Hasil pemeriksaan otomatis (uji potong garis terhadap setiap elips dan aktor, jarak bebas 6 satuan):

| Berkas | Simpul | Garis | Garis menyenggol elips lain | Rasio kanvas |
|---|---|---|---|---|
| `v01_use_case_laporan` | 14 | 35 | 4 | 1,15 |
| `v02_use_case_laporan` | 20 | 46 | 13 | 0,82 |
| `v03_use_case_laporan` | 25 | 61 | 23 | 0,68 |

**Empat masalah keterbacaan yang sempat dilaporkan sudah hilang:** garis Logout ke Manager dan Owner tidak lagi melewati Activity log, garis Staf ke Logout tidak lagi melewati Kunci laporan, garis Marketing ke Logout tidak lagi melewati Activity log, dan garis Kunci laporan ke Owner tidak lagi menempel pada Setujui Pengajuan pengadaan. Ketiganya diperbaiki dengan menggeser posisi — jarak Logout ke Activity log diperlebar, dan Staf dinaikkan sejajar area tengah seperti posisi Staf pada gambar final.

**Catatan jujur mengenai sisa senggolan.** Angka pada kolom ketiga tidak nol, dan itu **tidak dapat dinolkan selama garisnya lurus**. Dengan Login di sisi kiri, satu kolom use case di tengah, dan aktor di dua sisi, garis dari aktor ke elips yang letaknya jauh pasti melintasi elips lain — ini keterbatasan geometris, bukan kesalahan penempatan. Gambar final yang sudah disetujui memiliki sifat yang sama.

Pernah dicoba versi dengan jalur siku (setiap aktor memakai garis tegak tersendiri lalu masuk mendatar ke elipsnya) yang berhasil mencapai **nol senggolan**, tetapi tampilannya menyimpang jauh dari gambar final sehingga tidak dipakai. Bila suatu saat ada satu garis tertentu yang dipermasalahkan penguji, memperbaiki garis itu saja dengan satu titik belok jauh lebih mudah daripada mengubah seluruh gaya.

**Cara berkas dibuat.** Tidak tersedia draw.io CLI di komputer ini, sehingga berkas `.drawio` dan PNG dihasilkan dari **satu sumber koordinat yang sama** melalui skrip. Dengan begitu tata letak keduanya identik, dan berkas `.drawio` tetap dapat dibuka serta disunting di diagrams.net.

### Catatan tata letak (versi PlantUML lama, sudah tidak dipakai)

| Berkas | Simpul | Garis | Persilangan garis | Rasio kanvas |
|---|---|---|---|---|
| `v01_use_case_laporan` | 14 | 35 | 70 | 0,97 |
| `v02_use_case_laporan` | 20 | 46 | 52 | 0,78 |
| `v03_use_case_laporan` | 25 | 61 | 126 | 0,71 |

Jumlah persilangan memang tinggi, tetapi itu **konsekuensi langsung dari desain gambar final** yang menempatkan Login di sisi kiri dengan `<<include>>` dari seluruh use case. Gambar final yang sudah disetujui memiliki ciri yang sama. Tata letak dipilih agar kelompok use case berdekatan dengan aktor yang paling banyak memakainya: modul pengadaan di atas dekat Owner, modul transaksi dan master akun di bawah dekat Teller, modul laporan di tengah dekat Manager.

---

### 5. Use Case Diagram Prototipe v0.1
**Berkas:** `v01_use_case_laporan.puml` / `.png` · **Commit:** frontend `74192e6` (29 April 2026), backend `6adffdf` (28 April 2026)

**Aktor:** Admin, Marketing, Manager, Owner — sumber: `src/components/Sidebar.tsx` baris 46–53, dan `src/app/(dashboard)/approval/page.tsx` baris 7 (`type Role = "Admin" | "Marketing" | "Manager" | "Owner"`).

| Use case | Aktor | Bukti di kode |
|---|---|---|
| Login | Admin, Marketing, Manager, Owner | `src/app/(auth)/login/page.tsx`; `src/app/api/auth/login/route.ts` |
| Logout | Admin, Marketing, Manager, Owner | `src/app/(dashboard)/layout.tsx` baris 34–45, tombol baris 119–123 |
| Lihat dashboard | Admin, Marketing, Manager, Owner | `Sidebar.tsx` baris 46 |
| Lihat transaksi | Admin, Manager, Owner | `Sidebar.tsx` baris 47; halaman `(dashboard)/transactions/page.tsx` (isi masih data contoh) |
| Lihat laporan neraca | Admin, Manager, Owner | `Sidebar.tsx` baris 48 |
| Lihat laporan laba rugi | Admin, Manager, Owner | `Sidebar.tsx` baris 49 |
| Lihat arsip laporan | Admin, Manager, Owner | `Sidebar.tsx` baris 50 |
| Activity log | Admin, Manager, Owner | `Sidebar.tsx` baris 53 |
| Kelola data pengguna | Admin | `Sidebar.tsx` baris 52; `users/page.tsx` baris 97 (hapus), 140 (ubah status), 250 (tambah), 323 (ubah) |
| Lihat pemesanan unit | Manager, Owner | `Sidebar.tsx` baris 51; `approval/page.tsx` baris 69–70 (hanya Manager dan Owner) |
| Setujui pemesanan unit | Manager | `approval/page.tsx` baris 120–124 (Manager memproses status `Pending`), baris 113 |
| Setujui akhir pemesanan unit | Owner | `approval/page.tsx` baris 126–128 (Owner memproses status `ACC Manager` menjadi `ACC Final`) |
| Tolak pemesanan unit | Manager, Owner | `approval/page.tsx` baris 90–99 (`nextStatus === "Tolak"`) |

**Catatan:** backend pada commit `6adffdf` **belum memiliki pemeriksaan peran** — `src/routes/users.ts`, `units.ts`, `bookings.ts`, dan `activityLog.ts` hanya memakai `authMiddleware`. Berkas `src/middleware/role.ts` belum ada. Jadi seluruh hubungan aktor–use case pada diagram v0.1 bersumber dari pembatasan di frontend saja.

---

### 6. Use Case Diagram Prototipe v0.2
**Berkas:** `v02_use_case_laporan.puml` / `.png` · **Commit:** frontend `d722d48` (5 Juni 2026), backend tetap `6adffdf`

**Aktor:** Admin, Manager, Owner, Staf — sumber: `src/components/finance-shell.tsx` baris 95–120.

| Use case | Aktor | Bukti di kode |
|---|---|---|
| Login | Admin, Manager, Owner, Staf | `src/app/(auth)/login/page.tsx` |
| Logout | Admin, Manager, Owner, Staf | `finance-shell.tsx` baris 243–247 |
| Lihat dashboard | Admin, Manager, Owner, Staf | `finance-shell.tsx` baris 95 |
| Input transaksi | Manager | `finance-shell.tsx` baris 101 dan aturan rute baris 60 (`/transaksi` → `manager`); `src/app/transaksi/page.tsx` baris 10, 23 (`addTransaction`) |
| Hapus transaksi | Manager | `src/app/transaksi/page.tsx` baris 118 (`deleteTransaction`) |
| Kelola master akun | Manager | `finance-shell.tsx` baris 102 dan aturan rute baris 61; `master-akun/page.tsx` baris 45 (`addAccount`), 100 (`deleteAccount`) |
| Lihat laporan keuangan | Manager, Owner | `finance-shell.tsx` baris 108–111 (Arus Kas, Laba Rugi, Perubahan Modal, Neraca); perhitungan di `src/lib/accounting.ts` |
| Lihat arsip laporan | Manager, Owner | `finance-shell.tsx` baris 112; `laporan/arsip/page.tsx` (isi masih data contoh, belum ada aksi mengunci) |
| Membuat pengajuan barang | Staf | `approval/page.tsx` baris 187 (`createRequest`), tombol baris 294 |
| Melihat status pengajuan | Staf | `approval/page.tsx` baris 36, 46, 53 (`isFieldRole`, tab `myRequests`) |
| Lihat pengajuan barang | Manager, Owner | `finance-shell.tsx` baris 118; `approval/page.tsx` baris 54–55 |
| Setujui pengajuan pengadaan | Manager | `approval/page.tsx` baris 201, 217 |
| Generate nomor nota | — (di-*include* oleh Setujui pengajuan pengadaan) | `approval/page.tsx` baris 201, 217; `src/services/approval-service.ts` `generateNotaNumber()` |
| Setujui akhir pengajuan pengadaan | Owner | `approval/page.tsx` baris 55 (`isOwner`), alur `ACC Manager` → `ACC Final` |
| Tolak pengajuan barang | Manager, Owner | `approval/page.tsx` baris 235–237 |
| Ekspor pengajuan CSV | Staf, Manager, Owner | `approval/page.tsx` baris 112 (`exportToCSV`), tombol baris 430 pada tab riwayat yang dipakai bersama semua peran |
| Activity log | Admin, Owner | `finance-shell.tsx` baris 119 dan aturan rute baris 63 |
| Kelola data pengguna | Admin | `finance-shell.tsx` baris 120 dan aturan rute baris 58 |

**Catatan:** backend **tidak berubah** sepanjang iterasi ini (tetap `6adffdf`), sehingga masih belum ada pemeriksaan peran di sisi peladen. Seluruh pembatasan bersumber dari `ROUTE_ROLES` pada `finance-shell.tsx` baris 58–63 dan penapisan menu baris 95–120. Data akun, transaksi, dan pengajuan disimpan di `localStorage`.

---

### 7. Use Case Diagram Prototipe v0.3
**Berkas:** `v03_use_case_laporan.puml` / `.png` · **Commit:** frontend `dad1bb1` / `bbf58ce` (29 Juni 2026), backend `b322238` (29 Juni 2026)

**Aktor:** Admin, Teller, Manager, Owner, Staf — sumber: `finance-shell.tsx` baris 98–125.

| Use case | Aktor | Bukti di kode (frontend) | Bukti di kode (backend) |
|---|---|---|---|
| Login | semua peran | `(auth)/login/page.tsx` | `routes/auth.ts` baris 8 |
| Logout | semua peran | `finance-shell.tsx` | — |
| Lihat dashboard | semua peran | `finance-shell.tsx` baris 98 | `routes/dashboard.ts` baris 36–38 |
| Input transaksi | Teller | `transaksi/page.tsx` baris 19 (`isTeller`), 63 | `routes/transactions.ts` baris 27 (`roleMiddleware("teller")`) |
| Lihat transaksi | Teller, Manager, Owner | `finance-shell.tsx` baris 104, aturan rute baris 61 | `routes/transactions.ts` baris 21 |
| Hapus transaksi | Teller | `transaksi/page.tsx` baris 141–142 (syarat status `PENDING`, `DRAFT`, `REJECTED`) | `routes/transactions.ts` baris 33 |
| Setujui transaksi | Manager | `transaksi/approval/page.tsx` baris 85–91, tombol baris 313 | `routes/transactions.ts` baris 36 |
| Tolak transaksi | Manager | `transaksi/approval/page.tsx` baris 115–121, tombol baris 304 | `routes/transactions.ts` baris 39 |
| Masukkan alasan penolakan | — (di-*include* oleh Tolak transaksi) | `transaksi/approval/page.tsx` baris 62, 359, 375 (tombol nonaktif bila alasan kosong) | `transactionController.ts` menolak bila `rejectionReason` kosong |
| Lihat jurnal umum | Teller, Manager, Owner | `finance-shell.tsx` baris 105, aturan rute baris 62; `jurnal-umum/page.tsx` baris 87 | `routes/journalEntries.ts` baris 15–18 (hanya baca) |
| Kelola master akun | Teller | `finance-shell.tsx` baris 106, aturan rute baris 63 | `routes/chartOfAccounts.ts` baris 26–28 (`roleMiddleware("teller")`) |
| Lihat laporan keuangan | Teller, Manager, Owner | `finance-shell.tsx` baris 112–116, aturan rute baris 64 | `routes/dashboard.ts` baris 46, 49 |
| Lihat arsip laporan | Teller, Manager, Owner | `finance-shell.tsx` baris 116 | `routes/dashboard.ts` baris 42 |
| Kunci laporan | Manager | `laporan/arsip/page.tsx` baris 157–175 (`handleLockDay`), tombol baris 428–434 "Kunci Hari (EOD)", hanya tampil bila status terbuka | `routes/dashboard.ts` baris 57 (`roleMiddleware("manager")`) |
| Membuat pengajuan barang | Staf | `approval/page.tsx` baris 53 (`isFieldRole`) | `routes/purchaseRequests.ts` baris 26 |
| Melihat status pengajuan | Staf | `approval/page.tsx` baris 36, 46 | `routes/purchaseRequests.ts` baris 20 |
| Lihat pengajuan barang | Manager, Owner | `finance-shell.tsx` baris 122 | `routes/purchaseRequests.ts` baris 20 |
| Setujui pengajuan pengadaan | Manager | `approval/page.tsx` baris 54 (`isManager`) | `routes/purchaseRequests.ts` baris 29 |
| Generate nomor nota | — (di-*include* oleh Setujui pengajuan pengadaan) | — | `purchaseRequestController.ts`: `generateNotaNumber()` dijalankan saat status menjadi `ACC Manager` |
| Setujui akhir pengajuan pengadaan | Owner | `approval/page.tsx` baris 55 (`isOwner`) | `routes/purchaseRequests.ts` baris 32 |
| Tolak pengajuan barang | Manager, Owner | `approval/page.tsx` | `routes/purchaseRequests.ts` baris 35 |
| Ekspor pengajuan CSV | Staf, Manager, Owner | `approval/page.tsx` baris 112, tombol baris 436 pada tab riwayat bersama | — (diolah di sisi peramban) |
| Activity log | Admin, Owner | `finance-shell.tsx` baris 124, aturan rute baris 66 | `routes/activityLog.ts` baris 17–22 |
| Kelola data pengguna | Admin | `finance-shell.tsx` baris 125, aturan rute baris 59 | `routes/users.ts` baris 9–13 |

**Relasi yang digambar dan buktinya:**

| Relasi | Bukti |
|---|---|
| Setujui pengajuan pengadaan `<<include>>` Generate nomor nota | Penerbitan nomor nota berjalan otomatis di dalam proses persetujuan Manager, tidak dapat dijalankan sendiri |
| Tolak transaksi `<<include>>` Masukkan alasan penolakan | `rejectionReason` wajib diisi; tombol nonaktif bila kosong, dan peladen menolak permintaan tanpa alasan |
| Hapus transaksi `<<extend>>` Lihat transaksi | Tombol hapus hanya muncul di dalam daftar transaksi, dan hanya untuk status `DRAFT`, `PENDING`, atau `REJECTED` |
| Kunci laporan `<<extend>>` Lihat arsip laporan | Tombol mengunci hanya muncul di dalam halaman arsip, dan hanya untuk hari yang statusnya masih terbuka |

**Dua ketidaksesuaian frontend–backend pada v0.3 (perlu diketahui, jangan diklaim sebagai rancangan):**

1. **Tombol "Kunci Hari (EOD)"** di `laporan/arsip/page.tsx` baris 428–434 **tidak diberi syarat peran**, sehingga Teller dan Owner yang membuka halaman arsip ikut melihat tombol tersebut. Namun endpoint `POST /api/dashboard/reports/eod/trigger` dibatasi `roleMiddleware("manager")`, sehingga peran selain Manager akan menerima HTTP 403. Pada diagram, use case ini dihubungkan ke **Manager** karena itulah kewenangan yang berlaku di peladen.
2. **`master-akun/page.tsx` baris 20–21** menuliskan `isCreatable`/`isDeletable` untuk peran `admin` **atau** `teller`, padahal aturan rute `/master-akun` hanya mengizinkan `teller` dan peladen juga hanya `teller`. Jadi Admin tidak pernah dapat mencapai halaman tersebut; sisa kode untuk `admin` tidak terpakai. Pada diagram, use case ini dihubungkan ke **Teller** saja.

---

### 8. Use Case Diagram Sistem Versi Final
**Berkas:** `v04_use_case_laporan.puml` / `.png` · **Sumber:** kode versi terkini (*working tree*), termasuk revisi pemindahan hak kelola Master Akun ke Manager yang belum di-commit.

**Aktor:** Admin, Staf, Teller, Manager, Owner — sumber: `src/components/finance-shell.tsx` baris 98.

| Use case | Aktor | Bukti di kode (frontend) | Bukti di kode (backend) |
|---|---|---|---|
| Login | semua peran | `(auth)/login/page.tsx` | `routes/auth.ts` baris 8 |
| Logout | semua peran | `finance-shell.tsx` | — |
| Lihat dashboard | semua peran | `finance-shell.tsx` baris 98 | `routes/dashboard.ts` baris 36–38 |
| Kelola data pengguna | Admin | `finance-shell.tsx` baris 59, 126 | `routes/users.ts` baris 9–13 (`roleMiddleware("admin")`) |
| Activity log | Admin, Owner | `finance-shell.tsx` baris 66, 125 | `routes/activityLog.ts` baris 17–22 |
| Input transaksi | Teller | `transaksi/page.tsx` baris 25 (`isTeller`), 116 | `routes/transactions.ts` baris 27 |
| Lihat transaksi | Teller, Manager, Owner | `finance-shell.tsx` baris 61, 104 | `routes/transactions.ts` baris 21 |
| Edit transaksi | Teller | `transaksi/page.tsx` baris 14 (`updateTransaction`), 86, 131, 163, 180 (`onEdit`) | `routes/transactions.ts` baris 30 |
| Hapus transaksi | Teller | `transaksi/page.tsx` baris 164, 181 (`onDelete`) | `routes/transactions.ts` baris 33 |
| Setujui transaksi | Manager | `finance-shell.tsx` baris 60, 124; `transaksi/approval/page.tsx` | `routes/transactions.ts` baris 36 |
| Tolak transaksi | Manager | `transaksi/approval/page.tsx` | `routes/transactions.ts` baris 39 |
| Masukkan alasan penolakan | — (di-*include* oleh Tolak transaksi) | `transaksi/approval/page.tsx` (tombol nonaktif bila alasan kosong) | `transactionController.ts` menolak bila `rejectionReason` kosong |
| Lihat jurnal umum | Teller, Manager, Owner | `finance-shell.tsx` baris 62, 105 | `routes/journalEntries.ts` baris 15–18 |
| Kelola master akun | **Manager** | `finance-shell.tsx` baris 63, 106; `master-akun/page.tsx` baris 20–21 | `routes/chartOfAccounts.ts` baris 27–29 (`roleMiddleware("manager")`) |
| Lihat laporan keuangan | Teller, Manager, Owner | `finance-shell.tsx` baris 64, 112–115 | `routes/dashboard.ts` baris 46, 49 |
| Lihat arsip laporan | Teller, Manager, Owner | `finance-shell.tsx` baris 116 | `routes/dashboard.ts` baris 42 |
| Kunci laporan | Manager | `laporan/arsip/page.tsx` baris 161 (`handleLockDay`), tombol baris 467–473 "Kunci & Arsipkan" | `routes/dashboard.ts` baris 57 (`roleMiddleware("manager")`) |
| Lihat analisis kinerja keuangan | Manager, Owner | `finance-shell.tsx` baris 117; `laporan/analisis-kinerja/page.tsx` | `routes/spk.ts` baris 10 (`roleMiddleware("manager", "owner")`) |
| Membuat pengajuan barang | Staf | `finance-shell.tsx` baris 65, 123; `(dashboard)/approval/page.tsx` baris 60 (`isFieldRole`) | `routes/purchaseRequests.ts` baris 26 (`roleMiddleware("staf")`) |
| Melihat status pengajuan | Staf | `(dashboard)/approval/page.tsx` tab `myRequests` | `routes/purchaseRequests.ts` baris 20 |
| Hapus pengajuan barang | Staf | `(dashboard)/approval/page.tsx` baris 255 (`handleDelete`), 434 (`req.status === "Pending"`) | `routes/purchaseRequests.ts` baris 38 (`roleMiddleware("staf")`) |
| Lihat pengajuan barang | Manager, Owner | `finance-shell.tsx` baris 123 | `routes/purchaseRequests.ts` baris 20 |
| Setujui pengajuan pengadaan | Manager | `(dashboard)/approval/page.tsx` (`isManager`) | `routes/purchaseRequests.ts` baris 29 (`roleMiddleware("manager")`) |
| Generate nomor nota | — (di-*include* oleh Setujui pengajuan pengadaan) | — | `purchaseRequestController.ts` — `generateNotaNumber()` saat status menjadi `ACC Manager` |
| Setujui akhir pengajuan pengadaan | Owner | `(dashboard)/approval/page.tsx` (`isOwner`) | `routes/purchaseRequests.ts` baris 32 (`roleMiddleware("owner")`) |
| Tolak pengajuan barang | Manager, Owner | `(dashboard)/approval/page.tsx` | `routes/purchaseRequests.ts` baris 35 |
| Ekspor pengajuan CSV | Staf, Manager, Owner | `(dashboard)/approval/page.tsx` (`exportToCSV`, tab riwayat bersama) | — (diolah di peramban) |

**Relasi yang digambar:**

| Relasi | Bukti |
|---|---|
| Setujui pengajuan pengadaan `<<include>>` Generate nomor nota | Nomor nota terbit otomatis di dalam proses persetujuan Manager |
| Tolak transaksi `<<include>>` Masukkan alasan penolakan | `rejectionReason` wajib diisi di antarmuka dan di peladen |
| Edit transaksi `<<extend>>` Lihat transaksi | Tombol ubah hanya muncul di dalam daftar transaksi, untuk status DRAFT, PENDING, atau REJECTED |
| Hapus transaksi `<<extend>>` Lihat transaksi | Tombol hapus muncul pada kelompok status yang sama |
| Kunci laporan `<<extend>>` Lihat arsip laporan | Tombol hanya muncul untuk hari yang statusnya masih terbuka |
| Hapus pengajuan barang `<<extend>>` Melihat status pengajuan | Tombol hanya aktif bila `req.status === "Pending"` dan berada di daftar pengajuan milik Staf sendiri |

#### Mengapa Teller TIDAK diberi use case terkait daftar akun

Diperiksa sesuai permintaan. **Teller tidak dapat membuka halaman Master Akun** pada versi terkini:

- `finance-shell.tsx` baris 63 — aturan rute `/master-akun` hanya `["manager"]`, sehingga Teller akan ditolak bila mengakses alamatnya langsung
- `finance-shell.tsx` baris 106 — menu Master Akun hanya tampil untuk `["Manager"]`
- `master-akun/page.tsx` baris 20–21 — tombol tambah dan hapus hanya untuk `role === "manager"`

Teller memang masih memerlukan daftar akun, tetapi **hanya sebagai pilihan debit dan kredit di dalam formulir input transaksi** (`GET /api/chart-of-accounts` pada `routes/chartOfAccounts.ts` baris 21–24 masih mengizinkan `teller`). Karena itu **tidak dibuat use case tersendiri** — pemakaian daftar akun tersebut sudah tercakup di dalam use case **Input transaksi** dan **Edit transaksi**.

#### Pemeriksaan tombol "Kunci Hari (EOD)" pada kode terkini

**Masalah yang ditemukan di v0.3 masih terjadi.** Pada `src/app/laporan/arsip/page.tsx` baris 467–473, tombol (kini berlabel **"Kunci & Arsipkan"**, sebelumnya "Kunci Hari (EOD)") hanya diberi syarat `isPast`, **tanpa syarat peran sama sekali**:

```
{isPast && (
  <button onClick={() => handleLockDay(archive.date)} ...>
    Kunci &amp; Arsipkan
  </button>
)}
```

Karena halaman `/laporan` terbuka untuk `teller`, `manager`, dan `owner` (aturan rute baris 64), **Teller dan Owner tetap melihat tombol tersebut**. Namun endpoint `POST /api/dashboard/reports/eod/trigger` dibatasi `roleMiddleware("manager")` (`routes/dashboard.ts` baris 57), sehingga bila ditekan oleh Teller atau Owner akan menghasilkan **HTTP 403**.

Pada diagram, "Kunci laporan" dihubungkan ke **Manager** saja, karena itulah kewenangan yang benar-benar berlaku.

> **Ini keterbatasan yang MASIH SAH untuk ditulis di Bab V** — berbeda dengan persoalan hak akses pengadaan yang sudah diperbaiki. Contoh kalimat:
>
> "Pada halaman Arsip Laporan, tombol penguncian laporan masih ditampilkan kepada seluruh peran yang dapat membuka halaman tersebut, meskipun peladen hanya mengizinkan Manager untuk menjalankannya. Penyeragaman tampilan tombol dengan hak akses di peladen disarankan untuk pengembangan selanjutnya."

#### Pemetaan Elips Diagram dengan Tabel Use Case Description

Judul dan aktor kesembilan tabel diambil dari laporan. **Seluruh sembilan tabel memiliki elips yang bersesuaian di diagram, dan tidak ada satu pun perbedaan aktor.**

| Kode | Judul tabel Use Case Description | Aktor pada laporan | Elips yang tercakup | Aktor pada diagram | Status |
|---|---|---|---|---|---|
| UC-01 | Login | seluruh peran | Login | Admin, Staf, Teller, Manager, Owner | **cocok** |
| UC-02 | Mengelola Data Pengguna | Admin | Kelola data pengguna | Admin | **cocok** |
| UC-03 | Mengelola Master Akun | Manager | Kelola master akun | Manager | **cocok** |
| UC-04 | Menginput Transaksi | Teller | Input transaksi | Teller | **cocok** |
| UC-05 | Menyetujui atau Menolak Transaksi | Manager | Setujui transaksi · Tolak transaksi · Masukkan alasan penolakan *(include)* | Manager | **cocok** |
| UC-06 | Mengajukan Pengadaan Barang | Staf | Membuat pengajuan barang | Staf | **cocok** |
| UC-07 | Memproses Persetujuan Pengadaan Barang | Manager, Owner | Setujui pengajuan pengadaan *(Manager)* · Setujui akhir pengajuan pengadaan *(Owner)* · Tolak pengajuan barang · Generate nomor nota *(include)* | Manager, Owner | **cocok** |
| UC-08 | Melihat Laporan Keuangan | Teller, Manager, Owner | Lihat laporan keuangan | Teller, Manager, Owner | **cocok** |
| UC-09 | Melihat Analisis Kinerja Keuangan | Manager, Owner | Lihat analisis kinerja keuangan | Manager, Owner | **cocok** |

**Tidak ada UC yang kehilangan elips, dan tidak ada aktor yang berbeda.** UC-03 sudah memakai Manager, sesuai revisi pemindahan hak kelola Master Akun.

#### Elips yang belum memiliki tabel Use Case Description

Dari 27 elips, **14 sudah tercakup** oleh kesembilan tabel di atas. **13 sisanya belum punya tabel sendiri.** Ini wajar — tabel deskripsi umumnya hanya dibuat untuk use case utama — tetapi perlu Anda ketahui supaya siap bila ditanya.

| No | Elips | Aktor | Catatan |
|---|---|---|---|
| 2 | Logout | semua peran | Umumnya cukup dibahas sebagai alur alternatif di dalam UC-01 |
| 3 | Lihat dashboard | semua peran | Halaman pembuka setiap peran |
| 5 | Activity log | Admin, Owner | **Paling menonjol** — fitur tersendiri dengan dua peran, tetapi tidak punya tabel |
| 7 | Lihat transaksi | Teller, Manager, Owner | Menjadi dasar bagi Edit dan Hapus transaksi |
| 8 | Edit transaksi | Teller | Lihat catatan di bawah |
| 9 | Hapus transaksi | Teller | Lihat catatan di bawah |
| 13 | Lihat jurnal umum | Teller, Manager, Owner | Hanya baca |
| 16 | Lihat arsip laporan | Teller, Manager, Owner | Dapat dianggap bagian dari UC-08 |
| 17 | Kunci laporan | **Manager** | Lihat catatan di bawah |
| 20 | Melihat status pengajuan | Staf | Dapat dianggap bagian dari UC-06 |
| 21 | Hapus pengajuan barang | Staf | Lihat catatan di bawah |
| 22 | Lihat pengajuan barang | Manager, Owner | Dapat dianggap bagian dari UC-07 |
| 27 | Ekspor pengajuan CSV | Staf, Manager, Owner | Fungsi tambahan pada halaman pengadaan |

#### Tiga hal yang perlu diputuskan sebelum sidang

**1. Judul UC-04 tidak mencakup Edit dan Hapus transaksi.**
Judulnya "Menginput Transaksi", sedangkan Teller juga dapat mengubah dan menghapus transaksi berstatus DRAFT, PENDING, atau REJECTED. Dua pilihan: tuliskan keduanya sebagai **alur alternatif** di dalam tabel UC-04, atau ubah judulnya menjadi "Mengelola Transaksi". Bila dibiarkan apa adanya, penguji dapat menanyakan mengapa kemampuan mengubah transaksi tidak terdokumentasi.

**2. Judul UC-06 tidak mencakup Hapus pengajuan barang.**
Persoalan yang sama. Judulnya "Mengajukan Pengadaan Barang", sedangkan Staf juga dapat menghapus pengajuannya sendiri yang masih berstatus Pending. Sebaiknya ditulis sebagai alur alternatif di dalam UC-06.

**3. Kunci laporan berbeda aktor dengan UC-08.**
UC-08 "Melihat Laporan Keuangan" beraktor Teller, Manager, dan Owner, sedangkan **Kunci laporan hanya Manager**. Bila Kunci laporan dimasukkan ke dalam UC-08, bagian aktor pada tabel itu menjadi keliru. Sebaiknya Kunci laporan **tidak digabungkan** ke UC-08, melainkan disebut terpisah — atau bila ingin dibahas di sana, aktornya ditegaskan berbeda.

Satu catatan tambahan: **Activity log** (nomor 5) adalah satu-satunya fitur tingkat menu yang sama sekali tidak tersentuh kesembilan tabel. Bila ada ruang untuk menambah satu tabel, itulah calon paling kuat.

---

## Perbandingan Antarversi

### v0.1 → v0.2

| Perubahan | Rincian |
|---|---|
| Aktor dihapus | **Marketing** |
| Aktor ditambah | **Staf** |
| Use case dihapus | Lihat pemesanan unit, Setujui pemesanan unit, Setujui akhir pemesanan unit, Tolak pemesanan unit, Lihat laporan neraca dan Lihat laporan laba rugi (sebagai halaman terpisah) |
| Use case ditambah | Input transaksi, Hapus transaksi, Kelola master akun, Lihat laporan keuangan (menggabungkan empat laporan), Membuat pengajuan barang, Melihat status pengajuan, Lihat pengajuan barang, Setujui pengajuan pengadaan, Setujui akhir pengajuan pengadaan, Tolak pengajuan barang, Generate nomor nota, Ekspor pengajuan CSV |
| Use case berubah pemilik | Lihat transaksi (Admin, Manager, Owner) menjadi Input/Hapus transaksi (Manager); Activity log dari Admin, Manager, Owner menjadi Admin dan Owner; laporan dari Admin, Manager, Owner menjadi Manager dan Owner |
| Relasi ditambah | Setujui pengajuan pengadaan `<<include>>` Generate nomor nota |

Perubahan terbesar: **objek persetujuan berpindah dari pemesanan unit rumah ke pengajuan pembelian barang**, sedangkan pola bertingkatnya tetap sama.

### v0.2 → v0.3

| Perubahan | Rincian |
|---|---|
| Aktor ditambah | **Teller** |
| Aktor dihapus | — |
| Use case ditambah | Lihat transaksi, Setujui transaksi, Tolak transaksi, Masukkan alasan penolakan, Lihat jurnal umum, Kunci laporan |
| Use case dihapus | — |
| Use case berubah pemilik | Input transaksi dan Hapus transaksi berpindah dari **Manager** ke **Teller**; Kelola master akun berpindah dari **Manager** ke **Teller**; Lihat laporan keuangan dan Lihat arsip laporan bertambah aktor **Teller** |
| Relasi ditambah | Tolak transaksi `<<include>>` Masukkan alasan penolakan; Hapus transaksi `<<extend>>` Lihat transaksi; Kunci laporan `<<extend>>` Lihat arsip laporan |

Perubahan terbesar: **pemisahan tugas pencatatan dan persetujuan**. Manager berhenti menginput transaksi dan beralih menjadi pemberi persetujuan.

### v0.3 → versi final

| Perubahan | Rincian |
|---|---|
| Aktor | Tidak berubah, tetap lima peran |
| Use case ditambah | **Analisis Kinerja Keuangan** (Manager, Owner); **Edit transaksi** (Teller); **Hapus pengajuan barang** (Staf) |
| Use case berubah pemilik | **Kelola master akun** berpindah dari **Teller** ke **Manager** (revisi September 2026) |

Ketiga penambahan itu memang belum ada di v0.3: `spkController.ts` dan halaman `analisis-kinerja` baru muncul pada `45e6acb`/`88a5be0` (7 Juli 2026); `deleteRequest` pada halaman pengadaan baru muncul pada `88a5be0`; dan kemampuan Teller mengubah transaksi (`updateTransaction`, `editingId`) juga baru muncul pada `88a5be0`/`eef582a`.

---

## Pemeriksaan Gambar Use Case Final terhadap Kode Terkini

Diperiksa terhadap kode pada *working tree* (termasuk revisi September 2026 yang belum di-commit). **Gambar final tidak diubah**, hanya dilaporkan.

### Temuan pasti

**1. Kelola master akun masih digambarkan milik Teller, padahal sudah dipindahkan ke Manager.**

Ini sudah tidak sesuai dengan kode yang berjalan sekarang:

| Berkas | Kondisi sekarang |
|---|---|
| `src/components/finance-shell.tsx` baris 63 | `{ prefix: "/master-akun", allowed: ["manager"] }` |
| `src/components/finance-shell.tsx` baris 106 | menu Master Akun → `roles: ["Manager"]` |
| `src/app/master-akun/page.tsx` baris 20–21 | `isCreatable`/`isDeletable` → `role === "manager"` |
| `src/routes/chartOfAccounts.ts` baris 27–29 | `POST`, `PUT`, `DELETE` → `roleMiddleware("manager")` |

Perlu diperhatikan: **hak baca tidak ikut pindah.** `GET` pada `chartOfAccounts.ts` baris 21–24 tetap mengizinkan `teller`, `manager`, dan `owner`, karena formulir input transaksi membutuhkan daftar akun untuk pilihan debit dan kredit. Jadi bila gambar final diperbaiki, garis Teller ke "Kelola master akun" harus **dihapus** dan digantikan garis dari Manager — bukan diartikan bahwa Teller kehilangan seluruh akses akun.

### Temuan yang perlu Anda cek sendiri pada gambar

Pembacaan gambar yang dilampirkan terbatas karena resolusinya, jadi tiga hal berikut **belum dapat dipastikan** dan sebaiknya Anda periksa langsung pada berkas sumber gambar final:

1. **"Edit transaksi" (Teller)** — ada di kode sekarang (`src/app/transaksi/page.tsx` baris 14, 86, 131: `updateTransaction`, `editingId`), tetapi tidak terbaca pada gambar. Menurut daftar use case final Anda, relasinya `<<extend>>` ke "Lihat transaksi" dengan kondisi DRAFT atau REJECTED.
2. **"Hapus pengajuan barang" (Staf)** — ada di kode sekarang (`src/app/(dashboard)/approval/page.tsx` baris 25, 255, 268: `deleteRequest`, `handleDelete`), tetapi tidak terbaca pada gambar. Catatan kondisi **"[status PENDING dan milik sendiri]"** memang terlihat di bagian bawah gambar, dan menurut daftar final Anda catatan itu milik use case ini — perlu dipastikan garis `<<extend>>`-nya benar-benar tergambar.
3. **"Generate nomor nota"** — menurut daftar use case final Anda, ini di-`<<include>>` oleh "Setujui Pengajuan (ACC L1 - Manager)", tetapi tidak terbaca pada gambar.

### Catatan bentuk, bukan kesalahan

Gambar final memakai **satu** use case "Setujui Pengajuan pengadaan", sedangkan kode memiliki **dua tingkat persetujuan yang terpisah**: `POST /:id/approve-manager` (Manager, menerbitkan nomor nota) dan `POST /:id/approve-owner` (Owner, persetujuan akhir). Bila penguji menanyakan alur bertingkat, satu elips itu perlu Anda jelaskan secara lisan, atau dipecah menjadi dua use case seperti pada diagram v0.2 dan v0.3 yang saya buat ("Setujui pengajuan pengadaan" dan "Setujui akhir pengajuan pengadaan").

### Perbedaan yang disengaja antara diagram v0.1–v0.3 dan gambar final

Diagram v0.1–v0.3 memuat use case **"Lihat dashboard"** yang tidak ada pada gambar final. Ini disengaja: pada v0.1, peran **Marketing hanya memiliki akses ke dashboard** (`Sidebar.tsx` baris 46), sehingga tanpa use case tersebut aktor Marketing akan tampak tidak memiliki fungsi sama sekali. Bila ditanya, jawabannya: dashboard memang halaman nyata pada setiap versi, dan pada versi final tidak digambar karena dianggap bawaan.

Relasi `<<include>>` dari setiap use case ke "Login" juga sengaja tidak digambar pada ketiga diagram ini, digantikan catatan "Seluruh use case mensyaratkan pengguna telah login", agar garis tidak menumpuk.

---

## Diagram Versi Teknis (arsip, tidak dimasukkan ke laporan)

Berkas asli tetap disimpan sebagai bukti penelusuran. Isinya sama persis, hanya masih memuat nama fungsi, nama kunci penyimpanan, path endpoint, dan hash commit pada judul.

| Berkas asli | Padanan versi laporan |
|---|---|
| `v01_struktur_halaman.puml` | `v01_struktur_halaman_laporan.puml` |
| `v02_alur_laporan.puml` | `v02_alur_laporan_laporan.puml` |
| `v02_struktur_data_localstorage.puml` | `v02_struktur_data_laporan.puml` |
| `v03_alur_pengajuan_pembelian.puml` | `v03_alur_pengajuan_pembelian_laporan.puml` |

Tiga diagram berikut **belum dibuatkan versi laporan** (masih versi teknis):

| Berkas | Commit sumber | Berkas kode |
|---|---|---|
| `v01_arsitektur.puml` | `74192e6` (frontend), `6adffdf` (backend) | `src/app/api/**/route.ts`, `src/contexts/AuthContext.tsx`, `src/index.ts`, `src/routes/*.ts`, `prisma/schema.prisma` |
| `v03_struktur_basis_data.puml` | `b322238` (backend) | `prisma/schema.prisma` |
| `v03_alur_approval_transaksi.puml` | `b322238` (backend) | `src/controllers/transactionController.ts`, `src/routes/transactions.ts`, `src/middleware/role.ts` |

---

## Catatan Hak Akses Pengajuan Pembelian pada v0.3 — SUDAH DIPERBAIKI di Versi Final

> ## ⚠️ KOREKSI PENTING
>
> Bagian ini semula ditulis sebagai **keterbatasan penelitian** yang perlu dicantumkan di Bab V. **Itu keliru.**
>
> Pemeriksaan ulang terhadap kode versi terkini menunjukkan kelonggaran hak akses ini **sudah diperbaiki pada commit `45e6acb` (7 Juli 2026)**, yaitu di dalam iterasi v0.4. Jadi masalah ini **hanya berlaku untuk prototipe v0.3**, bukan untuk sistem yang diserahkan.
>
> **JANGAN menulis ini sebagai keterbatasan sistem final.** Bila tetap ditulis, Anda akan melaporkan cacat yang sebenarnya tidak ada pada sistem yang diuji, dan penguji yang membuka kodenya akan menemukan ketidakcocokan.
>
> **Cara memakai temuan ini yang benar:** jadikan bagian dari **cerita perbaikan antar-iterasi** di Bab IV — bukti nyata bahwa iterasi v0.4 tidak hanya menambah fitur SAW, tetapi juga memperketat penegakan hak akses.

### Perbandingan v0.3 dengan versi final

Berkas: `src/routes/purchaseRequests.ts`

| Tindakan | v0.3 (`b322238`) | Versi final (`45e6acb` dan seterusnya) |
|---|---|---|
| Lihat daftar pengajuan | tanpa pembatasan peran | `roleMiddleware("staf", "manager", "owner")` |
| Lihat detail pengajuan | tanpa pembatasan peran | `roleMiddleware("staf", "manager", "owner")` |
| Mengajukan pembelian | `staf`, `teller`, `admin`, `manager`, `owner` | `roleMiddleware("staf")` |
| Menyetujui tingkat 1 | `manager`, `owner`, `admin` | `roleMiddleware("manager")` |
| Menyetujui akhir | `owner`, `admin` | `roleMiddleware("owner")` |
| Menolak pengajuan | `manager`, `owner`, `admin` | `roleMiddleware("manager", "owner")` |
| Menghapus pengajuan | tanpa pembatasan peran di route (diperiksa di controller) | `roleMiddleware("staf")` |

Pada versi final, hak akses modul pengadaan **sudah persis sama dengan rancangan**: hanya Staf yang mengajukan dan menghapus, hanya Manager yang menyetujui tingkat pertama, dan hanya Owner yang menyetujui akhir. Peran `admin` dicabut seluruhnya dari modul ini, sesuai keputusan "Admin tidak mengajukan barang".

**Kalimat yang dapat dipakai di Bab IV (iterasi v0.4):**

> "Selain penambahan fitur analisis kinerja keuangan, iterasi v0.4 juga memperketat penegakan hak akses pada modul pengajuan pembelian. Pada v0.3 sebagian endpoint masih mengizinkan peran di luar rancangan, sedangkan pada versi final setiap endpoint telah dibatasi sesuai peran yang dirancang."

### Rincian keadaan pada v0.3 (untuk keperluan penjelasan iterasi)

Hak akses pengajuan pembelian yang diterapkan di **backend lebih longgar** daripada rancangan hak akses yang dinyatakan di laporan dan yang diterapkan di **frontend**.

| Tindakan | Rancangan di laporan | Penerapan di frontend | Penerapan di backend |
|---|---|---|---|
| Mengajukan pembelian | Staf | `/approval` dibuka untuk `staf`, `manager`, `owner` — Admin dan Teller **tertutup** | `POST /api/purchase-requests` mengizinkan `staf`, `teller`, `admin`, `manager`, `owner` |
| Menyetujui tingkat 1 | Manager | Tombol hanya tampil bagi Manager | `POST /:id/approve-manager` mengizinkan `manager`, `owner`, `admin` |
| Menyetujui akhir | Owner / Direktur | Tombol hanya tampil bagi Owner | `POST /:id/approve-owner` mengizinkan `owner`, `admin` |
| Melihat pengajuan | Staf hanya melihat miliknya sendiri | Menu dibatasi per peran | `GET /` dan `GET /:id` terbuka bagi **semua pengguna yang sudah masuk**, tanpa pembatasan peran |

**Bukti:** `src/routes/purchaseRequests.ts` @ `b322238`, baris 17–38.

```
router.use(authMiddleware);   // seluruh endpoint wajib sudah masuk

router.get("/", getAllPurchaseRequests);        // tanpa roleMiddleware
router.get("/:id", getPurchaseRequestById);     // tanpa roleMiddleware
router.post("/", roleMiddleware("staf", "teller", "admin", "manager", "owner"), createPurchaseRequest);
router.post("/:id/approve-manager", roleMiddleware("manager", "owner", "admin"), approvePurchaseRequestManager);
router.post("/:id/approve-owner", roleMiddleware("owner", "admin"), approvePurchaseRequestOwner);
router.post("/:id/reject", roleMiddleware("manager", "owner", "admin"), rejectPurchaseRequest);
router.delete("/:id", deletePurchaseRequest);   // tanpa roleMiddleware, tetapi diperiksa di dalam controller
```

**Catatan penting mengenai penghapusan (jangan sampai salah sebut):** endpoint `DELETE /:id` memang tidak memakai `roleMiddleware`, **tetapi pembatasannya ada di dalam controller**. Fungsi `deletePurchaseRequest` (baris 576 dst.) memeriksa bahwa penghapus haruslah pemohon pengajuan itu sendiri (`request.requesterId === userId`) atau berperan `admin`; selain itu permintaan ditolak. Jadi penghapusan **sudah terbatas**, hanya saja pemeriksaannya diletakkan di controller, bukan di berkas route.

### Akibatnya

Menu pengajuan pembelian memang tidak muncul bagi peran yang tidak berhak, sehingga **dalam pemakaian normal lewat antarmuka, alur persetujuan berjalan sesuai rancangan**. Namun bila endpoint dipanggil langsung tanpa melalui antarmuka, peran di luar rancangan masih dapat mengajukan maupun menyetujui.

Perlu dicatat bahwa modul pengajuan pembelian adalah **satu-satunya modul dengan kelonggaran seperti ini**. Modul transaksi sudah ketat: input dibatasi `roleMiddleware("teller")` dan persetujuan dibatasi `roleMiddleware("manager")`, keduanya tanpa peran tambahan.

### Bila Penguji Bertanya

- **"Apakah hak aksesnya sudah benar?"** → Sudah. Pada versi yang diserahkan, seluruh endpoint pengadaan dibatasi sesuai rancangan. Kelonggaran yang sempat ada hanya terjadi pada prototipe v0.3 dan diperbaiki pada iterasi berikutnya.
- **"Bagaimana cara membuktikan perbaikannya?"** → Bandingkan `src/routes/purchaseRequests.ts` pada commit `b322238` dengan commit `45e6acb`.

---

## Perangkat yang Dipakai Membuat Diagram

- PlantUML versi 1.2025.4
- Java Runtime 22.0.2
- Graphviz 2.44.1 (bawaan PlantUML)
- Render PNG dengan `skinparam dpi 300`
