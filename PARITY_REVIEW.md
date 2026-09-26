# Manager PWA V0.4.1 — Parity Review

## Reference rule
- **Old Manager:** functionality, terminology and information density.
- **Player PWA:** visual language and interaction consistency.
- **New Manager PWA:** adaptive PWA shell, direct Supabase read architecture and modular permissions.

## Versenysport parity status

| Module | V0.4.1 status | What is preserved/restored | Remaining gap |
|---|---|---|---|
| Áttekintés | READ PARITY | upcoming training/match/team-program counters; RSVP matrix; next matches | write/admin actions later |
| Részvételi jelzések | READ PARITY | full names; Jövök / Nem jövök / Nincs válasz; team grouping; filters; avatars | historical edge cases to verify live |
| Edzések | READ PARITY | dense event rows, full team name, date/time, court/venue, RSVP counts, status, expandable roster | edit/create/delete later |
| Meccsek | READ PARITY | same dense event structure; home/away/event details available | Competition Core result/protocol later |
| Csapatok | READ PARITY | team cards/detail/roster and current metadata | team editing later |
| Játékosok | READ PARITY | full name, membership, position, jersey, license, medical, account, attendance X/Y/% | editing/transfers/account actions later |
| Naptár | PARTIAL READ PARITY | Day/Week/Month/Season, competition events, adaptive desktop/mobile rendering | legacy court/resource availability bands; drag/resize/save later |
| Díjak | NOT YET | — | migrate existing fee matrix + override/audit later |
| Értesítések | NOT YET | — | manual composer later |
| Beállítások | FOUNDATION ONLY | global settings surface retained | canonical config migration later |

## Intentional semantic correction
The old Overview block titled **Jelenlét** showed RSVP intent, not actual marked attendance. V0.4.1 names it **Részvételi jelzések** while retaining the same Jövök / Nem jövök / Nincs válasz logic. Actual attendance remains a separate statistic.

## Data correctness improvement
MGR002 counts a valid team member with no `availability` row as **Nincs válasz**. This matches the matrix meaning and avoids undercounting unknown responses.

## Release rule
V0.4.1 frontend must not be deployed before MGR002 preflight/install/post-install QA are all green.
