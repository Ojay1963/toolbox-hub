# Observability

This project uses a lightweight observability setup designed for a solo developer deployment.

## What is logged

Server-side tool API failures emit structured log events with:

- route path
- tool name
- HTTP method
- status code
- error code
- upstream service label where relevant
- upstream failure type
- timeout/fetch failure flags
- uploaded file size where relevant
- timestamp

The logger is intentionally careful about what it does **not** include:

- no secrets
- no API keys
- no uploaded document contents
- no OCR text contents
- no raw HTML or user text payloads

## Where logs go

By default, logs go to the server console as structured JSON.

If `OBSERVABILITY_WEBHOOK_URL` is configured, error events are also posted to a monitoring webhook. This is intended as a simple hook point for services like:

- a serverless log collector
- a custom Discord/Slack webhook relay
- a lightweight internal error endpoint

## Environment variables

Optional observability variables:

- `OBSERVABILITY_WEBHOOK_URL`
- `OBSERVABILITY_WEBHOOK_AUTH_HEADER`
- `OBSERVABILITY_WEBHOOK_AUTH_TOKEN`
- `NEXT_PUBLIC_ANALYTICS_PROVIDER`

## Analytics hook point

The app shell includes a no-op client analytics hook in `components/monitoring/analytics-hook.tsx`.

This does not send analytics by default. It exists only as a safe integration point so a future provider can be added without rewriting the layout tree.

## Production expectations

Before launch, a production deployment should:

1. Capture server logs from all `app/api/tools/*` routes.
2. Watch for repeated `RATE_LIMITED`, `UPSTREAM_TIMEOUT`, `UPSTREAM_UNAVAILABLE`, and `SERVICE_UNAVAILABLE` errors.
3. Review large upload failures to tune size limits conservatively.
4. Keep webhook auth tokens server-side only.
5. Avoid logging sensitive file contents or user-submitted text.
6. Add a real analytics provider only if needed, and update the privacy policy when doing so.

## Practical monitoring priorities

Highest-value routes to watch:

- `/api/tools/pdf-ocr`
- `/api/tools/background-remover`
- `/api/tools/website-speed-test`
- `/api/tools/website-screenshot-tool`
- `/api/tools/mobile-friendly-checker`
- `/api/tools/protect-pdf`
- `/api/tools/pdf-to-word`
- `/api/tools/word-to-pdf`
- `/api/tools/pdf-compressor`
- `/api/tools/currency-converter`

Most important signals:

- spikes in 429 rate limits
- upstream timeout errors
- missing env/service unavailable errors
- large-file rejection patterns
- sudden rises in 5xx route failures
