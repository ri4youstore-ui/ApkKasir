# ApkKasir - Sistem POS Web (PWA) Modern

**Sistem Point of Sale (POS) responsif berbasis web untuk Indonesia dengan multi-user, payment gateway, dan PWA support.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-2.0-darkgreen?style=flat-square)

## 🎯 Fitur Utama

### 👥 Manajemen Multi-User
- **Role Owner/Admin**: Akses penuh ke semua fitur, manajemen kasir, laporan lengkap
- **Role Kasir**: Akses transaksi penjualan dan riwayat transaksi sendiri
- Authentication berbasis email + password dengan JWT
- Sistem manajemen akses berbasis role (RBAC)

### 📊 Dashboard Comprehensive
- Ringkasan omset hari ini
- Total transaksi sepanjang waktu
- Produk terlaris
- Grafik penjualan 7 hari terakhir
- Chart interaktif dengan Recharts

### 🛒 Sistem POS/Kasir
- Grid produk dengan search real-time
- Shopping cart dengan quantity control
- Support metode pembayaran:
  - **Tunai** (dengan kalkulasi kembalian otomatis)
  - **QRIS** (QR Code Indonesia Standard)
  - **E-Wallet**: DANA, OVO, GoPay, ShopeePay
  - **Virtual Account**: BCA, BRI, Mandiri, BNI
- Integrasi Midtrans/Xendit
- Struk print dan download PDF
- Validasi stok real-time

### 📦 Manajemen Produk
- CRUD produk lengkap
- Kategori produk
- Stok management
- Upload foto produk
- Tracking harga & keuntungan
- Bulk import/export (upcoming)

### 📋 Riwayat Transaksi
- Filter berdasarkan tanggal dan kasir
- Detail item transaksi
- Status pembayaran tracking
- Export ke Excel/PDF
- Print struk

### 📈 Laporan
- Laporan harian, mingguan, bulanan
- Laba rugi sederhana
- Performa produk
- Performa kasir

### 🎨 UI/UX Modern
- Desain minimalis elegan (Warna: Hitam + Emas / Navy + Putih)
- Dark mode & Light mode toggle
- Bottom navigation untuk mobile
- Responsive design (Mobile-first)
- Smooth animations & transitions
- Font Poppins/Inter

