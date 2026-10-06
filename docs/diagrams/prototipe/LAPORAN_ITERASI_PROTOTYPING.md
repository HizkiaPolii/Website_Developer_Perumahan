# Rekonstruksi Iterasi Prototyping (v0.1 – v0.4)
### Berdasarkan Riwayat Kode Sumber

**Sistem:** Bumi Residence Housing Finance System
**Disusun untuk:** Bab IV Skripsi — Hizkia Polii (220211060081)
**Metode penelusuran:** perintah baca Git saja (`git log`, `git ls-tree`, `git show <commit>:<path>`, `git diff`). Tidak ada berkas proyek yang diubah, tidak ada `checkout`, `reset`, maupun perpindahan branch.

---

## Catatan Awal: Dua Repositori Terpisah

Sistem ini terdiri atas **dua repositori Git yang berdiri sendiri**, sehingga setiap versi prototipe harus dipetakan ke **sepasang commit**:

| Repositori | Lokasi | Jumlah commit |
|---|---|---|
| Frontend (Next.js) | `d:\Pengelolaan-Perusahaan\pengelolaan-perusahaan` | 12 commit |
| Backend (Express.js) | `D:\backend-developer-perumahan` | 6 commit |

**Kedua repositori tidak memiliki tag Git sama sekali** dan hanya memiliki satu branch (`main`). Karena itu batas versi **tidak dapat ditentukan dari tag**, melainkan ditentukan dari isi perubahan kode pada tiap commit. Dasar penentuan dijelaskan pada Bagian 1.

---

# BAGIAN 1 — IDENTIFIKASI BATAS VERSI

## 1.1 Riwayat Commit Lengkap

### Repositori Frontend

| Hash | Tanggal | Pesan Commit |
|---|---|---|
| `a6416b9` | 17 Apr 2026 | Initial commit from Create Next App |
| `2d4117d` | 27 Apr 2026 | add project |
| `199795f` | 28 Apr 2026 | fix responsif page |
| **`74192e6`** | **29 Apr 2026** | **ubah sistem booking jadi pengelolaan keuangan** |
| `5cbbe03` | 4 Mei 2026 | update progress website |
| `71c5054` | 7 Mei 2026 | tambah laporan arus kas, perubahan modal |
| **`d722d48`** | **5 Jun 2026** | **update web baru** |
| `dad1bb1` | 29 Jun 2026 | update frontend web |
| **`bbf58ce`** | **29 Jun 2026** | **add vitest** |
| `88a5be0` | 7 Jul 2026 | update terbaru projek |
| **`eef582a`** | **18 Jul 2026** | **minor fix** |

### Repositori Backend

| Hash | Tanggal | Pesan Commit |
|---|---|---|
| `5ff5a6c` | 27 Apr 2026 | add project |
| **`6adffdf`** | **28 Apr 2026** | **add acitivity log controller** |
| `ce52c09` | 6 Jun 2026 | update backend website |
| **`b322238`** | **29 Jun 2026** | **update backend sistem** |
| `45e6acb` | 7 Jul 2026 | upadate terbaru backend projek |
| **`bfd4da5`** | **18 Jul 2026** | **minor updt** |

> Commit yang dicetak tebal adalah commit akhir tiap versi.

---

## 1.2 Penentuan Batas Versi

| Versi | Commit Akhir Frontend | Commit Akhir Backend | Tanggal Batas |
|---|---|---|---|
| **v0.1** | `74192e6` | `6adffdf` | 29 April 2026 |
| **v0.2** | `d722d48` | `6adffdf` *(tidak ada commit backend baru)* | 5 Juni 2026 |
| **v0.3** | `bbf58ce` *(substansi pada `dad1bb1`)* | `b322238` | 29 Juni 2026 |
| **v0.4** | `eef582a` | `bfd4da5` | 18 Juli 2026 |

### Dasar Penentuan Tiap Batas

**Batas v0.1 → v0.2: commit `74192e6` (29 April 2026)**

Pesan commit menyatakan sendiri peralihan fokus sistem: *"ubah sistem booking jadi pengelolaan keuangan"*. Isi commit membuktikannya:

- **Dihapus:** `src/app/(dashboard)/booking/page.tsx` (339 baris), `src/app/(dashboard)/units/page.tsx` (283 baris), `DEMO.md`
- **Ditambahkan:** `transactions/page.tsx`, `reports/balance-sheet/page.tsx`, `reports/income-statement/page.tsx`, `reports/archive/page.tsx`

Ini persis memenuhi deskripsi v0.1 pada laporan: modul booking/unit properti yang kemudian dihapus dan diganti kerangka awal halaman transaksi dan laporan keuangan.

**Batas v0.2 → v0.3: commit `d722d48` (5 Juni 2026)**

Penentu utamanya adalah **penggunaan `localStorage` sebagai penyimpanan data usaha**. Hasil penghitungan berkas yang memuat `localStorage` di tiap commit:

| Commit | Tanggal | Berkas yang memuat `localStorage` | Jenis penggunaan |
|---|---|---|---|
| `71c5054` | 7 Mei 2026 | 9 berkas | Data usaha (4 halaman laporan + input transaksi) |
| **`d722d48`** | **5 Jun 2026** | **6 berkas** | **Data usaha (`useAccountingStore.ts`, `approval-service.ts`)** |
| `dad1bb1` | 29 Jun 2026 | 3 berkas | **Hanya token/sesi** (`AuthContext.tsx`, `financial-constants.ts`, `Sidebar.tsx`) |

`d722d48` adalah **commit terakhir yang menyimpan data usaha (akun, transaksi, pengajuan pembelian) di localStorage**. Satu hari berikutnya, commit backend `ce52c09` (6 Juni 2026) membangun seluruh API akuntansi. Jadi tanggal 5–6 Juni 2026 adalah titik peralihan dari prototipe berbasis peramban ke sistem berbasis server.

**Batas v0.3 → v0.4: commit `bbf58ce` / `b322238` (29 Juni 2026)**

Pada `dad1bb1` (frontend) dan `b322238` (backend) seluruh fitur yang disebut pada deskripsi v0.3 sudah lengkap: Jurnal Umum, Approval Transaksi, Master Akun berbasis basis data, dan Pengajuan Pembelian bertingkat. `bbf58ce` pada hari yang sama hanya menambahkan dependensi Vitest (`package.json`, `package-lock.json`), tanpa perubahan fungsional, sehingga dipakai sebagai penanda akhir v0.3.

**Akhir v0.4: commit `eef582a` / `bfd4da5` (18 Juli 2026)**

Metode SAW muncul pada `45e6acb` (backend, `src/controllers/spkController.ts` + `src/routes/spk.ts`) dan `88a5be0` (frontend, `src/app/laporan/analisis-kinerja/page.tsx`), keduanya 7 Juli 2026. `eef582a`/`bfd4da5` (18 Juli 2026) adalah commit terakhir pada kedua repositori dan berisi penyempurnaan modul.

---

## 1.3 Tiga Koreksi terhadap Petunjuk Awal

Temuan berikut **berbeda dari petunjuk yang tertulis di laporan** dan perlu diperbaiki agar tidak menjadi celah pertanyaan saat sidang.

### Koreksi 1 — PostgreSQL + Prisma **bukan** hal baru di v0.3

Petunjuk laporan menyebut v0.3 sebagai *"pindah ke PostgreSQL + Prisma"*. Riwayat kode menunjukkan sebaliknya:

- Commit backend **pertama** (`5ff5a6c`, 27 April 2026) **sudah** memuat `prisma/schema.prisma` dengan `provider = "postgresql"`
- Sudah ada dua migrasi: `20260426090043_init` dan `20260427123919_add_phone_field`
- Artinya PostgreSQL + Prisma sudah dipakai sejak **v0.1**, untuk tabel `users`, `units`, `bookings`, dan `activity_logs`

**Yang sebenarnya terjadi di v0.3** adalah *frontend* berhenti menyimpan data usaha di `localStorage` peramban dan mulai membaca/menulis ke PostgreSQL melalui REST API.

> **Usulan rumusan untuk laporan:**
> *"v0.3: pemindahan penyimpanan data usaha dari localStorage peramban ke basis data PostgreSQL melalui REST API, disertai penerapan RBAC lima peran, master akun, approval transaksi, jurnal umum, dan pengajuan pembelian bertingkat."*

### Koreksi 2 — Halaman Master Akun sudah ada sejak v0.2

`src/app/master-akun/page.tsx` pertama muncul pada commit `d722d48` (5 Juni 2026), yaitu **akhir v0.2**, namun saat itu masih berbasis `localStorage` dengan kunci `prodev_accounts`. Yang baru pada v0.3 adalah keterhubungannya dengan tabel `chart_of_accounts` melalui endpoint `/api/chart-of-accounts`.

