# Club Control Manager V0.5.2B6J + MGR022 — 11× QA

Date: 2026-10-04  
Baseline: Manager V0.5.2B6I + MGR021  
Scope: root horizontal-offset hotfix, pass price fallback, BEAC competition-fee reconciliation.

## 1. Product / business logic — PASS (static)
- Imported BEAC competition pass is authoritative evidence of paid monthly competition pass/tagdíj.
- Only an explicitly locked manual override remains stronger than import.
- Actual raw imported price is first priority; configured team/global price is fallback.
- Coach fee and competition-license logic are untouched by MGR022.

## 2. UX / information architecture — PASS (static)
- No new navigation or duplicate finance surface.
- Existing Finance → Versenycsapatok / Bérletek / Beállítások / Napló structure remains.
- No global horizontal page scrolling is reintroduced; internal tables/grids retain their own scrolling.

## 3. UI / design system — PASS (static)
- Main content/root is forced to full-width, zero horizontal offset.
- Existing B6I Overview, event cards, standings, team grids and finance component styling remain.
- Bérlet price display no longer turns missing/null price into `0 Ft`.

## 4. Frontend / PWA / device — PASS static; physical smoke pending
- `node --check app.js`: PASS.
- `node --check sw.js`: PASS.
- CSS parser errors: 0.
- CSS brace balance: exact.
- HTML duplicate IDs: 0.
- Cache key bumped to B6J.
- Root scrollLeft reset runs after route/render, pageshow and resize; internal scrollers are not reset.
- Physical iPhone/Android/desktop smoke remains required.

## 5. Backend / API — PASS by source review; live install pending
- New authenticated `cc_manager_finance_reconcile_beac_v1(text)` reconciles canonical `mass_passes` to competition monthly fee meta.
- Existing service-role `cc_manager_beac_bulk_sync_v2387(jsonb,text)` is replaced compatibly with the same lock/price precedence.
- Browser cannot call the privileged legacy bulk RPC.

## 6. Database / data integrity — PASS by source review; live pre/postcheck required
- No DROP/TRUNCATE/DELETE of finance/pass data.
- Reconcile uses UPSERT on the existing fee-meta unique key.
- Audit rows are written only for actual changes.
- Locked manual values are skipped, not rewritten.
- Unlocked manual values can be replaced only when a matching imported competition pass exists for the same player/month.

## 7. Architecture / integration — PASS
- `mass_passes` remains the canonical normalized BEAC/pass source.
- Finance matrix remains the existing canonical Manager read surface.
- Team-specific settings from MGR021 remain fallback configuration, not sales truth.
- No new parallel payment datastore introduced.

## 8. Security / permissions — PASS by source review; live postcheck pending
- Reconcile requires authenticated Manager and `competition.fees` edit permission.
- Reconcile EXECUTE is granted to authenticated/service_role, not anon/public.
- Legacy bulk sync remains service-role only.
- No service-role key or private credential is present in frontend files.

## 9. QA / performance / accessibility — PASS static; runtime pending
- Merge-conflict marker scan: PASS.
- Missing-price tests: null/empty → configured fallback, explicit imported price → imported amount.
- Reconciliation is idempotent: already identical automatic states are skipped.
- Finance load performs one reconcile RPC + one matrix RPC; no per-player browser RPC loop.
- Existing native controls/labels are retained.

## 10. DevOps / release / rollback — PASS static
- Separate PRECHECK / INSTALL / POSTCHECK / ROLLBACK files supplied for MGR022.
- Frontend package excludes `config.js`.
- B6J is based directly on B6I; changes are scoped to the three reported defects plus repair of a malformed escaped-newline CSS block discovered during QA.
- Service worker cache bumped.

## 11. Motion / interaction — PASS static; device smoke pending
- Root X correction has no animation and preserves current vertical scroll on ordinary re-render.
- Route changes still return to page top intentionally.
- Internal standings/matrix/table horizontal gestures remain native and untouched.
- Reduced-motion behavior from B6I is unchanged.

## Live checks after deploy
1. MGR022 PRECHECK → all booleans true.
2. INSTALL → success.
3. POSTCHECK → function/security checks true; `competition_pass_rows` should be plausible/nonzero if raw competition passes exist.
4. Open Finance: an imported pass with an **unlocked** manual `Nincs fizetve` state must become paid.
5. Repeat with **Kézi felülírás zárolása** checked: it must remain manual.
6. Bérletek: raw price appears; missing price uses team/global configured price, never accidental 0 Ft.
7. At the viewport where B6I was shifted, Overview must start at the normal left content padding while standings/grids still scroll internally.
