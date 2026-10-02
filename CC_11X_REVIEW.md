# Manager V0.5.2B5P — Overview Card + Player Grid Parity + Avatar60

1. Product — PASS static: Overview upcoming matches reuse canonical match-card component; matrix RSVP editing uses Player-style 3-state capsules.
2. UX — PASS static: same event-card language between Meccsek and Overview; grid keeps events vertical / players horizontal.
3. UI — PASS static: black event icons; opponent/rank/card information remains from the B5N card component.
4. Frontend/PWA — PASS static: app.js syntax; CSS braces; cache bumped.
5. Backend/API — PASS by existing contract: matrix writes still use cc_manager_competition_rsvp_v1.
6. Data integrity — PASS by contract: no direct table writes; event IDs unchanged.
7. Architecture — PASS: card renderer is shared instead of duplicate Overview markup.
8. Security — PASS: existing Manager scoped RPC/permissions retained.
9. QA/accessibility — PASS static: controls are native buttons; duplicate HTML ids: 0.
10. DevOps — PASS: frontend-only Manager change; new player-animals.webp asset must be copied.
11. Motion/interaction — PASS static: BRSZ sync function byte-identical to B5N.

Regression lock:
- runCompetitionSourceSync_: byte-identical PASS
- BRSZ Edge/Helper: NOT MODIFIED
- MGR015 schedule identity backend: NOT MODIFIED
- live browser smoke: PENDING

- B5P artwork refinement: Manager now uses the same corrected 60-avatar atlas as Player P10; original indices 0–51 remain unchanged.
