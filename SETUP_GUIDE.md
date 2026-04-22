# 🚀 ApkKasir - Aplikasi POS Web Modern (PWA)

**Sistem Point of Sale profesional untuk bisnis Indonesia dengan dukungan multi-user, payment gateway terintegrasi, responsive design, dan PWA capabilities.**

---

## ✨ Status Project

✅ Struktur folder lengkap  
✅ Authentication & Authorization  
✅ Dashboard dengan analytics  
✅ POS/Kasir system  
✅ Management produk (foundation)  
✅ Riwayat transaksi  
✅ User profile  
✅ Stripe/Payment gateway integration  
✅ Supabase database schema  
✅ Seed data dengan 10 produk demo  

---

## 📋 Fitur Utama

### 1. Multi-User & Role-Based Access
- **Owner/Admin**: Akses penuh, manajemen kasir, laporan komprehensif
- **Kasir**: Transaksi penjualan dan riwayat transaksi sendiri
- Email + Password authentication dengan JWT
- Session management via Supabase Auth

### 2. Dashboard Analytics
- Omset penjualan hari ini
- Total transaksi sepanjang waktu
- Produk terlaris
- Grafik penjualan 7 hari realtime

### 3. Sistem Kasir/POS
- Grid produk dengan search realtime
- Shopping cart dengan quantity control
- **Metode pembayaran supported:**
  - 💵 Tunai (dengan kalkulasi kembalian otomatis)
  - 🔲 QRIS (QR Code Indonesia Standard)
  - 📱 E-Wallet: DANA, OVO, GoPay, ShopeePay
  - 🏦 Virtual Account: BCA, BRI, Mandiri, BNI
- Integrasi Midtrans/Xendit
- Struk cetak & PDF download
- Validasi stok real-time

### 4. Manajemen Produk
- CRUD operasi lengkap
- Kategori produk
- Stok tracking
- Upload foto
- Margin profit tracking

### 5. Riwayat Transaksi
- Filter by tanggal & kasir
- Detail item transaksi
- Status pembayaran tracking
- Export PDF/Excel

### 6. UI/UX Modern
- Desain minimalis elegan (Warna: Hitam + Emas / Navy + Putih)
- Dark mode & Light mode toggle
- Bottom navigation mobile
- Responsive design (Mobile-first)
- Smooth animations
- Font: Poppins/Inter

### 7. PWA Capabilities
- Installable seperti native app
- Offline support (coming soon)
- Push notifications (coming soon)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS 3, shadcn/ui components |
| **State** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + JWT |
| **Payment** | Midtrans API |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | Sonner Toasts |
| **PDF** | jsPDF, html2canvas |
| **Excel** | SheetJS (xlsx) |

---

## 📦 Setup Guide

