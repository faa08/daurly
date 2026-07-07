-- ============================================================
--  DATABASE SCHEMA - PELUM PROJECT (v3)
--  Platform: Supabase (PostgreSQL)
--
--  CARA PAKAI:
--  • DB baru (reset total): uncomment bagian RESET di bawah, lalu jalankan seluruh file
--  • DB sudah ada: jalankan bagian MIGRASI di akhir file saja
-- ============================================================


-- ============================================================
-- RESET: Drop semua tabel & enum lama (urutan terbalik)
-- Jalankan ini HANYA jika mau reset total dari awal.
-- ============================================================
DROP TABLE IF EXISTS notifikasi      CASCADE;
DROP TABLE IF EXISTS support_ticket  CASCADE;
DROP TABLE IF EXISTS chat_message    CASCADE;
DROP TABLE IF EXISTS chat_room       CASCADE;
DROP TABLE IF EXISTS saldo_seller    CASCADE;
DROP TABLE IF EXISTS pengiriman      CASCADE;
DROP TABLE IF EXISTS payment         CASCADE;
DROP TABLE IF EXISTS retur            CASCADE;
DROP TABLE IF EXISTS review_toko     CASCADE;
DROP TABLE IF EXISTS ikut_toko       CASCADE;
DROP TABLE IF EXISTS order_item      CASCADE;
DROP TABLE IF EXISTS "order"         CASCADE;
DROP TABLE IF EXISTS cart_item       CASCADE;
DROP TABLE IF EXISTS cart            CASCADE;
DROP TABLE IF EXISTS review          CASCADE;
DROP TABLE IF EXISTS produk          CASCADE;
DROP TABLE IF EXISTS kategori        CASCADE;
DROP TABLE IF EXISTS seller          CASCADE;
DROP TABLE IF EXISTS alamat          CASCADE;
DROP TABLE IF EXISTS users           CASCADE;
DROP TABLE IF EXISTS super_admin     CASCADE;

DROP TYPE IF EXISTS notif_type_enum;
DROP TYPE IF EXISTS stat_saldo_enum;
DROP TYPE IF EXISTS tipe_saldo_enum;
DROP TYPE IF EXISTS stat_kirim_enum;
DROP TYPE IF EXISTS metod_pay_enum;
DROP TYPE IF EXISTS stat_pay_enum;
DROP TYPE IF EXISTS stat_retur_enum;
DROP TYPE IF EXISTS stat_order_enum;
DROP TYPE IF EXISTS stat_produk_enum;
DROP TYPE IF EXISTS user_role;


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUM TYPES (semua enum didefinisikan di awal)
-- ============================================================
CREATE TYPE user_role        AS ENUM ('customer', 'seller', 'admin');
CREATE TYPE stat_produk_enum AS ENUM ('tersedia', 'tidak tersedia');
CREATE TYPE stat_order_enum  AS ENUM ('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan');
CREATE TYPE stat_retur_enum  AS ENUM ('diajukan', 'disetujui', 'ditolak', 'selesai');
CREATE TYPE stat_pay_enum    AS ENUM ('pending', 'success', 'failed', 'expired');
CREATE TYPE metod_pay_enum   AS ENUM ('transfer_bank', 'e_wallet', 'cod', 'qris', 'va', 'kartu_kredit');
CREATE TYPE stat_kirim_enum  AS ENUM ('belum_dikirim', 'sedang_dikirim', 'sampai', 'gagal');
CREATE TYPE tipe_saldo_enum  AS ENUM ('masuk', 'keluar');
CREATE TYPE stat_saldo_enum  AS ENUM ('pending', 'sukses', 'gagal');
CREATE TYPE notif_type_enum  AS ENUM ('order', 'payment', 'shipping', 'promo', 'system');


