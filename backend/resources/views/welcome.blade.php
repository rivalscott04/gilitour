<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} — API</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1.25rem; line-height: 1.55; color: #1a1a1a; }
        a { color: #2563eb; }
        code { font-size: 0.9em; background: #f4f4f5; padding: 0.15em 0.4em; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>{{ config('app.name') }}</h1>
    <p>Backend ini hanya melayani <strong>API JSON</strong>. Aplikasi operator (React/Vite) dijalankan dari folder proyek utama (root repo), bukan dari sini.</p>
    <p>
        <a href="{{ config('app.frontend_url') }}">Buka app</a>
        <span style="color:#71717a"> — <code>FRONTEND_URL</code></span>
    </p>
    <p>Basis API: <code>{{ url('/api/v1') }}</code></p>
</body>
</html>
