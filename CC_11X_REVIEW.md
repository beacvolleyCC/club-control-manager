# Club Control Manager V0.5.2B5J — UI correction + Player slider parity

Date: 2026-10-02
Baseline: V0.5.2B5I + installed MGR015
Scope: frontend-only correction. No Supabase/Edge schema or sync-core change.

## Included
- Event cards rebuilt closer to the supplied UX reference: flat/pale team tint, no gradient stripe, compact team/headcount/position block, Player event icons, 24-hour Budapest time, opponent/logo area.
- Competition training cards show only `Edzés` plus court number; no redundant training title / `Csapatedzés` copy.
- Existing match cards no longer infer `Edzőmeccs` from `endsAt`. Without an explicit persisted match-kind marker they default to normal match, avoiding the B5I false-friendly regression.
- Manager standings UI remains connected to `cc_manager_competition_standings_v1`.
- Competition event roster RSVP control now uses the Player Grid-style compact three-state slider (`✓ / – / ✕`) with drag, direction lock, snap and one-step tap behavior.
- Mass-sport attendance now uses the Player Trainings-tab full three-state pill control. Manager attendance semantics remain `Megjelent / Nincs rögzítve / Nem jelent meg`.
- Event roster player row moved closer to the supplied Player-card hierarchy: avatar, large jersey number, identity, optional license/medical/position/size chips, RSVP slider and actual-attendance control.
- Existing BRSZ Browser Helper / MGR015 sync route is not changed.

## 11× review
1. Product/function — PASS static. Competition vs mass slider semantics remain distinct.
2. UX/IA — PASS static. Slider variants match their Player reference surfaces.
3. UI/visual consistency — PASS static. No new design language for RSVP controls.
4. Frontend/PWA — PASS static. `node --check app.js` PASS; B5J cache key bumped.
5. Backend/API — PASS by unchanged contract. Existing Manager RSVP and mass attendance RPCs are reused.
6. DB/data integrity — PASS by unchanged write paths. No table writes or migrations added in B5J.
7. Architecture — PASS. Supabase remains canonical; MGR015 remains the federation identity/update layer.
8. Security — PASS by unchanged permissioned RPC routes; no secrets added.
9. QA/performance/accessibility — PASS static. Native buttons retained; pointer drag preserves vertical page pan intent.
10. DevOps/rollback — PASS. Frontend-only replacement; rollback is redeploy B5I.
11. Motion/interaction — PASS static. Drag is transitionless, release/tap snap is short and bounded. Physical touch smoke still required.

## Static assertions executed
- JavaScript syntax PASS.
- CSS brace balance PASS.
- B5J version/cache markers PASS.
- Player-style competition slider markup/drag logic PASS.
- Player-style mass attendance slider markup/drag logic PASS.
- False `endsAt => friendly` inference removed PASS.
- Training simplified label/court rule present PASS.
- Standings call/render path retained PASS.
- Europe/Budapest + 24h formatting retained PASS.
- Required local event/BEAC assets present PASS.

## Live smoke required
1. Versenysport → one event detail → move a player `✓ / – / ✕`; verify RPC save and reload.
2. Tömegsport → one booking → move `Megjelent / Nincs rögzítve / Nem jelent meg`; verify save and rollback on failure.
3. Verify vertical page scroll is not hijacked by slider drag on phone.
4. Verify normal imported matches are shown as normal matches, not friendlies.
5. Verify an event card on desktop + phone against the supplied UX reference.
6. Verify Manager standings remain visible after the B5J frontend replacement.