### Prerequisites
- Node.js 16+
- npm atau yarn
- Akun Supabase (gratis: https://supabase.com)
- Akun Midtrans (https://midtrans.com)

### Step 1: Clone Repository
```bash
cd /workspaces/ApkKasir
```

### Step 2: Install Dependencies
```bash
npm install
# atau
yarn install
```

### Step 3: Setup Supabase

#### 3a. Create Supabase Project
1. Buka https://supabase.com
2. Sign up atau login
3. Buat project baru
4. Copy `Project URL` dan `Anon Key`

#### 3b. Run Database Migrations
1. Di Supabase dashboard, buka **SQL Editor**
2. Klik **New Query**
3. Copy-paste semua SQL dari [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
4. Jalankan query (ctrl+enter)

#### 3c. Enable Auth
1. Di Supabase, buka **Authentication > Providers**
2. Pastikan **Email** provider enabled
3. Di **Authentication > URL Configuration**:
   - Set Redirect URL: `http://localhost:3000/auth/login`
   - Set Site URL: `http://localhost:3000`

### Step 4: Setup Environment Variables

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=VT-xxxx
MIDTRANS_SERVER_KEY=Mid-server-xxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Cara mendapatkan Supabase Keys:**
1. Di Supabase dashboard → Settings → API
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` (di bawah) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 5: Seed Data Demo

```bash
npm run db:seed
```

Ini akan membuat:
- ✅ 1 Owner account: `owner@kasir.test / password123`
- ✅ 2 Kasir accounts: `cashier1@kasir.test`, `cashier2@kasir.test` / password123
- ✅ 1 Toko: "Kafe Santai"
- ✅ 10 Produk demo
- ✅ 3 Transaksi sample

### Step 6: Run Development Server

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔐 Demo Credentials

### Owner Account
```
Email: owner@kasir.test
Password: password123
Role: Owner/Admin
```

### Cashier Accounts
```
Email: cashier1@kasir.test
Password: password123
Role: Cashier/Kasir

Email: cashier2@kasir.test
Password: password123
Role: Cashier/Kasir
```

---

## 📖 Panduan Penggunaan

### 🏠 Dashboard (`/dashboard`)
1. Login sebagai owner atau cashier
2. Lihat ringkasan penjualan hari ini
3. Lihat grafik penjualan 7 hari
4. Statistik transaksi total

### 🛒 POS/Kasir (`/pos`)
**Untuk: Owner & Kasir**

1. **Search Produk**
   - Gunakan search bar untuk cari produk
   - Filter by kategori (optional)

2. **Tambah ke Keranjang**
   - Klik tombol "Tambah" pada produk
   - Otomatis masuk ke keranjang di kanan

3. **Manage Keranjang**
   - Gunakan +/- untuk ubah quantity
   - Klik 🗑️ untuk hapus item
   - Klik "Batal" untuk clear semua

4. **Pilih Metode Pembayaran**
   - Tunai
   - QRIS
   - E-Wallet (DANA, OVO, GoPay, ShopeePay)
   - Bank Transfer (BCA, BRI, Mandiri, BNI)

5. **Bayar**
   - Input nominal (untuk tunai)
   - Sistem otomatis hitung kembalian
   - Klik "Bayar"
   - Struk auto-generate

### 📦 Produk (`/products`)
**Untuk: Owner Only**

1. Lihat semua produk
2. Tambah produk baru:
   - Nama, SKU, Harga, Cost, Stok
   - Upload foto
   - Pilih kategori
3. Edit produk
4. Hapus produk
5. Monitoring stok rendah

### 📋 Riwayat Transaksi (`/transactions`)
**Untuk: Owner (semua) & Cashier (milik sendiri)**

1. Filter by tanggal
2. Search ID transaksi
3. Lihat detail transaksi
4. Download struk PDF
5. Print struk

### 👤 Profile (`/profile`)
1. Update nama profil
2. Update informasi toko (owner)
3. Ubah password
4. Logout

---

## 📁 Struktur Folder

```
ApkKasir/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── pos/              # POS/Kasir page
│   │   │   ├── transactions/     # Transaksi page
│   │   │   └── profile/          # Profile page
│   │   ├── auth/
│   │   │   ├── login/            # Login page
│   │   │   └── signup/           # Signup page
│   │   ├── api/
│   │   │   └── payment/callback/ # Payment webhook
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── pos/                  # POS components
│   │   └── navigation/           # Navigation components
│   ├── lib/
│   │   ├── supabase/             # Supabase clients
│   │   ├── auth.ts               # Auth functions
│   │   ├── payment/              # Payment gateway
│   │   ├── utils.ts              # Utilities
│   │   └── utils/                # Format utils
│   ├── store/
│   │   ├── auth.ts               # Auth store (Zustand)
│   │   └── cart.ts               # Cart store (Zustand)
│   ├── types/
│   │   └── database.ts           # Database types
│   └── middleware.ts             # Auth middleware
├── public/
│   └── manifest.json             # PWA manifest
├── scripts/
│   └── seed.ts                   # Database seeding
├── supabase/
│   └── migrations/
│       └── 001_init.sql          # Database schema
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README_SETUP.md
```

---

## 🔌 Payment Gateway Integration

### Midtrans Setup

1. **Daftar Midtrans**
   - https://midtrans.com
   - Pilih "Merchant Dashboard"
   - Sign up dengan bisnis Anda

2. **Get API Keys**
   - Di Dashboard, go to Settings → API Keys
   - Copy `Client Key` → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - Copy `Server Key` → `MIDTRANS_SERVER_KEY`

3. **Configure Webhook**
   - Di Midtrans Dashboard → Settings → Notification
   - HTTP POST notification URL: `https://yourdomain.com/api/payment/callback`

### Payment Methods Supported
| Method | Metode |
|--------|---------|
| QRIS | QR Code Indonesia Standard (Gopay) |
| DANA | E-Wallet DANA |
| OVO | E-Wallet OVO |
| GoPay | E-Wallet GoPay |
| ShopeePay | E-Wallet ShopeePay |
| BCA | Virtual Account BCA |
| BRI | Virtual Account BRI |
| Mandiri | Virtual Account Mandiri |
| BNI | Virtual Account BNI |
| Cash | Tunai |

---

## 🗄️ Database Schema

### Tables

```sql
-- Stores (Toko)
stores {
  id, name, owner_id, address, phone, logo_url, 
  receipt_footer, theme, created_at, updated_at
}

-- Users (Kasir/Admin)
users {
  id, store_id, role, name, email, avatar_url,
  created_at, updated_at
}

-- Products (Produk)
products {
  id, store_id, name, description, sku, price, cost,
  stock, category, image_url, is_active,
  created_at, updated_at
}

-- Transactions (Transaksi)
transactions {
  id, store_id, cashier_id, total_amount, total_paid,
  change_amount, payment_method, payment_status, notes,
  created_at, updated_at
}

-- Transaction Items (Item Transaksi)
transaction_items {
  id, transaction_id, product_id, quantity,
  unit_price, subtotal, created_at
}

-- Payment Transactions (Tracking Payment)
payment_transactions {
  id, transaction_id, payment_method, amount,
  reference_id, status, response_data,
  created_at, updated_at
}
```

### Functions & Triggers
- `decrease_stock()` - Auto kurangi stok saat transaksi
- `get_top_products()` - Get produk terlaris
- `update_updated_at()` - Auto update timestamp

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) di Supabase
- ✅ Role-based access control (RBAC)
- ✅ JWT authentication
- ✅ Password hashing (Supabase Auth)
- ✅ Environment variables untuk secrets
- ✅ CORS protection
- ✅ Middleware untuk protected routes

---

## 📱 PWA Features

### ✅ Implemented
- Manifest.json configuration
- Home screen installable
- Responsive design (mobile-first)
- Bottom navigation for mobile
- Optimized assets

### 🔜 Coming Soon
- Service Workers
- Offline support
- Background sync
- Push notifications

---

## 🚀 Deployment

### Option 1: Deploy ke Vercel (Recommended)

```bash
# 1. Push ke GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Di Vercel Dashboard
# - Connect GitHub repository
# - Add environment variables
# - Deploy automatically
```

### Option 2: Deploy ke Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login ke Railway
railway login

# Deploy
railway up
```

### Production Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key...
SUPABASE_SERVICE_ROLE_KEY=prod-service-key...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=prod-client-key...
MIDTRANS_SERVER_KEY=prod-server-key...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
npm install --legacy-peer-deps  # Jika npm install error
```

### Error: "Supabase connection failed"
- Cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Pastikan Supabase project aktif
- Cek koneksi internet

### Error: "Auth user not found"
- Pastikan Supabase Auth sudah di-setup
- Check email provider enabled
- Try logout dan login ulang

### Error: Port 3000 sudah terpakai
```bash
npm run dev -- -p 3001
```

### Error: TypeScript errors
```bash
npm run type-check
# Fix errors, then rebuild
npm run build
```

---

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Lint code
npm run type-check       # TypeScript check

# Database
npm run db:generate      # Generate types dari Supabase
npm run db:seed          # Seed demo data

# Testing (coming soon)
npm test
```

---

## 🎯 Fitur yang Akan Ditambah

- [ ] Laporan komprehensif (harian, bulanan, tahunan)
- [ ] Laba rugi tracking
- [ ] Multi-store support
- [ ] Discount & promo system
- [ ] Customer loyalty program
- [ ] Inventory alerts
- [ ] SMS/Email notifications
- [ ] Expense tracking
- [ ] Point of Sale receipt customization
- [ ] Multi-currency support
- [ ] API documentation (REST)
- [ ] Mobile app (Flutter)

---

## 📞 Support & Contact

- 📧 Email: support@apkkasir.test
- 💬 WhatsApp: +(62) XXX-XXXX-XXXX
- 🌐 Website: https://apkkasir.test
- 📚 Docs: https://docs.apkkasir.test

---

## 📝 Lisensi

MIT License - Bebas digunakan untuk personal dan commercial

---

## 🤝 Contributing

Pull requests welcome! Issues dan suggestions sangat kami hargai.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Created with ❤️

Aplikasi ini dibuat khusus untuk membantu UMKM Indonesia dalam mengelola bisnis penjualan mereka dengan mudah dan profesional.

**Happy coding & Happy selling! 🚀**

---

*Last Updated: April 22, 2026*