### Koreksi 3 — Jumlah peran berkembang bertahap, lima peran baru ada di v0.3

| Versi | Peran yang terbukti di kode | Sumber |
|---|---|---|
| v0.1 | Admin, Marketing, Manager, Owner (4) | `src/components/Sidebar.tsx` @ `74192e6` |
| v0.2 | Admin, Manager, Owner, Staf (4) | `src/components/finance-shell.tsx` @ `d722d48` |
| v0.3 | Admin, Teller, Manager, Owner, Staf (5) | `src/components/finance-shell.tsx` @ `dad1bb1` |

Peran **Marketing** hilang dan peran **Teller** serta **Staf** masuk secara bertahap. Pernyataan "RBAC 5 peran" memang tepat untuk v0.3, tetapi tidak berlaku untuk versi sebelumnya.

---

# BAGIAN 2 — REKONSTRUKSI RANCANGAN TIAP VERSI

---

## 2.1 Prototipe v0.1 — Fondasi Sistem

**Commit akhir:** frontend `74192e6` (29 April 2026) · backend `6adffdf` (28 April 2026)

### a. Halaman/Route Frontend

| Route | Keterangan | Peran |
|---|---|---|
| `/login` | Halaman masuk | publik |
| `/` | Dashboard | Admin, Marketing, Manager, Owner |
| `/transactions` | Manajemen Transaksi | Admin, Manager, Owner |
| `/reports/balance-sheet` | Laporan Neraca | Admin, Manager, Owner |
| `/reports/income-statement` | Laporan Laba Rugi | Admin, Manager, Owner |
| `/reports/archive` | Pengarsipan Laporan | Admin, Manager, Owner |
| `/approval` | Halaman Approval | Manager, Owner |
| `/users` | Manajemen User | Admin |
| `/users/add` | Tambah User | Admin |
| `/users/[id]/edit` | Ubah User | Admin |
| `/activity-log` | Activity Log | Admin, Manager, Owner |

### b. Endpoint API

**Route Handler Next.js (proksi sisi server):**
`POST /api/auth/login` · `GET /api/auth/verify` · `GET, POST /api/users` · `GET, PUT, DELETE /api/users/[id]`

**Backend Express.js** (`src/index.ts` @ `6adffdf`):

| Prefiks | Endpoint |
|---|---|
| `/api/auth` | `POST /login`, `POST /register`, `GET /verify` |
| `/api/users` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/api/activity-logs` | `GET /`, `GET /recent`, `GET /role`, `GET /action/:action`, `GET /user/:userId`, `GET /:id`, `POST /` |
| `/api/units` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/api/bookings` | `GET /`, `GET /:id`, `POST /`, `PUT /:id/approve`, `PUT /:id/reject`, `PUT /:id/cancel` |
| `/api/health` | `GET /` |

Pengamanan hanya `authMiddleware` (verifikasi JWT). **Belum ada middleware pemeriksa peran.**

### c. Struktur Data — `prisma/schema.prisma` @ `6adffdf`

Empat model, PostgreSQL:

| Model | Tabel | Field utama |
|---|---|---|
| `User` | `users` | id, email (unik), name, phone, password, role, createdAt, updatedAt |
| `Unit` | `units` | id, name, location, price, status |
| `Booking` | `bookings` | id, userId (FK), unitId (FK), status |
| `ActivityLog` | `activity_logs` | id, userId (FK), action, details, createdAt |

Data pada peramban: kunci `token` dan `user` di `localStorage` (`AuthContext.tsx`).

### d. Alur Proses yang Sudah Berjalan

1. **Autentikasi JWT** — pengguna masuk melalui `/login` → Route Handler Next.js meneruskan ke `POST /api/auth/login` backend → token JWT disimpan di `localStorage` → tiap permintaan berikutnya membawa header `Authorization: Bearer`.
2. **Manajemen pengguna** — CRUD penuh oleh Admin melalui proksi Route Handler.
3. **Pencatatan aktivitas** — activity log tersimpan di PostgreSQL.
4. **Penapisan menu berdasarkan peran** — dilakukan di `Sidebar.tsx` (sisi tampilan saja, belum ada penegakan di server).

### e. Perubahan dibanding Versi Sebelumnya

Versi pertama. Terhadap commit sebelumnya (`199795f`), commit `74192e6` **menghapus** modul booking dan unit properti dari frontend, lalu **menambahkan** kerangka halaman transaksi dan laporan keuangan.

### f. Catatan Penting

- Seluruh isi halaman transaksi dan laporan pada versi ini masih berupa **data contoh (dummy) yang ditulis langsung di dalam berkas halaman** — belum terhubung ke basis data.
- Endpoint `/api/units` dan `/api/bookings` **masih ada di backend** meski halamannya sudah dihapus dari frontend, karena backend tidak ikut di-commit pada 29 April.

---

## 2.2 Prototipe v0.2 — Modul Keuangan Berbasis localStorage

**Commit akhir:** frontend `d722d48` (5 Juni 2026) · backend tetap `6adffdf` (tidak ada commit backend baru sepanjang periode ini)

### a. Halaman/Route Frontend

Terjadi **penataan ulang total penamaan route ke bahasa Indonesia**:

| Route | Keterangan | Peran |
|---|---|---|
| `/login` | Halaman masuk | publik |
| `/` | Dashboard | Admin, Manager, Owner, Staf |
| `/transaksi` | Transaksi | Manager |
| `/master-akun` | Master Akun | Manager |
| `/laporan/arus-kas` | Laporan Arus Kas | Manager, Owner |
| `/laporan/laba-rugi` | Laporan Laba Rugi | Manager, Owner |
| `/laporan/perubahan-modal` | Laporan Perubahan Modal | Manager, Owner |
| `/laporan/neraca` | Laporan Neraca | Manager, Owner |
| `/laporan/arsip` | Pengarsipan Laporan | Manager, Owner |
| `/laporan/arsip/view` | Lihat Arsip Laporan | Manager, Owner |
| `/approval` | Approval Pengadaan | Staf, Manager, Owner |
| `/activity-log` | Activity Log | Admin, Owner |
| `/users`, `/users/add`, `/users/[id]/edit` | Manajemen User | Admin |

Route lama `/transactions` dan `/reports/*` **dihapus**.

### b. Endpoint API

**Backend tidak berubah** dari v0.1 (masih `/api/auth`, `/api/users`, `/api/activity-logs`, `/api/units`, `/api/bookings`).

Namun frontend **sudah membangun lapisan penghubung API** pada commit `5cbbe03` (4 Mei 2026):

| Berkas | Isi |
|---|---|
| `src/services/api-client.ts` | Kelas `ApiClient`, penyisipan header `Authorization: Bearer`, penanganan `HttpError` |
| `src/hooks/useApi.ts`, `useFetch.ts`, `useApiEndpoints.ts` | Hook pemanggil API |
| `src/types/financial-system.ts` | Tipe `ChartOfAccount`, `Transaction`, `DashboardStats`, `ApiResponse<T>`, `TransactionStatus` (`DRAFT`/`PENDING`/`APPROVED`/`REJECTED`/`POSTED`), dll. |
| `src/utils/financial-constants.ts` | `API_BASE_URL`, `API_ENDPOINTS`, `getToken`/`setToken`/`removeToken` |

> **Temuan yang perlu dicatat:** `useApiEndpoints.ts` @ `5cbbe03` sudah mengacu ke alamat seperti `/api/transactions`, `/api/chart-of-accounts`, `/api/dashboard/stats`, dan `/api/dashboard/balance-sheet` — **padahal endpoint tersebut belum ada di backend pada saat itu**. Lapisan penghubung API dirancang lebih dahulu sebagai persiapan, baru diikuti pembangunan backend pada 6 Juni 2026.

### c. Struktur Data — `localStorage`

Seluruh data usaha disimpan di peramban pengguna:

| Kunci | Isi | Sumber |
|---|---|---|
| `prodev_accounts` | Larik `Account`: `id`, `code`, `name`, `type` (aset / kewajiban / modal / pendapatan / beban), `parentId`, `isCash`, `isDrawing`, `isFixedAsset?` | `src/lib/accounting.ts`, `src/hooks/useAccountingStore.ts` |
| `prodev_transactions` | Larik `Transaction`: `id`, `date`, `description`, `debitAccountId`, `creditAccountId`, `amount` | idem |
| `purchaseRequests` | Larik `PurchaseRequest`: `id` (PR-TAHUN-NNN), `item`, `quantity`, `amount`, `requester`, `requesterId`, `department`, `date`, `status`, `description`, `notaNumber?`, jejak persetujuan/penolakan | `src/services/approval-service.ts` |
| `purchaseRequestCounter` | Nomor urut pengajuan | idem |
| `token`, `user`, `loginTime` | Sesi pengguna | `src/contexts/AuthContext.tsx` |

