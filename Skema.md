# Skema Backend - Manajemen Lomba PHBN

Dokumen ini menjelaskan struktur database dan logika backend yang diperlukan untuk mendukung fungsionalitas aplikasi Manajemen Lomba 17 Agustus.

## 1. Skema Migrasi (Database)

### Tabel: `users`
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `password_hash`: String
- `role`: Enum ('admin', 'panitia')
- `timestamps`

### Tabel: `competitions` (Lomba)
- `id`: UUID (Primary Key)
- `name`: String (e.g., "Balap Karung")
- `category`: String (e.g., "Anak-anak")
- `type`: Enum ('individu', 'tim')
- `time`: String
- `location`: String
- `status`: Enum ('pending', 'ongoing', 'completed')
- `winner_first_id`: UUID (FK to participants, Nullable)
- `winner_second_id`: UUID (FK to participants, Nullable)
- `winner_third_id`: UUID (FK to participants, Nullable)
- `timestamps`
> **Catatan Migrasi:** Kolom `winner_first_id`, `winner_second_id`, dan `winner_third_id` memiliki ketergantungan melingkar dengan tabel `participants`. Saat migrasi, tabel `competitions` dan `participants` harus dibuat terlebih dahulu tanpa Foreign Key constraints ini, kemudian Foreign Key constraints ditambahkan di langkah migrasi terpisah.




### Tabel: `participants` (Peserta/Tim)
- `id`: UUID (Primary Key)
- `competition_id`: UUID (FK to competitions)
- `name`: String (Nama Peserta atau Nama Tim)
- `rt`: String
- `kelas`: String
- `kategori`: String
- `status`: Enum ('active', 'eliminated')
- `timestamps`

### Tabel: `participant_members` (Anggota Tim)
- `id`: UUID (Primary Key)
- `participant_id`: UUID (FK to participants)
- `name`: String

### Tabel: `brackets`
- `id`: UUID (Primary Key)
- `competition_id`: UUID (FK to competitions)
- `participants_per_match`: Integer (Default: 2)
- `timestamps`

### Tabel: `rounds`
- `id`: UUID (Primary Key)
- `bracket_id`: UUID (FK to brackets)
- `name`: String (e.g., "Babak Penyisihan", "Final")
- `round_index`: Integer

### Tabel: `matches`
- `id`: UUID (Primary Key)
- `round_id`: UUID (FK to rounds)
- `winner_id`: UUID (FK to participants, Nullable)
- `match_index`: Integer

### Tabel: `match_participants` (Pivot Table)
- `match_id`: UUID (FK to matches)
- `participant_id`: UUID (FK to participants)

---

## 2. Relasi (Relationships)

1.  **Competition 1:N Participants**: Satu lomba memiliki banyak peserta.
2.  **Participant 1:N ParticipantMembers**: Satu pendaftaran (terutama tipe tim) memiliki banyak anggota.
3.  **Competition 1:1 Bracket**: Satu lomba memiliki satu skema bagan pertandingan.
4.  **Bracket 1:N Rounds**: Satu bagan terdiri dari beberapa babak (Penyisihan, Semi-final, Final).
5.  **Round 1:N Matches**: Satu babak terdiri dari beberapa pertandingan.
6.  **Match N:M Participants**: Satu pertandingan diikuti oleh beberapa peserta (biasanya 2), dan seorang peserta bisa mengikuti beberapa pertandingan di babak yang berbeda.

---

## 3. Logika Controller (Logic Controller)

### A. RegistrationController
- **massRegister(request)**:
    - Validasi `competition_id` dan daftar `regCards`.
    - Cek duplikasi nama peserta di lomba yang sama.
    - *Loop* setiap kartu: Simpan ke `participants`. Jika tipe tim, simpan anggota ke `participant_members`.
    - Return status sukses dan jumlah peserta yang berhasil didaftarkan.

### B. BracketController
- **generateBracket(competition_id, per_match)**:
    - Ambil semua peserta yang `status = 'active'`.
    - *Shuffle* (acak) urutan peserta.
    - Buat entitas `bracket` dan `round` pertama (index 0).
    - Pecah peserta ke dalam grup berukuran `per_match`.
    - Buat `matches` dan hubungkan peserta melalui `match_participants`.

- **setMatchWinner(match_id, winner_id)**:
    - Update `winner_id` di tabel `matches`.
    - Update peserta lain di match tersebut menjadi `status = 'eliminated'`.
    - **Cek Progres Babak**:
        - Jika semua *match* di babak saat ini sudah punya pemenang:
            - Ambil semua `winner_id` dari babak tersebut.
            - Jika jumlah pemenang > 1: Buat `round` baru dan pasangkan pemenang ke `matches` baru.
            - Jika jumlah pemenang == 1: Tandai sebagai pemenang utama di `competitions.winner_first_id`.

### C. CompetitionController
- **exportAndReset()**:
    - Generate PDF menggunakan data dari `competitions` (beserta relasi `winner`, `participants`, dll).
    - Kirim file PDF ke client.
    - Lakukan *Truncate* atau *Soft Delete* pada semua tabel kecuali `users` untuk persiapan tahun depan.

### D. ReportController
- **getStats()**:
    - Hitung total lomba, peserta unik, dan partisipasi per RT menggunakan agregasi SQL (`COUNT`, `GROUP BY`).
    - Format data untuk grafik atau tabel laporan.
---

## 4. Rekomendasi Indexing

Untuk mengoptimalkan performa query, berikut adalah kolom yang wajib memiliki index:

| Tabel | Kolom | Alasan |
|-------|-------|--------|
| `competitions` | `status` | Mempercepat filtering di Dashboard (Aktif/Selesai). |
| `participants` | `competition_id` | Optimasi JOIN saat melihat daftar peserta per lomba. |
| `participants` | `rt` | Optimasi query agregasi pada ReportController (Group By RT). |
| `participants` | `status` | Mempercepat pencarian peserta yang belum tereliminasi untuk bagan. |
| `participant_members` | `participant_id` | Optimasi JOIN untuk mengambil anggota tim. |
| `rounds` | `bracket_id`, `round_index` | Mempercepat pengambilan babak secara berurutan. |
| `matches` | `round_id`, `match_index` | Mempercepat pengambilan pertandingan dalam satu babak. |
| `match_participants` | `(match_id, participant_id)` | Composite Index untuk mempercepat pencarian relasi Many-to-Many. |

> **Catatan:** Sebagian besar Database Engine secara otomatis membuat index untuk `Primary Key` dan kolom `Unique`. Index tambahan di atas difokuskan pada *Foreign Key* dan kolom yang sering muncul di klausa `WHERE`, `JOIN`, atau `GROUP BY`.

---