-- ============================================================
-- TABLE: super_admin
-- ============================================================
CREATE TABLE super_admin (
    id_superadmin   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    password        TEXT NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: users
-- (UPDATED: tambah nama_lengkap, no_telp, avatar)
-- ============================================================
CREATE TABLE users (
    id_user         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(100) UNIQUE,
    password        TEXT,
    email           VARCHAR(150) NOT NULL UNIQUE,
    nama_lengkap    VARCHAR(200),
    no_telp         VARCHAR(20),
    avatar          TEXT,                            -- URL foto profil
    role            user_role NOT NULL DEFAULT 'customer',
    nama_toko       VARCHAR(150),
    jenis_kelamin   VARCHAR(20),
    tanggal_lahir   DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: alamat (alamat pengiriman user)
-- ============================================================
CREATE TABLE alamat (
    id_alamat       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    label           VARCHAR(50) NOT NULL DEFAULT 'Rumah',
    nama_penerima   VARCHAR(100) NOT NULL,
    no_telp         VARCHAR(20) NOT NULL,
    provinsi        VARCHAR(100) NOT NULL,
    kota            VARCHAR(100) NOT NULL,
    kecamatan       VARCHAR(100) NOT NULL,
    kode_pos        VARCHAR(10),
    detail_alamat   TEXT NOT NULL,
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    is_utama        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: seller (1 seller = 1 toko)
-- (UPDATED: tambah is_verified, deskripsi, logo_toko,
--  split rek_bank jadi nama_bank + no_rek + atas_nama_rek)
-- ============================================================
CREATE TABLE seller (
    id_seller       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
    nm_store        VARCHAR(150) NOT NULL,
    deskripsi       TEXT,                            -- deskripsi toko
    logo_toko       TEXT,                            -- URL logo toko
    email           VARCHAR(150) NOT NULL UNIQUE,
    no_telp         VARCHAR(20),
    addr            TEXT,
    img_ktp         TEXT,
    nik_ktp         VARCHAR(16),                     -- 16-digit NIK KTP
    nib             VARCHAR(20),                     -- 13-digit Nomor Induk Berusaha
    nama_bank       VARCHAR(50),                     -- contoh: BCA, BNI, Mandiri
    no_rek          VARCHAR(30),                     -- nomor rekening
    atas_nama_rek   VARCHAR(100),                    -- nama pemilik rekening
    is_verified     BOOLEAN DEFAULT FALSE,           -- diverifikasi oleh admin
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: kategori
-- ============================================================
CREATE TABLE kategori (
    id_kategori     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kategori   VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: produk
-- ============================================================
CREATE TABLE produk (
    id_produk       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    id_kategori     UUID REFERENCES kategori(id_kategori) ON DELETE SET NULL,
    nama_produk     VARCHAR(200) NOT NULL,
    slug            VARCHAR(255) UNIQUE,             -- slug untuk routing URL
    "desc"          TEXT,
    harga           NUMERIC(15, 2) NOT NULL CHECK (harga >= 0),
    berat           INT DEFAULT 0,                   -- berat dalam gram (untuk ongkir)
    bahan           VARCHAR(200),                      -- detail: bahan produk
    asal_produk     VARCHAR(200),                    -- detail: asal / lokasi
    ketahanan       VARCHAR(200),                      -- detail: ketahanan / perawatan
    info_tambahan   TEXT,                            -- paragraf info tambahan
    varian          JSONB NOT NULL DEFAULT '[]',       -- [{ "label": "Warna", "values": ["Merah"] }]
    img             TEXT,                             -- gambar utama
    produk_stock    INT NOT NULL DEFAULT 0 CHECK (produk_stock >= 0),
    stat_produk     stat_produk_enum NOT NULL DEFAULT 'tersedia',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: review
-- ============================================================
CREATE TABLE review (
    id_review   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_produk   UUID NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    komentar    TEXT,
    foto_review TEXT,                            -- URL foto lampiran review
    id_order    UUID REFERENCES "order"(id_order) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user, id_produk)
);


-- ============================================================
-- TABLE: cart
-- ============================================================
CREATE TABLE cart (
    id_cart     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL UNIQUE REFERENCES users(id_user) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: cart_item
-- ============================================================
CREATE TABLE cart_item (
    id_cart_item    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cart         UUID NOT NULL REFERENCES cart(id_cart) ON DELETE CASCADE,
    id_produk       UUID NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
    qty_cartitem    INT NOT NULL DEFAULT 1 CHECK (qty_cartitem > 0),
    added_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: "order"
-- (UPDATED: tambah id_seller, hapus kolom retur duplikat)
-- 1 order = 1 seller. Saat checkout, cart items digroup
-- per seller dan masing-masing jadi 1 order terpisah.
-- ============================================================
CREATE TABLE "order" (
    id_order        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    id_alamat       UUID REFERENCES alamat(id_alamat) ON DELETE SET NULL,
    total_hrg       NUMERIC(15, 2) NOT NULL CHECK (total_hrg >= 0),
    ongkir          NUMERIC(15, 2) DEFAULT 0,        -- ongkos kirim
    diskon          NUMERIC(15, 2) DEFAULT 0,        -- potongan voucher
    biaya_layanan   NUMERIC(15, 2) DEFAULT 0,        -- biaya layanan aplikasi
    stat_order      stat_order_enum NOT NULL DEFAULT 'pending',
    tipe_pembayaran VARCHAR(20) DEFAULT 'digital',
    catatan         TEXT,
    ship_lat        DOUBLE PRECISION,
    ship_lng        DOUBLE PRECISION,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: order_item
-- ============================================================
CREATE TABLE order_item (
    id_order_item   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order        UUID NOT NULL REFERENCES "order"(id_order) ON DELETE CASCADE,
    id_produk       UUID REFERENCES produk(id_produk) ON DELETE SET NULL,
    qty_orderitem   INT NOT NULL CHECK (qty_orderitem > 0),
    hrg_saat_beli   NUMERIC(15, 2) NOT NULL CHECK (hrg_saat_beli >= 0),
    nama_produk_snapshot VARCHAR(255),
    img_snapshot    TEXT
);


-- ============================================================
-- TABLE: review_toko
-- ============================================================
CREATE TABLE review_toko (
    id_review_toko  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    id_order        UUID REFERENCES "order"(id_order) ON DELETE SET NULL,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    komentar        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user, id_seller)
);


-- ============================================================
-- TABLE: ikut_toko (pengikut toko)
-- ============================================================
CREATE TABLE ikut_toko (
    id_ikut         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user, id_seller)
);


-- ============================================================
-- TABLE: retur (return handling per order_item)
-- Ini satu-satunya tempat retur dihandle (tidak ada lagi
-- kolom retur di tabel order).
-- ============================================================
CREATE TABLE retur (
    id_retur        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order_item   UUID NOT NULL REFERENCES order_item(id_order_item) ON DELETE CASCADE,
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    alasan          TEXT,
    foto_bukti      TEXT,
    status          stat_retur_enum NOT NULL DEFAULT 'diajukan',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: payment
-- (UPDATED: tambah bukti_bayar)
-- ============================================================
CREATE TABLE payment (
    id_payment  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order    UUID NOT NULL UNIQUE REFERENCES "order"(id_order) ON DELETE CASCADE,
    juml_pay    NUMERIC(15, 2) NOT NULL CHECK (juml_pay >= 0),
    metod_pay   metod_pay_enum NOT NULL,
    stat_pay    stat_pay_enum NOT NULL DEFAULT 'pending',
    bukti_bayar TEXT,                                -- URL foto bukti transfer
    tgl_pay     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: pengiriman
-- ============================================================
CREATE TABLE pengiriman (
    id_pengiriman   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order        UUID NOT NULL UNIQUE REFERENCES "order"(id_order) ON DELETE CASCADE,
    kurir           VARCHAR(50) NOT NULL,
    no_resi         VARCHAR(100),
    stat_kirim      stat_kirim_enum NOT NULL DEFAULT 'belum_dikirim',
    estimasi_tiba   DATE,
    tgl_dikirim     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: saldo_seller
-- ============================================================
CREATE TABLE saldo_seller (
    id_saldo        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    id_order        UUID REFERENCES "order"(id_order) ON DELETE SET NULL,
    jumlah          NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    tipe            tipe_saldo_enum NOT NULL,
    stat_saldo      stat_saldo_enum NOT NULL DEFAULT 'pending',
    ket             TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: support_ticket (kontak / bantuan)
-- ============================================================
CREATE TABLE support_ticket (
    id_ticket    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user      UUID REFERENCES users(id_user) ON DELETE SET NULL,
    subject      VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TABLE: notifikasi
-- ============================================================
CREATE TABLE notifikasi (
    id_notifikasi UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user       UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    judul         VARCHAR(200) NOT NULL,
    pesan         TEXT NOT NULL,
    tipe          notif_type_enum NOT NULL DEFAULT 'system',
    link          VARCHAR(500),
    id_order      UUID REFERENCES "order"(id_order) ON DELETE SET NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_seller_user         ON seller(id_user);
CREATE INDEX idx_produk_seller       ON produk(id_seller);
CREATE INDEX idx_produk_kategori     ON produk(id_kategori);
CREATE INDEX idx_produk_stat         ON produk(stat_produk);
CREATE INDEX idx_review_produk       ON review(id_produk);
CREATE INDEX idx_review_user         ON review(id_user);
CREATE INDEX idx_cart_item_cart      ON cart_item(id_cart);
CREATE INDEX idx_cart_item_produk    ON cart_item(id_produk);
CREATE INDEX idx_order_user          ON "order"(id_user);
CREATE INDEX idx_order_seller        ON "order"(id_seller);
CREATE INDEX idx_order_stat          ON "order"(stat_order);
CREATE INDEX idx_order_item_order    ON order_item(id_order);
CREATE INDEX idx_review_toko_seller  ON review_toko(id_seller);
CREATE INDEX idx_review_toko_user    ON review_toko(id_user);
CREATE INDEX idx_ikut_toko_seller    ON ikut_toko(id_seller);
CREATE INDEX idx_ikut_toko_user      ON ikut_toko(id_user);
CREATE INDEX idx_retur_user          ON retur(id_user);
CREATE INDEX idx_retur_order_item    ON retur(id_order_item);
CREATE INDEX idx_payment_order       ON payment(id_order);
CREATE INDEX idx_payment_stat        ON payment(stat_pay);
CREATE INDEX idx_alamat_user         ON alamat(id_user);
CREATE INDEX idx_pengiriman_order    ON pengiriman(id_order);
CREATE INDEX idx_pengiriman_stat     ON pengiriman(stat_kirim);
CREATE INDEX idx_saldo_seller        ON saldo_seller(id_seller);
CREATE INDEX idx_saldo_tipe          ON saldo_seller(tipe);
CREATE INDEX idx_notifikasi_user      ON notifikasi(id_user);
CREATE INDEX idx_notifikasi_user_read ON notifikasi(id_user, is_read);
CREATE INDEX idx_notifikasi_created   ON notifikasi(created_at DESC);


-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_produk_updated_at
    BEFORE UPDATE ON produk
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_order_updated_at
    BEFORE UPDATE ON "order"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_retur_updated_at
    BEFORE UPDATE ON retur
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Aplikasi memakai anon key + auth custom (bukan Supabase Auth)
-- ============================================================
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alamat          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori        ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk          ENABLE ROW LEVEL SECURITY;
ALTER TABLE review          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_item       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item      ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_toko     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ikut_toko       ENABLE ROW LEVEL SECURITY;
ALTER TABLE retur           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman      ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_seller    ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi      ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES
-- ============================================================

-- USERS
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow public register" ON users;
CREATE POLICY "Allow public register"
    ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read users" ON users;
CREATE POLICY "Allow public read users"
    ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon update users" ON users;
CREATE POLICY "Allow anon update users"
    ON users FOR UPDATE USING (true) WITH CHECK (true);

-- SELLER
DROP POLICY IF EXISTS "Public can view seller profiles" ON seller;
CREATE POLICY "Public can view seller profiles"
    ON seller FOR SELECT USING (true);
DROP POLICY IF EXISTS "Seller can update own profile" ON seller;
DROP POLICY IF EXISTS "Users can register as seller" ON seller;
DROP POLICY IF EXISTS "Allow public create seller" ON seller;
CREATE POLICY "Allow public create seller"
    ON seller FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update seller" ON seller;
CREATE POLICY "Allow anon update seller"
    ON seller FOR UPDATE USING (true) WITH CHECK (true);

-- ALAMAT
DROP POLICY IF EXISTS "Users can manage own alamat" ON alamat;
DROP POLICY IF EXISTS "Allow anon insert alamat" ON alamat;
CREATE POLICY "Allow anon insert alamat"
    ON alamat FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon read alamat" ON alamat;
CREATE POLICY "Allow anon read alamat"
    ON alamat FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon update alamat" ON alamat;
CREATE POLICY "Allow anon update alamat"
    ON alamat FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete alamat" ON alamat;
CREATE POLICY "Allow anon delete alamat"
    ON alamat FOR DELETE USING (true);

-- KATEGORI
DROP POLICY IF EXISTS "Public can view kategori" ON kategori;
CREATE POLICY "Public can view kategori"
    ON kategori FOR SELECT USING (true);

-- PRODUK
DROP POLICY IF EXISTS "Public can view available products" ON produk;
CREATE POLICY "Public can view available products"
    ON produk FOR SELECT USING (stat_produk = 'tersedia');
DROP POLICY IF EXISTS "Seller can manage own products" ON produk;
DROP POLICY IF EXISTS "Allow anon read all products" ON produk;
CREATE POLICY "Allow anon read all products"
    ON produk FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert product" ON produk;
CREATE POLICY "Allow anon insert product"
    ON produk FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update product" ON produk;
CREATE POLICY "Allow anon update product"
    ON produk FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete product" ON produk;
CREATE POLICY "Allow anon delete product"
    ON produk FOR DELETE USING (true);

-- REVIEW
DROP POLICY IF EXISTS "Public can view reviews" ON review;
CREATE POLICY "Public can view reviews"
    ON review FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own reviews" ON review;
DROP POLICY IF EXISTS "Allow anon read review" ON review;
CREATE POLICY "Allow anon read review"
    ON review FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert review" ON review;
CREATE POLICY "Allow anon insert review"
    ON review FOR INSERT WITH CHECK (true);

-- CART
DROP POLICY IF EXISTS "Users can access own cart" ON cart;
DROP POLICY IF EXISTS "Allow anon cart" ON cart;
CREATE POLICY "Allow anon cart"
    ON cart FOR ALL USING (true) WITH CHECK (true);

-- CART_ITEM
DROP POLICY IF EXISTS "Users can access own cart items" ON cart_item;
DROP POLICY IF EXISTS "Allow anon cart item" ON cart_item;
CREATE POLICY "Allow anon cart item"
    ON cart_item FOR ALL USING (true) WITH CHECK (true);

-- ORDER
DROP POLICY IF EXISTS "Buyer can view own orders" ON "order";
DROP POLICY IF EXISTS "Buyer can create order" ON "order";
DROP POLICY IF EXISTS "Seller can view incoming orders" ON "order";
DROP POLICY IF EXISTS "Seller can update order status" ON "order";
DROP POLICY IF EXISTS "Allow anon read orders" ON "order";
CREATE POLICY "Allow anon read orders"
    ON "order" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert order" ON "order";
CREATE POLICY "Allow anon insert order"
    ON "order" FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update order" ON "order";
CREATE POLICY "Allow anon update order"
    ON "order" FOR UPDATE USING (true) WITH CHECK (true);

-- ORDER_ITEM
DROP POLICY IF EXISTS "Buyer can view own order items" ON order_item;
DROP POLICY IF EXISTS "Buyer can insert order items" ON order_item;
DROP POLICY IF EXISTS "Seller can view order items" ON order_item;
DROP POLICY IF EXISTS "Allow anon read order items" ON order_item;
CREATE POLICY "Allow anon read order items"
    ON order_item FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert order item" ON order_item;
CREATE POLICY "Allow anon insert order item"
    ON order_item FOR INSERT WITH CHECK (true);

-- REVIEW_TOKO
DROP POLICY IF EXISTS "Public can view store reviews" ON review_toko;
CREATE POLICY "Public can view store reviews"
    ON review_toko FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own store reviews" ON review_toko;
DROP POLICY IF EXISTS "Allow anon insert review_toko" ON review_toko;
CREATE POLICY "Allow anon insert review_toko"
    ON review_toko FOR INSERT WITH CHECK (true);

-- IKUT_TOKO
DROP POLICY IF EXISTS "Public can view store followers" ON ikut_toko;
CREATE POLICY "Public can view store followers"
    ON ikut_toko FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert ikut_toko" ON ikut_toko;
CREATE POLICY "Allow anon insert ikut_toko"
    ON ikut_toko FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete ikut_toko" ON ikut_toko;
CREATE POLICY "Allow anon delete ikut_toko"
    ON ikut_toko FOR DELETE USING (true);

-- RETUR
DROP POLICY IF EXISTS "Buyer can view own returns" ON retur;
DROP POLICY IF EXISTS "Buyer can create return" ON retur;
DROP POLICY IF EXISTS "Seller can view returns for their orders" ON retur;
DROP POLICY IF EXISTS "Seller can update return status" ON retur;
DROP POLICY IF EXISTS "Allow anon read retur" ON retur;
CREATE POLICY "Allow anon read retur"
    ON retur FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert retur" ON retur;
CREATE POLICY "Allow anon insert retur"
    ON retur FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update retur" ON retur;
CREATE POLICY "Allow anon update retur"
    ON retur FOR UPDATE USING (true) WITH CHECK (true);

-- PAYMENT
DROP POLICY IF EXISTS "Buyer can view own payments" ON payment;
DROP POLICY IF EXISTS "Buyer can create payment" ON payment;
DROP POLICY IF EXISTS "Seller can view payments for their orders" ON payment;
DROP POLICY IF EXISTS "Allow anon read payment" ON payment;
CREATE POLICY "Allow anon read payment"
    ON payment FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert payment" ON payment;
CREATE POLICY "Allow anon insert payment"
    ON payment FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update payment" ON payment;
CREATE POLICY "Allow anon update payment"
    ON payment FOR UPDATE USING (true) WITH CHECK (true);

-- PENGIRIMAN
DROP POLICY IF EXISTS "Buyer can view own shipment" ON pengiriman;
DROP POLICY IF EXISTS "Seller can manage shipment" ON pengiriman;
DROP POLICY IF EXISTS "Allow anon read pengiriman" ON pengiriman;
CREATE POLICY "Allow anon read pengiriman"
    ON pengiriman FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert pengiriman" ON pengiriman;
CREATE POLICY "Allow anon insert pengiriman"
    ON pengiriman FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update pengiriman" ON pengiriman;
CREATE POLICY "Allow anon update pengiriman"
    ON pengiriman FOR UPDATE USING (true) WITH CHECK (true);

-- SALDO_SELLER
DROP POLICY IF EXISTS "Seller can view own saldo" ON saldo_seller;
DROP POLICY IF EXISTS "Allow anon read saldo" ON saldo_seller;
CREATE POLICY "Allow anon read saldo"
    ON saldo_seller FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert saldo" ON saldo_seller;
CREATE POLICY "Allow anon insert saldo"
    ON saldo_seller FOR INSERT WITH CHECK (true);

-- SUPPORT_TICKET
DROP POLICY IF EXISTS "Users can insert support tickets" ON support_ticket;
DROP POLICY IF EXISTS "Users can view own support tickets" ON support_ticket;
DROP POLICY IF EXISTS "Allow anon insert support_ticket" ON support_ticket;
CREATE POLICY "Allow anon insert support_ticket"
    ON support_ticket FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon read support_ticket" ON support_ticket;
CREATE POLICY "Allow anon read support_ticket"
    ON support_ticket FOR SELECT USING (true);

-- NOTIFIKASI
DROP POLICY IF EXISTS "Allow anon read notifikasi" ON notifikasi;
CREATE POLICY "Allow anon read notifikasi"
    ON notifikasi FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert notifikasi" ON notifikasi;
CREATE POLICY "Allow anon insert notifikasi"
    ON notifikasi FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update notifikasi" ON notifikasi;
CREATE POLICY "Allow anon update notifikasi"
    ON notifikasi FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete notifikasi" ON notifikasi;
CREATE POLICY "Allow anon delete notifikasi"
    ON notifikasi FOR DELETE USING (true);


-- ============================================================
-- MIGRASI (DB sudah ada — jalankan bagian ini saja di SQL Editor)
-- Aman dijalankan ulang (idempotent)
-- ============================================================

-- Hapus fitur chat toko (sudah tidak dipakai)
DROP TABLE IF EXISTS chat_message CASCADE;
DROP TABLE IF EXISTS chat_room CASCADE;

-- Tabel baru jika belum ada
DO $$ BEGIN
  CREATE TYPE notif_type_enum AS ENUM ('order', 'payment', 'shipping', 'promo', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS support_ticket (
    id_ticket    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user      UUID REFERENCES users(id_user) ON DELETE SET NULL,
    subject      VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifikasi (
    id_notifikasi UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user       UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    judul         VARCHAR(200) NOT NULL,
    pesan         TEXT NOT NULL,
    tipe          notif_type_enum NOT NULL DEFAULT 'system',
    link          VARCHAR(500),
    id_order      UUID REFERENCES "order"(id_order) ON DELETE SET NULL,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifikasi_user      ON notifikasi(id_user);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user_read ON notifikasi(id_user, is_read);
CREATE INDEX IF NOT EXISTS idx_notifikasi_created   ON notifikasi(created_at DESC);

ALTER TABLE support_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;

-- Policy migrasi (ulang policy di atas jika perlu)
DROP POLICY IF EXISTS "Allow anon insert support_ticket" ON support_ticket;
CREATE POLICY "Allow anon insert support_ticket"
    ON support_ticket FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon read support_ticket" ON support_ticket;
CREATE POLICY "Allow anon read support_ticket"
    ON support_ticket FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read notifikasi" ON notifikasi;
CREATE POLICY "Allow anon read notifikasi"
    ON notifikasi FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert notifikasi" ON notifikasi;
CREATE POLICY "Allow anon insert notifikasi"
    ON notifikasi FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update notifikasi" ON notifikasi;
CREATE POLICY "Allow anon update notifikasi"
    ON notifikasi FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete notifikasi" ON notifikasi;
CREATE POLICY "Allow anon delete notifikasi"
    ON notifikasi FOR DELETE USING (true);

-- Cart & cart_item (perbaiki error keranjang / RLS)
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_item ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own cart" ON cart;
DROP POLICY IF EXISTS "Allow anon cart" ON cart;
CREATE POLICY "Allow anon cart"
    ON cart FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can access own cart items" ON cart_item;
DROP POLICY IF EXISTS "Allow anon cart item" ON cart_item;
CREATE POLICY "Allow anon cart item"
    ON cart_item FOR ALL USING (true) WITH CHECK (true);

-- Kolom detail produk & varian (jika belum ada)
ALTER TABLE produk ADD COLUMN IF NOT EXISTS bahan VARCHAR(200);
ALTER TABLE produk ADD COLUMN IF NOT EXISTS asal_produk VARCHAR(200);
ALTER TABLE produk ADD COLUMN IF NOT EXISTS ketahanan VARCHAR(200);
ALTER TABLE produk ADD COLUMN IF NOT EXISTS info_tambahan TEXT;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS varian JSONB NOT NULL DEFAULT '[]';

-- Chat pengiriman (setelah pembayaran digital)
CREATE TABLE IF NOT EXISTS order_chat (
    id_chat    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order   UUID NOT NULL REFERENCES "order"(id_order) ON DELETE CASCADE,
    id_user    UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_order)
);

CREATE TABLE IF NOT EXISTS order_chat_message (
    id_message   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_chat      UUID NOT NULL REFERENCES order_chat(id_chat) ON DELETE CASCADE,
    sender_role  VARCHAR(20) NOT NULL CHECK (sender_role IN ('admin', 'customer')),
    sender_id    UUID REFERENCES users(id_user) ON DELETE SET NULL,
    text         TEXT NOT NULL,
    delivered_at TIMESTAMPTZ,
    read_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_chat_user    ON order_chat(id_user);
CREATE INDEX IF NOT EXISTS idx_order_chat_message ON order_chat_message(id_chat, created_at);

ALTER TABLE "order" ADD COLUMN IF NOT EXISTS tipe_pembayaran VARCHAR(20) DEFAULT 'digital';

ALTER TABLE order_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_chat_message ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon order_chat" ON order_chat;
CREATE POLICY "Allow anon order_chat"
    ON order_chat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon order_chat_message" ON order_chat_message;
CREATE POLICY "Allow anon order_chat_message"
    ON order_chat_message FOR ALL USING (true) WITH CHECK (true);

-- Review terkait pesanan + chat return ke admin
ALTER TABLE review ADD COLUMN IF NOT EXISTS id_order UUID REFERENCES "order"(id_order) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS return_chat (
    id_chat    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_retur   UUID NOT NULL REFERENCES retur(id_retur) ON DELETE CASCADE,
    id_user    UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_retur)
);

CREATE TABLE IF NOT EXISTS return_chat_message (
    id_message   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_chat      UUID NOT NULL REFERENCES return_chat(id_chat) ON DELETE CASCADE,
    sender_role  VARCHAR(20) NOT NULL CHECK (sender_role IN ('admin', 'customer')),
    sender_id    UUID REFERENCES users(id_user) ON DELETE SET NULL,
    text         TEXT NOT NULL,
    delivered_at TIMESTAMPTZ,
    read_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_chat_user ON return_chat(id_user);
CREATE INDEX IF NOT EXISTS idx_return_chat_message ON return_chat_message(id_chat, created_at);

ALTER TABLE return_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_chat_message ENABLE ROW LEVEL SECURITY;
                                        
DROP POLICY IF EXISTS "Allow anon return_chat" ON return_chat;
CREATE POLICY "Allow anon return_chat"
    ON return_chat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon return_chat_message" ON return_chat_message;
CREATE POLICY "Allow anon return_chat_message"
    ON return_chat_message FOR ALL USING (true) WITH CHECK (true);

-- Chat umum pelanggan ↔ admin (Customer Service manusia)
CREATE TABLE IF NOT EXISTS support_chat (
    id_chat    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user    UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user)
);

CREATE TABLE IF NOT EXISTS support_chat_message (
    id_message   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_chat      UUID NOT NULL REFERENCES support_chat(id_chat) ON DELETE CASCADE,
    sender_role  VARCHAR(20) NOT NULL CHECK (sender_role IN ('admin', 'customer')),
    sender_id    UUID REFERENCES users(id_user) ON DELETE SET NULL,
    text         TEXT NOT NULL,
    delivered_at TIMESTAMPTZ,
    read_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_chat_user ON support_chat(id_user);
CREATE INDEX IF NOT EXISTS idx_support_chat_message ON support_chat_message(id_chat, created_at);

ALTER TABLE support_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chat_message ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon support_chat" ON support_chat;
CREATE POLICY "Allow anon support_chat"
    ON support_chat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon support_chat_message" ON support_chat_message;
CREATE POLICY "Allow anon support_chat_message"
    ON support_chat_message FOR ALL USING (true) WITH CHECK (true);

-- Optimasi query produk (listing tanpa baca kolom img/varian/deskripsi penuh)
ALTER TABLE produk ADD COLUMN IF NOT EXISTS cover_img VARCHAR(2048);
CREATE INDEX IF NOT EXISTS idx_produk_created_at ON produk(created_at DESC);

-- Backfill cover_img dari URL gambar yang sudah ada (skip base64)
UPDATE produk
SET cover_img = CASE
    WHEN img IS NULL OR img = '' THEN NULL
    WHEN img LIKE 'data:%' THEN NULL
    WHEN img LIKE 'http%' OR img LIKE '/%' THEN left(img, 2048)
    WHEN img LIKE '[%' THEN (
        SELECT left(value, 2048)
        FROM jsonb_array_elements_text(img::jsonb) AS t(value)
        WHERE value NOT LIKE 'data:%' AND (value LIKE 'http%' OR value LIKE '/%')
        LIMIT 1
    )
    ELSE NULL
END
WHERE cover_img IS NULL;

-- Pengikut toko (ikut toko)
CREATE TABLE IF NOT EXISTS ikut_toko (
    id_ikut         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user, id_seller)
);

CREATE INDEX IF NOT EXISTS idx_ikut_toko_seller ON ikut_toko(id_seller);
CREATE INDEX IF NOT EXISTS idx_ikut_toko_user   ON ikut_toko(id_user);

ALTER TABLE ikut_toko ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view store followers" ON ikut_toko;
CREATE POLICY "Public can view store followers"
    ON ikut_toko FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert ikut_toko" ON ikut_toko;
CREATE POLICY "Allow anon insert ikut_toko"
    ON ikut_toko FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete ikut_toko" ON ikut_toko;
CREATE POLICY "Allow anon delete ikut_toko"
    ON ikut_toko FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';

ALTER TABLE cart_item ADD COLUMN IF NOT EXISTS pilihan_varian JSONB;

-- Storage bucket products (upload gambar produk & avatar via API/service role)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read products bucket" ON storage.objects;
CREATE POLICY "Public read products bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Anon upload products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anon update products bucket" ON storage.objects;

-- Upload storage: user terautentikasi (admin/seller lewat Supabase Auth session)
CREATE POLICY "Authenticated upload products bucket"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update products bucket"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'products' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Centang baca chat (WhatsApp-style): delivered_at + read_at
ALTER TABLE order_chat_message ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE order_chat_message ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE support_chat_message ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE support_chat_message ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE return_chat_message ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE return_chat_message ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- ============================================================
-- SUPABASE AUTH (login/regis pakai auth.users, bukan password plain di users)
-- Setup di Dashboard Supabase:
--   1. Authentication → Providers → Email → ON
--   2. Confirm email → ON (wajib verifikasi inbox)
--   3. URL Configuration → Redirect URLs:
--        http://localhost:3000/auth/callback
--        http://localhost:3000/auth/reset-password
--        https://<domain-anda>/auth/callback
--        https://<domain-anda>/auth/reset-password
--   4. Buat user admin di Authentication → Users (email admin@linkproductive.com)
--      atau invite admin — profil public.users disinkron via /api/auth/sync-profile
-- Kolom users.password tidak dipakai lagi untuk login (boleh NULL).
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Sinkron skema users lama → lengkap (jalankan jika sync-profile gagal: kolom tidak ditemukan)
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS no_telp VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_toko VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS jenis_kelamin VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;

-- Checkout: referensi transaksi Midtrans + varian di order_item
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(64);
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS pilihan_varian JSONB;
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS nama_produk_snapshot VARCHAR(255);
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS img_snapshot TEXT;

-- Isi snapshot untuk pesanan lama (admin tidak perlu join produk)
UPDATE order_item oi
SET
  nama_produk_snapshot = p.nama_produk,
  img_snapshot = COALESCE(
    NULLIF(TRIM(p.cover_img), ''),
    CASE
      WHEN p.img IS NOT NULL AND (p.img LIKE 'http%' OR p.img LIKE '/%') THEN LEFT(p.img, 2048)
      WHEN p.img IS NOT NULL AND p.img LIKE 'data:image%' THEN p.img
      ELSE NULL
    END
  )
FROM produk p
WHERE oi.id_produk = p.id_produk
  AND (oi.nama_produk_snapshot IS NULL OR TRIM(oi.nama_produk_snapshot) = '');

CREATE INDEX IF NOT EXISTS idx_order_transaction_ref ON "order"(transaction_ref);

-- Koordinat alamat & snapshot lokasi kirim di pesanan
ALTER TABLE alamat ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE alamat ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS ship_lat DOUBLE PRECISION;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS ship_lng DOUBLE PRECISION;

-- Banner / hero (slider beranda & banner kategori — editable admin)
CREATE TABLE IF NOT EXISTS site_banner (
    id_banner       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banner_kind     VARCHAR(30) NOT NULL CHECK (banner_kind IN ('home_hero', 'category_hero')),
    category_slug   VARCHAR(80) NOT NULL DEFAULT '',
    badge           VARCHAR(120),
    title_line1     VARCHAR(200),
    title_line2     VARCHAR(200),
    description     TEXT,
    button_text     VARCHAR(80),
    button_link     VARCHAR(500),
    image_url       TEXT NOT NULL DEFAULT '',
    image_position  VARCHAR(80) DEFAULT 'center center',
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_banner_home ON site_banner(banner_kind, sort_order) WHERE banner_kind = 'home_hero';
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_banner_category_unique
    ON site_banner(category_slug) WHERE banner_kind = 'category_hero';

ALTER TABLE site_banner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_banner" ON site_banner;
CREATE POLICY "Public read site_banner"
    ON site_banner FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow anon site_banner" ON site_banner;
CREATE POLICY "Allow anon site_banner"
    ON site_banner FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- PRODUCTION: Jangan jalankan seed admin di bawah pada DB production.
-- Buat admin via Supabase Auth Dashboard, lalu set role=admin di public.users.
-- ============================================================
-- Akun admin default (HANYA development / staging)
INSERT INTO users (id_user, username, password, email, nama_lengkap, role)
VALUES (
    'a0000001-0000-4000-8000-000000000001'::uuid,
    'admin_pelum',
    'admin123',
    'admin@linkproductive.com',
    'Administrator Pelataran UMKM',
    'admin'
)
ON CONFLICT (email) DO UPDATE SET
    password   = EXCLUDED.password,
    role       = 'admin',
    username   = EXCLUDED.username,
    nama_lengkap = EXCLUDED.nama_lengkap;

-- ============================================================
-- RLS KETAT (production) — ganti policy anon terbuka untuk data user
-- Jalankan setelah Supabase Auth aktif (auth.uid() = users.id_user)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id_user = auth.uid() AND role = 'admin'
  );
$$;

-- Alamat: milik user sendiri atau admin
DROP POLICY IF EXISTS "Allow anon read alamat" ON alamat;
DROP POLICY IF EXISTS "Allow anon insert alamat" ON alamat;
DROP POLICY IF EXISTS "Allow anon update alamat" ON alamat;
DROP POLICY IF EXISTS "Allow anon delete alamat" ON alamat;

CREATE POLICY "Users manage own alamat"
    ON alamat FOR ALL
    USING (id_user = auth.uid() OR public.is_app_admin())
    WITH CHECK (id_user = auth.uid() OR public.is_app_admin());

-- Keranjang
DROP POLICY IF EXISTS "Allow anon cart" ON cart;
DROP POLICY IF EXISTS "Allow anon cart_item" ON cart_item;

CREATE POLICY "Users manage own cart"
    ON cart FOR ALL
    USING (id_user = auth.uid() OR public.is_app_admin())
    WITH CHECK (id_user = auth.uid() OR public.is_app_admin());

CREATE POLICY "Users manage own cart items"
    ON cart_item FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM cart c
        WHERE c.id_cart = cart_item.id_cart
          AND (c.id_user = auth.uid() OR public.is_app_admin())
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM cart c
        WHERE c.id_cart = cart_item.id_cart
          AND (c.id_user = auth.uid() OR public.is_app_admin())
      )
    );

-- Pesanan
DROP POLICY IF EXISTS "Allow anon read orders" ON "order";
DROP POLICY IF EXISTS "Allow anon insert order" ON "order";
DROP POLICY IF EXISTS "Allow anon update order" ON "order";

CREATE POLICY "Users read own orders"
    ON "order" FOR SELECT
    USING (id_user = auth.uid() OR public.is_app_admin());

CREATE POLICY "Users insert own orders"
    ON "order" FOR INSERT
    WITH CHECK (id_user = auth.uid() OR public.is_app_admin());

CREATE POLICY "Users update own orders"
    ON "order" FOR UPDATE
    USING (id_user = auth.uid() OR public.is_app_admin())
    WITH CHECK (id_user = auth.uid() OR public.is_app_admin());

-- Profil user
DROP POLICY IF EXISTS "Allow anon read users" ON users;
DROP POLICY IF EXISTS "Allow anon update users" ON users;

CREATE POLICY "Users read profiles"
    ON users FOR SELECT
    USING (id_user = auth.uid() OR public.is_app_admin());

CREATE POLICY "Users update own profile"
    ON users FOR UPDATE
    USING (id_user = auth.uid() OR public.is_app_admin())
    WITH CHECK (id_user = auth.uid() OR public.is_app_admin());

-- Produk: tulis hanya admin (baca tetap publik)
DROP POLICY IF EXISTS "Allow anon insert produk" ON produk;
DROP POLICY IF EXISTS "Allow anon update produk" ON produk;
DROP POLICY IF EXISTS "Allow anon delete produk" ON produk;

CREATE POLICY "Admin manage produk"
    ON produk FOR ALL
    USING (public.is_app_admin())
    WITH CHECK (public.is_app_admin());

-- Fix: order.id_user / id_seller NOT NULL tidak boleh ON DELETE SET NULL
ALTER TABLE "order" DROP CONSTRAINT IF EXISTS order_id_user_fkey;
ALTER TABLE "order"
    ADD CONSTRAINT order_id_user_fkey
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;

ALTER TABLE "order" DROP CONSTRAINT IF EXISTS order_id_seller_fkey;
ALTER TABLE "order"
    ADD CONSTRAINT order_id_seller_fkey
    FOREIGN KEY (id_seller) REFERENCES seller(id_seller) ON DELETE CASCADE;

-- ============================================================
-- TABLE: system_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    key          VARCHAR(100) PRIMARY KEY,
    value        JSONB NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public read
DROP POLICY IF EXISTS "Allow public read system_settings" ON system_settings;
CREATE POLICY "Allow public read system_settings" ON system_settings
    FOR SELECT USING (true);

-- Policies for admin write
DROP POLICY IF EXISTS "Admins manage system_settings" ON system_settings;
CREATE POLICY "Admins manage system_settings" ON system_settings
    FOR ALL USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

-- Insert default maintenance_mode
INSERT INTO system_settings (key, value)
VALUES ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';