Nilai awal diisi dari `defaultAccounts` dan `defaultTransactions` pada `src/lib/accounting.ts`.

### d. Alur Proses yang Sudah Berjalan

**1. Pencatatan berpasangan (double-entry)** — tiap transaksi wajib memiliki `debitAccountId` dan `creditAccountId`.

**2. Perhitungan empat laporan keuangan** melalui fungsi `buildReports(accounts, transactions)` di `src/lib/accounting.ts`, dijalankan ulang setiap kali data berubah (`useMemo` pada `useAccountingStore`):

1. Hitung saldo akun terbawah dengan memperhatikan sisi normal akun (Aset & Beban: debit menambah; Kewajiban, Modal, Pendapatan: kredit menambah)
2. Jumlahkan saldo anak ke akun induk, diurutkan dari akun terdalam
3. Susun **Laporan Arus Kas** dengan mengelompokkan tiap transaksi menurut jenis akun lawan dari akun kas (Operasional / Investasi / Pendanaan); transaksi antar akun kas diabaikan
4. Bentuk susunan akun berjenjang per jenis akun
5. Susun **Laporan Laba Rugi**: Laba Bersih = Total Pendapatan − Total Beban
6. Susun **Laporan Perubahan Modal**: Ekuitas Akhir = Modal Awal + Laba Bersih − Prive
7. Susun **Laporan Neraca**: Total Pasiva = Total Kewajiban + Ekuitas Akhir; ditandai seimbang bila selisih dengan Total Aset kurang dari 1

**3. Pengajuan pembelian bertingkat** (`approval-service.ts`) — alur `Pending → ACC Manager → ACC Final`, dengan status `Tolak` sebagai cabang. Nomor pengajuan `PR-TAHUN-NNN` dan nomor nota `NTA-XXXX` dibangkitkan di sisi peramban.

### e. Perubahan dibanding v0.1

**Ditambahkan:**

- Mesin akuntansi `src/lib/accounting.ts` (375 baris) dengan hierarki akun dan pencatatan berpasangan
- Dua laporan baru: **Arus Kas** dan **Perubahan Modal** (pada `71c5054`) sehingga menjadi **empat laporan**
- Halaman **Master Akun** (`/master-akun`)
- Lapisan penghubung API: `api-client.ts`, `useApi.ts`, `useApiEndpoints.ts`, `useFetch.ts`, `types/financial-system.ts`
- `ApprovalContext.tsx`, `approval-service.ts`, `CreateRequestModal.tsx`, `export-helper.ts`
- Kerangka tata letak baru `finance-shell.tsx` dan `finance-ui.tsx`
- Peran **Staf**

**Dihapus:**

- Seluruh route `/transactions` dan `/reports/*` beserta halaman detail dan edit laporan
- Peran **Marketing**

### f. Catatan Penting

Data hanya ada di peramban masing-masing pengguna. Dua pengguna berbeda **tidak melihat data yang sama**, dan data hilang bila penyimpanan peramban dibersihkan. Inilah keterbatasan utama yang menjadi alasan iterasi berikutnya.

---

## 2.3 Prototipe v0.3 — Basis Data Terpusat, RBAC, dan Dua Alur Persetujuan

**Commit akhir:** frontend `bbf58ce` (29 Juni 2026, substansi pada `dad1bb1`) · backend `b322238` (29 Juni 2026)

### a. Halaman/Route Frontend

| Route | Keterangan | Peran |
|---|---|---|
| `/login` | Halaman masuk | publik |
| `/` | Dashboard | Admin, Teller, Manager, Owner, Staf |
| `/transaksi` | Transaksi | Teller, Manager, Owner |
| `/transaksi/approval` | **Approval Transaksi (baru)** | Manager |
| `/jurnal-umum` | **Jurnal Umum (baru)** | Teller, Manager, Owner |
| `/master-akun` | Master Akun | Teller |
| `/laporan/arus-kas` | Laporan Arus Kas | Teller, Manager, Owner |
| `/laporan/laba-rugi` | Laporan Laba Rugi | Teller, Manager, Owner |
| `/laporan/perubahan-modal` | Laporan Perubahan Modal | Teller, Manager, Owner |
| `/laporan/neraca` | Laporan Neraca | Teller, Manager, Owner |
| `/laporan/arsip`, `/laporan/arsip/view` | Pengarsipan Laporan | Teller, Manager, Owner |
| `/approval` | Approval Pengadaan | Staf, Manager, Owner |
| `/activity-log` | Activity Log | Admin, Owner |
| `/users`, `/users/add`, `/users/[id]/edit` | Manajemen User | Admin |

Penegakan akses di frontend dilakukan lewat daftar `ROUTE_ROLES` pada `finance-shell.tsx`, bukan sekadar penyembunyian menu.

### b. Endpoint API Backend (`src/index.ts` @ `b322238`)

| Prefiks | Endpoint dan Pembatasan Peran |
|---|---|
| `/api/auth` | `POST /login`, `POST /register`, `GET /verify` |
| `/api/users` | CRUD penuh — **`roleMiddleware("admin")`** |
| `/api/activity-logs` | Baca — `admin`, `owner`; tulis — `admin` |
| `/api/chart-of-accounts` | `GET /`, `/hierarchy`, `/by-type/:type`, `/:id` — `teller`, `manager`, `owner`<br>`POST /`, `PUT /:id`, `DELETE /:id` — **`teller`** |
| `/api/transactions` | `GET` — `teller`, `manager`, `owner`<br>`POST`, `PUT /:id`, `DELETE /:id` — **`teller`**<br>`POST /:id/approve`, `/:id/reject`, `/:id/post` — **`manager`** |
| `/api/journal-entries` | `GET /`, `GET /:id` — `teller`, `manager`, `owner` (hanya baca) |
| `/api/purchase-requests` | `POST /` — `staf`, `teller`, `admin`, `manager`, `owner`<br>`POST /:id/approve-manager` — `manager`, `owner`, `admin`<br>`POST /:id/approve-owner` — `owner`, `admin`<br>`POST /:id/reject` — `manager`, `owner`, `admin`<br>`GET /`, `GET /:id`, `DELETE /:id` |
| `/api/dashboard` | `GET /stats`, `/recent-transactions`, `/summary`<br>Pembuatan laporan: `POST /reports/balance-sheet/generate`, `POST /reports/income-statement/generate`<br>Pengelolaan arsip: `POST /reports`, `PUT /reports/:id`, `POST /reports/:id/finalize`, `POST /reports/eod/trigger`, `DELETE /reports/:id` — **`manager`**<br>Pos laporan: `GET/POST/PUT/DELETE /reports/items` dan `/reports/income-statement/items` |

**Mekanisme RBAC:** berkas baru `src/middleware/role.ts` berisi `roleMiddleware(...allowedRoles)`. Middleware ini dijalankan setelah `authMiddleware`, membandingkan `req.user.role` (dari payload JWT) dengan daftar peran yang diizinkan tanpa membedakan huruf besar/kecil, dan mengembalikan **HTTP 403** bila tidak cocok.

### c. Struktur Data — `prisma/schema.prisma` @ `b322238`

Dua belas model (PostgreSQL), naik dari empat model pada v0.1:

| Model | Tabel | Peran dalam sistem |
|---|---|---|
| `Company` | `companies` | Induk seluruh data, pemisahan antarperusahaan |
| `User` | `users` | Pengguna + `role`, `department`, `isActive`, `lastLogin`, `companyId` |
| `ActivityLog` | `activity_logs` | Riwayat aktivitas |
| `ChartOfAccounts` | `chart_of_accounts` | Master akun berjenjang (`parentId`, `level`, `accountType`, `isCashFlow`) |
| `Transaction` | `transactions` | Transaksi berpasangan (`debitAccountId`, `creditAccountId`, `amount` desimal 15,2, `status`, `approvedBy`, `rejectionReason`) |
| `JournalEntry` | `journal_entries` | Jurnal umum, terhubung satu-ke-satu ke transaksi (`transactionId` unik) |
| `JournalEntryLine` | `journal_entry_lines` | Baris jurnal (`debit`, `credit`, `accountId`) |
| `AccountBalance` | `account_balances` | Saldo akun per periode |
| `FinancialReport` | `financial_reports` | Arsip laporan (`reportType`, `status`, `finalizedBy`) |
| `BalanceSheetItem` | `balance_sheet_items` | Pos neraca berjenjang |
| `IncomeStatementItem` | `income_statement_items` | Pos laba rugi berjenjang |
| `PurchaseRequest` | `purchase_requests` | Pengajuan pembelian (`prCode`, `status`, `notaNumber`, jejak persetujuan) |

