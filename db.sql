-- ============================================================
--  DATABASE SCHEMA - PELUM PROJECT (v2 - FIXED)
--  Platform: Supabase (PostgreSQL)
--
--  PERBAIKAN:
--  1. Tambah nama_lengkap, no_telp, avatar di users
--  2. Tambah id_seller di order (1 order = 1 seller)
--  3. Hapus kolom retur duplikat di order (cukup tabel retur)
--  4. Tambah is_verified, deskripsi, logo_toko di seller
--  5. Tambah RLS policy untuk seller (lihat & proses order)
--  6. Tambah super_admin policy
-- ============================================================


-- ============================================================
-- RESET: Drop semua tabel & enum lama (urutan terbalik)
-- Jalankan ini HANYA jika mau reset total dari awal.
-- ============================================================
DROP TABLE IF EXISTS saldo_seller    CASCADE;
DROP TABLE IF EXISTS pengiriman      CASCADE;
DROP TABLE IF EXISTS payment         CASCADE;
DROP TABLE IF EXISTS retur            CASCADE;
DROP TABLE IF EXISTS review_toko     CASCADE;
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
CREATE TYPE user_role        AS ENUM ('customer', 'seller');
CREATE TYPE stat_produk_enum AS ENUM ('tersedia', 'tidak tersedia');
CREATE TYPE stat_order_enum  AS ENUM ('pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan');
CREATE TYPE stat_retur_enum  AS ENUM ('diajukan', 'disetujui', 'ditolak', 'selesai');
CREATE TYPE stat_pay_enum    AS ENUM ('pending', 'success', 'failed', 'expired');
CREATE TYPE metod_pay_enum   AS ENUM ('transfer_bank', 'e_wallet', 'cod', 'qris', 'va', 'kartu_kredit');
CREATE TYPE stat_kirim_enum  AS ENUM ('belum_dikirim', 'sedang_dikirim', 'sampai', 'gagal');
CREATE TYPE tipe_saldo_enum  AS ENUM ('masuk', 'keluar');
CREATE TYPE stat_saldo_enum  AS ENUM ('pending', 'sukses', 'gagal');


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
    username        VARCHAR(100) NOT NULL UNIQUE,
    password        TEXT NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    nama_lengkap    VARCHAR(200),
    no_telp         VARCHAR(20),
    avatar          TEXT,                            -- URL foto profil
    role            user_role NOT NULL DEFAULT 'customer',
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
    added_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_cart, id_produk)
);


