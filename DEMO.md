# 🏠 Housing System - Setup Guide

> **Version**: 1.0 | **Status**: Production Ready

Panduan setup dan konfigurasi Housing Management System dengan Backend API Integration.

---

## 🎯 Backend API Requirements

Sistem ini memerlukan backend API yang sudah berjalan dengan endpoint-endpoint berikut:

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Units Management
- `GET /api/units` - Daftar semua unit
- `GET /api/units/:id` - Detail unit
- `POST /api/units` - Create unit (Admin only)
- `PUT /api/units/:id` - Update unit (Admin only)
- `DELETE /api/units/:id` - Delete unit (Admin only)

### Bookings
- `GET /api/bookings` - Daftar booking
- `POST /api/bookings` - Submit booking (Marketing)
- `GET /api/bookings/:id` - Detail booking

### Approvals
- `PUT /api/bookings/:id/approve` - Approve booking
- `PUT /api/bookings/:id/reject` - Reject booking

### Users Management
- `GET /api/users` - Daftar user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Activity Log
- `GET /api/activity-logs` - Daftar activity log

---

## 📋 Database Schema

Database harus memiliki tabel minimal:

### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Marketing', 'Manager', 'Owner') DEFAULT 'Marketing',
  status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  phone VARCHAR(20),
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### units
```sql
CREATE TABLE units (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cluster VARCHAR(100) NOT NULL,
  status ENUM('Tersedia', 'Pending', 'ACC Manager', 'ACC Final', 'Tolak') DEFAULT 'Tersedia',
  price BIGINT NOT NULL,
  area INT NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### bookings
```sql
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  unit_id VARCHAR(36) NOT NULL,
  status ENUM('Pending', 'ACC Manager', 'ACC Final', 'Tolak') DEFAULT 'Pending',
  marketing_id VARCHAR(36),
  submitted_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id),
  FOREIGN KEY (marketing_id) REFERENCES users(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);
```

---

## 🔑 Environment Variables

File `.env.local` harus ada:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Housing System"
```

---

## 🚀 Development Setup

1. Install dependencies
```bash
npm install
```

2. Pastikan backend API berjalan di port 3001
```bash
# Backend harus running
npm run dev:backend
```

3. Start frontend development server
```bash
npm run dev
```

4. Akses aplikasi di `http://localhost:3000/login`

---

## 🔐 Default Login Flow

1. User masuk credentials di `/login`
2. Backend validasi email & password di database
3. Return JWT token dan user data
4. Token disimpan di localStorage
5. Redirect ke dashboard

---

## 📝 Development Notes

- Semua mock data sudah dihapus
- Semua page terhubung ke API backend
- Token JWT disimpan di localStorage
- Authorization header: `Bearer {token}`
- RBAC dihandle oleh backend berdasarkan user.role

---

## ✅ Checklist Sebelum Production

- [ ] Backend API sudah production-ready
- [ ] Database sudah termigrasi dengan schema lengkap
- [ ] Environment variables sudah dikonfigurasi
- [ ] Authentication & JWT working
- [ ] RBAC rules sudah implemented di backend
- [ ] Error handling di semua endpoints
- [ ] Input validation di server-side
- [ ] Logging & monitoring setup
- [ ] Security headers configured
- [ ] HTTPS enabled

---

**Last Updated**: 2026-04-26
**Next Steps**: Implementasikan backend API sesuai requirements di atas

