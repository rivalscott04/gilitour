# Security Audit Report - Tour Minder

Tanggal audit: 2026-04-02  
Scope: backend + frontend (validasi form, SQL Injection, IDOR, dan temuan security medium)

## Executive Summary

Audit menemukan beberapa risiko serius pada kontrol akses API (IDOR/Broken Access Control), terutama karena endpoint API utama belum dilindungi autentikasi dan otorisasi granular.  
Risiko SQL Injection langsung tidak terlihat pada area yang diperiksa, karena query mayoritas menggunakan Eloquent/query builder dan whitelist sorting.

---

## Findings (Ordered by Severity)

## 1) [CRITICAL] Broken Access Control / IDOR pada endpoint API utama

**Lokasi**
- `backend/routes/api.php`
- `backend/app/Http/Controllers/Api/V1/BookingController.php`
- `backend/app/Http/Controllers/Api/V1/ChatController.php`
- `backend/app/Http/Controllers/Api/V1/CustomerController.php`
- `backend/app/Http/Controllers/Api/V1/DashboardController.php`
- `backend/app/Http/Controllers/Api/V1/AnalyticsController.php`

**Deskripsi**
- Endpoint di prefix `/api/v1` saat ini tidak terlihat dibungkus middleware autentikasi (`auth:sanctum`/JWT sejenis).
- Dengan route model binding seperti `/bookings/{booking}` dan `/chats/{booking}/messages`, data dapat diakses berbasis ID tanpa pembatasan ownership/role yang jelas.

**Dampak**
- Pengguna tidak sah berpotensi membaca/mengubah data booking, chat, customer, dashboard, analytics.
- Potensi data exposure lintas tenant/user.

**Rekomendasi**
- Terapkan middleware auth di route group API.
- Tambahkan authorization policy (ownership/role-based) pada resource sensitif (`Booking`, `ChatTemplate`, `Customer`).

---

## 2) [CRITICAL] `FormRequest::authorize()` selalu `true`

**Lokasi**
- `backend/app/Http/Requests/UpdateBookingStatusRequest.php`
- `backend/app/Http/Requests/UpdateBookingLocalFieldsRequest.php`
- `backend/app/Http/Requests/StoreChatMessageRequest.php`
- `backend/app/Http/Requests/StoreChatTemplateRequest.php`
- `backend/app/Http/Requests/UpdateChatTemplateRequest.php`
- `backend/app/Http/Requests/StoreWhatsappWebhookRequest.php`

**Deskripsi**
- Semua request class di atas mengembalikan `true` pada `authorize()`.
- Validasi format data ada, tetapi validasi hak akses tidak ada.

**Dampak**
- Siapa pun yang mencapai endpoint dapat melakukan aksi sensitif selama payload valid.

**Rekomendasi**
- Ubah `authorize()` agar cek user context (role/permission/ownership).
- Gunakan policy/gate untuk operasi update/delete/read penting.

---

## 3) [HIGH] Webhook WhatsApp dapat disalahgunakan (spoofing request)

**Lokasi**
- `backend/app/Http/Controllers/Api/V1/WebhookController.php`
- `backend/app/Http/Requests/StoreWhatsappWebhookRequest.php`

**Deskripsi**
- Endpoint webhook menerima `booking_id` + `message` dan dapat memicu update status (`confirmByCustomerMessage`) tanpa verifikasi signature asal webhook.
- Tidak terlihat mekanisme anti-replay.

**Dampak**
- Attacker dapat memalsukan request webhook untuk mengubah status booking.

**Rekomendasi**
- Verifikasi signature resmi provider webhook.
- Tambahkan timestamp + nonce/replay protection.
- Tambahkan rate limiting khusus endpoint webhook.

---

## 4) [HIGH] Confirmation link belum harden (token long-lived, endpoint terbuka)

**Lokasi**
- `backend/app/Http/Controllers/Api/V1/BookingController.php`
- `backend/app/Services/BookingService.php`