Model `Unit` dan `Booking` dari v0.1 **sudah dihapus**.

Di peramban hanya tersisa `token`, `user`, dan `loginTime`.

### d. Alur Proses yang Sudah Berjalan

**1. Alur Persetujuan Transaksi** (`transactionController.ts`)

- Teller mengirim `POST /api/transactions` → transaksi tersimpan berstatus `DRAFT`/`PENDING`
- Manager mengirim `POST /api/transactions/:id/approve`. Sistem memeriksa: status harus `PENDING`, dan periode laporan untuk tanggal transaksi belum dikunci (difinalisasi)
- Bila lolos, dalam **satu transaksi basis data** (`prisma.$transaction`) sistem: membuat entri Jurnal Umum bernomor `JE/<companyId>/<stempel waktu>`, membuat **dua baris jurnal** (akun debit dengan nilai debit, akun kredit dengan nilai kredit), lalu mengubah status transaksi menjadi `POSTED` beserta `approvedBy` dan `approvedAt`
- Penolakan lewat `POST /api/transactions/:id/reject` **mewajibkan `rejectionReason`**; status berubah menjadi `REJECTED`

**2. Alur Pengajuan Pembelian Bertingkat** (`purchaseRequestController.ts`)

- Staf mengajukan → status `Pending`, nomor otomatis `PR-TAHUN-NNN`
- Manager menyetujui (`POST /:id/approve-manager`) → status `ACC Manager`, **sistem menerbitkan nomor nota**. Hanya pengajuan berstatus `Pending` yang dapat disetujui
- Owner/Direktur menyetujui akhir (`POST /:id/approve-owner`) → status `ACC Final`. Sistem menolak bila status belum `ACC Manager`
- Penolakan (`POST /:id/reject`) → status `Tolak`, menyimpan `rejectedBy`, `rejectedAt`, `rejectionReason`

**3. Penguncian periode laporan** — laporan yang difinalisasi mengunci periodenya sehingga transaksi bertanggal dalam periode tersebut tidak dapat lagi disetujui.

### e. Perubahan dibanding v0.2

**Ditambahkan:**

- Basis data terpusat: 8 model akuntansi baru (`ChartOfAccounts`, `Transaction`, `JournalEntry`, `JournalEntryLine`, `AccountBalance`, `FinancialReport`, `BalanceSheetItem`, `IncomeStatementItem`, `PurchaseRequest`) dan model `Company`
- `src/middleware/role.ts` — penegakan RBAC di sisi server
- Halaman `/jurnal-umum` dan `/transaksi/approval`
- Peran **Teller**
- `src/utils/reportBuilder.ts` dan `src/services/eodService.ts` di backend
- Dokumen `system_overview.md` dan `use-case-diagram.html`

**Dihapus:**

- `src/services/approval-service.ts` (203 baris) — digantikan endpoint `/api/purchase-requests`
- Penyimpanan data usaha di `localStorage`
- Model `Unit` dan `Booking` dari skema Prisma

---

## 2.4 Prototipe v0.4 — Analisis Kinerja Keuangan (SAW)

**Commit akhir:** frontend `eef582a` (18 Juli 2026) · backend `bfd4da5` (18 Juli 2026)

### a. Halaman/Route Frontend

Seluruh route v0.3 tetap, **ditambah satu halaman baru**:

| Route | Keterangan | Peran |
|---|---|---|
| `/laporan/analisis-kinerja` | **Analisis Kinerja Keuangan (baru)** | Manager, Owner |

### b. Endpoint API Backend

Seluruh endpoint v0.3 tetap, **ditambah** (`src/routes/spk.ts`):

| Endpoint | Peran |
|---|---|
| `GET /api/spk/analisis-kinerja` | `manager`, `owner` |

### c. Struktur Data

Skema Prisma **hampir tidak berubah** dari v0.3. Satu-satunya penambahan field adalah **`isFixedAsset`** pada model `ChartOfAccounts` (penanda aset tetap, dipakai untuk penggolongan arus kas investasi). Sisa perbedaan berkas `schema.prisma` hanya penataan ulang format oleh `prisma format`.

### d. Alur Proses yang Ditambahkan — Metode SAW

Berdasarkan `src/controllers/spkController.ts` @ `bfd4da5`:

**Alternatif:** setiap bulan aktif dalam rentang periode yang dipilih (bulan yang memiliki transaksi pendapatan atau beban). Data diambil hanya dari transaksi berstatus `POSTED`.

**Kriteria dan bobot:**

| Kode | Kriteria | Jenis | Bobot | Rumus |
|---|---|---|---|---|
| C1 | Rasio Laba Bersih | Benefit | 0,35 | Laba Bersih ÷ Pendapatan × 100% |
| C2 | Pertumbuhan Pendapatan | Benefit | 0,30 | (Pendapatan bulan ini − bulan lalu) ÷ bulan lalu × 100% |
| C3 | Rasio Efisiensi Beban | Cost | 0,20 | Total Beban ÷ Pendapatan × 100% |
| C4 | Rasio Likuiditas Kas | Benefit | 0,15 | Saldo Kas ÷ Total Beban |

**Empat langkah perhitungan:**

1. Hitung nilai mentah tiap kriteria per bulan
2. Tentukan nilai pembanding: `max(C1)`, `max(C2)`, `min(C3)`, `max(C4)`
3. Normalisasi — Benefit: `R = nilai ÷ nilai_max`; Cost: `R = nilai_min ÷ nilai`. Lalu `Skor = 0,35·R1 + 0,30·R2 + 0,20·R3 + 0,15·R4`
4. Urutkan peringkat berdasarkan skor tertinggi

**Kategori:** ≥ 0,80 Sangat Baik · ≥ 0,60 Baik · ≥ 0,40 Cukup · ≥ 0,20 Kurang · di bawah itu Sangat Kurang.

### e. Perubahan dibanding v0.3

**Ditambahkan:**

- `src/controllers/spkController.ts` dan `src/routes/spk.ts` di backend
- `src/app/laporan/analisis-kinerja/page.tsx` di frontend
- Field `isFixedAsset` pada `ChartOfAccounts`
- Pengujian otomatis: `vitest.config.ts`, `src/__tests__/lib/accounting.test.ts`, `src/__tests__/saw/saw.test.ts` (frontend); `tests/auth.test.ts`, `tests/financial-reports.test.ts`, `tests/saw-spk.test.ts` (backend)

**Disempurnakan** (commit `eef582a`, 18 Juli 2026): halaman transaksi, halaman approval pengadaan, jurnal umum, arsip laporan, perubahan modal, analisis kinerja, `ApprovalContext`, `AuthContext`, `useApiEndpoints`, dan `export-helper`.

**Dihapus:** tidak ada modul yang dihapus pada versi ini.

---

# BAGIAN 3 — DAFTAR DIAGRAM DAN SUMBER PEMBUKTIANNYA

Seluruh berkas berada di `docs/diagrams/prototipe/`. Format PlantUML (`.puml`) dengan hasil render PNG beresolusi tinggi (`skinparam dpi 300`), berwarna hitam-putih-abu tanpa bayangan, berlabel bahasa Indonesia.

| No | Berkas | Jenis Diagram | Commit Sumber | Berkas Kode Sumber |
|---|---|---|---|---|
| 1 | `v01_struktur_halaman` | Sitemap struktur navigasi halaman | `74192e6` (frontend) | `src/app/**/page.tsx`, `src/components/Sidebar.tsx` |
| 2 | `v01_arsitektur` | Diagram arsitektur frontend–backend | `74192e6` (frontend), `6adffdf` (backend) | `src/app/api/**/route.ts`, `src/contexts/AuthContext.tsx`, `src/index.ts`, `src/routes/*.ts`, `prisma/schema.prisma` |
| 3 | `v02_struktur_data_localstorage` | Diagram struktur data penyimpanan localStorage | `d722d48` (frontend) | `src/lib/accounting.ts`, `src/hooks/useAccountingStore.ts`, `src/services/approval-service.ts`, `src/contexts/AuthContext.tsx`, `src/utils/financial-constants.ts` |
| 4 | `v02_alur_laporan` | Flowchart alur perhitungan laporan keuangan | `d722d48` (frontend) | `src/lib/accounting.ts` (fungsi `buildReports`), `src/hooks/useAccountingStore.ts` |
| 5 | `v03_struktur_basis_data` | Diagram struktur basis data (ERD notasi kaki gagak) | `b322238` (backend) | `prisma/schema.prisma` |
| 6 | `v03_alur_approval_transaksi` | Activity diagram beralur peran (swimlane) | `b322238` (backend) | `src/controllers/transactionController.ts`, `src/routes/transactions.ts`, `src/middleware/role.ts` |
| 7 | `v03_alur_pengajuan_pembelian` | State machine diagram status pengajuan | `b322238` (backend) | `src/controllers/purchaseRequestController.ts`, `src/routes/purchaseRequests.ts` |

