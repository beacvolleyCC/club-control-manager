# 2026/27 updated BRSZ fixture import — 18 October 2026

Source supplied directly in CC chat. Do not replace official source rows blindly.

## Group coverage supplied
- Men's Budapest I/A: KÖZGÁZ, Óbudai Egyetem–Kandó SC, Kispest SE, MAFC Kármán, Ráckeve, Dág KSE, BTDSE Taksony. Results: Kandó–BTDSE Taksony 3:1 (25:18,25:15,20:25,25:15) on 14 Oct; MAFC Kármán–Ráckeve 3:0 (32:30,25:20,25:21) on 13 Oct.
- Men's Budapest I/B: BEAC, PDSE, Semmelweis, MAFC-Schönherz, MAFC-Vásárhelyi, Corvinus, **Mozdulj SE (new entrant)**. Reported postponed Mozdulj–MAFC-Schönherz. Result: MAFC-Vásárhelyi–MAFC-Schönherz 3:0 (25:15,25:21,25:16) 15 Oct. BEAC–PDSE rescheduled 19 Oct 19:30.
- Women's Budapest I: updated full fixture matrix through May 2027, 5 reported results including BEAC–MAFC-ÉPK 3:1 (25:21,23:25,25:18,25:13) 16 Oct.
- Women's Budapest II/A: Budai XI. C, Budapest Bunnies, BDTSE Taksony, BDG, KRE-B, KEAC, H Zrínyi SE. Four reported postponements.
- Women's Budapest II/B: BEAC II, UTE U-20 Pink, MTK kék, RKSK, Corvinus, MAFC-BME, Radzeer SE. BEAC II–UTE U-20 Pink Tuesday 20 October at 19:30 (already an explicit manual league override in production).

## Identity and presentation
Use federation numeric team IDs where available, *scoped by league and season*. Normalise the Taksony alias BTDSE/BDTSE/Taksony/Bóczik-Brózik Tibor naming to one team **within a given league only**, not across men's/women's distinct BRSZ club ID (men 831 vs women A 899). Kandó = Óbudai Egyetem-Kandó SC within the same league; source IDs men's 44, Women's I 1159. PDSE BRSZ IDs 1214 and 1091 appear in the same men's B group, and must be reviewed/linked consciously. MAFC-Schönherz and MAFC-Vásárhelyi are different teams and must NOT be merged. Short *display labels* (e.g. Semmelweis, BTDSE, Dág) must never overwrite source names or IDs.

## Standard BEAC event defaults
Home: BEAC II uses Bogdánfy court 2; women's BB1 and men court 3. Home meeting 18:30 for the club's match announcement; do not assume this is chronologically before a match with a kickoff earlier than 18:30—flag exception. Away: 60 minutes before kickoff; editable meeting place. Player-only note should be absent when blank. MeetingAt/meetingPlace belong to the BEAC player event, not the official league fixture. Sending notifications should require explicit manager action, only for unplayed/rescheduled matches.

## Consistency critical
Previous manual snapshot override '20261001:fixture:1' sets BEAC II–UTE 2026-10-20 19:30 Budapest, but linked event 'b99c5397-8b51-40d0-a03c-e399c011bd3e' remains CANCELLED at 2026-10-13 19:30. Do not silently reactivate or alert players until reconciliation is approved.
Keep detailed source data, dedupe by stable BRSZ fixture ID + league/season, audit supersession, do not rewrite results/manual overrides. Add tests for newly added teams, cancelled, postponed, home court, meeting notes and cross-source collision.

The full fixture transcript is in the current user message; this file captures authoritative implementation constraints, **not a claim that the entire fixture list has been imported**.
