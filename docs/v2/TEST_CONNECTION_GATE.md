# V2 TEST read connection gate

A read-only TypeScript REST adapter now exists at `v2/packages/api/src/test-read-client.ts`. It is intentionally pinned to the **TEST** project hostname and requires a real authenticated session token. It never writes and never includes a service-role key.

Verified TEST columns: `teams(id,name,active)`; `events(id,team_id,title,event_type,starts_at,ends_at,venue,status)`; `players(id,display_name,name,position,active)`.

**Not yet verified:** authenticated RLS grants for V2 client, integration with login, real browser reads, deployment, end-to-end Manager/Player behavior. Never treat SQL admin read access as proof of browser read access.

Next steps: use existing TEST Supabase Auth flow; request session with publishable key; verify permissions and per-team isolation using separate test actors; adapt data to V2 domain contracts; then deploy isolated TEST preview. Do not store JWTs in GitHub or logs.
