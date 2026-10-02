# Club Control Manager V0.5.2B5I — 11× review

Baseline: deployed V0.5.2B5E. Date: 2026-10-02.

1. Product/function — PASS static
- New training/match cards follow the approved compact roster-first UX.
- Normal match has no finish time; friendly match requires one.
- Home-match defaults: Women I court 3, Women II court 2, Men court 3; Bogdánfy venue/address.
- Standings section remains in Matches.

2. UX / IA — PASS static
- Large Going/roster count is first; position mix follows it.
- Player event icons reused for training/home/away.
- No fake opponent logo: opponent logo renders only when standings source provides logoUrl.

3. UI / visual consistency — PASS static
- No strong gradient / no extra team stripe in the new cards.
- Flat, subtle team tint only.
- Warning thresholds: total <6 red, 6–9 amber; F/L/A 0 red 1 amber; OH/MB 0–1 red 2 amber.

4. Frontend / PWA — PASS static
- app.js syntax: PASS.
- index duplicate IDs: 0.
- service-worker cache bumped and four new assets included.
- No native input[type=time] remains in the Manager build.

5. Backend/API — PASS static contract / LIVE PENDING
- B5I uses existing Manager RPC contracts; no browser secret added.
- MGR015 only replaces cc_competition_sync_apply_team_v1 with a guarded identity-recovery extension.
- MGR014 results/standings RPC is separate and not modified.

6. DB / data integrity — PASS static / LIVE PENDING
- Existing linked event ID wins.
- If a technical source key changes, relink occurs only when exact home/away source-team pair is unique for the watched team/season.
- Kickoff time is deliberately excluded from recovery identity so schedule changes can update the same event.
- Ambiguous pair matches are not guessed.
- Availability/RSVP rows remain because public.events.id is updated in place rather than replaced.

7. Architecture — PASS
- Supabase remains canonical.
- Browser Helper only reads public BRSZ pages; Edge/service-role path remains privileged backend path.
- BRSZ automated cloud bypass is not introduced.

8. Security — PASS static / LIVE POSTCHECK REQUIRED
- authenticated cannot execute apply-team.
- service_role remains the only apply-team executor.
- authenticated direct UPDATE on competition_source_matches remains denied.

9. QA / performance / accessibility — PASS static / physical smoke pending
- New event rows are buttons and preserve keyboard focus visibility.
- Warning colors also retain numeric values; color is not the sole information carrier.
- Card layout has desktop/tablet/mobile breakpoints.
- Physical desktop/mobile smoke still required.

10. DevOps / deploy / rollback — PASS
- MGR015 includes read-only PRECHECK, INSTALL, POSTCHECK, and rollback.
- Frontend update is isolated from config.js.
- Browser Helper V1.1 is separately deployable/rollbackable.
- Edge Function V1.5 does not need redeploy for this release.

11. Motion / interaction — PASS static
- Existing Player notification swipe is outside this repo and untouched.
- No global gesture changes.
- Card hover/press motion is minimal and reduced-motion-compatible through existing platform behavior.

Release blockers before claiming live PASS:
1. MGR015 PRECHECK all TRUE.
2. MGR015 install + POSTCHECK all TRUE.
3. Browser Helper V1.1 reload.
4. Manager B5I deploy and hard refresh.
5. BRSZ refresh smoke: changed kickoff updates same match; no duplicate; prior RSVP count remains.
6. Home match creation smoke for all three teams.
7. Normal/friendly match form smoke and 24-hour display smoke.
