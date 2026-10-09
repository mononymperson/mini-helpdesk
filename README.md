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

## Catatan

- Saat register berhasil, response langsung mengembalikan `access_token` dan `refresh_token`.
- `business_slug` tidak perlu dikirim saat register karena slug akan digenerate oleh system berdasarkan `business_name`.

## User Management API

Endpoint berikut membutuhkan access token milik user dengan role `admin`.
`business_id` selalu diambil dari current user, bukan dari request client.

- `GET /users` — mengambil seluruh user dalam business current user.
- `POST /users` — membuat user baru dalam business current user. Body:

  ```json
  {
    "name": "Agent One",
    "email": "agent@example.com",
    "password": "secret",
    "role": "agent"
  }
  ```