### 📱 PWA Capabilities
- Installable seperti native app
- Offline support (upcoming)
- Push notifications (upcoming)
- Home screen shortcut

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm atau yarn
- Akun Supabase (gratis di https://supabase.com)
- Akun Midtrans atau Xendit (untuk payment gateway)

### 1. Clone Repository

```bash
cd /workspaces/ApkKasir
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Supabase

#### a. Create Supabase Project
1. Buka https://supabase.com
2. Sign up atau login
3. Buat project baru
4. Copy `Project URL` dan `Anon Key`

#### b. Run Database Migrations
1. Buka Supabase editor SQL di dashboard
2. Copy-paste semua SQL dari file `supabase/migrations/001_init.sql`
3. Jalankan query

#### c. Enable Auth
1. Di Supabase dashboard, pergi ke `Authentication > Providers`
2. Pastikan Email provider sudah enabled
3. Di `Authentication > Policies`, update email redirects ke http://localhost:3000

### 4. Setup Environment Variables

```bash
# Copy .env.example ke .env.local
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=VT-xxxx
MIDTRANS_SERVER_KEY=Mid-server-xxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Seed Data

```bash
npm run db:seed
```

Ini akan membuat:
- ✅ Akun owner (@owner@kasir.test / password123)
- ✅ Akun kasir (cashier1@kasir.test, cashier2@kasir.test / password123)
- ✅ Toko demo "Kafe Santai"
- ✅ 10 produk demo
- ✅ 3 transaksi sample

### 6. Development Server

```bash
npm run dev
```

Buka browser ke http://localhost:3000

## 📖 Panduan Penggunaan

### Login
- **Owner**: owner@kasir.test / password123
- **Kasir**: cashier1@kasir.test / password123

### Dashboard
Akses dari: `/dashboard`
- Melihat ringkasan penjualan hari ini
- Statistik transaksi
- Grafik penjualan 7 hari
- Widget produk terlaris

### POS/Kasir
Akses dari: `/pos`
1. Search dan pilih produk
2. Produk otomatis ditambah ke keranjang
3. Sesuaikan jumlah produk
4. Pilih metode pembayaran
5. Input nominal (jika tunai)
6. Klik "Bayar"
7. Download/Print struk

### Manajemen Produk (Owner Only)
Akses dari: `/products`
- Tambah produk baru
- Edit produk
- Hapus produk
- Atur kategori dan stok

### Riwayat Transaksi
Akses dari: `/transactions`
- Filter berdasarkan tanggal
- Lihat detail transaksi
- Download PDF struk
- Kasir hanya bisa melihat transaksi sendiri

### Profile
Akses dari: `/profile` atau `/account`
- Update nama profil
- Ubah password
- Update informasi toko (owner)
- Logout

## 🏗️ Struktur Folder

```
ApkKasir/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Protected routes
│   │   ├── auth/            # Auth pages
│   │   ├── api/             # API routes
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # UI components (shadcn/ui style)
│   │   ├── dashboard/       # Dashboard components
│   │   ├── pos/             # POS page components
│   │   ├── navigation/      # Navigation components
│   │   └── ...
│   ├── lib/
│   │   ├── supabase/        # Supabase client
│   │   ├── auth.ts          # Auth functions
│   │   ├── payment/         # Payment gateway integration
│   │   ├── utils/           # Utility functions
│   │   └── utils.ts         # Class name utilities
│   ├── store/               # Zustand stores
│   │   ├── auth.ts          # Auth store
│   │   └── cart.ts          # Shopping cart store
│   └── types/               # TypeScript types
│       └── database.ts      # Database types
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   └── icons/              # App icons
├── scripts/
│   └── seed.ts             # Database seeding script
├── supabase/
│   └── migrations/         # Database migrations
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🔌 Payment Gateway Integration

### Midtrans Setup

1. Daftar di https://midtrans.com
2. Copy Client Key & Server Key
3. Update di `.env.local`:
   ```
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=VT-xxxx
   MIDTRANS_SERVER_KEY=Mid-server-xxxx
   ```

### Metode Pembayaran Supported
- 💵 Tunai
- 🔲 QRIS (Gopay)
- 📱 DANA
- 📱 OVO
- 📱 GoPay
- 📱 ShopeePay
- 🏦 Virtual Account BCA
- 🏦 Virtual Account BRI
- 🏦 Virtual Account Mandiri
- 🏦 Virtual Account BNI

## 🗄️ Database Schema

### Tables
- `stores`: Informasi toko
- `users`: User/Kasir
- `products`: Produk untuk dijual
- `transactions`: Riwayat transaksi penjualan
- `transaction_items`: Item detail dalam transaksi
- `payment_transactions`: Payment gateway tracking

### ForeignKey & Relationships
- Owner → Store (1:1)
- Store → Users (1:N)
- Store → Products (1:N)
- Store → Transactions (1:N)
- User (Cashier) → Transactions (1:N)
- Transaction → Items (1:N)
- Product → Items (1:N)

## 🔒 Security

- ✅ Row Level Security (RLS) di Supabase
- ✅ Role-based access control (RBAC)
- ✅ JWT authentication
- ✅ Password hashing (Supabase Auth)
- ✅ Environment variables untuk secrets
- ✅ CORS protection
- ⚠️ Rate limiting (upcoming)

## 📱 PWA Features

### Sudah Implemented
- ✅ Manifest.json
- ✅ Home screen installable
- ✅ Responsive design

### Akan Datang
- ⬜ Service Workers
- ⬜ Offline synchronization
- ⬜ Push notifications
- ⬜ Background sync

## 🧪 Testing

### CreateAccount & Login
```bash
# Demo Owner
Email: owner@kasir.test
Password: password123

# Demo Cashier 1
Email: cashier1@kasir.test
Password: password123

# Demo Cashier 2
Email: cashier2@kasir.test
Password: password123
```

### Test POS
1. Login sebagai cashier
2. Buka halaman POS `/pos`
3. Search produk "Kopi"
4. Tambah ke keranjang
5. Pilih metode pembayaran
6. Bayar

## 🚀 Deployment

### Deploy ke Vercel
```bash
# Push ke GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Di Vercel dashboard
# Connect GitHub repository
# Add environment variables
# Deploy
```

### Deploy ke Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Environment Variables di Production
- Gunakan managed environment variables di platform
- Jangan commit `.env.local`
- Use `.env.example` sebagai template

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3
- **Components**: shadcn/ui style components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Payment**: Midtrans / Xendit API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **PDF Generation**: jsPDF
- **Excel Export**: SheetJS
- **QR Code**: qrcode.react

## 🐛 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### Error: "Supabase connection failed"
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` benar
- Check Supabase project status
- Regenerate keys jika perlu

### Error: "Auth user not found"
- Ensure Supabase auth sudah di-setup
- Check email provider enabled
- Try logout dan login ulang

### Port 3000 sudah terpakai
```bash
npm run dev -- -p 3001
```

## 📝 Lisensi

MIT License - Bebas digunakan untuk personal dan commercial

## 👨‍💻 Author

Dibuat dengan ❤️ untuk UMKM Indonesia

## 🤝 Contributing

Pull requests welcome! Silakan buat issue untuk suggestion atau bug report.

## 📞 Support

- 📧 Email: support@apkkasir.test
- 💬 WhatsApp: +(62) XXX-XXXX-XXXX
- 🌐 Website: https://apkkasir.test

---

**Terima kasih telah menggunakan ApkKasir! Semoga membantu mengembangkan bisnis Anda! 🚀**