**Deskripsi**
- Endpoint pembuatan link konfirmasi tidak terlihat dibatasi autentikasi.
- Token konfirmasi disimpan plaintext dan tidak terlihat masa berlaku (expiry) atau rotasi one-time.

**Dampak**
- Link bocor dapat digunakan pihak tidak berwenang dalam jangka panjang.

**Rekomendasi**
- Gunakan signed URL dengan expiry.
- Simpan hash token (bukan plaintext) bila memungkinkan.
- Terapkan one-time use + invalidasi token setelah dipakai.

---

## 5) [MEDIUM] Rate limiting belum eksplisit untuk endpoint sensitif

**Lokasi**
- `backend/routes/api.php`

**Deskripsi**
- Tidak terlihat throttle spesifik untuk endpoint sensitif (`status update`, `send message`, `webhook`, dll).

**Dampak**
- Risiko abuse, brute-force, dan resource exhaustion meningkat.

**Rekomendasi**
- Tambahkan `throttle` per endpoint sesuai profil risiko.
- Monitor request spike dan log anomaly.

---

## 6) [MEDIUM] Frontend belum menambahkan hardening request/auth context

**Lokasi**
- `src/lib/api-client.ts`

**Deskripsi**
- API client hanya set `Accept`/`Content-Type`, belum terlihat mekanisme auth token/session protection yang jelas.

**Dampak**
- Selaras dengan backend yang belum enforce auth; memperbesar risiko akses API tanpa kontrol.

**Rekomendasi**
- Integrasikan mekanisme auth (token/cookie secure flow) sesuai arsitektur.
- Pastikan backend tetap jadi source of truth untuk authorization.

---

## 7) [MEDIUM] Validasi frontend minim (defense-in-depth)

**Lokasi**
- `src/pages/BookingDetail.tsx`
- `src/pages/Chat.tsx`

**Deskripsi**
- Input masih longgar di sisi client (panjang/format), walau backend sudah memvalidasi.

**Dampak**
- UX kurang baik, potensi abuse bertambah sebelum request sampai backend.

**Rekomendasi**
- Tambahkan batas panjang, normalisasi input, dan feedback validasi realtime di UI.

---

## SQL Injection Assessment

### Status
- **Tidak ditemukan indikasi SQL Injection langsung** pada area backend utama yang ditinjau.

### Alasan
- Query mayoritas menggunakan Eloquent/query builder.
- Parameter sort sudah di-whitelist:
  - `backend/app/Services/BookingService.php`
  - `backend/app/Services/CustomerService.php`
- `DB::raw('COUNT(*) as total')` pada analytics bersifat statis (bukan input user).

### Catatan
- Tetap hindari raw query dinamis dari input user tanpa binding.

---

## Form Validation Assessment

### Yang sudah baik
- Rule validasi backend ada untuk field penting:
  - enum status
  - max length string
  - array tags
  - exists constraint untuk `booking_id` di webhook

### Gap utama
- Authorization belum melekat pada validasi request (`authorize()` masih `true`).

---

## Prioritized Remediation Plan

1. Proteksi route API dengan autentikasi (`auth:sanctum`/mekanisme terpilih).
2. Implementasi policy/ownership checks untuk resource sensitif.
3. Refactor semua `FormRequest::authorize()` agar cek permission.
4. Hardening webhook (signature + anti replay + throttling).
5. Hardening confirmation link (expiry + one-time token + hash).
6. Tambahkan throttling granular dan security logging.
7. Tambahkan validasi frontend sebagai defense-in-depth.
8. Pastikan konfigurasi production aman (`APP_DEBUG=false`, HTTPS, secure cookies).

---

## Residual Risk

Tanpa kontrol akses dan otorisasi yang benar, validasi format input saja tidak cukup mencegah akses data ilegal.  
Prioritas tertinggi adalah menutup broken access control/IDOR sebelum optimasi keamanan lainnya.

