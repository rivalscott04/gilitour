# Laporan System Integration Testing (SIT)

**Tanggal:** 4 April 2026  
**Lingkup:** Backend API (Laravel + PHPUnit), frontend unit (Vitest), pemetaan rute vs cakupan tes, catatan keamanan.

## Ringkasan eksekutif

| Lapisan | Alat | Hasil |
|--------|------|--------|
| API (Feature + Unit) | PHPUnit 11.5.55, PHP 8.2, SQLite `:memory:` | **24 tes, 105 asersi — semua lulus** |
| Frontend | Vitest 3.2.4 | **1 tes — lulus** (hanya contoh) |
| End-to-end browser | Playwright (konfigurasi ada) | **Tidak dijalankan — tidak ada berkas `*.spec.ts` di `tests/`** |

Kesimpulan: integrasi **API ke basis data dan alur bisnis utama** teruji otomatis dan stabil di lingkungan pengujian. Integrasi **browser ↔ API ↔ UI** belum terotomatisasi. Profil risiko keamanan untuk magic link dan matriks peran perlu pengujian/pengetatan tambahan di luar cakupan tes saat ini.

## Metodologi

1. Menjalankan seluruh suite PHPUnit sesuai `backend/phpunit.xml` (Feature + Unit, `DB_CONNECTION=sqlite`, `:memory:`).
2. Menjalankan `npm test` (Vitest) di root proyek.
3. Memetakan `backend/routes/api.php` terhadap kelas tes di `backend/tests/Feature/Feature/Api/`.
4. **Tidak** menjalankan server produksi, load test, atau scan kerentanan pihak ketiga (OWASP ZAP, dll.) — itu di luar SIT otomatis ini.

## Hasil detail

### Backend — PHPUnit

Perintah:

```bash
cd backend && ./vendor/bin/phpunit
```

Output terakhir: `OK (24 tests, 105 assertions)`.

**Catatan operasional:** Opsi PHPUnit `--testsuite` hanya boleh dipakai sekali per invokasi. Memanggil `--testsuite Feature --testsuite Unit` memicu peringatan runner dan tidak menjalankan kedua suite sekaligus; gunakan `./vendor/bin/phpunit` tanpa filter ganda untuk CI.

### Frontend — Vitest

Perintah:

```bash
npm test
```

Hanya `src/test/example.test.ts` yang dijalankan; tidak ada tes integrasi untuk `api-client`, halaman login, atau alur React Query.

### Pemetaan endpoint vs tes Feature

| Area | Endpoint utama | Tercakup di tes? |
|------|----------------|------------------|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | Ya (`AuthApiTest`) |
| Magic link (publik) | `GET|POST /bookings/{id}/magic-link` | Ya (`BookingApiTest` — preflight, confirm, cancel, reschedule) |
| Bookings (Sanctum) | index, show, patch status/local-fields, issue-confirm-link | Ya + isolasi operator (`test_operator_cannot_access_booking_owned_by_peer`) |
| Dashboard | summary, urgent, recent | Ya (`DashboardApiTest`) |
| Analytics | overview, trends, export CSV | Ya (`AnalyticsApiTest`) |
| Customers | index | Ya (`CustomerApiTest`) |
| Chat | index, messages, send | Ya (`ChatApiTest`) |
| Chat templates | REST terbatas | Ya (`ChatTemplateApiTest`) |

Tes Feature memakai `AuthenticatedApiTestCase` dengan user `role => operator` dan Sanctum `actingAs`, kecuali tes auth yang eksplisit.

## Temuan keamanan (sudut pandang pengujian)

1. **Magic link tanpa `auth:sanctum`** — sesuai desain; keamanan mengandalkan token ter-hash / kedaluwarsa. Tes memverifikasi alur valid, tetapi **tidak** menguji brute-force, rate limiting khusus pada rute magic link, atau enumerasi ID booking (respons 403 vs 404). Di `routes/api.php`, grup `throttle:api-sensitive` tidak membungkus rute magic link; pertimbangkan throttle terpisah untuk mengurangi percobaan token.
2. **Matriks peran** — ada bukti isolasi antar operator pada booking. Tes tidak secara eksplisit memetakan perilaku **admin** vs **operator** untuk seluruh resource (misalnya chat templates memakai policy terpisah); layak ditambahkan tes policy per peran jika aturan bisnis membedakan akses.
3. **Login** — memakai `throttle:login` (baik). Tes mencakup kredensial salah (422 + validation) dan logout yang mencabut token.
4. **Dependensi lingkungan** — SIT backend tidak memvalidasi integrasi dengan DB produksi (MySQL/PostgreSQL), Redis, atau antrean; hanya SQLite in-memory.

## Rekomendasi

1. Menambah skenario **Playwright** minimal: login SPA → panggilan API terekam atau asersi UI dashboard; magic link end-to-end jika ada URL staging.
2. Menambah tes Vitest untuk **klien API** (mock fetch) dan/atau komponen yang memuat data terautentikasi.
3. Di CI, jalankan `./vendor/bin/phpunit` (bukan dua `--testsuite` sekaligus) dan fail build pada PHPUnit warnings jika diinginkan (`--fail-on-warning` di PHPUnit 10+).
4. Uji manual atau otomatis terpisah untuk **CORS** dan origin Sanctum terhadap URL frontend deployment.

## Lampiran: inventaris tes (nama metode)

- `AuthApiTest`: login sukses/gagal, `me` terautentikasi/tidak, logout cabut token.
- `BookingApiTest`: isolasi operator, filter daftar, update status, issue link, magic link confirm/cancel/reschedule, field lokal.
- `DashboardApiTest`, `AnalyticsApiTest`, `CustomerApiTest`, `ChatApiTest`, `ChatTemplateApiTest`: alur baca/tulis sesuai domain.
- Unit: `BookingServiceTest`, `DashboardServiceTest`, plus contoh `ExampleTest`.

---

*Dokumen ini dihasilkan dari eksekusi otomatis dan review statis rute/kebijakan; bukan pengganti penetration test atau audit kepatuhan.*
