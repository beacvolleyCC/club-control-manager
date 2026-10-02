# Club Control Manager V0.5.2B5K — Card order + position data correction

Date: 2026-10-02
Baseline: V0.5.2B5J

## Scope
- Event icon moved to the first card column, before all text.
- Event icons rendered black.
- Opponent standing appended to the gray home/away metadata when standings data exists.
- Position composition is calculated from actual GOING RSVP rows + player.position.
- Card RSVP matrix loads for competition training/match views independently of Overview.
- Cached event roster is a fallback source.
- No backend writes, schema changes, BRSZ sync changes, notification swipe changes, or Player changes.

## 11× review
1. Product/function — PASS static.
2. UX/IA — PASS static; card order follows supplied reference direction.
3. UI — PASS static; icon first and black, position counts compact.
4. Frontend/PWA — PASS static; cache/version bumped.
5. Backend/API — unchanged.
6. DB/data integrity — unchanged.
7. Architecture — canonical RSVP + player position remain the source.
8. Security — no permission/grant changes.
9. QA/performance/accessibility — matrix is one season RPC; roster cache only fallback. Live smoke pending.
10. DevOps/rollback — frontend-only; rollback to B5J.
11. Motion/interaction — unchanged.
