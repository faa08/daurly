-- Pastikan ekstensi UUID aktif di Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat tabel support_chat jika belum ada
CREATE TABLE IF NOT EXISTS support_chat (
    id_chat    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user    UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user)
);

-- Buat tabel support_chat_message jika belum ada
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

-- Buat index optimasi jika belum ada
CREATE INDEX IF NOT EXISTS idx_support_chat_user ON support_chat(id_user);
CREATE INDEX IF NOT EXISTS idx_support_chat_message ON support_chat_message(id_chat, created_at);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE support_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chat_message ENABLE ROW LEVEL SECURITY;

-- Buat policy akses publik untuk tabel support_chat
DROP POLICY IF EXISTS "Allow anon support_chat" ON support_chat;
CREATE POLICY "Allow anon support_chat"
    ON support_chat FOR ALL USING (true) WITH CHECK (true);

-- Buat policy akses publik untuk tabel support_chat_message
DROP POLICY IF EXISTS "Allow anon support_chat_message" ON support_chat_message;
CREATE POLICY "Allow anon support_chat_message"
    ON support_chat_message FOR ALL USING (true) WITH CHECK (true);