### 1. Jalankan Development Server
```bash
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 2. Login Page
Sistem akan menampilkan **Login Page** yang indah dengan pilihan role. Tidak perlu password - cukup pilih role dan klik login!

---

## 🔐 Login Page Features

### Tampilan Login
- **Role Selection**: 4 kartu role yang bisa diklik
- **Role Preview**: Menampilkan informasi apa yang bisa diakses setiap role
- **Permission Matrix**: Tabel yang menunjukkan fitur apa yang accessible
- **Live Gradient**: Warna yang berbeda untuk setiap role

### Role Options

#### 1. 🔑 Administrator
- **Deskripsi**: Pengelola sistem dengan akses penuh
- **Akses**: 
  - ✓ Kelola semua user & role
  - ✓ Lihat dashboard lengkap
  - ✓ Kelola unit rumah
  - ✓ Lihat semua booking
- **Menu**: Dashboard, Units, Users

#### 2. 📞 Marketing Sales
- **Deskripsi**: Tim penjualan yang mengajukan booking
- **Akses**:
  - ✓ Lihat unit rumah tersedia
  - ✓ Ajukan booking customer
  - ✓ Track status booking
  - ✓ Dashboard penjualan
- **Menu**: Dashboard, Units, Booking

#### 3. 👔 Manager Approval
- **Deskripsi**: Validasi dan approval booking tahap pertama
- **Akses**:
  - ✓ Review booking marketing
  - ✓ Approval tahap pertama
  - ✓ Lihat unit rumah
  - ✓ Dashboard analytics
- **Menu**: Dashboard, Units, Approval

#### 4. 👑 Owner Director
- **Deskripsi**: Final approval dan oversight bisnis
- **Akses**:
  - ✓ Final approval booking
  - ✓ Lihat semua dashboard
  - ✓ Business analytics lengkap
  - ✓ Approval history
- **Menu**: Dashboard, Units, Approval

---

## 👤 Role Switching untuk Demo

Setelah login, ada **2 cara untuk switch role**:

### Cara 1: Logout & Re-login
1. Klik tombol **Logout** di header (kanan atas)
2. Kembali ke login page
3. Pilih role yang berbeda

### Cara 2: Role Switcher di Sidebar
1. Lihat sidebar bawah: **"Simulasi Role Aktif"**
2. Dropdown tersebut untuk instant role switching
3. Menu di sidebar langsung berubah
4. Role di header terUpdate



---

## 📋 Fitur-Fitur untuk Demo

### 0. 🔐 Login Page
- **Lokasi**: Halaman pertama / http://localhost:3000/login
- **Fitur Demo**:
  - 4 Role selection cards dengan preview gradient
  - Role description & access list
  - Permission matrix untuk setiap role
  - Real-time preview saat pilih role
  - Smooth transition to dashboard
- **Untuk Menunjukkan**: 
  - Role-based access control system
  - User authentication flow (demo mode)
  - Clear role definitions & responsibilities

### 1. 📊 Dashboard
- **Lokasi**: Halaman utama setelah login
- **Fitur Demo**:
  - 5 Statistics Cards (Total Unit, Tersedia, Pending, Manager Approval, Terjual)
  - Tabel unit terbaru dengan status real-time
  - Booking terbaru dengan status progress
  - Ringkasan statistik tim dan market value
- **Untuk Menunjukkan**: Overview sistem keseluruhan, status bisnis real-time

### 2. 📍 Data Unit Rumah
- **Lokasi**: Dashboard > Data Unit Rumah
- **Fitur Demo**:
  - Daftar 12 unit dengan berbagai status
  - Filter berdasarkan status (Tersedia, Pending, ACC Manager, ACC Final)
  - Search by cluster (Griya Asri, Emerald, Sapphire, Diamond)
  - Cluster cards dengan ringkasan per cluster
  - Status breakdown statistics
- **Untuk Menunjukkan**: Inventory management, filtering & search capabilities

### 3. 📋 Ajukan Booking (Marketing)
- **Lokasi**: Dashboard > Ajukan Booking
- **Akses**: Hanya role **Marketing**
- **Fitur Demo**:
  - Form booking dengan nama, email, telepon
  - Dropdown unit dengan harga dan area
  - Real-time unit detail preview
  - List booking terbaru di sidebar
  - Success notification saat submit
- **Untuk Menunjukkan**: 
  - Customer booking process
  - Form validation & UX
  - Data submission workflow

### 4. ✓ Halaman Approval (Manager/Owner)
- **Lokasi**: Dashboard > Halaman Approval
- **Akses**: Hanya role **Manager** & **Owner**
- **Fitur Demo**:
  - Workflow visualization (Pending → Manager ACC → Final ACC)
  - Statistics untuk setiap stage
  - Detailed booking cards dengan buyer info
  - Dua-tahap approval:
    - Manager: Pending → ACC Manager
    - Owner: ACC Manager → ACC Final
  - Reject option di setiap stage
  - Completed bookings history
- **Untuk Menunjukkan**:
  - Approval workflow berjenjang
  - Role-based decision making
  - Process flow dan tracking

**Demo Interactivity**:
1. Role switcher ke "Manager"
2. Klik "Approve (Manager)" untuk approve booking
3. Switch ke "Owner"
4. Klik "Final Approval" untuk finalisasi
5. Lihat booking pindah ke "Completed Bookings"

### 5. 👥 Manajemen User
- **Lokasi**: Dashboard > Manajemen User
- **Akses**: Hanya role **Admin**
- **Fitur Demo**:
  - Tabel 8 user dengan berbagai role
  - Filter by role (Admin, Marketing, Manager, Owner)
  - Add user form dengan validation
  - Toggle user status (Aktif/Nonaktif)
  - Delete user dengan confirmation
  - Statistics & role descriptions
- **Untuk Menunjukkan**:
  - User management capabilities
  - RBAC implementation
  - Team management features

---

## 🎬 Demo Scenarios

### Scenario 0: Login & Role Selection
**Durasi**: 2-3 menit

1. **Setup**: Akses http://localhost:3000/login
2. **Demo Steps**:
   - Tunjukkan 4 role cards yang indah
   - Hover/click setiap role untuk lihat preview
   - Jelaskan perbedaan access & permission setiap role
   - Pilih satu role (mis: Marketing)
   - Klik tombol login
   - Tunjukkan loading animation
   - Dashboard muncul dengan role yang dipilih
3. **Poin Penting**:
   - No password required (demo mode)
   - Clear visual hierarchy untuk role selection
   - Permission transparency dari login stage
   - Smooth UX flow

### Scenario 1: Marketing Booking Flow
**Durasi**: 5-7 menit

1. **Setup**: 
   - Dari login page, pilih role **Marketing**
   - Klik login
   - Dashboard muncul
2. **Demo Steps**:
   - Perhatikan sidebar: hanya ada Dashboard, Units, Booking (tidak ada Approval atau Users)
   - a. **Browse Units**:
     - Klik "Data Unit Rumah"
     - Tunjukkan semua 12 unit
     - Demo filter by status
     - Demo search by cluster
   - b. **Create Booking**:
     - Klik "Ajukan Booking Unit Rumah"
     - Tunjukkan form input (nama, email, telepon)
     - Pilih unit dari dropdown (misal: Unit A - Griya Asri)
     - Unit preview otomatis muncul di kanan
     - Klik "Ajukan Booking"
     - Success notification tampil
   - c. **Back to Dashboard**:
     - Klik Dashboard
     - Recent Bookings section updated dengan booking baru
3. **Poin Penting**:
   - Marketing HANYA bisa lihat Units & Booking
   - Tidak bisa akses Approval atau Users menu
   - Workflow jelas dari browsing ke booking submit
   - Real-time feedback (notification & dashboard update)
   - Role restriction ditunjukkan via sidebar menu

### Scenario 2: Approval Workflow
**Durasi**: 6-8 menit

1. **Setup**: 
   - Pastikan ada booking dengan status Pending (dari scenario 1)
   - Dari sidebar, gunakan role switcher untuk switch ke **Manager** role
   - Perhatikan sidebar berubah: Dashboard, Units, Approval (tidak ada Booking atau Users)
2. **Demo Steps**:
   - a. **Review Approval**:
     - Navigasi ke "Halaman Approval"
     - Tunjukkan workflow diagram (Pending → Manager ACC → Final ACC)
     - Tunjukkan booking cards dengan buyer information
   - b. **Manager Approval**:
     - Klik tombol "Approve (Manager)" di booking yang dipilih
     - Tunjukkan status bergerak ke "ACC Manager"
     - Tunjukkan updated progress di workflow
   - c. **Final Approval (Owner)**:
     - Switch role ke **Owner** menggunakan sidebar role switcher
     - Perhatikan sidebar berubah
     - Tunjukkan booking yang sudah Manager ACC
     - Klik "Final Approval"
     - Tunjukkan booking pindah ke "Completed Bookings" section
3. **Poin Penting**:
   - Role-based access control: Manager lihat Approval, Owner lihat Approval
   - Workflow berjenjang yang transparan
   - Audit trail: siapa approve, kapan
   - Permission-based UI: hanya button yang relevan untuk role
   - Real-time status tracking

### Scenario 3: Dashboard Analytics & Owner Overview
**Durasi**: 4-5 menit

1. **Setup**: 
   - Role sudah Owner dari scenario 2
   - Klik Dashboard di sidebar
2. **Demo Steps**:
   - a. **Statistics Overview**:
     - Tunjukkan 5 stat cards (Total Unit, Tersedia, Pending, Manager ACC, Terjual)
     - Jelaskan apa yang dilihat setiap role di dashboard
   - b. **Unit Inventory**:
     - Scroll ke bawah, tunjukkan unit table
     - Tunjukkan berbagai status (Tersedia, Pending, ACC Manager, ACC Final)
   - c. **Recent Activity**:
     - Tunjukkan recent bookings dengan status progress
     - Tunjukkan cluster breakdown
3. **Poin Penting**:
   - Owner punya overview lengkap semua data
   - Real-time dashboard updates
   - Clear visual indicators untuk quick decision making
   - Aggregated insights untuk business intelligence

### Scenario 4: User Management (Admin Only)
**Durasi**: 3-5 menit

1. **Setup**: 
   - Switch role ke **Admin** menggunakan sidebar role switcher
   - Perhatikan sidebar berubah: Dashboard, Units, Users (tidak ada Booking atau Approval)
2. **Demo Steps**:
   - a. **View User List**:
     - Navigasi ke "Manajemen User"
     - Tunjukkan 8 users dengan berbagai role (Admin, Marketing, Manager, Owner)
     - Tunjukkan user status (Aktif/Nonaktif)
   - b. **Filter by Role**:
     - Klik filter button untuk role tertentu (misal: Marketing)
     - Tunjukkan list terfilter hanya menampilkan Marketing users
   - c. **User Management**:
     - Tunjukkan "Tambah User" form dengan fields: name, email, role
     - Optional: Tambah user baru
     - Tunjukkan toggle status (Aktif → Nonaktif)
   - d. **Role Descriptions**:
     - Scroll down untuk lihat role descriptions section
     - Jelaskan setiap role dan responsibilities-nya
3. **Poin Penting**:
   - Admin punya full control atas user management
   - Role-based filtering untuk easy team organization
   - Status toggle untuk user activation/deactivation
   - Role clarity melalui descriptions
   - Only Admin bisa akses halaman ini

---

## 🔄 Role-Based Access Control Demo

Tunjukkan bagaimana sistem mengimplementasikan RBAC:

### Access Matrix
| Feature | Admin | Marketing | Manager | Owner |
|---------|-------|-----------|---------|-------|
| **Login Page** | ✓ | ✓ | ✓ | ✓ |
| **Dashboard** | ✓ | ✓ | ✓ | ✓ |
| **Data Unit Rumah** | ✓ | ✓ | ✓ | ✓ |
| **Ajukan Booking** | ✗ | ✓ | ✗ | ✗ |
| **Halaman Approval** | ✗ | ✗ | ✓ | ✓ |
| **Manajemen User** | ✓ | ✗ | ✗ | ✗ |

### Key RBAC Features
1. **Login Level**: Role selection dari awal dengan permission preview
2. **Menu Level**: Sidebar otomatis hide/show berdasarkan role
3. **Button Level**: Action buttons hanya tampil untuk role yang authorized
4. **Page Level**: Redirect ke dashboard jika unauthorized access
5. **Instant Switcher**: Role switcher di sidebar untuk demo flow

**Cara Demo RBAC**:
1. Lihat sidebar sebelah kiri
2. Ubah role di dropdown "Simulasi Role Aktif"
3. Lihat menu berubah sesuai role
4. Tunjukkan akses control yang ketat

---

## 💡 Key Features Highlights

### 1. Data Management
- ✅ 12 units dengan multiple clusters
- ✅ 4 clusters (Griya Asri, Emerald, Sapphire, Diamond)
- ✅ 3 status levels untuk approval
- ✅ Mock data yang realistic

### 2. User Experience
- ✅ Clean & modern UI dengan Tailwind CSS
- ✅ Responsive design untuk semua device
- ✅ Color coding untuk status visual
- ✅ Real-time updates & interactions

### 3. Business Logic
- ✅ Role-based access control
- ✅ Multi-stage approval workflow
- ✅ User management system
- ✅ Inventory tracking

### 4. Demo-Friendly
- ✅ Demo banner yang jelas
- ✅ Sample data yang lengkap
- ✅ Interactive forms & buttons
- ✅ Role switcher untuk mudah demo

---

## 📊 Sample Data Available

### Units (12 Total)
- **Griya Asri**: A-01 to A-05 (450jt, 72m²)
- **Emerald**: B-01 to B-04 (850jt, 120m²)
- **Sapphire**: C-01 to C-02 (1.2M, 150m²)
- **Diamond**: D-01 (1.5M, 200m²)

### Status Breakdown
- Tersedia: 6 units
- Pending: 2 units
- Manager ACC: 2 units
- Final ACC: 2 units

### Users (8 Total)
- Admin: 1 user
- Marketing: 3 users
- Manager: 2 users
- Owner: 1 user
- Inactive: 1 user

### Bookings (4+ Available)
- Pending: Multiple bookings ready to approve
- Manager ACC: Ready for final approval
- Completed: Archive of processed bookings

---

## ⚡ Tips untuk Demo Maksimal

1. **Start with Dashboard**
   - Tampilkan overview sistem
   - Tunjukkan statistics yang impressive

2. **Walk Through Each Role**
   - Use role switcher di sidebar
   - Tunjukkan different perspectives
   - Highlight relevance untuk setiap role

3. **Do Live Interactions**
   - Fill out booking form
   - Approve bookings
   - Add user baru
   - Tunjukkan real-time updates

4. **Emphasize Key Benefits**
   - Streamlined approval workflow
   - Clear role responsibilities
   - Transparency & tracking
   - Easy to use interface

5. **Highlight Technical Aspects**
   - Modern React + Next.js stack
   - Tailwind CSS styling
   - Type-safe TypeScript
   - Responsive design

---

## 🚀 Future Enhancements

Fitur yang bisa ditambah:
- [ ] Backend integration dengan database
- [ ] Authentication & session management
- [ ] Email notifications
- [ ] PDF document generation
- [ ] Advanced reporting & analytics
- [ ] Mobile app version
- [ ] Payment integration
- [ ] Document upload & storage

---

## 📞 Support

Pertanyaan tentang demo?
- Review code di `src/app/(dashboard)/`
- Check mock data di setiap page component
- Lihat component structure di `src/components/`

---

## 📄 License & Credits

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Unicode Emojis
- **Type Safety**: TypeScript 5

---

**Last Updated**: April 21, 2026
**Demo Version**: 1.0
**Status**: Ready for Presentation ✓