-- ============================================================
-- TABLE: "order"
-- (UPDATED: tambah id_seller, hapus kolom retur duplikat)
-- 1 order = 1 seller. Saat checkout, cart items digroup
-- per seller dan masing-masing jadi 1 order terpisah.
-- ============================================================
CREATE TABLE "order" (
    id_order        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user         UUID NOT NULL REFERENCES users(id_user) ON DELETE SET NULL,
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE SET NULL,
    id_alamat       UUID REFERENCES alamat(id_alamat) ON DELETE SET NULL,
    total_hrg       NUMERIC(15, 2) NOT NULL CHECK (total_hrg >= 0),
    ongkir          NUMERIC(15, 2) DEFAULT 0,        -- ongkos kirim
    diskon          NUMERIC(15, 2) DEFAULT 0,        -- potongan voucher
    biaya_layanan   NUMERIC(15, 2) DEFAULT 0,        -- biaya layanan aplikasi
    stat_order      stat_order_enum NOT NULL DEFAULT 'pending',
    catatan         TEXT,
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
    hrg_saat_beli   NUMERIC(15, 2) NOT NULL CHECK (hrg_saat_beli >= 0)
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
CREATE INDEX idx_retur_user          ON retur(id_user);
CREATE INDEX idx_retur_order_item    ON retur(id_order_item);
CREATE INDEX idx_payment_order       ON payment(id_order);
CREATE INDEX idx_payment_stat        ON payment(stat_pay);
CREATE INDEX idx_alamat_user         ON alamat(id_user);
CREATE INDEX idx_pengiriman_order    ON pengiriman(id_order);
CREATE INDEX idx_pengiriman_stat     ON pengiriman(stat_kirim);
CREATE INDEX idx_saldo_seller        ON saldo_seller(id_seller);
CREATE INDEX idx_saldo_tipe          ON saldo_seller(tipe);


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
-- ============================================================
ALTER TABLE super_admin     ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE retur           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman      ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_seller    ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Super Admin (akses via service_role key di backend,
-- tapi tetap buat policy untuk safety)
CREATE POLICY "Super admin full access"
    ON super_admin FOR ALL USING (true);

-- Users
CREATE POLICY "Users can view own data"
    ON users FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE USING (auth.uid() = id_user);

-- Seller (public bisa lihat profil toko)
CREATE POLICY "Public can view seller profiles"
    ON seller FOR SELECT USING (true);
CREATE POLICY "Seller can update own profile"
    ON seller FOR UPDATE USING (id_user = auth.uid());
CREATE POLICY "Users can register as seller"
    ON seller FOR INSERT WITH CHECK (id_user = auth.uid());

-- Alamat
CREATE POLICY "Users can manage own alamat"
    ON alamat FOR ALL USING (id_user = auth.uid());

-- Kategori (public read)
CREATE POLICY "Public can view kategori"
    ON kategori FOR SELECT USING (true);

-- Produk (public bisa lihat yg tersedia)
CREATE POLICY "Public can view available products"
    ON produk FOR SELECT USING (stat_produk = 'tersedia');
CREATE POLICY "Seller can manage own products"
    ON produk FOR ALL USING (
        id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
    );

-- Review (public bisa lihat)
CREATE POLICY "Public can view reviews"
    ON review FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews"
    ON review FOR ALL USING (id_user = auth.uid());

-- Cart
CREATE POLICY "Users can access own cart"
    ON cart FOR ALL USING (id_user = auth.uid());
CREATE POLICY "Users can access own cart items"
    ON cart_item FOR ALL USING (
        id_cart IN (SELECT id_cart FROM cart WHERE id_user = auth.uid())
    );

-- Order (BUYER bisa lihat order sendiri, SELLER bisa lihat & update order masuk)
CREATE POLICY "Buyer can view own orders"
    ON "order" FOR SELECT USING (id_user = auth.uid());
CREATE POLICY "Buyer can create order"
    ON "order" FOR INSERT WITH CHECK (id_user = auth.uid());
CREATE POLICY "Seller can view incoming orders"
    ON "order" FOR SELECT USING (
        id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
    );
CREATE POLICY "Seller can update order status"
    ON "order" FOR UPDATE USING (
        id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
    );

-- Order Item
CREATE POLICY "Buyer can view own order items"
    ON order_item FOR SELECT USING (
        id_order IN (SELECT id_order FROM "order" WHERE id_user = auth.uid())
    );
CREATE POLICY "Buyer can insert order items"
    ON order_item FOR INSERT WITH CHECK (
        id_order IN (SELECT id_order FROM "order" WHERE id_user = auth.uid())
    );
CREATE POLICY "Seller can view order items"
    ON order_item FOR SELECT USING (
        id_order IN (
            SELECT id_order FROM "order"
            WHERE id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
        )
    );

-- Review Toko
CREATE POLICY "Public can view store reviews"
    ON review_toko FOR SELECT USING (true);
CREATE POLICY "Users can manage own store reviews"
    ON review_toko FOR ALL USING (id_user = auth.uid());

-- Retur
CREATE POLICY "Buyer can view own returns"
    ON retur FOR SELECT USING (id_user = auth.uid());
CREATE POLICY "Buyer can create return"
    ON retur FOR INSERT WITH CHECK (id_user = auth.uid());
CREATE POLICY "Seller can view returns for their orders"
    ON retur FOR SELECT USING (
        id_order_item IN (
            SELECT oi.id_order_item FROM order_item oi
            JOIN "order" o ON o.id_order = oi.id_order
            WHERE o.id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
        )
    );
CREATE POLICY "Seller can update return status"
    ON retur FOR UPDATE USING (
        id_order_item IN (
            SELECT oi.id_order_item FROM order_item oi
            JOIN "order" o ON o.id_order = oi.id_order
            WHERE o.id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
        )
    );

-- Payment
CREATE POLICY "Buyer can view own payments"
    ON payment FOR SELECT USING (
        id_order IN (SELECT id_order FROM "order" WHERE id_user = auth.uid())
    );
CREATE POLICY "Buyer can create payment"
    ON payment FOR INSERT WITH CHECK (
        id_order IN (SELECT id_order FROM "order" WHERE id_user = auth.uid())
    );
CREATE POLICY "Seller can view payments for their orders"
    ON payment FOR SELECT USING (
        id_order IN (
            SELECT id_order FROM "order"
            WHERE id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
        )
    );

-- Pengiriman
CREATE POLICY "Buyer can view own shipment"
    ON pengiriman FOR SELECT USING (
        id_order IN (SELECT id_order FROM "order" WHERE id_user = auth.uid())
    );
CREATE POLICY "Seller can manage shipment"
    ON pengiriman FOR ALL USING (
        id_order IN (
            SELECT id_order FROM "order"
            WHERE id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
        )
    );

-- Saldo Seller
CREATE POLICY "Seller can view own saldo"
    ON saldo_seller FOR SELECT USING (
        id_seller IN (SELECT id_seller FROM seller WHERE id_user = auth.uid())
    );
