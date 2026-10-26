# CC TEST — Manual document → structured JSON import contract

## No external AI subscription or agent necessary
User uploads a match protocol PDF (or roster/fixture file) **in the current ChatGPT conversation**. The assistant reads/extracts it, checks names and IDs against the already verified source data, and produces a reviewable `JSON` file. A future Manager TEST import UI must parse that exact file and preview differences; it **must not write to LIVE**.

The current Manager test intake UI offers document kind, league, exact existing match and local file preview, but **does not yet read JSON or submit anything**. This is a future contract, not a claim of a working importer.

### Match protocol mapping
Use the existing `data/competition/2026-27/official-protocols-20261021.json` shape:
- top-level `season: "2026/27"`, `deployment: "staged_only"`, `matches: []`;
- each match `sourceKey` = unique MRSZ source, `canonicalFixtureSourceKey` = an **existing, verified match's source ID**, `fileSha256` derived from actual source bytes;
- `data` contains exact official `matchCode`, `competitionLabel`, `leagueKey`, `homeName`, `awayName`, source team IDs if verified, kickoff time with timezone, `homeSets`, `awaySets`, `setScores` and rosters, captains, libero, official player registration IDs when present.
- **Unknowns must remain null / absent, never guessed**. A filename does not prove league, team or match identity.
- The importer must use `canonicalFixtureSourceKey` to match the existing canonical record. It must **not create a duplicate match**, overwrite event/RSVP IDs, or copy an outcome into a different division/group.
- If a score/set count or identity conflicts with existing records, require human review and refuse direct apply.

### Other supported document categories planned
- `roster`: registered player list with team ID, season, verified licence/registration IDs, never name-only auto-joins.
- `fixture`: scheduled matches with exact competition/group, home/away and source ID; handle rescheduled fixtures without duplicating events.
- `result`: score-only evidence that does not invent missing player participation.

### Safety and cost gates
- A document upload here is a manual preparation step and may contain personal information. Avoid uploading unneeded addresses, birth dates, signatures or contact details; review privacy requirements.
- Do not put any extracted real players' personal information in public Git source. Use authenticated private staging with controlled retention.
- Later TEST preview: upload → detect type → validate → identify exact league and match → show original vs candidate → approve staging commit → inspect Manager and Player → separately approve LIVE patch.
- No paid external AI APIs, no service_role/browser secret, no automatic LIVE DML, no continuous background agent.

See `docs/handover/CLUB_CONTROL_ZERO_COST_POLICY_20261026.md`.
