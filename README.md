# mini-helpdesk

Mini Helpdesk adalah aplikasi helpdesk untuk mengelola bisnis, user, tiket,
dan komunikasi antara customer dengan agent. Project ini menggunakan FastAPI
untuk backend, PostgreSQL sebagai database, dan Next.js untuk frontend.
Project ini dibuat untuk memenuhi requirement technical test posisi Junior
Software Developer / Staff IT di PT SINERGI SOLUSI DIGITAL (SVO Connect).

## Menjalankan Project Development dari Nol

### Requirements

- Docker dan Docker Compose

### Setup

1. Clone repository dan masuk ke folder project:

   ```bash
   git clone https://github.com/mononymperson/mini-helpdesk.git
   cd mini-helpdesk
   ```

2. Buat file environment backend dari template:

   ```bash
   cp backend/.env.example backend/.env
   ```

3. Jalankan seluruh service development:

   ```bash
   docker compose up --build
   ```

   Perintah ini menjalankan:

   - PostgreSQL di `localhost:5432`
   - Backend API di `http://localhost:8000`
   - Swagger UI di `http://localhost:8000/docs`
   - Frontend di `http://localhost:3000`

   Migration database dijalankan otomatis sebelum backend dimulai.

4. Menjalankan seed di container backend (pastikan container sudah berjalan menggunakan docker compose up)
   ```bash
   docker compose exec backend python seed.py
   ```

## Environment Variables

Environment variable backend disimpan di `backend/.env`.

| Variable | Deskripsi | Contoh |
| --- | --- | --- |
| `DB_HOST` | Host PostgreSQL | `db` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nama database | `helpdesk` |
| `DB_USERNAME` | Username database | `helpdesk` |
| `DB_PASSWORD` | Password database | `change-me` |
| `JWT_SECRET_KEY` | Secret untuk signing JWT | `change-this-in-development` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Masa berlaku access token dalam menit | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Masa berlaku refresh token dalam hari | `7` |

Template environment tersedia di [backend/.env.example](./backend/.env.example).

# Demo Accounts

## Business 1: Tech Solutions Inc (tech-solutions)
| Role | Name | Email | Password |
|---|---|---|---|
| Admin | Alice Admin | alice.admin@techsol.com | password123 |
| Agent | Bob Agent | bob.agent@techsol.com | password123 |
| Customer | Carol Customer | carol.customer@techsol.com | password123 |
| Customer | Dave Customer | dave.customer@techsol.com | password123 |

## Business 2: Support Co (support-co)
| Role | Name | Email | Password |
|---|---|---|---|
| Admin | Eve Admin | eve.admin@supportco.com | password123 |
| Agent | Frank Agent | frank.agent@supportco.com | password123 |
| Customer | Grace Customer | grace.customer@supportco.com | password123 |
| Customer | Henry Customer | henry.customer@supportco.com | password123 |

## Catatan

### Fitur Wajib

### Auth
- [✓] Register business + admin
- [✓] Login (access + refresh token)
- [✓] Refresh token
- [✓] /me endpoint
- [✓] Admin bisa bikin agent/customer

### Tiket
- [✓] Customer bikin tiket + pesan pertama
- [✓] List tiket sesuai peran
- [✓] Filter by status
- [✓] Agent self-assign, admin re-assign
- [✓] Status: open → in_progress → resolved → closed
- [✓] Customer reopen

### Live Chat
- [✓] WebSocket per tiket
- [✓] Riwayat pesan tersimpan
- [✓] Nama, peran, waktu kirim
- [✓] Auth WebSocket
- [✓] Tiket closed gak bisa kirim pesan

### Keputusan teknis
- Menggunakan FastAPI untuk backend karena ringan dan cocok untuk API-only.
- Menggunakan PostgreSQL sebagai database utama.
- Menggunakan SQLAlchemy sebagai ORM untuk memetakan tabel ke objek Python, dan Alembic untuk migrasi database.
- Menggunakan Pydantic untuk validasi request/response dan serialisasi data, agar input user tervalidasi otomatis.
- Menggunakan shadcn/ui untuk komponen UI.
- SWR untuk data fetching.
- Menggunakan debounce saat filter state berganti
- Access token dan refresh token disimpan di cookies httpOnly.
- Saat register berhasil, response langsung mengembalikan access_token dan refresh_token.
- business_slug tidak perlu dikirim saat register karena slug akan digenerate oleh system berdasarkan business_name
- Response format konsisten: { data, message, errors }
- WebSocket connection menggunakan token di query string.

### Trade-off
- Agent tidak bisa ambil tiket yang sudah in_progress
- Admin bisa re-assign ticket
- Saat reopen (resolved → open), assignee menjadi kosong (null)

### Fitur bonus yg belum terimplementasi
- Unit/integration test backend dengan pytest — hanya test manual di browser.
- Indikator "sedang mengetik" dan status pesan sudah dibaca. Rencana: menambahkan event pada websocket saat input typing.
- Badge jumlah pesan belum dibaca di daftar tiket
- Upload lampiran gambar di chat. Rencana: menggunakan S3 atau local storage.
- Notifikasi real-time di daftar tiket.
- Rate limiting di endpoint login. Rencana: menggunakan slowapi dengan limit 5 request/menit per IP.
- Deploy online (Vercel + Render/Railway)