### Alasan Pemilihan Jenis Diagram

- **v0.1 — Sitemap + Arsitektur.** Fokus versi ini adalah fondasi: halaman apa saja yang ada dan bagaimana frontend berbicara dengan backend. Struktur data belum menarik untuk digambarkan karena isi halaman masih data contoh.
- **v0.2 — Struktur data localStorage + Flowchart.** Ciri khas versi ini adalah penyimpanan di peramban dan mesin perhitungan laporan. Diagram kelas dipakai untuk memperlihatkan bentuk data yang tersimpan, dan flowchart untuk memperlihatkan tujuh langkah `buildReports`.
- **v0.3 — ERD + Activity Diagram + State Machine.** Versi ini melompat ke basis data terpusat dengan dua alur persetujuan yang berbeda sifatnya. **Activity diagram beralur peran** dipilih untuk approval transaksi karena melibatkan tiga pihak (Teller, Sistem, Manager) dan banyak titik pemeriksaan. **State machine diagram** dipilih untuk pengajuan pembelian karena yang penting di sana adalah **perpindahan status** (`Pending → ACC Manager → ACC Final` / `Tolak`) beserta syaratnya, bukan urutan langkah antarpihak. Dua jenis diagram yang berbeda ini sekaligus menegaskan bahwa kedua alur persetujuan memang bukan hal yang sama.

---

# LAMPIRAN — Penelusuran Catatan Wawancara dengan Direktur

Permintaan untuk mencari catatan wawancara dengan Direktur pada percakapan sebelumnya **telah ditelusuri, namun catatan tersebut tidak ditemukan**.

**Yang diperiksa:** seluruh berkas transkrip percakapan pada `C:\Users\hizki\.claude\projects\d--Pengelolaan-Perusahaan-pengelolaan-perusahaan\` (5 berkas), dicari dengan kata kunci "wawancara" dan "direktur", termasuk seluruh pesan pengguna pada tiap sesi.

**Yang ditemukan hanyalah satu pernyataan ringkas** (sesi 15 September 2026):

> *"sepertinya terakhir saya bertemu perusahaan dan mengenalkan ini, semuanya di timpahkan ke saya karena mereka tidak ada metode atau apapun yang menghitung penilaian kinerja keuangan"*

Ini adalah **keterangan lisan yang Anda sampaikan**, bukan transkrip wawancara.

**Penyebab yang paling mungkin:** transkrip percakapan yang tersimpan di komputer ini paling lama hanya sampai **21 Agustus 2026**, sedangkan pengembangan v0.1–v0.4 berlangsung **April–Juli 2026**. Sesi-sesi percakapan pada periode pengembangan tersebut tidak tersimpan di mesin ini.

**Yang perlu Anda lakukan:** bila dokumen wawancara dengan Direktur akan dijadikan dasar penentuan kriteria dan bobot SAW di Bab III/IV, dokumen aslinya perlu dilampirkan sendiri — tidak dapat direkonstruksi dari riwayat kode maupun dari percakapan yang tersimpan di komputer ini.

### Pemutakhiran

Riwayat percakapan pada aplikasi **Antigravity** kemudian ditemukan dan memuat ringkasan diskusi dengan pihak perusahaan. Isinya sudah disandingkan dengan riwayat kode pada **Bagian 4** laporan ini.

Namun perlu ditegaskan: yang ditemukan adalah **ringkasan yang dirangkai ulang oleh asisten AI dari 42 percakapan**, **bukan transkrip wawancara asli**. Sumber semacam ini tidak dapat dikutip sebagai bukti primer dalam skripsi, dan pada pengujian di Bagian 4 terbukti memuat tiga kekeliruan mengenai hak akses peran. Kesimpulan di atas tetap berlaku: **dokumen wawancara asli tetap harus Anda lampirkan sendiri**.

---

# BAGIAN 4 — SINKRONISASI DENGAN CATATAN DISKUSI BERSAMA PIHAK PERUSAHAAN

Bagian ini mencocokkan **ringkasan diskusi dengan Owner Bumi Residence** (bersumber dari riwayat percakapan pada aplikasi Antigravity, 42 percakapan) dengan **bukti riwayat kode** pada Bagian 1–2.

> **Status sumber:** ringkasan tersebut adalah **rangkuman yang dibuat ulang oleh asisten AI dari percakapan lama**, bukan transkrip wawancara asli. Untuk keperluan sidang, sumber ini **tidak dapat dikutip sebagai bukti primer**. Fungsinya di sini hanya sebagai penunjuk arah, dan setiap butirnya telah diuji ulang terhadap kode.

## 4.1 Temuan Utama: Batas v0.2 → v0.3 Ternyata Adalah Titik Evaluasi Bersama Pengguna

Ini temuan paling penting dari penyandingan kedua sumber, dan sangat menguntungkan untuk penulisan metode Prototyping.

| Sumber | Keterangan |
|---|---|
| Catatan diskusi | Pertemuan dengan pihak perusahaan berlangsung sekitar **3–5 Juni 2026**. Sebelum itu (≈2 Juni) peran belum pasti, baru ada rencana "Admin, Manajer, Direktur" |
| Bukti kode | `d722d48` (**5 Juni 2026**) masih memuat **4 peran**: Admin, Manager, Owner, Staf — **belum ada Teller** |
| Bukti kode | `dad1bb1` (**29 Juni 2026**) memuat **5 peran**: Admin, Manager, Owner, Staf, **Teller** |

**Kesimpulan:** commit `d722d48` adalah **kondisi prototipe terakhir sebelum hasil evaluasi bersama Owner diterapkan**, dan `dad1bb1` adalah **commit yang mewujudkan hasil evaluasi tersebut**.

Artinya batas v0.2 → v0.3 yang semula ditentukan hanya dari bukti teknis (berhentinya pemakaian `localStorage`) ternyata **berimpit dengan siklus evaluasi pengguna**. Ini persis pola yang dituntut metode Prototyping: *bangun prototipe → evaluasi bersama pengguna → perbaiki*.

> **Usulan kalimat untuk Bab IV:**
> *"Prototipe v0.2 dievaluasi bersama pihak Bumi Residence pada awal Juni 2026. Hasil evaluasi tersebut menjadi dasar perancangan v0.3, meliputi penambahan peran Teller, pembatasan akses Owner, pemisahan tugas input dan persetujuan transaksi, serta pemindahan penyimpanan data ke basis data terpusat."*

## 4.2 Butir Diskusi yang TERBUKTI di Kode

| Butir hasil diskusi | Bukti kode | Commit |
|---|---|---|
| Peran menjadi 5: Admin, Manager, Owner, Staf, Teller | `finance-shell.tsx` memuat kelima peran | `dad1bb1` |
| Istilah "Lapangan" diganti "Staf" | Menu dan `ROUTE_ROLES` memakai `staf`; tidak ada `lapangan` di kode mana pun | `d722d48`, `dad1bb1` |
| Owner **tidak** boleh akses Master Akun | `/master-akun` → `allowed: ["teller"]` | `dad1bb1` |
| Owner **tidak** boleh input transaksi | `POST/PUT/DELETE /api/transactions` → `roleMiddleware("teller")` | `b322238` |
| Teller input transaksi, Manager menyetujui | `POST /` → `teller`; `POST /:id/approve`, `/reject`, `/post` → `manager` | `b322238` |
| Alur DRAFT/PENDING → APPROVED → POSTED | `status` transaksi + `approveTransaction` mengubah ke `POSTED` sekaligus membuat jurnal | `b322238` |
| Transaksi REJECTED dapat diperbaiki Teller | `PUT /:id` → `roleMiddleware("teller")`, `rejectionReason` tersimpan | `b322238` |
| Activity Log hanya Admin dan Owner | `/activity-log` → `allowed: ["admin", "owner"]`; backend `roleMiddleware("admin", "owner")` | `dad1bb1`, `b322238` |
| Manajemen User hanya Admin | `/users` → `allowed: ["admin"]`; backend `roleMiddleware("admin")` | `dad1bb1`, `b322238` |
| Admin tidak boleh melihat laporan | Menu laporan tidak memuat `Admin`; `ROUTE_ROLES` `/laporan` → `teller, manager, owner` | `d722d48`, `dad1bb1` |
| RBAC ditegakkan di frontend **dan** backend | `finance-shell.tsx` (`ROUTE_ROLES`) + `src/middleware/role.ts` (HTTP 403) | `dad1bb1`, `b322238` |
| Penghapusan seluruh localStorage, full backend | Berkas ber-`localStorage` turun dari 6 menjadi 3 (hanya token/sesi) | `dad1bb1` |
| Dashboard dibedakan per peran | `src/app/page.tsx` bertambah 827 baris pada commit yang sama | `dad1bb1` |
| Nama situs diubah sesuai nama perusahaan | `layout.tsx`: `title: "Bumi Residence — Housing Finance System"`; aset baru `public/logo-br.png`, `public/bg-login.jpeg` | `dad1bb1` |
| Redesain 4 laporan agar konsisten | `neraca` (−308), `laba-rugi` (−219), `arus-kas` (+295), `perubahan-modal` diubah serentak | `dad1bb1` |
| Fitur booking & unit dihapus, fokus ke keuangan | Halaman `booking`/`units` dihapus; model `Unit`/`Booking` hilang dari skema | `74192e6`, `b322238` |
| Metode End of Day, otomatis 18:00 WITA | `src/services/eodService.ts`: `cron.schedule("0 * * * *")`, syarat `hours === 18` dan hari Senin–Jumat, zona `Asia/Makassar` | `b322238` |
| EOD akhirnya dijadikan **manual** | `startEODScheduler` **hanya di-`import`, tidak pernah dipanggil** di `src/index.ts` — pada `b322238`, `45e6acb`, maupun `bfd4da5`. Penguncian dilakukan lewat `POST /reports/:id/finalize` (`roleMiddleware("manager")`) | ketiganya |

Catatan khusus EOD: kode penjadwal otomatis **tetap ditinggalkan di dalam repositori** tetapi tidak pernah diaktifkan. Ini bukti kode yang rapi untuk menceritakan keputusan "dicoba otomatis, lalu diputuskan manual" di Bab IV.

## 4.3 Butir Diskusi yang TIDAK Sesuai dengan Kode

Tabel RBAC pada ringkasan diskusi memuat **tiga kekeliruan**. Bila tabel itu disalin apa adanya ke skripsi, isinya akan bertentangan dengan sistem yang diuji.

| Klaim pada ringkasan | Kondisi sebenarnya di kode | Bukti |
|---|---|---|
| Manager ✅ **Manajemen Transaksi** | **Manager tidak dapat menginput transaksi.** Manager hanya menyetujui, menolak, dan mem-posting | `POST/PUT/DELETE /api/transactions` → `roleMiddleware("teller")` @ `b322238` |
| Teller ❌ **Laporan Keuangan** | **Teller dapat mengakses keempat laporan** | `/laporan` → `allowed: ["teller","manager","owner"]` @ `dad1bb1`; `POST /reports/balance-sheet/generate` → `teller, manager, owner` @ `b322238` |
| Teller ❌ **Pengarsipan Laporan** | **Teller dapat melihat arsip laporan** (yang hanya boleh Manager adalah *mengunci*/finalisasi) | menu "Pengarsipan Laporan" → `["Teller","Manager","Owner"]` @ `dad1bb1`; `POST /reports/:id/finalize` → `roleMiddleware("manager")` @ `b322238` |

**Tabel RBAC v0.3 yang benar menurut kode** ada pada Bagian 2.3 laporan ini. Gunakan tabel tersebut, bukan tabel pada ringkasan diskusi.

## 4.4 Ketidaksesuaian Frontend–Backend yang Perlu Disikapi

Butir diskusi *"Admin tidak membuat pengajuan barang (karena rada melenceng)"* **hanya diterapkan di frontend**:

| Lapisan | Kondisi |
|---|---|
| Frontend | `/approval` → `allowed: ["staf", "manager", "owner"]` — Admin **tertutup** |
| Backend | `POST /api/purchase-requests` → `roleMiddleware("staf", "teller", "admin", "manager", "owner")` — Admin **masih diizinkan** |

Menu Admin memang tidak menampilkan halaman pengadaan, tetapi endpoint-nya masih menerima permintaan dari Admin bila dipanggil langsung. Ini **celah penegakan RBAC** yang nyata.

**Sikap yang disarankan:** cukup disebutkan sebagai keterbatasan pada Bab IV/V (misalnya pada bagian keterbatasan penelitian atau saran pengembangan). **Jangan diperbaiki sekarang** kecuali memang diminta, karena mengubah kode setelah pengujian di perusahaan berarti hasil pengujian yang dilaporkan tidak lagi mencerminkan kode yang diuji.

## 4.5 Butir yang Tidak Dapat Dipastikan dari Riwayat Kode

Hal-hal berikut disebut pada ringkasan diskusi namun **tidak meninggalkan jejak di riwayat kode**, sehingga **tidak dapat dipastikan** dan tidak boleh diklaim sebagai temuan kode:

- Tanggal pasti pertemuan dengan Owner (kode hanya menunjukkan perubahannya muncul di commit 29 Juni 2026)
- Isi percakapan, siapa saja yang hadir, dan jabatan narasumber
- Alasan yang disampaikan Owner untuk tiap keputusan
- Adanya "panduan demo presentasi 16 bagian" — tidak ada berkas semacam itu di kedua repositori
- Hasil/berita acara pengujian di Bumi Residence
- Apakah Owner menyebut atau menyetujui bobot SAW 35/30/20/15

Butir terakhir adalah yang **paling menentukan** untuk Bab III. Sampai saat ini, baik riwayat kode maupun riwayat percakapan **tidak memuat pernyataan Owner mengenai kriteria maupun bobot SAW**. Yang tersedia hanya keterangan bahwa perusahaan belum memiliki metode penilaian kinerja keuangan dan menyerahkan penyusunannya kepada peneliti.

---

# BAGIAN 5 — TAHAP KOMUNIKASI TIAP ITERASI

> **Kedudukan dalam Bab IV:** dalam metode Prototyping, tahap **Komunikasi** berada **sebelum** Perancangan Cepat. Jadi saat disusun ke Bab IV, isi Bagian 5 ini ditempatkan **di awal tiap subbab iterasi**, mendahului diagram Perancangan Cepat pada Bagian 3.

## 5.1 Catatan Metodologis tentang Bukti

Tahap Komunikasi adalah kegiatan lisan. **Kegiatan itu sendiri tidak meninggalkan jejak langsung di riwayat kode.** Karena itu setiap kebutuhan di bawah ini diberi penanda sumber:

| Penanda | Arti |
|---|---|
| **[K]** | Terbukti dari **kode** — kebutuhan ini pasti ada, karena wujudnya ada di dalam sistem |
| **[C]** | Berasal dari **catatan diskusi** (sumber sekunder, riwayat percakapan Antigravity) |
| **[K+C]** | Disebut di catatan diskusi **dan** terbukti wujudnya di kode — bukti terkuat |
| **[?]** | **Tidak dapat dipastikan** dari sumber mana pun |

Kode membuktikan **apa yang dibangun**, bukan **siapa yang memintanya**. Jadi penanda [K] berarti "kebutuhan ini nyata ada", bukan "pengguna yang meminta ini".

---

## 5.2 Komunikasi Iterasi v0.1
**Periode:** sebelum 29 April 2026

### Sumber Kebutuhan
Peneliti, berdasarkan pemahaman awal atas bisnis developer perumahan. **[?]** Tidak dapat dipastikan apakah sudah ada pertemuan formal dengan pihak perusahaan pada tahap ini — tidak ada catatan maupun jejak kode yang menunjukkannya.

### Kebutuhan yang Dikumpulkan

| No | Kebutuhan | Sumber | Bukti |
|---|---|---|---|
| 1 | Sistem hanya boleh diakses pengguna terdaftar, dengan sesi yang aman | **[K]** | `authController.ts`, `authMiddleware`, JWT @ `6adffdf` |
| 2 | Administrator mengelola data pengguna (tambah, ubah, nonaktifkan) | **[K]** | `/users`, `/users/add`, `/users/[id]/edit`, `userController.ts` |
| 3 | Seluruh aktivitas pengguna terekam sebagai jejak audit | **[K]** | `activityLogController.ts`, tabel `activity_logs`, `/activity-log` |
| 4 | Pengelolaan unit properti dan pemesanan (booking) unit | **[K]** | model `Unit` & `Booking`, `/api/units`, `/api/bookings`, halaman `/booking` dan `/units` |
| 5 | **Persetujuan berjenjang dua tingkat**: diajukan → disetujui Manager → disetujui akhir Direktur, dengan kemungkinan ditolak | **[K]** | `approval/page.tsx` @ `74192e6`: `type Status = "Pending" \| "ACC Manager" \| "ACC Final" \| "Tolak"` |
| 6 | Pembedaan hak akses antarjabatan | **[K]** | `Sidebar.tsx` menapis menu per peran |
| 7 | **Perubahan arah:** fokus dialihkan dari pemesanan unit ke pengelolaan keuangan | **[K+C]** | Pesan commit `74192e6` "ubah sistem booking jadi pengelolaan keuangan" + penghapusan halaman booking/unit |

### Temuan Penting untuk Bab IV

Butir 5 adalah temuan yang layak ditonjolkan. **Struktur persetujuan berjenjang perusahaan (Manager lalu Direktur) sudah diketahui dan diterapkan sejak iterasi pertama** — hanya saja objek yang disetujui masih *booking* penjualan unit. Status `ACC Manager` dan `ACC Final` yang dipakai sampai versi terakhir ternyata sudah lahir di v0.1.

Ini menunjukkan bahwa **hierarki persetujuan adalah kebutuhan organisasi yang paling awal terkomunikasikan**, dan bertahan menembus perubahan arah sistem.

### Peran yang Diasumsikan
Admin, Marketing, Manager, Owner **[K]**. Peran **Marketing** muncul karena sistem masih berorientasi penjualan unit — dan ikut hilang ketika arah sistem berubah.

### Yang Tidak Dapat Dipastikan
- **[?]** Siapa yang meminta perubahan arah dari booking ke pengelolaan keuangan
- **[?]** Tanggal dan bentuk komunikasi awal dengan perusahaan

---

## 5.3 Komunikasi Iterasi v0.2
**Periode:** Mei – awal Juni 2026

### Sumber Kebutuhan
Peneliti, berdasarkan kaidah akuntansi dan struktur persetujuan yang sudah diketahui dari v0.1. **Kebutuhan pada iterasi ini belum dikonfirmasi ke pihak perusahaan** — catatan diskusi menunjukkan bahwa menjelang akhir iterasi (≈2 Juni 2026) peran-peran sistem masih berupa dugaan: *"belum dapat role-role pasti, tapi yang baru pasti itu Admin, Manajer, Direktur"* **[C]**.

### Kebutuhan yang Dikumpulkan

| No | Kebutuhan | Sumber | Bukti |
|---|---|---|---|
| 1 | Empat laporan keuangan standar — Neraca, Laba Rugi, Arus Kas, Perubahan Modal | **[K+C]** | Keempat halaman `/laporan/*` @ `d722d48` |
| 2 | **Keempat laporan harus berasal dari satu sumber transaksi yang sama dan saling terhubung**, bukan diisi manual satu per satu | **[K+C]** | `buildReports()` menghasilkan keempat laporan sekaligus dari satu himpunan akun + transaksi |
| 3 | Daftar akun (COA) berjenjang yang dapat dikelola sendiri oleh perusahaan | **[K]** | `/master-akun`, `Account.parentId`, `generateAccountCode()` |
| 4 | Pencatatan berpasangan (debit–kredit) sesuai kaidah akuntansi | **[K]** | `Transaction` wajib punya `debitAccountId` dan `creditAccountId` |
| 5 | Neraca harus dapat diperiksa keseimbangannya | **[K]** | `isBalanced` dan `selisih` pada `BalanceSheet` |
| 6 | **Alur persetujuan berjenjang dialihkan ke pengajuan pembelian barang**, bukan lagi booking unit | **[K]** | `approval/page.tsx` @ `5cbbe03` memakai status yang sama untuk pengajuan barang |
| 7 | Manager menerbitkan **nomor nota** saat menyetujui pengajuan | **[K]** | `notaNumber` format `NTA-XXXX` dibangkitkan saat status menjadi `ACC Manager` |
| 8 | Persetujuan akhir berada di tangan Direktur | **[K]** | Label dialog *"Final Approval Direktur?"* @ `5cbbe03` |
| 9 | Administrator **tidak** boleh melihat laporan keuangan — pemisahan urusan administrasi dari urusan keuangan | **[K+C]** | Menu laporan @ `d722d48` hanya memuat `Manager` dan `Owner` |
| 10 | Pembatasan akses berbasis peran dijadikan fitur utama | **[C]** | — |
| 11 | Antarmuka berbahasa Indonesia | **[K]** | Seluruh route diganti ke `/transaksi`, `/laporan/*`, `/master-akun` |

### Strategi Teknis Peneliti (bukan kebutuhan pengguna)
Catatan diskusi menyebut keputusan peneliti untuk **menguji kebenaran logika akuntansi lebih dulu memakai `localStorage`**, dan baru membangun backend beserta tabel basis datanya setelah logika terbukti benar **[C]**.

Hal ini **jangan ditulis sebagai kebutuhan pengguna** di Bab IV, melainkan sebagai **keputusan teknis peneliti dalam membangun prototipe**. Justru di sinilah letak kesesuaiannya dengan metode Prototyping: prototipe dibangun cepat untuk menguji satu hal tertentu, bukan langsung membangun sistem lengkap.

### Yang Tidak Dapat Dipastikan
- **[?]** Apakah keempat jenis laporan ditentukan perusahaan atau dipilih peneliti berdasarkan standar akuntansi
- **[?]** Asal-usul kebutuhan nomor nota pada persetujuan Manager

---

## 5.4 Komunikasi Iterasi v0.3 — Pertemuan dengan Pihak Perusahaan
**Periode:** awal Juni 2026

> Ini adalah **satu-satunya iterasi yang memiliki bukti keterlibatan langsung pengguna**, dan karena itu menjadi tahap Komunikasi yang paling kuat untuk diceritakan di Bab IV.

### Sumber Kebutuhan
Pertemuan dengan pihak Bumi Residence (Owner/Direktur). Catatan diskusi menunjukkan pertemuan berlangsung sekitar **3–5 Juni 2026** **[C]**, dengan tujuan mempresentasikan perkembangan prototipe v0.2 sekaligus menanyakan peran dan fitur yang sebenarnya dibutuhkan.

Bukti kode mendukung kronologi ini: commit `d722d48` (5 Juni) masih memuat 4 peran tanpa Teller, sedangkan commit `dad1bb1` (29 Juni) sudah memuat kelima peran hasil kesepakatan.

### Kebutuhan yang Disepakati

| No | Kebutuhan | Sumber | Bukti |
|---|---|---|---|
| 1 | Sistem memakai **lima peran**: Admin, Manager, Owner, Staf, Teller | **[K+C]** | `finance-shell.tsx` @ `dad1bb1` |
| 2 | Sebutan **"Staf"** dipakai, menggantikan usulan "Lapangan" | **[K+C]** | Tidak ada kata `lapangan` di kode mana pun; yang dipakai `staf` |
| 3 | **Pemisahan tugas pencatatan dan persetujuan:** Teller menginput transaksi, Manager menyetujui | **[K+C]** | `POST /api/transactions` → `teller`; `/approve`, `/reject`, `/post` → `manager` @ `b322238` |
| 4 | Transaksi yang ditolak dapat diperbaiki dan diajukan ulang oleh Teller | **[K]** | `PUT /:id` → `teller`; `rejectionReason` tersimpan |
| 5 | Transaksi yang disetujui **otomatis** masuk ke Jurnal Umum | **[K]** | `approveTransaction` membuat `JournalEntry` + 2 baris jurnal dalam satu transaksi basis data |
| 6 | **Owner tidak menyentuh operasional** — tidak mengelola master akun, tidak menginput transaksi; hanya melihat laporan dan memberi persetujuan | **[K+C]** | `/master-akun` → `["teller"]`; input transaksi → `teller` |
| 7 | Jejak audit hanya dapat dilihat **Admin dan Owner**, tidak oleh Manager | **[K+C]** | `/activity-log` → `["admin","owner"]`; backend `roleMiddleware("admin","owner")` |
| 8 | Administrator fokus mengelola pengguna, **tidak** mengajukan pembelian barang | **[K+C]** | `/approval` → `["staf","manager","owner"]` (Admin tidak termasuk) |
| 9 | Pembatasan akses harus **ditegakkan di sisi server**, tidak cukup menyembunyikan menu | **[K+C]** | Berkas baru `src/middleware/role.ts` mengembalikan HTTP 403 |
| 10 | **Data harus terpusat** agar seluruh pengguna melihat data yang sama | **[K+C]** | Seluruh penyimpanan data usaha pindah ke PostgreSQL; `localStorage` tinggal token |
| 11 | Setiap peran mendapat tampilan dashboard sesuai kewenangannya | **[K+C]** | `src/app/page.tsx` bertambah 827 baris @ `dad1bb1` |
| 12 | Perusahaan memakai metode **End of Day** — laporan ditutup dan dikunci setiap hari | **[K+C]** | `eodService.ts`: cron, syarat pukul 18.00 zona `Asia/Makassar`, Senin–Jumat |
| 13 | Periode laporan yang sudah dikunci tidak boleh lagi menerima transaksi baru | **[K]** | Pemeriksaan `isPeriodLocked` pada `approveTransaction` |
| 14 | Sistem memakai **identitas perusahaan** | **[K+C]** | `title: "Bumi Residence — Housing Finance System"`, aset `logo-br.png`, `bg-login.jpeg` |

### Perubahan Kebutuhan di Tengah Iterasi: End of Day

Butir 12 sempat berubah wujud dalam iterasi yang sama, dan ini contoh baik untuk menceritakan sifat *iteratif* metode Prototyping:

1. Kebutuhan awal: penguncian laporan harian dilakukan **otomatis** pukul 18.00 WITA **[K+C]**
2. Pelaksanaan otomatis menimbulkan banyak kendala **[C]**
3. Keputusan akhir: penguncian dilakukan **manual** oleh Manager melalui halaman Arsip Laporan **[K+C]**

**Bukti kode atas keputusan ini sangat rapi:** berkas `eodService.ts` beserta seluruh logika penjadwalannya **tetap ditinggalkan di dalam repositori**, tetapi fungsi `startEODScheduler` **hanya di-`import` dan tidak pernah dipanggil** di `src/index.ts` — pada `b322238`, `45e6acb`, maupun `bfd4da5`. Penguncian akhirnya dijalankan lewat `POST /reports/:id/finalize` yang dibatasi `roleMiddleware("manager")`.

### Yang Tidak Dapat Dipastikan
- **[?]** Tanggal persis pertemuan, tempat, dan siapa saja yang hadir
- **[?]** Alasan yang disampaikan pihak perusahaan untuk tiap keputusan
- **[?]** Apakah kesepakatan dituangkan dalam berita acara tertulis

---

## 5.5 Komunikasi Iterasi v0.4
**Periode:** Juli 2026

### Sumber Kebutuhan
Kebutuhan penelitian (metode yang diangkat dalam skripsi), dipadukan dengan keterangan mengenai kondisi perusahaan.

### Kebutuhan yang Dikumpulkan

| No | Kebutuhan | Sumber | Bukti |
|---|---|---|---|
| 1 | Perusahaan membutuhkan penilaian kinerja keuangan yang **objektif dan dapat dibandingkan antarperiode** | **[K]** | `spkController.ts`, halaman `/laporan/analisis-kinerja` |
| 2 | Penilaian dilakukan **per bulan**, agar dapat dipakai memantau jalannya usaha secara rutin | **[K]** | Alternatif penilaian = tiap bulan aktif dalam rentang periode |
| 3 | Penilaian hanya memakai data transaksi yang **sudah sah** | **[K]** | Agregasi dibatasi transaksi berstatus `POSTED` |
| 4 | Empat kriteria: laba bersih, pertumbuhan pendapatan, efisiensi beban, likuiditas kas | **[K]** | Tetapan `KRITERIA` pada `spkController.ts` |
| 5 | Hasil disajikan sebagai **skor, peringkat, dan kategori** yang mudah dibaca pengguna non-teknis | **[K]** | `getKategori()`: Sangat Baik / Baik / Cukup / Kurang / Sangat Kurang |
| 6 | Fitur ini hanya untuk **Manager dan Owner** — tingkat pengambil keputusan | **[K]** | `GET /api/spk/analisis-kinerja` → `roleMiddleware("manager","owner")` |
| 7 | Perhitungan yang menyangkut uang perlu diuji kebenarannya secara otomatis | **[K]** | `saw.test.ts`, `accounting.test.ts`, `saw-spk.test.ts`, `financial-reports.test.ts` |

### Kondisi Perusahaan sebagai Latar Kebutuhan
Perusahaan **belum memiliki metode penilaian kinerja keuangan apa pun**, sehingga penyusunan kriteria dan bobot diserahkan kepada peneliti **[C]**.

Kondisi ini justru memperkuat alasan keberadaan fitur tersebut: sistem menyediakan sesuatu yang sebelumnya tidak dimiliki perusahaan. Ini dapat ditulis sebagai bagian dari rumusan masalah maupun manfaat penelitian.

### Yang Tidak Dapat Dipastikan — dan Ini Paling Menentukan
- **[?]** Apakah pihak perusahaan **menyebut atau menyetujui** bobot 0,35 / 0,30 / 0,20 / 0,15. Tidak ada jejaknya baik di riwayat kode maupun di catatan diskusi
- **[?]** Kapan dan dalam bentuk apa kebutuhan penilaian kinerja ini disampaikan kepada perusahaan
- **[?]** Apakah kelima kategori penilaian (Sangat Baik sampai Sangat Kurang) disepakati bersama perusahaan

Butir pertama adalah titik yang paling mungkin ditanya penguji. Selama belum ada bukti primer, **jangan menulis bahwa bobot berasal dari perusahaan**.

---

## 5.6 Ringkasan Tahap Komunikasi Antar-Iterasi

| Iterasi | Sumber kebutuhan utama | Inti kebutuhan | Keterlibatan pengguna |
|---|---|---|---|
| **v0.1** | Peneliti | Autentikasi, manajemen pengguna, jejak audit, pengelolaan unit & booking, persetujuan berjenjang | **[?]** Tidak dapat dipastikan |
| **v0.2** | Peneliti + kaidah akuntansi | Empat laporan keuangan yang saling terhubung, master akun, pencatatan berpasangan, pengajuan pembelian bertingkat | Belum dikonfirmasi ke perusahaan |
| **v0.3** | **Pihak perusahaan (Owner)** | Lima peran, pemisahan tugas Teller–Manager, pembatasan akses Owner, data terpusat, End of Day | **Terlibat langsung** |
| **v0.4** | Kebutuhan penelitian + kondisi perusahaan | Penilaian kinerja keuangan bulanan yang objektif | **[?]** Tidak dapat dipastikan |

### Pola yang Terbaca

Dari tabel di atas terlihat pola yang jujur dan justru masuk akal untuk sebuah penelitian prototyping:

**Kebutuhan awal disusun peneliti, lalu dikoreksi oleh pengguna pada iterasi ketiga, dan koreksi itu bertahan sampai versi akhir.** Tidak satu pun keputusan hasil pertemuan Juni 2026 yang dibatalkan pada v0.4.

Ini sekaligus menjawab bila penguji bertanya *"apa gunanya iterasi kalau kebutuhan sudah tahu dari awal?"* — jawabannya: iterasi v0.3 membuktikan bahwa dugaan awal peneliti **tidak seluruhnya benar**. Peran Marketing dihapus, peran Teller yang tidak pernah terpikir justru muncul, dan pembagian tugas pencatatan–persetujuan baru terbentuk setelah bertemu pengguna.

## 5.7 Catatan Kejujuran Metodologis

Tiga hal yang perlu disampaikan apa adanya, dan sebaiknya **jangan dilebih-lebihkan** di Bab IV:

1. **Hanya iterasi v0.3 yang memiliki bukti keterlibatan langsung pengguna.** Menulis seolah-olah keempat iterasi diawali wawancara pengguna akan sulit dipertanggungjawabkan bila ditanya bukti dokumennya.
2. **Sumber catatan diskusi bersifat sekunder.** Butir bertanda **[C]** berasal dari ringkasan riwayat percakapan yang dirangkai ulang oleh asisten AI, bukan dokumen wawancara. Butir bertanda **[K]** dan **[K+C]** jauh lebih aman dipertahankan karena wujudnya ada di dalam sistem.
3. **Bukti primer perlu dilampirkan.** Untuk memperkuat tahap Komunikasi — terutama iterasi v0.3 dan dasar bobot SAW pada v0.4 — dokumen wawancara, notulen, atau surat keterangan dari Bumi Residence perlu dilampirkan sendiri. Riwayat kode tidak dapat menggantikannya.

---

*Seluruh isi Bagian 1–3 berasal dari pembacaan riwayat kode kedua repositori. Bagian 4 dan 5 menyandingkan riwayat kode dengan catatan diskusi dari sumber sekunder, dengan penanda sumber pada tiap butir. Hal yang tidak dapat dibuktikan telah dinyatakan secara eksplisit.*
